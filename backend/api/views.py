from django.db.models import Q, F
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from cart.models import Cart, CartItem
from catalog.models import Brand, Category, CategoryAttribute, Product, ProductAttributeValue
from orders.models import Order

from .models import FileRecord
from .serializers import (
    BrandSerializer,
    CartItemSerializer,
    CartSerializer,
    CategoryAttributeSerializer,
    CategorySerializer,
    FileRecordSerializer,
    OrderSerializer,
    PresignDownloadResponseSerializer,
    PresignUploadRequestSerializer,
    PresignUploadResponseSerializer,
    ProductAttributeValueSerializer,
    ProductSerializer,
)
from storage import minio_client


class HelloView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"message": "Hello, DRF!"})


class FileViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Minimal file endpoints for testing with MinIO.
    """

    permission_classes = [IsAuthenticated]
    queryset = FileRecord.objects.all().order_by("-created_at")
    serializer_class = FileRecordSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.is_staff:
            return super().get_queryset()
        return super().get_queryset().filter(uploaded_by=user)

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated], url_path="presign-upload")
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
            uploaded_by=request.user if request.user.is_authenticated else None,
        )
        response = PresignUploadResponseSerializer(
            {"id": record.id, "object_key": key, "upload_url": upload_url}
        )
        return Response(response.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated], url_path="presign-download")
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


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    queryset = Category.objects.filter(is_active=True).order_by("sort_order", "name")
    serializer_class = CategorySerializer


class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    queryset = Brand.objects.all().order_by("name")
    serializer_class = BrandSerializer


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True).select_related(
            "brand", "category"
        )
        category = self.request.query_params.get("category")
        brand = self.request.query_params.get("brand")
        search = self.request.query_params.get("search")
        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")
        in_stock = self.request.query_params.get("in_stock")
        attribute_filters = self.request.query_params.getlist("attribute")

        if category:
            queryset = queryset.filter(category_id=category)
        if brand:
            queryset = queryset.filter(brand_id=brand)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        if in_stock in {"1", "true", "yes"}:
            queryset = queryset.filter(stock_quantity__gt=F("stock_reserved"))

        for entry in attribute_filters:
            if ":" not in entry:
                continue
            attribute_id, raw_value = entry.split(":", 1)
            if not attribute_id:
                continue

            value = raw_value.strip()
            if value.lower() in {"true", "false"}:
                queryset = queryset.filter(
                    attributes__attribute_id=attribute_id,
                    attributes__value_boolean=value.lower() == "true",
                )
            else:
                try:
                    number_value = float(value)
                except ValueError:
                    queryset = queryset.filter(
                        attributes__attribute_id=attribute_id,
                        attributes__value_string=value,
                    )
                else:
                    queryset = queryset.filter(
                        attributes__attribute_id=attribute_id,
                        attributes__value_number=number_value,
                    )

        return queryset.order_by("name").distinct()


class CategoryAttributeViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = CategoryAttributeSerializer

    def get_queryset(self):
        queryset = CategoryAttribute.objects.all().select_related("category")
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category_id=category)
        return queryset.order_by("name")


class ProductAttributeValueViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = ProductAttributeValueSerializer

    def get_queryset(self):
        queryset = ProductAttributeValue.objects.select_related("product", "attribute")
        product = self.request.query_params.get("product")
        if product:
            queryset = queryset.filter(product_id=product)
        return queryset


class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer

    def get_queryset(self):
        queryset = Cart.objects.all()
        if self.request.user.is_authenticated:
            return queryset.filter(user=self.request.user)
        session_id = self.request.query_params.get("session_id")
        if session_id:
            return queryset.filter(session_id=session_id)
        return queryset.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CartItemViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer

    def get_queryset(self):
        queryset = CartItem.objects.select_related("cart", "product")
        cart_id = self.request.query_params.get("cart")
        if self.request.user.is_authenticated:
            queryset = queryset.filter(cart__user=self.request.user)
        else:
            session_id = self.request.query_params.get("session_id")
            if session_id:
                queryset = queryset.filter(cart__session_id=session_id)
            else:
                return queryset.none()
        if cart_id:
            queryset = queryset.filter(cart_id=cart_id)
        return queryset


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer

    def get_queryset(self):
        queryset = Order.objects.prefetch_related("items")
        if self.request.user.is_authenticated:
            return queryset.filter(user=self.request.user)
        return queryset.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
