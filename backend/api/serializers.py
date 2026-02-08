from django.db import transaction
from rest_framework import serializers

from cart.models import Cart, CartItem
from catalog.models import (
    Banner,
    Brand,
    Category,
    CategoryAttribute,
    Product,
    ProductAttributeValue,
    ProductMedia,
)
from orders.models import Order, OrderItem

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


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "parent",
            "image_url",
            "is_active",
            "sort_order",
        ]


class MainCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "image_url"]


class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = ["id", "name", "image_url"]


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ["id", "name", "slug", "logo_url", "description"]


class ProductMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductMedia
        fields = ["id", "file_url", "alt_text", "sort_order"]


class CategoryAttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoryAttribute
        fields = [
            "id",
            "category",
            "name",
            "data_type",
            "unit",
            "is_filterable",
            "is_required",
            "filter_type",
        ]


class ProductAttributeValueSerializer(serializers.ModelSerializer):
    attribute = CategoryAttributeSerializer(read_only=True)
    attribute_id = serializers.PrimaryKeyRelatedField(
        source="attribute",
        queryset=CategoryAttribute.objects.all(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = ProductAttributeValue
        fields = [
            "id",
            "product",
            "attribute",
            "attribute_id",
            "value_string",
            "value_number",
            "value_boolean",
        ]


class ProductSerializer(serializers.ModelSerializer):
    media = ProductMediaSerializer(many=True, read_only=True)
    attributes = ProductAttributeValueSerializer(many=True, read_only=True)
    stock_available = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "brand",
            "category",
            "price",
            "stock_quantity",
            "stock_reserved",
            "stock_available",
            "is_active",
            "created_at",
            "updated_at",
            "media",
            "attributes",
        ]


class CatalogProductSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    brand_name = serializers.CharField(source="brand.name", read_only=True)
    stock_available = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "price",
            "brand",
            "brand_name",
            "stock_available",
            "image_url",
        ]

    def get_image_url(self, obj):
        media = obj.media.order_by("sort_order").first()
        if media and media.file_url:
            return media.file_url.url
        return ""


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        source="product", queryset=Product.objects.all(), write_only=True
    )

    class Meta:
        model = CartItem
        fields = ["id", "cart", "product", "product_id", "quantity", "price_snapshot"]
        read_only_fields = ["price_snapshot"]

    def validate_cart(self, cart):
        request = self.context.get("request")
        if request and request.user.is_authenticated and cart.user_id != request.user.id:
            raise serializers.ValidationError("Cart does not belong to the authenticated user.")
        return cart

    def create(self, validated_data):
        product = validated_data["product"]
        validated_data["price_snapshot"] = product.price
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "product" in validated_data:
            validated_data["price_snapshot"] = validated_data["product"].price
        return super().update(instance, validated_data)


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ["id", "user", "session_id", "created_at", "updated_at", "items"]
        read_only_fields = ["user", "created_at", "updated_at"]

    def validate(self, attrs):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            attrs.pop("session_id", None)
        return super().validate(attrs)


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        source="product", queryset=Product.objects.all(), write_only=True
    )

    class Meta:
        model = OrderItem
        fields = ["id", "order", "product", "product_id", "quantity", "price_snapshot"]
        read_only_fields = ["order", "price_snapshot"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "user",
            "status",
            "subtotal",
            "shipping_total",
            "tax_total",
            "discount_total",
            "grand_total",
            "created_at",
            "updated_at",
            "items",
        ]
        read_only_fields = ["user", "status", "created_at", "updated_at"]

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        if not items_data:
            raise serializers.ValidationError({"items": "Order must include at least one item."})

        order = Order.objects.create(**validated_data)
        subtotal = 0

        for item in items_data:
            product = (
                Product.objects.select_for_update()
                .select_related("category")
                .get(pk=item["product"].pk)
            )
            if product.stock_available < item["quantity"]:
                raise serializers.ValidationError(
                    {"items": f"Insufficient stock for {product.name}."}
                )

            price_snapshot = product.price
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item["quantity"],
                price_snapshot=price_snapshot,
            )
            product.stock_quantity = product.stock_quantity - item["quantity"]
            product.save(update_fields=["stock_quantity"])
            subtotal += price_snapshot * item["quantity"]

        order.subtotal = subtotal
        order.grand_total = subtotal + order.shipping_total + order.tax_total - order.discount_total
        order.save(update_fields=["subtotal", "grand_total"])
        return order
