from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings
from decimal import Decimal


class Supplier(models.Model):
    """Enhanced Supplier model with additional fields for ecommerce"""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="supplier_profile"
    )
    business_name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    
    # Rating and verification
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
    )
    total_reviews = models.PositiveIntegerField(default=0)
    is_verified = models.BooleanField(default=False)
    
    # Business metrics
    total_orders = models.PositiveIntegerField(default=0)
    total_revenue = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))]
    )
    repeat_customers = models.PositiveIntegerField(default=0)
    conversion_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00")), MaxValueValidator(Decimal("100.00"))]
    )
    
    # Delivery info
    delivery_time_hours = models.PositiveIntegerField(default=24)
    delivery_charges = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=Decimal("50.00"),
        validators=[MinValueValidator(Decimal("0.00"))]
    )
    
    # Business hours (JSON for flexibility)
    operating_hours = models.JSONField(
        default=dict,
        help_text="Operating hours: {day: {open: HH:MM, close: HH:MM}}"
    )
    
    # Media
    logo = models.ImageField(upload_to="suppliers/logos/", blank=True)
    cover_image = models.ImageField(upload_to="suppliers/covers/", blank=True)
    
    # Contact
    phone = models.CharField(max_length=15, blank=True)
    email = models.EmailField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_verified", "-rating", "business_name"]
        indexes = [
            models.Index(fields=["business_name"], name="supplier_business_idx"),
            models.Index(fields=["location"], name="supplier_location_idx"),
            models.Index(fields=["is_verified", "rating"], name="supplier_verified_rating_idx"),
            models.Index(fields=["total_orders"], name="supplier_orders_idx"),
        ]

    def __str__(self) -> str:
        return self.business_name

    def update_metrics(self):
        """Recalculate supplier metrics from orders"""
        from apps.orders.models import Order
        
        orders = Order.objects.filter(assigned_supplier=self, status=Order.Status.DELIVERED)
        self.total_orders = orders.count()
        self.total_revenue = sum(o.total_price for o in orders)
        
        # Calculate conversion rate
        if self.total_orders > 0:
            self.conversion_rate = Decimal(str(self.total_orders)) / Decimal("100")
        
        self.save()
