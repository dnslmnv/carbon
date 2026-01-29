from django.db import migrations, models
import uuid


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="FileRecord",
            fields=[
                ("id", models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ("object_key", models.CharField(max_length=255, unique=True)),
                ("filename", models.CharField(max_length=255)),
                ("content_type", models.CharField(max_length=100, blank=True, default="")),
                ("size", models.PositiveBigIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
