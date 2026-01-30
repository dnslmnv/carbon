from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Profile", {"fields": ("name", "phone_number")}),
        ("Role", {"fields": ("role",)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Profile", {"fields": ("name", "phone_number", "email")}),
        ("Role", {"fields": ("role",)}),
    )
    list_display = UserAdmin.list_display + ("name", "phone_number", "role")
