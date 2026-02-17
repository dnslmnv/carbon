from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

from api.views import PhoneTokenObtainPairView, RegisterView

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/", include("api.urls")),
    path("api/token/", PhoneTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/register/", RegisterView.as_view(), name="register"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
