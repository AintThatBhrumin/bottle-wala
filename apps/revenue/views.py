from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdminRole, IsSupplierOrAdminRole

from .serializers import (
    MonthlyRevenueSerializer,
    PromotedListingSerializer,
    RevenueDashboardSerializer,
    SubscriptionUpgradeSerializer,
    SupplierPayoutSerializer,
    SupplierPromotionCreateSerializer,
    SupplierSubscriptionSerializer,
)
from .services import get_monthly_revenue, get_revenue_dashboard, get_supplier_payouts


class RevenueDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def get(self, request):
        serializer = RevenueDashboardSerializer(get_revenue_dashboard())
        return Response(serializer.data)


class MonthlyRevenueView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def get(self, request):
        serializer = MonthlyRevenueSerializer(get_monthly_revenue(), many=True)
        return Response(serializer.data)


class SubscriptionUpgradeView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSupplierOrAdminRole]

    def post(self, request):
        serializer = SubscriptionUpgradeSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        subscription = serializer.save()
        return Response(SupplierSubscriptionSerializer(subscription).data, status=status.HTTP_201_CREATED)


class SupplierPromoteView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSupplierOrAdminRole]

    def post(self, request):
        serializer = SupplierPromotionCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        promotion = serializer.save()
        return Response(PromotedListingSerializer(promotion).data, status=status.HTTP_201_CREATED)


class SupplierPayoutsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSupplierOrAdminRole]

    def get(self, request):
        serializer = SupplierPayoutSerializer(get_supplier_payouts(actor=request.user), many=True)
        return Response(serializer.data)
