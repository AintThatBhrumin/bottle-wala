from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import GuestSession, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "name",
            "role",
            "date_joined",
        )
        read_only_fields = ("id", "date_joined")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("email", "name", "role", "password")

    def validate_role(self, value: str) -> str:
        if value == User.Role.ADMIN:
            raise serializers.ValidationError("Admin accounts cannot be self-registered.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        return User.objects.create_user(password=password, **validated_data)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["email"] = user.email
        token["role"] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data


class GuestSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuestSession
        fields = ["guest_id", "cart_data", "browsing_history", "saved_suppliers", "expires_at"]
        read_only_fields = ["guest_id", "expires_at"]

    def create(self, validated_data):
        return GuestSession.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.cart_data = validated_data.get("cart_data", instance.cart_data)
        instance.browsing_history = validated_data.get("browsing_history", instance.browsing_history)
        instance.saved_suppliers = validated_data.get("saved_suppliers", instance.saved_suppliers)
        instance.save()
        return instance
