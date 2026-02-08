from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    BrandViewSet,
    BannerViewSet,
    CartItemViewSet,
    CartViewSet,
    CategoryAttributeViewSet,
    CategoryViewSet,
    FileViewSet,
    HelloView,
    OrderViewSet,
    ProductAttributeValueViewSet,
    ProductViewSet,
)

router = DefaultRouter()
router.register(r"files", FileViewSet, basename="files")
router.register(r"categories", CategoryViewSet, basename="categories")
router.register(r"brands", BrandViewSet, basename="brands")
router.register(r"banners", BannerViewSet, basename="banners")
router.register(r"products", ProductViewSet, basename="products")
router.register(r"category-attributes", CategoryAttributeViewSet, basename="category-attributes")
router.register(r"product-attributes", ProductAttributeValueViewSet, basename="product-attributes")
router.register(r"carts", CartViewSet, basename="carts")
router.register(r"cart-items", CartItemViewSet, basename="cart-items")
router.register(r"orders", OrderViewSet, basename="orders")

urlpatterns = [
    path("hello/", HelloView.as_view()),
    path("", include(router.urls)),
]
