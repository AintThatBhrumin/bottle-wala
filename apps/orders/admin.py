from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = (
        "product",
        "quantity",
        "sticker_type",
        "custom_text",
        "custom_image",
        "unit_price_snapshot",
        "sticker_fee_snapshot",
        "customization_total",
        "line_total",
    )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "assigned_supplier",
        "status",
        "payment_status",
        "total_price",
        "platform_revenue",
        "supplier_payout",
        "created_at",
    )
    list_filter = ("status", "payment_status", "created_at")
    search_fields = ("user__email", "delivery_address", "payment_order_id", "payment_id", "receipt")
    inlines = [OrderItemInline]
