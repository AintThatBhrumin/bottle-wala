from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import OrderItem
from .services import recalculate_order_total


@receiver(post_save, sender=OrderItem)
def recalculate_total_after_order_item_save(sender, instance: OrderItem, **kwargs):
    recalculate_order_total(order=instance.order, commit=True)


@receiver(post_delete, sender=OrderItem)
def recalculate_total_after_order_item_delete(sender, instance: OrderItem, **kwargs):
    recalculate_order_total(order=instance.order, commit=True)
