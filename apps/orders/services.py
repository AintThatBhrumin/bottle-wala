from decimal import Decimal

from django.conf import settings
from django.db import transaction
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.accounts.models import User
from apps.products.models import Product
from apps.products.services import validate_product_order_request
from apps.revenue.services import apply_order_revenue_snapshot, finalize_order_revenue
from apps.suppliers.models import Supplier

from .models import Order, OrderItem
from .payment_services import (
    build_checkout_payment_payload,
    create_razorpay_order,
    mark_razorpay_payment_failed,
    verify_razorpay_payment,
)


def get_order_supplier(*, order: Order) -> Supplier | None:
    if order.assigned_supplier_id:
        return order.assigned_supplier

    first_item = order.items.select_related("product__supplier").first()
    if first_item is None:
        return None
    return first_item.product.supplier


def get_orders_visible_to_user(*, user, queryset=None):
    queryset = queryset if queryset is not None else Order.objects.all()

    if user.is_superuser or user.role == User.Role.ADMIN:
        return queryset
    if user.role == User.Role.SUPPLIER:
        return queryset.filter(
            assigned_supplier__user=user,
            payment_status=Order.PaymentStatus.CAPTURED,
        )
    return queryset.filter(user=user)


def ensure_customer_can_view_order(*, customer, order: Order) -> None:
    if order.user_id != customer.id:
        raise PermissionDenied("You can only view your own orders.")


def ensure_customer_can_manage_payment(*, customer, order: Order) -> None:
    if customer.is_superuser or customer.role == User.Role.ADMIN:
        return
    if order.user_id != customer.id:
        raise PermissionDenied("You can only manage payment for your own orders.")


def ensure_supplier_can_manage_order(*, supplier_user, order: Order) -> None:
    if supplier_user.is_superuser or supplier_user.role == User.Role.ADMIN:
        return

    if order.assigned_supplier_id is None or order.assigned_supplier.user_id != supplier_user.id:
        raise PermissionDenied("You can only manage orders assigned to your supplier account.")
    if not order.is_payment_captured:
        raise PermissionDenied("Suppliers can only manage orders after payment is captured.")


def validate_order_items(*, items: list[dict]) -> Supplier:
    if not items:
        raise ValidationError({"items": ["At least one order item is required."]})

    suppliers: dict[int, Supplier] = {}
    item_errors: dict[int, dict] = {}

    for index, item in enumerate(items):
        product = item["product"]
        suppliers[product.supplier_id] = product.supplier

        try:
            validate_product_order_request(
                product=product,
                quantity=item["quantity"],
                sticker_type=item["sticker_type"],
                custom_text=item.get("custom_text", ""),
                custom_image=item.get("custom_image"),
            )
        except ValidationError as exc:
            item_errors[index] = exc.detail

    if len(suppliers) != 1:
        raise ValidationError({"items": ["All items in an order must belong to the same supplier."]})

    if item_errors:
        raise ValidationError({"items": item_errors})

    return next(iter(suppliers.values()))


@transaction.atomic
def create_order(*, customer, delivery_address: str, items: list[dict]) -> Order:
    if customer.role != User.Role.CUSTOMER and not customer.is_superuser:
        raise PermissionDenied("Only customers can create orders.")

    supplier = validate_order_items(items=items)

    order = Order.objects.create(
        user=customer,
        assigned_supplier=supplier,
        delivery_address=delivery_address.strip(),
        currency=settings.ORDER_CURRENCY,
        status=Order.Status.PAYMENT_PENDING,
    )
    order.receipt = build_order_receipt(order_id=order.id)
    order.save(update_fields=["receipt", "updated_at"])

    for item in items:
        product = Product.objects.select_related("supplier").get(pk=item["product"].pk)
        OrderItem.objects.create(
            order=order,
            product=product,
            quantity=item["quantity"],
            sticker_type=item["sticker_type"],
            custom_text=item.get("custom_text", ""),
            custom_image=item.get("custom_image"),
        )

    recalculate_order_total(order=order, commit=True)
    return order


@transaction.atomic
def start_order_checkout(*, customer, delivery_address: str, items: list[dict]) -> dict:
    order = create_order(customer=customer, delivery_address=delivery_address, items=items)
    payment_order = create_razorpay_order(order=order)
    if order.is_payment_captured:
        finalize_order_revenue(order=order)

    return {
        "order": order,
        "payment": build_checkout_payment_payload(order=order, gateway_order=payment_order),
    }


def recalculate_order_total(*, order: Order, commit: bool = True) -> Decimal:
    return apply_order_revenue_snapshot(order=order, commit=commit).total


def build_order_receipt(*, order_id: int) -> str:
    return f"jalsetu-order-{order_id}"


@transaction.atomic
def confirm_order_payment(
    *,
    order: Order,
    actor,
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
) -> Order:
    ensure_customer_can_manage_payment(customer=actor, order=order)
    return verify_razorpay_payment(
        order=order,
        razorpay_order_id=razorpay_order_id,
        razorpay_payment_id=razorpay_payment_id,
        razorpay_signature=razorpay_signature,
    )


@transaction.atomic
def fail_order_payment(
    *,
    order: Order,
    actor,
    razorpay_order_id: str = "",
    razorpay_payment_id: str = "",
    failure_reason: str = "",
) -> Order:
    ensure_customer_can_manage_payment(customer=actor, order=order)
    return mark_razorpay_payment_failed(
        order=order,
        razorpay_order_id=razorpay_order_id,
        razorpay_payment_id=razorpay_payment_id,
        failure_reason=failure_reason,
    )


@transaction.atomic
def update_order_status(*, order: Order, actor, status: str) -> Order:
    ensure_supplier_can_manage_order(supplier_user=actor, order=order)
    if order.status == Order.Status.PAYMENT_PENDING:
        raise ValidationError({"status": ["Payment must be captured before suppliers can update this order."]})
    order.status = status
    order.save(update_fields=["status", "updated_at"])
    return order
