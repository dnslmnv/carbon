from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import FileRecord
from .serializers import (
    FileRecordSerializer,
    PresignDownloadResponseSerializer,
    PresignUploadRequestSerializer,
    PresignUploadResponseSerializer,
)
from storage import minio_client


class HelloView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"message": "Hello, DRF!"})


class FileViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Minimal file endpoints for testing with MinIO.
    Authentication is open for demo purposes; tighten for production.
    """

    permission_classes = [AllowAny]
    queryset = FileRecord.objects.all().order_by("-created_at")
    serializer_class = FileRecordSerializer

    @action(detail=False, methods=["post"], permission_classes=[AllowAny], url_path="presign-upload")
    def presign_upload(self, request):
        serializer = PresignUploadRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        key = minio_client.make_object_key(data["filename"])
        upload_url = minio_client.presigned_put_url(
            key, content_type=data.get("content_type"), expires_in=900
        )
        record = FileRecord.objects.create(
            object_key=key,
            filename=data["filename"],
            content_type=data.get("content_type", ""),
            size=data.get("size") or 0,
        )
        response = PresignUploadResponseSerializer(
            {"id": record.id, "object_key": key, "upload_url": upload_url}
        )
        return Response(response.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"], permission_classes=[AllowAny], url_path="presign-download")
    def presign_download(self, request, pk=None):
        record = self.get_object()
        download_url = minio_client.presigned_get_url(record.object_key, expires_in=900)
        response = PresignDownloadResponseSerializer(
            {
                "download_url": download_url,
                "object_key": record.object_key,
                "filename": record.filename,
                "content_type": record.content_type,
            }
        )
        return Response(response.data)
