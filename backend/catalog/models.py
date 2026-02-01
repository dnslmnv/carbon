from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        related_name="children",
        on_delete=models.SET_NULL,
    )
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = "categories"

    def __str__(self) -> str:
        return self.name


class Brand(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    logo_url = models.URLField(blank=True)
    description = models.TextField(blank=True)

    def __str__(self) -> str:
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    brand = models.ForeignKey(Brand, on_delete=models.PROTECT, related_name="products")
    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name="products"
    )
    price = models.DecimalField(max_digits=12, decimal_places=2)
    stock_quantity = models.IntegerField(default=0)
    stock_reserved = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def stock_available(self) -> int:
        return max(0, self.stock_quantity - self.stock_reserved)

    def __str__(self) -> str:
        return self.name


class ProductMedia(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="media")
    file_url = models.URLField()
    alt_text = models.CharField(max_length=255, blank=True)
    sort_order = models.PositiveIntegerField(default=0)


class CategoryAttribute(models.Model):
    class DataType(models.TextChoices):
        STRING = "string", "String"
        NUMBER = "number", "Number"
        BOOLEAN = "boolean", "Boolean"
        ENUM = "enum", "Enum"

    class FilterType(models.TextChoices):
        CHECKBOX = "checkbox", "Checkbox"
        SELECT = "select", "Select"
        RANGE = "range", "Range"

    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="attributes"
    )
    name = models.CharField(max_length=200)
    data_type = models.CharField(max_length=20, choices=DataType.choices)
    unit = models.CharField(max_length=50, blank=True)
    is_filterable = models.BooleanField(default=True)
    is_required = models.BooleanField(default=False)
    filter_type = models.CharField(
        max_length=20, choices=FilterType.choices, blank=True
    )

    def __str__(self) -> str:
        return f"{self.category.name}: {self.name}"


class ProductAttributeValue(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="attributes"
    )
    attribute = models.ForeignKey(CategoryAttribute, on_delete=models.CASCADE)
    value_string = models.CharField(max_length=255, blank=True)
    value_number = models.DecimalField(
        max_digits=12, decimal_places=3, null=True, blank=True
    )
    value_boolean = models.BooleanField(null=True, blank=True)

    class Meta:
        unique_together = ("product", "attribute")
