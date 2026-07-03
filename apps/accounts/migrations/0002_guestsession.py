# Generated migration for GuestSession model

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='GuestSession',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('guest_id', models.UUIDField(db_index=True, default=uuid.uuid4, unique=True)),
                ('cart_data', models.JSONField(default=list, help_text='Stores guest cart items: [{product_id, quantity, bottle_size}, ...]')),
                ('browsing_history', models.JSONField(default=list, help_text='Recently viewed suppliers/products: [supplier_id, ...]')),
                ('saved_suppliers', models.JSONField(default=list, help_text='Saved supplier IDs for quick access')),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('expires_at', models.DateTimeField(help_text='Session expires after 7-14 days of inactivity')),
                ('user', models.OneToOneField(blank=True, help_text='Links to user after login/registration', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='guest_session', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='guestsession',
            index=models.Index(fields=['guest_id'], name='guest_session_guest_id_idx'),
        ),
        migrations.AddIndex(
            model_name='guestsession',
            index=models.Index(fields=['user'], name='guest_session_user_idx'),
        ),
        migrations.AddIndex(
            model_name='guestsession',
            index=models.Index(fields=['expires_at'], name='guest_session_expires_idx'),
        ),
    ]
