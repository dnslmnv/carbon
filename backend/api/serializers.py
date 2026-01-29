from rest_framework import serializers

from .models import FileRecord


class PresignUploadRequestSerializer(serializers.Serializer):
    filename = serializers.CharField(max_length=255)
    content_type = serializers.CharField(max_length=100, required=False, allow_blank=True)
    size = serializers.IntegerField(required=False, min_value=0)


class PresignUploadResponseSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    object_key = serializers.CharField()
    upload_url = serializers.CharField()


class PresignDownloadResponseSerializer(serializers.Serializer):
    download_url = serializers.CharField()
    object_key = serializers.CharField()
    filename = serializers.CharField()
    content_type = serializers.CharField(allow_blank=True)


class FileRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileRecord
        fields = ["id", "object_key", "filename", "content_type", "size", "created_at"]
