from django.db import models

from orders.models import Order


class Payment(models.Model):
    class Provider(models.TextChoices):
        YOOKASSA = "yookassa", "YooKassa"
        CLOUDPAYMENTS = "cloudpayments", "CloudPayments"
        TINKOFF = "tinkoff", "Tinkoff"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        AUTHORIZED = "authorized", "Authorized"
        CAPTURED = "captured", "Captured"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="payments")
    provider = models.CharField(max_length=50, choices=Provider.choices)
    provider_payment_id = models.CharField(max_length=100, blank=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default="RUB")
    idempotency_key = models.CharField(max_length=64, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
