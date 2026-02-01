from django.db import models

from orders.models import Order


class Shipment(models.Model):
    class Carrier(models.TextChoices):
        CDEK = "cdek", "CDEK"
        PICKUP = "pickup", "Pickup"
        CUSTOM = "custom", "Custom"

    class Status(models.TextChoices):
        CREATED = "created", "Created"
        IN_TRANSIT = "in_transit", "In transit"
        DELIVERED = "delivered", "Delivered"
        CANCELED = "canceled", "Canceled"

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="shipment")
    carrier = models.CharField(
        max_length=20, choices=Carrier.choices, default=Carrier.CDEK
    )
    service_code = models.CharField(max_length=50, blank=True)
    tracking_number = models.CharField(max_length=100, blank=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.CREATED
    )
    cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    label_url = models.URLField(blank=True)


class ShipmentAddress(models.Model):
    shipment = models.OneToOneField(
        Shipment, on_delete=models.CASCADE, related_name="address"
    )
    recipient_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=50)
    address_line1 = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    region = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=50, default="RU")
    delivery_type = models.CharField(max_length=20, default="courier")
    pickup_point_code = models.CharField(max_length=50, blank=True)
