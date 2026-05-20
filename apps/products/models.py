from decimal import Decimal

from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import CheckConstraint, Index, Q, UniqueConstraint
from django.db.models.functions import Lower

from apps.suppliers.models import Supplier


class Product(models.Model):
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name="products")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price_per_unit = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    min_order_quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    image = models.ImageField(upload_to="products/water-bottles/", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        indexes = [
            Index(fields=["supplier", "name"], name="products_supplier_name_idx"),
            Index(fields=["price_per_unit"], name="products_price_idx"),
            Index(fields=["created_at"], name="products_created_idx"),
        ]
        constraints = [
            UniqueConstraint(Lower("name"), "supplier", name="products_supplier_name_ci_unique"),
            CheckConstraint(check=Q(price_per_unit__gt=0), name="products_price_positive"),
            CheckConstraint(check=Q(min_order_quantity__gte=1), name="products_min_order_gte_1"),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.supplier.business_name})"

    def clean(self) -> None:
        super().clean()
        self.name = (self.name or "").strip()
        if not self.name:
            raise ValidationError({"name": "Product name is required."})
        if self.min_order_quantity < 1:
            raise ValidationError({"min_order_quantity": "Minimum order quantity must be at least 1."})

    def calculate_price(self, quantity: int) -> Decimal:
        if quantity < self.min_order_quantity:
            raise ValidationError(
                {"quantity": f"Quantity must be at least the minimum order quantity of {self.min_order_quantity}."}
            )
        return self.price_per_unit * quantity

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class StickerOption(models.Model):
    class Type(models.TextChoices):
        SUPPLIER = "supplier", "Supplier"
        CUSTOM = "custom", "Custom"

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="sticker_options")
    type = models.CharField(max_length=20, choices=Type.choices)
    template_image = models.ImageField(upload_to="products/sticker-templates/", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["product_id", "type"]
        indexes = [
            Index(fields=["product", "type"], name="sticker_product_type_idx"),
        ]
        constraints = [
            UniqueConstraint(fields=["product", "type"], name="sticker_unique_type_per_product"),
        ]

    def __str__(self) -> str:
        return f"{self.product.name} - {self.get_type_display()} sticker"
