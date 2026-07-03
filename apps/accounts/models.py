import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Index, UniqueConstraint
from django.db.models.functions import Lower
from django.utils import timezone

from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        CUSTOMER = "customer", "Customer"
        SUPPLIER = "supplier", "Supplier"
        ADMIN = "admin", "Admin"

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    class Meta:
        ordering = ["-date_joined"]
        indexes = [
            Index(fields=["role", "is_active"], name="accounts_role_active_idx"),
            Index(fields=["date_joined"], name="accounts_joined_idx"),
        ]
        constraints = [
            UniqueConstraint(Lower("email"), name="accounts_user_email_ci_unique"),
        ]

    def __str__(self) -> str:
        return self.email

    def clean(self) -> None:
        super().clean()
        if not self.email:
            raise ValidationError({"email": "Email is required."})
        self.email = self.__class__.objects.normalize_email(self.email).lower()
        self.name = (self.name or "").strip()
        if not self.name:
            raise ValidationError({"name": "Name is required."})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class GuestSession(models.Model):
    """
    Tracks anonymous/guest users during their browsing session.
    When a guest user logs in, their cart is merged with the logged-in user's cart.
    """
    guest_id = models.UUIDField(default=uuid.uuid4, unique=True, db_index=True)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="guest_session",
        null=True,
        blank=True,
        help_text="Links to user after login/registration"
    )
    cart_data = models.JSONField(
        default=list,
        help_text="Stores guest cart items: [{product_id, quantity, bottle_size}, ...]"
    )
    browsing_history = models.JSONField(
        default=list,
        help_text="Recently viewed suppliers/products: [supplier_id, ...]"
    )
    saved_suppliers = models.JSONField(
        default=list,
        help_text="Saved supplier IDs for quick access"
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(
        help_text="Session expires after 7-14 days of inactivity"
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            Index(fields=["guest_id"], name="guest_session_guest_id_idx"),
            Index(fields=["user"], name="guest_session_user_idx"),
            Index(fields=["expires_at"], name="guest_session_expires_idx"),
        ]

    def __str__(self) -> str:
        return f"Guest {self.guest_id}"

    def is_expired(self) -> bool:
        return timezone.now() > self.expires_at

    def clean(self) -> None:
        super().clean()
        if self.user and self.user.role not in [self.user.Role.CUSTOMER, self.user.Role.ADMIN]:
            raise ValidationError({"user": "Only customers can have guest sessions."})

    def save(self, *args, **kwargs):
        if not self.expires_at:
            # Set expiry to 14 days from now
            self.expires_at = timezone.now() + timezone.timedelta(days=14)
        self.full_clean()
        super().save(*args, **kwargs)
