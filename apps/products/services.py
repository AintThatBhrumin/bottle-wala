from decimal import Decimal

from rest_framework.exceptions import ValidationError

from .models import Product


def validate_product_order_request(
    *,
    product: Product,
    quantity: int,
    sticker_type: str,
    custom_text: str = "",
    custom_image=None,
) -> None:
    if not product.supplier.is_verified:
        raise ValidationError({"product": [f"Supplier '{product.supplier.business_name}' is not approved for ordering yet."]})

    if quantity < product.min_order_quantity:
        raise ValidationError(
            {"quantity": [f"Minimum order quantity for '{product.name}' is {product.min_order_quantity}."]}
        )

    if sticker_type == "custom" and not (custom_text or custom_image):
        raise ValidationError({"sticker_type": ["Custom sticker orders require custom text or a custom image."]})

    if sticker_type == "supplier" and (custom_text or custom_image):
        raise ValidationError({"sticker_type": ["Supplier sticker orders cannot include custom text or a custom image."]})


def calculate_line_total(*, product: Product, quantity: int) -> Decimal:
    return product.price_per_unit * quantity
