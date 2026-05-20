from django.db import transaction
from rest_framework import serializers

from apps.suppliers.models import Supplier

from .models import Product, StickerOption


class StickerOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StickerOption
        fields = ("id", "type", "template_image", "created_at")
        read_only_fields = ("id", "created_at")


class ProductSerializer(serializers.ModelSerializer):
    supplier = serializers.PrimaryKeyRelatedField(queryset=Supplier.objects.select_related("user").all(), required=False)
    supplier_name = serializers.CharField(source="supplier.business_name", read_only=True)
    sticker_options = StickerOptionSerializer(many=True, required=False)

    class Meta:
        model = Product
        fields = (
            "id",
            "supplier",
            "supplier_name",
            "name",
            "description",
            "price_per_unit",
            "min_order_quantity",
            "image",
            "sticker_options",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "supplier_name", "created_at", "updated_at")

    def validate_sticker_options(self, value):
        sticker_types = [item["type"] for item in value]
        if len(sticker_types) != len(set(sticker_types)):
            raise serializers.ValidationError("Sticker option types must be unique per product.")
        return value

    def validate(self, attrs):
        request = self.context["request"]
        user = request.user
        supplier = attrs.get("supplier") or getattr(self.instance, "supplier", None)

        if user.role == user.Role.SUPPLIER:
            own_supplier = getattr(user, "supplier_profile", None)
            if own_supplier is None:
                raise serializers.ValidationError({"supplier": "Create a supplier profile before managing products."})
            if supplier and supplier != own_supplier:
                raise serializers.ValidationError({"supplier": "You can only manage products for your own supplier profile."})
            attrs["supplier"] = own_supplier
        elif user.role != user.Role.ADMIN and not user.is_superuser:
            raise serializers.ValidationError("Only suppliers or admins can manage products.")
        elif supplier is None:
            raise serializers.ValidationError({"supplier": "Supplier is required."})

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        sticker_options = validated_data.pop("sticker_options", [])
        product = Product.objects.create(**validated_data)
        for sticker_option in sticker_options:
            StickerOption.objects.create(product=product, **sticker_option)
        return product

    @transaction.atomic
    def update(self, instance, validated_data):
        sticker_options = validated_data.pop("sticker_options", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if sticker_options is not None:
            instance.sticker_options.all().delete()
            for sticker_option in sticker_options:
                StickerOption.objects.create(product=instance, **sticker_option)

        return instance
