from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.accounts.models import User
from apps.products.models import Product, StickerOption
from apps.suppliers.models import Supplier


DEMO_SUPPLIERS = [
    {
        "email": "demo.supplier.aqua@jalsetu.local",
        "name": "Aqua Prime Demo",
        "business_name": "Aqua Prime Bottlers",
        "location": "Ahmedabad, Gujarat",
        "rating": Decimal("4.85"),
        "products": [
            {
                "name": "Premium 500ml Event Bottle",
                "description": "Clear PET bottle for launches, conferences, weddings, and hospitality events.",
                "price_per_unit": Decimal("18.00"),
                "min_order_quantity": 120,
            },
            {
                "name": "Matte Label 1L Bottle",
                "description": "Larger bottle format with a premium matte label option for VIP tables and gifting.",
                "price_per_unit": Decimal("32.00"),
                "min_order_quantity": 80,
            },
        ],
    },
    {
        "email": "demo.supplier.blueflow@jalsetu.local",
        "name": "Blueflow Demo",
        "business_name": "Blueflow Hydration Co.",
        "location": "Mumbai, Maharashtra",
        "rating": Decimal("4.70"),
        "products": [
            {
                "name": "Conference Ready 250ml Bottle",
                "description": "Compact bottle for seminars, corporate desks, sampling counters, and bulk venue use.",
                "price_per_unit": Decimal("12.00"),
                "min_order_quantity": 200,
            },
            {
                "name": "Custom Sponsor Bottle Pack",
                "description": "High-volume branded bottle pack with supplier labels or custom sponsor artwork.",
                "price_per_unit": Decimal("24.00"),
                "min_order_quantity": 150,
            },
        ],
    },
]


class Command(BaseCommand):
    help = "Seed verified demo suppliers and products for local marketplace demos."

    @transaction.atomic
    def handle(self, *args, **options):
        supplier_count = 0
        product_count = 0

        for supplier_data in DEMO_SUPPLIERS:
            user = User.objects.filter(email=supplier_data["email"]).first()
            if user is None:
                user = User.objects.create_user(
                    email=supplier_data["email"],
                    password=None,
                    name=supplier_data["name"],
                    role=User.Role.SUPPLIER,
                    is_active=True,
                )
            user.name = supplier_data["name"]
            user.role = User.Role.SUPPLIER
            user.is_active = True
            user.set_unusable_password()
            user.save()

            supplier, _ = Supplier.objects.update_or_create(
                user=user,
                defaults={
                    "business_name": supplier_data["business_name"],
                    "location": supplier_data["location"],
                    "rating": supplier_data["rating"],
                    "is_verified": True,
                },
            )
            supplier_count += 1

            for product_data in supplier_data["products"]:
                product, _ = Product.objects.update_or_create(
                    supplier=supplier,
                    name=product_data["name"],
                    defaults={
                        "description": product_data["description"],
                        "price_per_unit": product_data["price_per_unit"],
                        "min_order_quantity": product_data["min_order_quantity"],
                    },
                )
                product_count += 1

                for sticker_type in (StickerOption.Type.SUPPLIER, StickerOption.Type.CUSTOM):
                    StickerOption.objects.get_or_create(product=product, type=sticker_type)

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {supplier_count} demo suppliers and {product_count} demo products."
            )
        )
