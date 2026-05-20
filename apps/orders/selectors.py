from .models import Order


def orders_for_user(user):
    queryset = Order.objects.select_related("customer", "supplier", "supplier__user").prefetch_related("items", "items__product")
    if user.is_staff:
        return queryset
    supplier_profile = getattr(user, "supplier_profile", None)
    if supplier_profile:
        return queryset.filter(supplier=supplier_profile)
    return queryset.filter(customer=user)
