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
