from django.db import transaction

from apps.accounts.models import User

from .models import SupplierProfile


@transaction.atomic
def create_supplier_profile(*, user: User, **data) -> SupplierProfile:
    if user.role == User.Role.CUSTOMER:
        user.role = User.Role.SUPPLIER
        user.save(update_fields=["role"])
    return SupplierProfile.objects.create(user=user, **data)
