from django.urls import path

from .views import (
    MonthlyRevenueView,
    RevenueDashboardView,
    SubscriptionUpgradeView,
    SupplierPayoutsView,
    SupplierPromoteView,
)


urlpatterns = [
    path("dashboard/", RevenueDashboardView.as_view(), name="revenue-dashboard"),
    path("monthly/", MonthlyRevenueView.as_view(), name="revenue-monthly"),
    path("subscription/upgrade/", SubscriptionUpgradeView.as_view(), name="subscription-upgrade"),
    path("supplier/promote/", SupplierPromoteView.as_view(), name="supplier-promote"),
    path("supplier/payouts/", SupplierPayoutsView.as_view(), name="supplier-payouts"),
]
