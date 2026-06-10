from rest_framework import serializers

from .models import PromotedListing, SupplierSubscription
from .services import promote_supplier, upgrade_supplier_subscription


class RevenueTotalsSerializer(serializers.Serializer):
    daily = serializers.DecimalField(max_digits=12, decimal_places=2)
    weekly = serializers.DecimalField(max_digits=12, decimal_places=2)
    monthly = serializers.DecimalField(max_digits=12, decimal_places=2)
    yearly = serializers.DecimalField(max_digits=12, decimal_places=2)


class RevenueBreakdownSerializer(serializers.Serializer):
    commission = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    sticker_fee = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    subscription = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    promoted_listing = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    delivery_margin = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)


class MonthlyRevenueSerializer(serializers.Serializer):
    month = serializers.DateField()
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    transactions = serializers.IntegerField()


class MonthlyOrderSerializer(serializers.Serializer):
    month = serializers.DateField()
    orders = serializers.IntegerField()
    supplier_earnings = serializers.DecimalField(max_digits=12, decimal_places=2)


class RevenueDashboardSerializer(serializers.Serializer):
    totals = RevenueTotalsSerializer()
    breakdown = RevenueBreakdownSerializer()
    revenue_growth = MonthlyRevenueSerializer(many=True)
    orders = MonthlyOrderSerializer(many=True)


class SubscriptionUpgradeSerializer(serializers.Serializer):
    supplier = serializers.IntegerField(required=False)
    plan_type = serializers.ChoiceField(choices=SupplierSubscription.PlanType.choices)

    def save(self, **kwargs):
        return upgrade_supplier_subscription(
            actor=self.context["request"].user,
            supplier_id=self.validated_data.get("supplier"),
            plan_type=self.validated_data["plan_type"],
        )


class SupplierSubscriptionSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source="supplier.business_name", read_only=True)

    class Meta:
        model = SupplierSubscription
        fields = (
            "id",
            "supplier",
            "supplier_name",
            "plan_type",
            "price_per_month",
            "start_date",
            "end_date",
            "active",
            "created_at",
        )
        read_only_fields = fields


class SupplierPromotionCreateSerializer(serializers.Serializer):
    supplier = serializers.IntegerField(required=False)
    promotion_type = serializers.ChoiceField(choices=PromotedListing.PromotionType.choices)
    weeks = serializers.IntegerField(min_value=1, max_value=52, default=1)

    def save(self, **kwargs):
        return promote_supplier(
            actor=self.context["request"].user,
            supplier_id=self.validated_data.get("supplier"),
            promotion_type=self.validated_data["promotion_type"],
            weeks=self.validated_data["weeks"],
        )


class PromotedListingSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source="supplier.business_name", read_only=True)

    class Meta:
        model = PromotedListing
        fields = (
            "id",
            "supplier",
            "supplier_name",
            "promotion_type",
            "amount",
            "start_date",
            "end_date",
            "active",
            "created_at",
        )
        read_only_fields = fields


class SupplierPayoutSerializer(serializers.Serializer):
    supplier_id = serializers.IntegerField()
    supplier_name = serializers.CharField()
    orders = serializers.IntegerField()
    gross_sales = serializers.DecimalField(max_digits=12, decimal_places=2)
    platform_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    supplier_payout = serializers.DecimalField(max_digits=12, decimal_places=2)
