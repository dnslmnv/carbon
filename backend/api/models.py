import uuid

from django.conf import settings
from django.db import models


class FileRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    object_key = models.CharField(max_length=255, unique=True)
    filename = models.CharField(max_length=255)
    content_type = models.CharField(max_length=100, blank=True, default="")
    size = models.PositiveBigIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="file_records",
    )

    def __str__(self):
        return f"{self.filename} ({self.object_key})"
