from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        MANAGER = "manager", "Manager"

    name = models.CharField(max_length=150, blank=True)
    phone_number = models.CharField(max_length=32, blank=True)
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.MANAGER,
    )

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = self.Role.ADMIN
            self.is_staff = True
        else:
            self.is_staff = self.role == self.Role.ADMIN
        super().save(*args, **kwargs)
