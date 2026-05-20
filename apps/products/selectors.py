from .models import Product


def list_active_products():
    return Product.objects.filter(is_active=True, supplier__is_active=True).select_related("supplier", "category")
