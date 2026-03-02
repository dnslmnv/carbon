from django.conf import settings
from django.db import models

from catalog.models import Product


class Order(models.Model):
    class PaymentStatus(models.TextChoices):
        NOT_PAID = "not_paid", "Not paid"
        PAID = "paid", "Paid"

    class Status(models.TextChoices):
        IN_WORK = "in_work", "In work"
        ASSEMBLY = "assembly", "Assembly"
        SHIPPING = "shipping", "Shipping"
        COMPLETE = "complete", "Complete"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.NOT_PAID,
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.IN_WORK
    )
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    price_snapshot = models.DecimalField(max_digits=12, decimal_places=2)
