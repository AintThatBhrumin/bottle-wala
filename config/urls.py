from django.contrib import admin
from django.urls import include, path

from apps.revenue.views import SubscriptionUpgradeView, SupplierPayoutsView, SupplierPromoteView


admin.site.site_header = "Jal-Setu Admin"
admin.site.site_title = "Jal-Setu Admin"
admin.site.index_title = "Jal-Setu Platform Administration"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/suppliers/", include("apps.suppliers.urls")),
    path("api/products/", include("apps.products.urls")),
    path("api/orders/", include("apps.orders.urls")),
    path("api/revenue/", include("apps.revenue.urls")),
    path("api/subscription/upgrade/", SubscriptionUpgradeView.as_view(), name="subscription-upgrade"),
    path("api/supplier/promote/", SupplierPromoteView.as_view(), name="supplier-promote"),
    path("api/supplier/payouts/", SupplierPayoutsView.as_view(), name="supplier-payouts"),
]
