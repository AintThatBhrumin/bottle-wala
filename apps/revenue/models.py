from decimal import Decimal

from django.db import models
from django.db.models import CheckConstraint, Index, Q, UniqueConstraint
from django.utils import timezone


class CommissionConfig(models.Model):
    commission_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("12.00"))
    delivery_margin_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("0.00"))
    delivery_margin_active = models.BooleanField(default=False)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            CheckConstraint(
                check=Q(commission_percentage__gte=0) & Q(commission_percentage__lte=100),
                name="revenue_commission_between_0_and_100",
            ),
            CheckConstraint(
                check=Q(delivery_margin_percentage__gte=0) & Q(delivery_margin_percentage__lte=100),
                name="revenue_delivery_margin_between_0_and_100",
            ),
            UniqueConstraint(
                fields=["active"],
                condition=Q(active=True),
                name="revenue_single_active_commission_config",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.commission_percentage}% commission"


class StickerPricing(models.Model):
    class StickerType(models.TextChoices):
        SUPPLIER = "supplier", "Supplier sticker"
        CUSTOM = "custom", "Custom branding"

    class PricingMode(models.TextChoices):
        FREE = "free", "Free"
        FIXED = "fixed", "Fixed"
        RANGE = "range", "Range"

    sticker_type = models.CharField(max_length=20, choices=StickerType.choices)
    price_per_bottle = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal("0.00"))
    minimum_price_per_bottle = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal("0.00"))
    maximum_price_per_bottle = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal("0.00"))
    pricing_mode = models.CharField(max_length=20, choices=PricingMode.choices, default=PricingMode.FIXED)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sticker_type", "-created_at"]
        indexes = [
            Index(fields=["sticker_type", "active"], name="sticker_type_active_idx"),
        ]
        constraints = [
            CheckConstraint(check=Q(price_per_bottle__gte=0), name="sticker_price_gte_0"),
            CheckConstraint(check=Q(minimum_price_per_bottle__gte=0), name="sticker_min_price_gte_0"),
            CheckConstraint(check=Q(maximum_price_per_bottle__gte=0), name="sticker_max_price_gte_0"),
            CheckConstraint(
                check=Q(maximum_price_per_bottle__gte=models.F("minimum_price_per_bottle")),
                name="sticker_max_gte_min",
            ),
            UniqueConstraint(
                fields=["sticker_type", "active"],
                condition=Q(active=True),
                name="sticker_single_active_type_pricing",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.get_sticker_type_display()} - {self.price_per_bottle}"


class SupplierSubscription(models.Model):
    class PlanType(models.TextChoices):
        FREE = "free", "Free"
        PRO = "pro", "Pro"
        ENTERPRISE = "enterprise", "Enterprise"

    supplier = models.ForeignKey("suppliers.Supplier", on_delete=models.CASCADE, related_name="subscriptions")
    plan_type = models.CharField(max_length=20, choices=PlanType.choices, default=PlanType.FREE)
    price_per_month = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField(null=True, blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-start_date"]
        indexes = [
            Index(fields=["supplier", "active"], name="supplier_sub_active_idx"),
            Index(fields=["plan_type"], name="supplier_subscription_plan_idx"),
        ]
        constraints = [
            CheckConstraint(check=Q(price_per_month__gte=0), name="subscription_price_gte_0"),
            UniqueConstraint(
                fields=["supplier", "active"],
                condition=Q(active=True),
                name="supplier_single_active_subscription",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.supplier} - {self.get_plan_type_display()}"


class PromotedListing(models.Model):
    class PromotionType(models.TextChoices):
        FEATURED = "featured_listing", "Featured listing"
        HOMEPAGE = "homepage_promotion", "Homepage promotion"

    supplier = models.ForeignKey("suppliers.Supplier", on_delete=models.CASCADE, related_name="promoted_listings")
    promotion_type = models.CharField(max_length=32, choices=PromotionType.choices)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField()
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-start_date"]
        indexes = [
            Index(fields=["supplier", "active"], name="promoted_supplier_active_idx"),
            Index(fields=["promotion_type"], name="promoted_listing_type_idx"),
        ]
        constraints = [
            CheckConstraint(check=Q(amount__gte=0), name="promoted_listing_amount_gte_0"),
        ]

    def __str__(self) -> str:
        return f"{self.supplier} - {self.get_promotion_type_display()}"


class RevenueTransaction(models.Model):
    class RevenueType(models.TextChoices):
        COMMISSION = "commission", "Commission"
        STICKER_FEE = "sticker_fee", "Sticker fee"
        SUBSCRIPTION = "subscription", "Subscription"
        PROMOTED_LISTING = "promoted_listing", "Promoted listing"
        DELIVERY_MARGIN = "delivery_margin", "Delivery margin"

    order = models.ForeignKey("orders.Order", on_delete=models.SET_NULL, related_name="revenue_transactions", null=True, blank=True)
    supplier = models.ForeignKey("suppliers.Supplier", on_delete=models.PROTECT, related_name="revenue_transactions")
    revenue_type = models.CharField(max_length=32, choices=RevenueType.choices)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="INR")
    description = models.CharField(max_length=255, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            Index(fields=["created_at"], name="revenue_txn_created_idx"),
            Index(fields=["supplier", "created_at"], name="rev_txn_supplier_created_idx"),
            Index(fields=["revenue_type", "created_at"], name="revenue_txn_type_created_idx"),
        ]
        constraints = [
            CheckConstraint(check=Q(amount__gte=0), name="revenue_txn_amount_gte_0"),
            UniqueConstraint(
                fields=["order", "revenue_type"],
                condition=Q(order__isnull=False),
                name="revenue_single_order_type_transaction",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.get_revenue_type_display()} - {self.amount} {self.currency}"
