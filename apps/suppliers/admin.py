from django.contrib import admin

from .models import Supplier


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ("business_name", "user", "location", "rating", "is_verified")
    list_filter = ("is_verified", "location")
    search_fields = ("business_name", "location", "user__email", "user__name")
