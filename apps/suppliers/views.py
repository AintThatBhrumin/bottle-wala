from django.db.models import Q
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from .models import Supplier
from .permissions import CanApproveSupplier, IsSupplierOwnerOrAdmin
from .serializers import SupplierApprovalSerializer, SupplierSerializer


class SupplierViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Supplier.objects.select_related("user").all()
    serializer_class = SupplierSerializer

    def get_permissions(self):
        if self.action == "approve":
            return [permissions.IsAuthenticated(), CanApproveSupplier()]
        if self.action in {"create", "update", "partial_update", "mine"}:
            return [permissions.IsAuthenticated(), IsSupplierOwnerOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "approve":
            return SupplierApprovalSerializer
        return SupplierSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if not user.is_authenticated:
            return queryset.none()
        if user.is_superuser or user.role == user.Role.ADMIN:
            return queryset
        if user.role == user.Role.SUPPLIER:
            return queryset.filter(Q(is_verified=True) | Q(user=user))
        return queryset.filter(is_verified=True)

    def perform_create(self, serializer):
        if self.request.user.role != self.request.user.Role.SUPPLIER:
            raise PermissionDenied("Only supplier users can create a supplier profile.")
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        if not (self.request.user.is_superuser or self.request.user.role == self.request.user.Role.ADMIN):
            if serializer.instance.user_id != self.request.user.id:
                raise PermissionDenied("You can only update your own supplier profile.")
        serializer.save()

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def mine(self, request):
        profile = Supplier.objects.filter(user=request.user).first()
        if not profile:
            return Response({"detail": "Supplier profile not found."}, status=404)
        return Response(self.get_serializer(profile).data)

    @action(detail=True, methods=["patch"])
    def approve(self, request, pk=None):
        supplier = self.get_object()
        serializer = self.get_serializer(supplier, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(SupplierSerializer(supplier, context=self.get_serializer_context()).data, status=status.HTTP_200_OK)
