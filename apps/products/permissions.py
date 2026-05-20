from rest_framework.permissions import BasePermission


class CanManageProducts(BasePermission):
    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_superuser or request.user.role in {request.user.Role.SUPPLIER, request.user.Role.ADMIN})
        )


class IsProductOwnerOrAdmin(BasePermission):
    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj) -> bool:
        return bool(
            request.user.is_superuser
            or request.user.role == request.user.Role.ADMIN
            or obj.supplier.user_id == request.user.id
        )
