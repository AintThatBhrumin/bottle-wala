from rest_framework.permissions import BasePermission

from .models import User


class RolePermission(BasePermission):
    allowed_roles: set[str] = set()

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.is_superuser or user.role in self.allowed_roles)
        )


class IsAdminRole(RolePermission):
    allowed_roles = {User.Role.ADMIN}


class IsSupplierRole(RolePermission):
    allowed_roles = {User.Role.SUPPLIER}


class IsCustomerRole(RolePermission):
    allowed_roles = {User.Role.CUSTOMER}


class IsSupplierOrAdminRole(RolePermission):
    allowed_roles = {User.Role.SUPPLIER, User.Role.ADMIN}


class IsCustomerOrAdminRole(RolePermission):
    allowed_roles = {User.Role.CUSTOMER, User.Role.ADMIN}
