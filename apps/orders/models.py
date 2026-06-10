from decimal import Decimal, ROUND_HALF_UP

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import CheckConstraint, Index, Q, UniqueConstraint
from django.utils import timezone

from apps.products.models import Product
from apps.suppliers.models import Supplier


class Order(models.Model):
    class Status(models.TextChoices):
        PAYMENT_PENDING = "payment_pending", "Payment Pending"
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"

    class PaymentStatus(models.TextChoices):
        CREATED = "created", "Created"
        AUTHORIZED = "authorized", "Authorized"
        CAPTURED = "captured", "Captured"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders")
    assigned_supplier = models.ForeignKey(
        Supplier,
        on_delete=models.PROTECT,
        related_name="orders",
        null=True,
        blank=True,
    )
    total_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    subtotal_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    customization_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    delivery_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    commission_percentage_snapshot = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    commission_revenue = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    delivery_margin_revenue = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    platform_revenue = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    supplier_payout = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PAYMENT_PENDING)
    currency = models.CharField(max_length=3, default="INR")
    receipt = models.CharField(max_length=40, unique=True, blank=True, null=True)
    payment_provider = models.CharField(max_length=32, default="razorpay")
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.CREATED)
    payment_order_id = models.CharField(max_length=64, blank=True)
    payment_id = models.CharField(max_length=64, blank=True)
    payment_signature = models.CharField(max_length=128, blank=True)
    payment_failure_reason = models.CharField(max_length=255, blank=True)
    payment_captured_at = models.DateTimeField(null=True, blank=True)
    delivery_address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            Index(fields=["user", "status"], name="orders_user_status_idx"),
            Index(fields=["assigned_supplier", "status"], name="orders_supplier_status_idx"),
            Index(fields=["payment_status"], name="orders_payment_status_idx"),
            Index(fields=["payment_order_id"], name="orders_payment_order_idx"),
            Index(fields=["created_at"], name="orders_created_idx"),
        ]
        constraints = [
            CheckConstraint(check=Q(total_price__gte=0), name="orders_total_price_gte_0"),
            CheckConstraint(check=Q(subtotal_price__gte=0), name="orders_subtotal_price_gte_0"),
            CheckConstraint(check=Q(customization_total__gte=0), name="orders_custom_total_gte_0"),
            CheckConstraint(check=Q(delivery_cost__gte=0), name="orders_delivery_cost_gte_0"),
            CheckConstraint(check=Q(commission_revenue__gte=0), name="orders_commission_revenue_gte_0"),
            CheckConstraint(check=Q(delivery_margin_revenue__gte=0), name="orders_delivery_margin_gte_0"),
            CheckConstraint(check=Q(platform_revenue__gte=0), name="orders_platform_revenue_gte_0"),
            CheckConstraint(check=Q(supplier_payout__gte=0), name="orders_supplier_payout_gte_0"),
            UniqueConstraint(
                fields=["payment_order_id"],
                condition=~Q(payment_order_id=""),
                name="orders_payment_order_id_unique",
            ),
            UniqueConstraint(
                fields=["payment_id"],
                condition=~Q(payment_id=""),
                name="orders_payment_id_unique",
            ),
        ]

    def __str__(self) -> str:
        return f"Order #{self.pk} - {self.user.email}"

    def clean(self) -> None:
        super().clean()
        self.delivery_address = (self.delivery_address or "").strip()
        self.currency = (self.currency or "INR").strip().upper()
        self.receipt = (self.receipt or "").strip() or None
        self.payment_failure_reason = (self.payment_failure_reason or "").strip()
        if not self.delivery_address:
            raise ValidationError({"delivery_address": "Delivery address is required."})
        if self.user_id and self.user.role != self.user.Role.CUSTOMER:
            raise ValidationError({"user": "Only customers can place orders."})
        if self.assigned_supplier_id and self.assigned_supplier.user.role != self.user.Role.SUPPLIER:
            raise ValidationError({"assigned_supplier": "Assigned supplier must belong to a supplier account."})
        if len(self.currency) != 3:
            raise ValidationError({"currency": "Currency must be a valid 3-letter ISO code."})

    def recalculate_total_price(self, *, commit: bool = False) -> Decimal:
        from apps.revenue.services import apply_order_revenue_snapshot

        apply_order_revenue_snapshot(order=self, commit=commit)
        return self.total_price

    def get_total_in_subunits(self) -> int:
        quantized_total = self.total_price.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        return int((quantized_total * 100).to_integral_value(rounding=ROUND_HALF_UP))

    @property
    def is_payment_captured(self) -> bool:
        return self.payment_status == self.PaymentStatus.CAPTURED

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    class StickerType(models.TextChoices):
        SUPPLIER = "supplier", "Supplier"
        CUSTOM = "custom", "Custom"

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name="order_items")
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    sticker_type = models.CharField(max_length=20, choices=StickerType.choices)
    custom_text = models.CharField(max_length=255, blank=True)
    custom_image = models.ImageField(upload_to="orders/custom-stickers/", blank=True)
    unit_price_snapshot = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    sticker_fee_snapshot = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal("0.00"))
    customization_total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    line_total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["id"]
        indexes = [
            Index(fields=["order", "product"], name="order_items_order_product_idx"),
            Index(fields=["sticker_type"], name="order_items_sticker_type_idx"),
        ]
        constraints = [
            CheckConstraint(check=Q(quantity__gte=1), name="order_items_quantity_gte_1"),
            CheckConstraint(check=Q(unit_price_snapshot__gte=0), name="order_items_unit_price_gte_0"),
            CheckConstraint(check=Q(sticker_fee_snapshot__gte=0), name="order_items_sticker_fee_gte_0"),
            CheckConstraint(check=Q(customization_total__gte=0), name="order_items_custom_total_gte_0"),
            CheckConstraint(check=Q(line_total__gte=0), name="order_items_line_total_gte_0"),
        ]

    def __str__(self) -> str:
        return f"{self.product.name} x {self.quantity}"

    def clean(self) -> None:
        super().clean()
        self.custom_text = (self.custom_text or "").strip()
        if self.quantity < self.product.min_order_quantity:
            raise ValidationError(
                {"quantity": f"Quantity must be at least {self.product.min_order_quantity} for this product."}
            )
        if self.sticker_type == self.StickerType.CUSTOM and not (self.custom_text or self.custom_image):
            raise ValidationError(
                {"custom_text": "Provide custom text or a custom image when using a custom sticker type."}
            )
        if self.sticker_type == self.StickerType.SUPPLIER and (self.custom_text or self.custom_image):
            raise ValidationError(
                {"sticker_type": "Supplier sticker items cannot include custom text or a custom image."}
            )

    def calculate_line_total(self) -> Decimal:
        from apps.revenue.services import calculate_item_total

        _, customization_cost, line_total = calculate_item_total(
            unit_price=self.product.price_per_unit,
            quantity=self.quantity,
            sticker_type=self.sticker_type,
        )
        self.sticker_fee_snapshot = Decimal("0.00") if self.quantity == 0 else customization_cost / self.quantity
        self.customization_total = customization_cost
        return line_total

    def save(self, *args, **kwargs):
        self.unit_price_snapshot = self.product.price_per_unit
        self.line_total = self.calculate_line_total()
        self.full_clean()
        super().save(*args, **kwargs)
