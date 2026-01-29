from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import FileViewSet, HelloView

router = DefaultRouter()
router.register(r"files", FileViewSet, basename="files")

urlpatterns = [
    path("hello/", HelloView.as_view()),
    path("", include(router.urls)),
]
