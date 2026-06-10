from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta
from decimal import Decimal, ROUND_HALF_UP

from django.db import transaction
from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.accounts.models import User
from apps.orders.models import Order
from apps.suppliers.models import Supplier

from .models import CommissionConfig, PromotedListing, RevenueTransaction, StickerPricing, SupplierSubscription


MONEY_ZERO = Decimal("0.00")
PERCENT_DIVISOR = Decimal("100")
SUBSCRIPTION_PRICES = {
    SupplierSubscription.PlanType.FREE: Decimal("0.00"),
    SupplierSubscription.PlanType.PRO: Decimal("999.00"),
    SupplierSubscription.PlanType.ENTERPRISE: Decimal("2999.00"),
}
PROMOTION_PRICES = {
    PromotedListing.PromotionType.FEATURED: Decimal("499.00"),
    PromotedListing.PromotionType.HOMEPAGE: Decimal("999.00"),
}


@dataclass(frozen=True)
class OrderRevenueBreakdown:
    bottle_cost: Decimal
    customization_cost: Decimal
    delivery_cost: Decimal
    commission_percentage: Decimal
    commission_revenue: Decimal
    delivery_revenue: Decimal
    platform_revenue: Decimal
    supplier_payout: Decimal
    total: Decimal


def money(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def percent_amount(amount: Decimal, percentage: Decimal) -> Decimal:
    return money((amount * percentage) / PERCENT_DIVISOR)


def get_active_commission_config() -> CommissionConfig:
    config = CommissionConfig.objects.filter(active=True).order_by("-created_at").first()
    if config:
        return config
    return CommissionConfig.objects.create(commission_percentage=Decimal("12.00"), active=True)


def get_active_sticker_pricing(sticker_type: str) -> StickerPricing:
    pricing = StickerPricing.objects.filter(sticker_type=sticker_type, active=True).order_by("-created_at").first()
    if pricing:
        return pricing

    if sticker_type == StickerPricing.StickerType.CUSTOM:
        return StickerPricing.objects.create(
            sticker_type=StickerPricing.StickerType.CUSTOM,
            pricing_mode=StickerPricing.PricingMode.RANGE,
            price_per_bottle=Decimal("4.00"),
            minimum_price_per_bottle=Decimal("2.00"),
            maximum_price_per_bottle=Decimal("5.00"),
            active=True,
        )

    return StickerPricing.objects.create(
        sticker_type=StickerPricing.StickerType.SUPPLIER,
        pricing_mode=StickerPricing.PricingMode.FREE,
        price_per_bottle=MONEY_ZERO,
        active=True,
    )


def get_sticker_fee_per_bottle(sticker_type: str) -> Decimal:
    pricing = get_active_sticker_pricing(sticker_type=sticker_type)
    if pricing.pricing_mode == StickerPricing.PricingMode.FREE:
        return MONEY_ZERO
    if pricing.pricing_mode == StickerPricing.PricingMode.RANGE:
        if pricing.price_per_bottle:
            return money(min(max(pricing.price_per_bottle, pricing.minimum_price_per_bottle), pricing.maximum_price_per_bottle))
        return money(pricing.minimum_price_per_bottle)
    return money(pricing.price_per_bottle)


def calculate_item_total(*, unit_price: Decimal, quantity: int, sticker_type: str) -> tuple[Decimal, Decimal, Decimal]:
    bottle_cost = money(unit_price * quantity)
    sticker_fee = get_sticker_fee_per_bottle(sticker_type=sticker_type)
    customization_cost = money(sticker_fee * quantity)
    return bottle_cost, customization_cost, money(bottle_cost + customization_cost)


def calculate_order_revenue(*, order: Order) -> OrderRevenueBreakdown:
    config = get_active_commission_config()
    bottle_cost = MONEY_ZERO
    customization_cost = MONEY_ZERO

    for item in order.items.select_related("product").all():
        unit_price = item.unit_price_snapshot or item.product.price_per_unit
        bottle_cost += money(unit_price * item.quantity)
        customization_cost += money((item.sticker_fee_snapshot or MONEY_ZERO) * item.quantity)

    delivery_cost = money(order.delivery_cost or MONEY_ZERO)
    total = money(bottle_cost + customization_cost + delivery_cost)
    commission_revenue = percent_amount(bottle_cost, config.commission_percentage)
    delivery_revenue = (
        percent_amount(delivery_cost, config.delivery_margin_percentage)
        if config.delivery_margin_active
        else MONEY_ZERO
    )
    platform_revenue = money(commission_revenue + customization_cost + delivery_revenue)
    supplier_payout = money(total - platform_revenue)

    return OrderRevenueBreakdown(
        bottle_cost=money(bottle_cost),
        customization_cost=money(customization_cost),
        delivery_cost=delivery_cost,
        commission_percentage=config.commission_percentage,
        commission_revenue=commission_revenue,
        delivery_revenue=delivery_revenue,
        platform_revenue=platform_revenue,
        supplier_payout=supplier_payout,
        total=total,
    )


def apply_order_revenue_snapshot(*, order: Order, commit: bool = True) -> OrderRevenueBreakdown:
    breakdown = calculate_order_revenue(order=order)
    order.subtotal_price = breakdown.bottle_cost
    order.customization_total = breakdown.customization_cost
    order.delivery_cost = breakdown.delivery_cost
    order.commission_percentage_snapshot = breakdown.commission_percentage
    order.commission_revenue = breakdown.commission_revenue
    order.delivery_margin_revenue = breakdown.delivery_revenue
    order.platform_revenue = breakdown.platform_revenue
    order.supplier_payout = breakdown.supplier_payout
    order.total_price = breakdown.total

    if commit:
        order.save(
            update_fields=[
                "subtotal_price",
                "customization_total",
                "delivery_cost",
                "commission_percentage_snapshot",
                "commission_revenue",
                "delivery_margin_revenue",
                "platform_revenue",
                "supplier_payout",
                "total_price",
                "updated_at",
            ]
        )

    return breakdown


def sync_order_revenue_transactions(*, order: Order) -> None:
    if not order.assigned_supplier_id:
        return

    transaction_payloads = [
        (RevenueTransaction.RevenueType.COMMISSION, order.commission_revenue, "Marketplace commission"),
        (RevenueTransaction.RevenueType.STICKER_FEE, order.customization_total, "Custom branding fee"),
        (RevenueTransaction.RevenueType.DELIVERY_MARGIN, order.delivery_margin_revenue, "Delivery margin"),
    ]

    for revenue_type, amount, description in transaction_payloads:
        if amount <= MONEY_ZERO:
            RevenueTransaction.objects.filter(order=order, revenue_type=revenue_type).delete()
            continue

        RevenueTransaction.objects.update_or_create(
            order=order,
            revenue_type=revenue_type,
            defaults={
                "supplier": order.assigned_supplier,
                "amount": money(amount),
                "currency": order.currency,
                "description": description,
                "metadata": {
                    "order_total": str(order.total_price),
                    "supplier_payout": str(order.supplier_payout),
                },
            },
        )


@transaction.atomic
def finalize_order_revenue(*, order: Order) -> OrderRevenueBreakdown:
    breakdown = apply_order_revenue_snapshot(order=order, commit=True)
    sync_order_revenue_transactions(order=order)
    return breakdown


def get_supplier_for_actor(actor: User, supplier_id: int | None = None) -> Supplier:
    if actor.is_superuser or actor.role == User.Role.ADMIN:
        if not supplier_id:
            raise ValidationError({"supplier": ["Supplier is required for admin actions."]})
        try:
            return Supplier.objects.get(pk=supplier_id)
        except Supplier.DoesNotExist as exc:
            raise ValidationError({"supplier": ["Supplier does not exist."]}) from exc

    if actor.role != User.Role.SUPPLIER:
        raise PermissionDenied("Only suppliers can manage subscriptions and promotions.")

    try:
        return actor.supplier_profile
    except Supplier.DoesNotExist as exc:
        raise ValidationError({"supplier": ["Supplier profile is missing."]}) from exc


@transaction.atomic
def upgrade_supplier_subscription(*, actor: User, plan_type: str, supplier_id: int | None = None) -> SupplierSubscription:
    if plan_type not in SupplierSubscription.PlanType.values:
        raise ValidationError({"plan_type": ["Unsupported subscription plan."]})

    supplier = get_supplier_for_actor(actor, supplier_id=supplier_id)
    now = timezone.now()
    SupplierSubscription.objects.filter(supplier=supplier, active=True).update(active=False, end_date=now)

    subscription = SupplierSubscription.objects.create(
        supplier=supplier,
        plan_type=plan_type,
        price_per_month=SUBSCRIPTION_PRICES[plan_type],
        start_date=now,
        active=True,
    )

    if subscription.price_per_month > MONEY_ZERO:
        RevenueTransaction.objects.create(
            supplier=supplier,
            revenue_type=RevenueTransaction.RevenueType.SUBSCRIPTION,
            amount=subscription.price_per_month,
            currency="INR",
            description=f"{subscription.get_plan_type_display()} subscription",
            metadata={"subscription_id": subscription.id, "billing_period": "monthly"},
        )

    return subscription


@transaction.atomic
def promote_supplier(*, actor: User, promotion_type: str, weeks: int = 1, supplier_id: int | None = None) -> PromotedListing:
    if promotion_type not in PromotedListing.PromotionType.values:
        raise ValidationError({"promotion_type": ["Unsupported promotion type."]})
    if weeks < 1:
        raise ValidationError({"weeks": ["Promotion duration must be at least 1 week."]})

    supplier = get_supplier_for_actor(actor, supplier_id=supplier_id)
    now = timezone.now()
    amount = money(PROMOTION_PRICES[promotion_type] * weeks)
    promoted_listing = PromotedListing.objects.create(
        supplier=supplier,
        promotion_type=promotion_type,
        amount=amount,
        start_date=now,
        end_date=now + timedelta(weeks=weeks),
        active=True,
    )

    RevenueTransaction.objects.create(
        supplier=supplier,
        revenue_type=RevenueTransaction.RevenueType.PROMOTED_LISTING,
        amount=amount,
        currency="INR",
        description=promoted_listing.get_promotion_type_display(),
        metadata={"promotion_id": promoted_listing.id, "weeks": weeks},
    )

    return promoted_listing


def revenue_sum(queryset) -> Decimal:
    return queryset.aggregate(total=Sum("amount"))["total"] or MONEY_ZERO


def revenue_breakdown(queryset) -> dict[str, Decimal]:
    grouped = queryset.values("revenue_type").annotate(total=Sum("amount"))
    return {row["revenue_type"]: money(row["total"] or MONEY_ZERO) for row in grouped}


def get_revenue_dashboard() -> dict:
    now = timezone.now()
    starts = {
        "daily": now - timedelta(days=1),
        "weekly": now - timedelta(days=7),
        "monthly": now - timedelta(days=30),
        "yearly": now - timedelta(days=365),
    }
    queryset = RevenueTransaction.objects.all()

    totals = {
        key: money(revenue_sum(queryset.filter(created_at__gte=start)))
        for key, start in starts.items()
    }

    by_type = revenue_breakdown(queryset.filter(created_at__gte=starts["monthly"]))
    monthly_rows = (
        queryset.filter(created_at__gte=now - timedelta(days=365))
        .annotate(month=TruncMonth("created_at"))
        .values("month")
        .annotate(revenue=Sum("amount"), transactions=Count("id"))
        .order_by("month")
    )
    monthly = [
        {
            "month": row["month"].date().isoformat(),
            "revenue": money(row["revenue"] or MONEY_ZERO),
            "transactions": row["transactions"],
        }
        for row in monthly_rows
    ]

    order_rows = (
        Order.objects.filter(payment_status=Order.PaymentStatus.CAPTURED, created_at__gte=now - timedelta(days=365))
        .annotate(month=TruncMonth("created_at"))
        .values("month")
        .annotate(orders=Count("id"), supplier_earnings=Sum("supplier_payout"))
        .order_by("month")
    )
    orders = [
        {
            "month": row["month"].date().isoformat(),
            "orders": row["orders"],
            "supplier_earnings": money(row["supplier_earnings"] or MONEY_ZERO),
        }
        for row in order_rows
    ]

    return {
        "totals": totals,
        "breakdown": by_type,
        "revenue_growth": monthly,
        "orders": orders,
    }


def get_monthly_revenue() -> list[dict]:
    return get_revenue_dashboard()["revenue_growth"]


def get_supplier_payouts(*, actor: User) -> list[dict]:
    queryset = Order.objects.filter(payment_status=Order.PaymentStatus.CAPTURED).select_related("assigned_supplier")
    if not (actor.is_superuser or actor.role == User.Role.ADMIN):
        if actor.role != User.Role.SUPPLIER:
            raise PermissionDenied("Only suppliers can view supplier payouts.")
        queryset = queryset.filter(assigned_supplier__user=actor)

    rows = (
        queryset.values("assigned_supplier_id", "assigned_supplier__business_name")
        .annotate(
            orders=Count("id"),
            gross_sales=Sum("total_price"),
            platform_revenue=Sum("platform_revenue"),
            supplier_payout=Sum("supplier_payout"),
        )
        .order_by("assigned_supplier__business_name")
    )

    return [
        {
            "supplier_id": row["assigned_supplier_id"],
            "supplier_name": row["assigned_supplier__business_name"],
            "orders": row["orders"],
            "gross_sales": money(row["gross_sales"] or MONEY_ZERO),
            "platform_revenue": money(row["platform_revenue"] or MONEY_ZERO),
            "supplier_payout": money(row["supplier_payout"] or MONEY_ZERO),
        }
        for row in rows
    ]
