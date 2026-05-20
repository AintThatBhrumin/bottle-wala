from django.contrib import admin

from .models import Product, StickerOption


class StickerOptionInline(admin.TabularInline):
    model = StickerOption
    extra = 0


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "supplier", "price_per_unit", "min_order_quantity", "created_at")
    list_filter = ("supplier__is_verified",)
    search_fields = ("name", "supplier__business_name")
    inlines = [StickerOptionInline]
