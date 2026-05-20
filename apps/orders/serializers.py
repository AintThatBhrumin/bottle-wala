import re

from rest_framework import serializers

from apps.products.models import Product
from apps.products.serializers import ProductSerializer

from .models import Order, OrderItem
from .services import (
    confirm_order_payment,
    fail_order_payment,
    get_order_supplier,
    start_order_checkout,
    update_order_status,
)


class OrderItemCreateSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.select_related("supplier").all())
    quantity = serializers.IntegerField(min_value=1)
    sticker_type = serializers.ChoiceField(choices=OrderItem.StickerType.choices)
    custom_text = serializers.CharField(required=False, allow_blank=True, default="")
    custom_image = serializers.ImageField(required=False, allow_null=True)


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = (
            "id",
            "product",
            "quantity",
            "sticker_type",
            "custom_text",
            "custom_image",
            "unit_price_snapshot",
            "line_total",
            "created_at",
        )


class OrderSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    supplier = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            "id",
            "user",
            "user_email",
            "supplier",
            "total_price",
            "status",
            "payment_status",
            "currency",
            "delivery_address",
            "items",
            "payment_captured_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "user",
            "user_email",
            "supplier",
            "total_price",
            "payment_status",
            "currency",
            "payment_captured_at",
            "created_at",
            "updated_at",
        )

    def get_supplier(self, obj):
        supplier = get_order_supplier(order=obj)
        if supplier is None:
            return None
        return {
            "id": supplier.id,
            "business_name": supplier.business_name,
            "location": supplier.location,
            "is_verified": supplier.is_verified,
        }


class OrderCheckoutPaymentSerializer(serializers.Serializer):
    provider = serializers.CharField()
    key = serializers.CharField()
    amount = serializers.IntegerField()
    currency = serializers.CharField()
    order_id = serializers.CharField()
    name = serializers.CharField()
    description = serializers.CharField()
    prefill = serializers.DictField()
    notes = serializers.DictField()


class OrderCheckoutResponseSerializer(serializers.Serializer):
    order = OrderSerializer()
    payment = OrderCheckoutPaymentSerializer()


class OrderCreateSerializer(serializers.Serializer):
    delivery_address = serializers.CharField()
    items = OrderItemCreateSerializer(many=True)

    def to_internal_value(self, data):
        if hasattr(data, "keys"):
            pattern = re.compile(r"^items\[(\d+)\]\[(\w+)\]$")
            extracted_items = {}

            for key in data.keys():
                match = pattern.match(str(key))
                if not match:
                    continue

                index = int(match.group(1))
                field = match.group(2)
                extracted_items.setdefault(index, {})[field] = data.get(key)

            if extracted_items:
                normalized = {
                    "delivery_address": data.get("delivery_address", ""),
                    "items": [extracted_items[index] for index in sorted(extracted_items.keys())],
                }
                return super().to_internal_value(normalized)

        return super().to_internal_value(data)

    def create(self, validated_data):
        return start_order_checkout(
            customer=self.context["request"].user,
            delivery_address=validated_data["delivery_address"],
            items=validated_data["items"],
        )

    def to_representation(self, instance):
        return OrderCheckoutResponseSerializer(instance, context=self.context).data


class OrderPaymentVerificationSerializer(serializers.Serializer):
    razorpay_payment_id = serializers.CharField()
    razorpay_order_id = serializers.CharField()
    razorpay_signature = serializers.CharField()

    def save(self, **kwargs):
        return confirm_order_payment(
            order=self.context["order"],
            actor=self.context["request"].user,
            razorpay_order_id=self.validated_data["razorpay_order_id"],
            razorpay_payment_id=self.validated_data["razorpay_payment_id"],
            razorpay_signature=self.validated_data["razorpay_signature"],
        )


class OrderPaymentFailureSerializer(serializers.Serializer):
    razorpay_order_id = serializers.CharField(required=False, allow_blank=True, default="")
    razorpay_payment_id = serializers.CharField(required=False, allow_blank=True, default="")
    error_code = serializers.CharField(required=False, allow_blank=True, default="")
    error_description = serializers.CharField(required=False, allow_blank=True, default="")
    error_source = serializers.CharField(required=False, allow_blank=True, default="")
    error_step = serializers.CharField(required=False, allow_blank=True, default="")
    error_reason = serializers.CharField(required=False, allow_blank=True, default="")

    def save(self, **kwargs):
        parts = [
            self.validated_data.get("error_code", "").strip(),
            self.validated_data.get("error_description", "").strip(),
            self.validated_data.get("error_source", "").strip(),
            self.validated_data.get("error_step", "").strip(),
            self.validated_data.get("error_reason", "").strip(),
        ]
        failure_reason = " | ".join(part for part in parts if part)
        return fail_order_payment(
            order=self.context["order"],
            actor=self.context["request"].user,
            razorpay_order_id=self.validated_data["razorpay_order_id"],
            razorpay_payment_id=self.validated_data["razorpay_payment_id"],
            failure_reason=failure_reason,
        )


class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ("status",)

    def validate_status(self, value):
        if value not in {Order.Status.ACCEPTED, Order.Status.DELIVERED, Order.Status.CANCELLED}:
            raise serializers.ValidationError("Suppliers can only mark orders as accepted, delivered, or cancelled.")
        return value

    def update(self, instance, validated_data):
        actor = self.context["request"].user
        return update_order_status(order=instance, actor=actor, status=validated_data["status"])
