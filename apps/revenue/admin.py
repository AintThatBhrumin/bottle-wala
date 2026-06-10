from django.contrib import admin

from .models import CommissionConfig, PromotedListing, RevenueTransaction, StickerPricing, SupplierSubscription


@admin.register(CommissionConfig)
class CommissionConfigAdmin(admin.ModelAdmin):
    list_display = ("commission_percentage", "delivery_margin_percentage", "delivery_margin_active", "active", "created_at")
    list_filter = ("active", "delivery_margin_active")


@admin.register(StickerPricing)
class StickerPricingAdmin(admin.ModelAdmin):
    list_display = (
        "sticker_type",
        "pricing_mode",
        "price_per_bottle",
        "minimum_price_per_bottle",
        "maximum_price_per_bottle",
        "active",
    )
    list_filter = ("sticker_type", "pricing_mode", "active")


@admin.register(SupplierSubscription)
class SupplierSubscriptionAdmin(admin.ModelAdmin):
    list_display = ("supplier", "plan_type", "price_per_month", "start_date", "end_date", "active")
    list_filter = ("plan_type", "active")
    search_fields = ("supplier__business_name", "supplier__user__email")


@admin.register(PromotedListing)
class PromotedListingAdmin(admin.ModelAdmin):
    list_display = ("supplier", "promotion_type", "amount", "start_date", "end_date", "active")
    list_filter = ("promotion_type", "active")
    search_fields = ("supplier__business_name", "supplier__user__email")


@admin.register(RevenueTransaction)
class RevenueTransactionAdmin(admin.ModelAdmin):
    list_display = ("revenue_type", "supplier", "order", "amount", "currency", "created_at")
    list_filter = ("revenue_type", "currency", "created_at")
    search_fields = ("supplier__business_name", "supplier__user__email", "description")
    readonly_fields = ("created_at",)
