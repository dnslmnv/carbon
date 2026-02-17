from django import forms
from django.contrib import admin
from django.core.exceptions import ValidationError

from .models import (
    Banner,
    Brand,
    Category,
    CategoryAttribute,
    Product,
    ProductAttributeValue,
    ProductMedia,
)


class ProductMediaInline(admin.TabularInline):
    model = ProductMedia
    extra = 1


class ProductAttributeValueInlineForm(forms.ModelForm):
    class Meta:
        model = ProductAttributeValue
        fields = "__all__"

    def clean(self):
        cleaned_data = super().clean()
        product = cleaned_data.get("product") or getattr(self.instance, "product", None)
        attribute = cleaned_data.get("attribute")
        if product and attribute and attribute.category_id != product.category_id:
            raise ValidationError("Характеристика должна принадлежать категории товара.")
        return cleaned_data


class ProductAttributeValueInline(admin.TabularInline):
    model = ProductAttributeValue
    form = ProductAttributeValueInlineForm
    extra = 1

    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        original_init = formset.form.__init__

        def form_init(form_self, *args, **form_kwargs):
            original_init(form_self, *args, **form_kwargs)
            attribute_field = form_self.fields.get("attribute")
            if not attribute_field:
                return
            if obj:
                attribute_field.queryset = CategoryAttribute.objects.filter(
                    category=obj.category
                ).order_by("name")
            elif "category" in request.GET:
                attribute_field.queryset = CategoryAttribute.objects.filter(
                    category_id=request.GET.get("category")
                ).order_by("name")
            else:
                attribute_field.queryset = CategoryAttribute.objects.none()

        formset.form.__init__ = form_init
        return formset


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "brand", "category", "price", "is_active")
    list_filter = ("is_active", "brand", "category")
    search_fields = ("name", "slug")
    inlines = [ProductMediaInline, ProductAttributeValueInline]


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


@admin.register(CategoryAttribute)
class CategoryAttributeAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "data_type",
        "is_filterable",
        "filter_type",
        "is_required",
    )
    list_filter = ("category", "data_type", "is_filterable", "is_required")
    search_fields = ("name", "category__name")
    ordering = ("category__name", "name")


@admin.register(ProductAttributeValue)
class ProductAttributeValueAdmin(admin.ModelAdmin):
    list_display = (
        "product",
        "attribute",
        "value_string",
        "value_number",
        "value_boolean",
    )
    list_filter = ("attribute", "product__category")
    search_fields = ("product__name", "attribute__name", "value_string")


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ("name", "image_url")


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name", "slug")
