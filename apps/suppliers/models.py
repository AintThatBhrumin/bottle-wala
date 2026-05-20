from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import CheckConstraint, Index, Q


class Supplier(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="supplier_profile")
    business_name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
    )
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_verified", "-rating", "business_name"]
        indexes = [
            Index(fields=["business_name"], name="suppliers_business_idx"),
            Index(fields=["location"], name="suppliers_location_idx"),
            Index(fields=["is_verified", "rating"], name="suppliers_verified_rating_idx"),
        ]
        constraints = [
            CheckConstraint(
                check=Q(rating__gte=0) & Q(rating__lte=5),
                name="suppliers_rating_between_0_and_5",
            ),
        ]

    def __str__(self) -> str:
        return self.business_name

    def clean(self) -> None:
        super().clean()
        self.business_name = (self.business_name or "").strip()
        self.location = (self.location or "").strip()
        if not self.business_name:
            raise ValidationError({"business_name": "Business name is required."})
        if not self.location:
            raise ValidationError({"location": "Location is required."})
        if self.user_id and self.user.role != self.user.Role.SUPPLIER:
            raise ValidationError({"user": "Supplier profile user must have the supplier role."})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


SupplierProfile = Supplier
