from decimal import Decimal
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.test import TestCase
from rest_framework import serializers, status
from rest_framework.test import APIClient

from cart.models import Cart, CartItem
from catalog.models import Brand, Category, CategoryAttribute, Product, ProductAttributeValue
from orders.models import Order, OrderItem

from .models import FileRecord
from .serializers import CartItemSerializer, CartSerializer, OrderSerializer


User = get_user_model()


class APITestBase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="user",
            email="user@example.com",
            password="password",
        )

        self.brand = Brand.objects.create(name="Acme", slug="acme")
        self.category = Category.objects.create(name="Widgets", slug="widgets")
        self.product = Product.objects.create(
            name="Widget",
            slug="widget",
            description="Base widget",
            brand=self.brand,
            category=self.category,
            price=Decimal("25.00"),
            stock_quantity=10,
            stock_reserved=2,
        )


class HelloViewTests(APITestBase):
    def test_hello_view_allows_anonymous(self):
        response = self.client.get("/api/hello/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {"message": "Hello, DRF!"})


class FileViewSetTests(APITestBase):
    @patch("api.views.minio_client.presigned_put_url")
    def test_presign_upload_creates_record(self, mocked_presign):
        mocked_presign.return_value = "https://minio.test/upload"
        self.client.force_authenticate(user=self.user)

        payload = {"filename": "report.pdf", "content_type": "application/pdf", "size": 2048}
        response = self.client.post("/api/files/presign-upload/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FileRecord.objects.count(), 1)
        record = FileRecord.objects.first()
        self.assertEqual(record.filename, "report.pdf")
        self.assertEqual(record.uploaded_by, self.user)
        self.assertEqual(response.json()["upload_url"], "https://minio.test/upload")

    @patch("api.views.minio_client.presigned_get_url")
    def test_presign_download_returns_url(self, mocked_presign):
        mocked_presign.return_value = "https://minio.test/download"
        record = FileRecord.objects.create(
            object_key="file-key",
            filename="file.csv",
            content_type="text/csv",
            size=10,
            uploaded_by=self.user,
        )
        self.client.force_authenticate(user=self.user)

        response = self.client.get(f"/api/files/{record.id}/presign-download/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["download_url"], "https://minio.test/download")
        self.assertEqual(response.json()["filename"], "file.csv")


class ProductViewSetTests(APITestBase):
    def test_product_filters_by_category(self):
        other_category = Category.objects.create(name="Gadgets", slug="gadgets")
        Product.objects.create(
            name="Gadget",
            slug="gadget",
            description="Other",
            brand=self.brand,
            category=other_category,
            price=Decimal("30.00"),
            stock_quantity=5,
        )

        response = self.client.get(f"/api/products/?category={self.category.id}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.json()
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["id"], self.product.id)

    def test_product_filters_by_attribute_boolean(self):
        attribute = CategoryAttribute.objects.create(
            category=self.category,
            name="Is New",
            data_type=CategoryAttribute.DataType.BOOLEAN,
            is_filterable=True,
            is_required=False,
            filter_type=CategoryAttribute.FilterType.CHECKBOX,
        )
        ProductAttributeValue.objects.create(
            product=self.product,
            attribute=attribute,
            value_boolean=True,
        )

        response = self.client.get(f"/api/products/?attribute={attribute.id}:true")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.json()
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["id"], self.product.id)

    def test_product_filters_in_stock(self):
        response = self.client.get("/api/products/?in_stock=true")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.json()
        self.assertEqual(len(results), 1)

    def test_product_filters_by_attribute_number_range(self):
        attribute = CategoryAttribute.objects.create(
            category=self.category,
            name="Power",
            data_type=CategoryAttribute.DataType.NUMBER,
            is_filterable=True,
            is_required=False,
            filter_type=CategoryAttribute.FilterType.RANGE,
        )
        ProductAttributeValue.objects.create(
            product=self.product,
            attribute=attribute,
            value_number=Decimal("42.500"),
        )

        response = self.client.get(f"/api/products/?attribute={attribute.id}:40..45")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.json()
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["id"], self.product.id)


class PhoneTokenObtainPairTests(APITestBase):
    def test_token_login_with_duplicate_phone_number_returns_unauthorized(self):
        duplicated_phone = "+1234567890"
        self.user.phone_number = duplicated_phone
        self.user.save(update_fields=["phone_number"])

        User.objects.create_user(
            username="duplicate-user",
            email="duplicate-user@example.com",
            phone_number=duplicated_phone,
            password="password",
        )

        response = self.client.post(
            "/api/token/",
            {"phone_number": duplicated_phone, "password": "password"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_token_login_with_unique_phone_number_returns_tokens(self):
        phone_number = "+19876543210"
        self.user.phone_number = phone_number
        self.user.save(update_fields=["phone_number"])

        response = self.client.post(
            "/api/token/",
            {"phone_number": phone_number, "password": "password"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.json())
        self.assertIn("refresh", response.json())


class CartSerializerTests(APITestBase):
    def test_authenticated_cart_ignores_session_id(self):
        serializer = CartSerializer(
            data={"session_id": "session-123"},
            context={"request": type("Request", (), {"user": self.user})()},
        )

        self.assertTrue(serializer.is_valid())
        self.assertNotIn("session_id", serializer.validated_data)

    def test_cart_item_serializer_enforces_cart_ownership(self):
        other_user = User.objects.create_user(
            username="other",
            email="other@example.com",
            password="password",
        )
        cart = Cart.objects.create(user=other_user)

        serializer = CartItemSerializer(
            data={"cart": cart.id, "product_id": self.product.id, "quantity": 1},
            context={"request": type("Request", (), {"user": self.user, "is_authenticated": True})()},
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("cart", serializer.errors)


class CartViewSetTests(APITestBase):
    def test_anonymous_cart_requires_session_id(self):
        response = self.client.get("/api/carts/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_cart_list_returns_user_cart(self):
        Cart.objects.create(user=self.user)
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/carts/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()), 1)


class CartItemViewSetTests(APITestBase):
    def test_cart_item_create_sets_price_snapshot(self):
        cart = Cart.objects.create(user=self.user)
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            "/api/cart-items/",
            {"cart": cart.id, "product_id": self.product.id, "quantity": 2},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        item = CartItem.objects.get(id=response.json()["id"])
        self.assertEqual(item.price_snapshot, self.product.price)


class OrderSerializerTests(APITestBase):
    def test_order_serializer_requires_items(self):
        serializer = OrderSerializer(data={"shipping_total": "0", "tax_total": "0"})

        self.assertFalse(serializer.is_valid())
        self.assertIn("items", serializer.errors)

    def test_order_serializer_creates_items_and_updates_stock(self):
        serializer = OrderSerializer(
            data={
                "items": [{"product_id": self.product.id, "quantity": 2}],
                "shipping_total": "5.00",
                "tax_total": "2.00",
                "discount_total": "1.00",
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        order = serializer.save(user=self.user)

        self.product.refresh_from_db()
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(OrderItem.objects.count(), 1)
        self.assertEqual(order.subtotal, Decimal("50.00"))
        self.assertEqual(order.grand_total, Decimal("56.00"))
        self.assertEqual(order.payment_status, Order.PaymentStatus.NOT_PAID)
        self.assertEqual(order.status, Order.Status.IN_WORK)
        self.assertEqual(order.items.first().product_id, self.product.id)
        self.assertEqual(self.product.stock_quantity, 8)

    def test_order_serializer_blocks_insufficient_stock(self):
        serializer = OrderSerializer(
            data={
                "items": [{"product_id": self.product.id, "quantity": 50}],
                "shipping_total": "0",
                "tax_total": "0",
                "discount_total": "0",
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        with self.assertRaisesMessage(serializers.ValidationError, "Insufficient stock"):
            serializer.save(user=self.user)


class OrderViewSetTests(APITestBase):
    def test_order_list_requires_authentication(self):
        response = self.client.get("/api/orders/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_order_list(self):
        Order.objects.create(user=self.user)
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/orders/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()), 1)

    def test_order_list_ordered_by_created_at_desc(self):
        self.client.force_authenticate(user=self.user)
        older_order = Order.objects.create(user=self.user)
        newer_order = Order.objects.create(user=self.user)

        response = self.client.get("/api/orders/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.json()
        self.assertEqual(payload[0]["id"], newer_order.id)
        self.assertEqual(payload[1]["id"], older_order.id)

    def test_staff_can_filter_orders_by_user_id(self):
        other_user = User.objects.create_user(
            username="other",
            email="other@example.com",
            password="password",
        )
        staff_user = User.objects.create_user(
            username="staff",
            email="staff@example.com",
            password="password",
        )
        staff_user.role = User.Role.ADMIN
        staff_user.save(update_fields=["role"])
        own_order = Order.objects.create(user=staff_user)
        filtered_order = Order.objects.create(user=other_user)

        self.client.force_authenticate(user=staff_user)
        response = self.client.get(f"/api/orders/?user_id={other_user.id}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.json()
        self.assertEqual(len(payload), 1)
        self.assertEqual(payload[0]["id"], filtered_order.id)
        self.assertNotEqual(payload[0]["id"], own_order.id)

    def test_order_detail_returns_order_by_id(self):
        order = Order.objects.create(user=self.user)
        self.client.force_authenticate(user=self.user)

        response = self.client.get(f"/api/orders/{order.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["id"], order.id)


class FileRecordModelTests(TestCase):
    def test_file_record_object_key_unique(self):
        user = User.objects.create_user(
            username="unique",
            email="unique@example.com",
            password="password",
        )
        FileRecord.objects.create(
            object_key="unique-key",
            filename="file.txt",
            content_type="text/plain",
            size=12,
            uploaded_by=user,
        )

        with self.assertRaises(IntegrityError):
            FileRecord.objects.create(
                object_key="unique-key",
                filename="file-2.txt",
                content_type="text/plain",
                size=12,
                uploaded_by=user,
            )
