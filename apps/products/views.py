from django.db.models import Q
from rest_framework import mixins, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Product
from .permissions import CanManageProducts, IsProductOwnerOrAdmin
from .serializers import ProductSerializer


class ProductViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Product.objects.select_related("supplier", "supplier__user").prefetch_related("sticker_options").all()
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.action in {"create", "update", "partial_update", "mine"}:
            return [permissions.IsAuthenticated(), CanManageProducts(), IsProductOwnerOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if not user.is_authenticated:
            return queryset.none()

        supplier_id = self.request.query_params.get("supplier")
        if supplier_id:
            queryset = queryset.filter(supplier_id=supplier_id)

        if user.is_superuser or user.role == user.Role.ADMIN:
            return queryset

        if user.role == user.Role.SUPPLIER:
            return queryset.filter(Q(supplier__is_verified=True) | Q(supplier__user=user)).distinct()

        return queryset.filter(supplier__is_verified=True)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def mine(self, request):
        supplier_profile = getattr(request.user, "supplier_profile", None)
        queryset = self.get_queryset()
        if supplier_profile is None:
            queryset = queryset.none()
        else:
            queryset = queryset.filter(supplier=supplier_profile)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
