import os

from django.core.management.base import BaseCommand

from apps.accounts.models import User


class Command(BaseCommand):
    help = "Create or update the production admin user from environment variables."

    def handle(self, *args, **options):
        email = (os.environ.get("ADMIN_EMAIL") or "").strip().lower()
        password = os.environ.get("ADMIN_PASSWORD") or ""
        name = (os.environ.get("ADMIN_NAME") or "Jal-Setu Admin").strip()

        if not email:
            self.stdout.write("ADMIN_EMAIL not set; skipping admin bootstrap.")
            return

        user = User.objects.filter(email=email).first()
        if user is None:
            if not password:
                self.stdout.write("ADMIN_PASSWORD not set; cannot create admin user.")
                return
            User.objects.create_superuser(email=email, password=password, name=name)
            self.stdout.write(self.style.SUCCESS(f"Created admin user {email}."))
            return

        update_fields = []
        if user.role != User.Role.ADMIN:
            user.role = User.Role.ADMIN
            update_fields.append("role")
        if not user.is_staff:
            user.is_staff = True
            update_fields.append("is_staff")
        if not user.is_superuser:
            user.is_superuser = True
            update_fields.append("is_superuser")
        if not user.is_active:
            user.is_active = True
            update_fields.append("is_active")
        if user.name != name:
            user.name = name
            update_fields.append("name")
        if password:
            user.set_password(password)
            update_fields.append("password")

        if update_fields:
            user.save(update_fields=[*set(update_fields), "updated_at"])
            self.stdout.write(self.style.SUCCESS(f"Updated admin user {email}."))
        else:
            self.stdout.write(f"Admin user {email} already exists.")
