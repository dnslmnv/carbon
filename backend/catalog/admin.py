from django.contrib import admin

from .models import Banner, Brand, Category, Product, ProductMedia


class ProductMediaInline(admin.TabularInline):
    model = ProductMedia
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "brand", "category", "price", "is_active")
    list_filter = ("is_active", "brand", "category")
    search_fields = ("name", "slug")
    inlines = [ProductMediaInline]


@admin.register(ProductMedia)
class ProductMediaAdmin(admin.ModelAdmin):
    list_display = ("product", "file_url", "sort_order")
    list_filter = ("product",)
    ordering = ("product", "sort_order")


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "parent", "is_active", "sort_order")
    list_filter = ("is_active",)
    search_fields = ("name", "slug")
    ordering = ("sort_order", "name")


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ("name", "image_url")


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name", "slug")
