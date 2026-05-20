from .models import SupplierProfile


def list_active_suppliers():
    return SupplierProfile.objects.filter(is_active=True).select_related("user")
