from rest_framework import serializers

from .models import Supplier


class SupplierSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_name = serializers.CharField(source="user.name", read_only=True)

    class Meta:
        model = Supplier
        fields = (
            "id",
            "user",
            "user_email",
            "user_name",
            "business_name",
            "location",
            "rating",
            "is_verified",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "user", "user_email", "user_name", "rating", "is_verified", "created_at", "updated_at")

    def validate(self, attrs):
        request = self.context["request"]
        if request.method == "POST" and hasattr(request.user, "supplier_profile"):
            raise serializers.ValidationError({"user": "This user already has a supplier profile."})
        if request.method == "POST" and request.user.role != request.user.Role.SUPPLIER:
            raise serializers.ValidationError({"user": "Only supplier users can create a supplier profile."})
        return attrs

    def create(self, validated_data):
        return Supplier.objects.create(user=self.context["request"].user, **validated_data)


class SupplierApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ("is_verified",)
