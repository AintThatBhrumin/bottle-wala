from rest_framework.permissions import BasePermission


class IsSupplierOwnerOrAdmin(BasePermission):
    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj) -> bool:
        return bool(request.user.is_superuser or request.user.role == request.user.Role.ADMIN or obj.user_id == request.user.id)


class CanApproveSupplier(BasePermission):
    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_superuser or request.user.role == request.user.Role.ADMIN)
        )
