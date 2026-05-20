from rest_framework.permissions import BasePermission


class IsOrderStakeholder(BasePermission):
    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj) -> bool:
        if request.user.is_superuser or request.user.role == request.user.Role.ADMIN:
            return True
        if obj.user_id == request.user.id:
            return True
        return obj.items.filter(product__supplier__user=request.user).exists()


class CanCreateOrder(BasePermission):
    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_superuser or request.user.role == request.user.Role.CUSTOMER)
        )


class CanManageOrderStatus(BasePermission):
    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_superuser or request.user.role in {request.user.Role.SUPPLIER, request.user.Role.ADMIN})
        )

    def has_object_permission(self, request, view, obj) -> bool:
        if request.user.is_superuser or request.user.role == request.user.Role.ADMIN:
            return True
        return obj.assigned_supplier_id is not None and obj.assigned_supplier.user_id == request.user.id


class CanManageOwnOrderPayment(BasePermission):
    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_superuser or request.user.role in {request.user.Role.CUSTOMER, request.user.Role.ADMIN})
        )

    def has_object_permission(self, request, view, obj) -> bool:
        if request.user.is_superuser or request.user.role == request.user.Role.ADMIN:
            return True
        return obj.user_id == request.user.id
