import uuid

from django.db import models


class FileRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    object_key = models.CharField(max_length=255, unique=True)
    filename = models.CharField(max_length=255)
    content_type = models.CharField(max_length=100, blank=True, default="")
    size = models.PositiveBigIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.filename} ({self.object_key})"
