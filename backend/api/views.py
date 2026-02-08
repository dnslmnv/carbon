from django.core.paginator import Paginator
from django.db.models import Q, F, Count, Min, Max
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from cart.models import Cart, CartItem
from catalog.models import Banner, Brand, Category, CategoryAttribute, Product, ProductAttributeValue
from orders.models import Order

from .models import FileRecord
from .serializers import (
    BrandSerializer,
    BannerSerializer,
    CartItemSerializer,
    CartSerializer,
    CatalogProductSerializer,
    CategoryAttributeSerializer,
    CategorySerializer,
    FileRecordSerializer,
    MainCategorySerializer,
    OrderSerializer,
    PresignDownloadResponseSerializer,
    PresignUploadRequestSerializer,
    PresignUploadResponseSerializer,
    ProductAttributeValueSerializer,
    ProductDetailSerializer,
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

    @action(detail=False, methods=["get"], permission_classes=[AllowAny], url_path="main")
    def main_categories(self, request):
        queryset = Category.objects.filter(
            is_active=True,
            parent__isnull=True,
        ).order_by("sort_order", "name")
        serializer = MainCategorySerializer(queryset, many=True)
        return Response(serializer.data)


class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    queryset = Brand.objects.all().order_by("name")
    serializer_class = BrandSerializer


class BannerViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    queryset = Banner.objects.all().order_by("name")
    serializer_class = BannerSerializer


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True).select_related(
            "brand", "category"
        ).prefetch_related("media", "attributes", "attributes__attribute")
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

    def get_serializer_class(self):
        if self.action in {"retrieve", "by_slug"}:
            return ProductDetailSerializer
        return ProductSerializer

    @action(detail=False, methods=["get"], permission_classes=[AllowAny], url_path=r"by-slug/(?P<slug>[^/.]+)")
    def by_slug(self, request, slug=None):
        product = get_object_or_404(self.get_queryset(), slug=slug)
        serializer = self.get_serializer(product)
        return Response(serializer.data)


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


class CatalogPageView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = list(
            Category.objects.filter(is_active=True).order_by("sort_order", "name")
        )
        if not categories:
            return Response(
                {
                    "category": None,
                    "breadcrumbs": [],
                    "category_tree": [],
                    "filters": {"brands": [], "attributes": []},
                    "products": {
                        "count": 0,
                        "page": 1,
                        "page_size": 0,
                        "results": [],
                    },
                    "banners": BannerSerializer(Banner.objects.all().order_by("name"), many=True).data,
                }
            )

        category_id = request.query_params.get("category")
        if category_id:
            category = get_object_or_404(Category, pk=category_id, is_active=True)
        else:
            category = categories[0]

        categories_by_parent = {}
        for item in categories:
            parent_id = item.parent_id
            categories_by_parent.setdefault(parent_id, []).append(item)

        def build_tree(parent_id=None):
            tree = []
            for item in categories_by_parent.get(parent_id, []):
                tree.append(
                    {
                        "id": item.id,
                        "name": item.name,
                        "slug": item.slug,
                        "image_url": item.image_url.url if item.image_url else "",
                        "children": build_tree(item.id),
                    }
                )
            return tree

        def collect_descendant_ids(start_id):
            ids = []
            stack = [start_id]
            while stack:
                current_id = stack.pop()
                ids.append(current_id)
                for child in categories_by_parent.get(current_id, []):
                    stack.append(child.id)
            return ids

        breadcrumbs = []
        current = category
        while current:
            breadcrumbs.append({"id": current.id, "name": current.name, "slug": current.slug})
            current = current.parent
        breadcrumbs.reverse()

        descendant_ids = collect_descendant_ids(category.id)
        base_products = (
            Product.objects.filter(is_active=True, category_id__in=descendant_ids)
            .select_related("brand", "category")
            .prefetch_related("media", "attributes", "attributes__attribute")
        )

        filtered_products = base_products
        brands = request.query_params.getlist("brand")
        search = request.query_params.get("search")
        min_price = request.query_params.get("min_price")
        max_price = request.query_params.get("max_price")
        in_stock = request.query_params.get("in_stock")
        attribute_filters = request.query_params.getlist("attribute")

        if brands:
            filtered_products = filtered_products.filter(brand_id__in=brands)
        if search:
            filtered_products = filtered_products.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        if min_price:
            filtered_products = filtered_products.filter(price__gte=min_price)
        if max_price:
            filtered_products = filtered_products.filter(price__lte=max_price)
        if in_stock in {"1", "true", "yes"}:
            filtered_products = filtered_products.filter(stock_quantity__gt=F("stock_reserved"))

        for entry in attribute_filters:
            if ":" not in entry:
                continue
            attribute_id, raw_value = entry.split(":", 1)
            if not attribute_id:
                continue

            value = raw_value.strip()
            if value.lower() in {"true", "false"}:
                filtered_products = filtered_products.filter(
                    attributes__attribute_id=attribute_id,
                    attributes__value_boolean=value.lower() == "true",
                )
            else:
                try:
                    number_value = float(value)
                except ValueError:
                    filtered_products = filtered_products.filter(
                        attributes__attribute_id=attribute_id,
                        attributes__value_string=value,
                    )
                else:
                    filtered_products = filtered_products.filter(
                        attributes__attribute_id=attribute_id,
                        attributes__value_number=number_value,
                    )

        filtered_products = filtered_products.order_by("name").distinct()

        try:
            page_number = int(request.query_params.get("page", 1))
        except (TypeError, ValueError):
            page_number = 1
        try:
            page_size = int(request.query_params.get("page_size", 9))
        except (TypeError, ValueError):
            page_size = 9
        paginator = Paginator(filtered_products, page_size)
        page_obj = paginator.get_page(page_number)

        brand_filters = (
            base_products.values("brand_id", "brand__name")
            .annotate(count=Count("id"))
            .order_by("brand__name")
        )

        attribute_filters_payload = []
        for attribute in CategoryAttribute.objects.filter(
            category=category, is_filterable=True
        ).order_by("name"):
            values_queryset = ProductAttributeValue.objects.filter(
                product__in=base_products, attribute=attribute
            )
            payload = {
                "id": attribute.id,
                "name": attribute.name,
                "unit": attribute.unit,
                "data_type": attribute.data_type,
                "filter_type": attribute.filter_type,
                "options": [],
                "range": None,
            }

            if attribute.data_type == CategoryAttribute.DataType.BOOLEAN:
                options = (
                    values_queryset.exclude(value_boolean__isnull=True)
                    .values("value_boolean")
                    .annotate(count=Count("id"))
                    .order_by("value_boolean")
                )
                payload["options"] = [
                    {
                        "value": str(option["value_boolean"]).lower(),
                        "label": "Да" if option["value_boolean"] else "Нет",
                        "count": option["count"],
                    }
                    for option in options
                ]
            elif attribute.data_type == CategoryAttribute.DataType.NUMBER:
                range_values = values_queryset.aggregate(
                    min_value=Min("value_number"), max_value=Max("value_number")
                )
                if range_values["min_value"] is not None:
                    payload["range"] = {
                        "min": float(range_values["min_value"]),
                        "max": float(range_values["max_value"]),
                    }
            else:
                options = (
                    values_queryset.exclude(value_string="")
                    .values("value_string")
                    .annotate(count=Count("id"))
                    .order_by("value_string")
                )
                payload["options"] = [
                    {
                        "value": option["value_string"],
                        "label": option["value_string"],
                        "count": option["count"],
                    }
                    for option in options
                ]

            attribute_filters_payload.append(payload)

        response_payload = {
            "category": {"id": category.id, "name": category.name, "slug": category.slug},
            "breadcrumbs": breadcrumbs,
            "category_tree": build_tree(None),
            "filters": {
                "brands": [
                    {
                        "id": item["brand_id"],
                        "name": item["brand__name"],
                        "count": item["count"],
                    }
                    for item in brand_filters
                ],
                "attributes": attribute_filters_payload,
            },
            "products": {
                "count": paginator.count,
                "page": page_obj.number,
                "page_size": page_size,
                "results": CatalogProductSerializer(page_obj.object_list, many=True).data,
            },
            "banners": BannerSerializer(Banner.objects.all().order_by("name"), many=True).data,
        }
        return Response(response_payload)


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
        user = self.request.user
        if user.is_authenticated:
            serializer.save(user=user)
        else:
            serializer.save()


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
