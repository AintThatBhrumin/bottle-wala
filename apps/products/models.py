from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from apps.suppliers.models import Supplier


class Product(models.Model):
    """Enhanced Product model with bottle sizes and supplier controls"""
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name="products")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price_per_unit = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    
    # Bottle size tracking (JSON for flexibility)
    bottle_sizes = models.JSONField(
        default=list,
        help_text="Available bottle sizes: [1, 5, 10, 20, 'custom']"
    )
    
    # Supplier controls
    min_order_quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    max_order_quantity = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1)]
    )
    stock_visible = models.BooleanField(default=True)
    recurring_delivery_enabled = models.BooleanField(default=False)
    delivery_radius_km = models.IntegerField(default=10, validators=[MinValueValidator(1)])
    
    # Stock management
    current_stock = models.PositiveIntegerField(default=0)
    
    # Media
    image = models.ImageField(upload_to="products/water-bottles/", blank=True)
    images = models.JSONField(
        default=list,
        help_text="Additional product images URLs"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["supplier", "is_active"], name="product_supplier_active_idx"),
            models.Index(fields=["price_per_unit"], name="product_price_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.supplier.business_name})"

    def get_available_sizes(self):
        """Return list of available bottle sizes"""
        return self.bottle_sizes or []

    def calculate_price_for_size(self, size: str, quantity: int) -> Decimal:
        """Calculate price based on bottle size and quantity"""
        if quantity < self.min_order_quantity:
            raise ValueError(
                f"Minimum order quantity is {self.min_order_quantity}"
            )
        if self.max_order_quantity and quantity > self.max_order_quantity:
            raise ValueError(
                f"Maximum order quantity is {self.max_order_quantity}"
            )
        return self.price_per_unit * quantity
