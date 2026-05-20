from rest_framework import mixins, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.permissions import IsCustomerOrAdminRole, IsSupplierOrAdminRole

from .models import Order
from .permissions import CanCreateOrder, CanManageOrderStatus, CanManageOwnOrderPayment, IsOrderStakeholder
from .serializers import (
    OrderCreateSerializer,
    OrderPaymentFailureSerializer,
    OrderPaymentVerificationSerializer,
    OrderSerializer,
    OrderStatusUpdateSerializer,
)
from .services import get_orders_visible_to_user


class OrderViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = (
        Order.objects.select_related("user", "assigned_supplier", "assigned_supplier__user")
        .prefetch_related("items", "items__product", "items__product__supplier", "items__product__sticker_options")
        .all()
    )
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        if not user.is_authenticated:
            return queryset.none()
        return get_orders_visible_to_user(user=user, queryset=queryset)

    def get_serializer_class(self):
        if self.action == "create":
            return OrderCreateSerializer
        if self.action == "verify_payment":
            return OrderPaymentVerificationSerializer
        if self.action == "payment_failed":
            return OrderPaymentFailureSerializer
        if self.action in {"update", "partial_update"}:
            return OrderStatusUpdateSerializer
        return OrderSerializer

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated(), CanCreateOrder()]
        if self.action in {"verify_payment", "payment_failed"}:
            return [permissions.IsAuthenticated(), CanManageOwnOrderPayment()]
        if self.action in {"update", "partial_update"}:
            return [permissions.IsAuthenticated(), CanManageOrderStatus()]
        return [permissions.IsAuthenticated(), IsOrderStakeholder()]

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated, IsCustomerOrAdminRole])
    def history(self, request):
        queryset = self.get_queryset().filter(user=request.user)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = OrderSerializer(page, many=True, context=self.get_serializer_context())
            return self.get_paginated_response(serializer.data)
        serializer = OrderSerializer(queryset, many=True, context=self.get_serializer_context())
        return Response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated, IsSupplierOrAdminRole])
    def incoming(self, request):
        queryset = self.get_queryset()
        if not (request.user.is_superuser or request.user.role == request.user.Role.ADMIN):
            queryset = queryset.filter(assigned_supplier__user=request.user).distinct()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = OrderSerializer(page, many=True, context=self.get_serializer_context())
            return self.get_paginated_response(serializer.data)
        serializer = OrderSerializer(queryset, many=True, context=self.get_serializer_context())
        return Response(serializer.data)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[permissions.IsAuthenticated, CanManageOwnOrderPayment],
        url_path="verify-payment",
    )
    def verify_payment(self, request, pk=None):
        order = self.get_object()
        self.check_object_permissions(request, order)
        serializer = self.get_serializer(data=request.data, context={**self.get_serializer_context(), "order": order})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderSerializer(order, context=self.get_serializer_context()).data)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[permissions.IsAuthenticated, CanManageOwnOrderPayment],
        url_path="payment-failed",
    )
    def payment_failed(self, request, pk=None):
        order = self.get_object()
        self.check_object_permissions(request, order)
        serializer = self.get_serializer(data=request.data, context={**self.get_serializer_context(), "order": order})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderSerializer(order, context=self.get_serializer_context()).data)
