from django.contrib import admin
from . models import Product, Category, ProductImage

# @admin.register(Category)是一個 裝飾器（decorator）等同 admin.site.register(Category, CategoryAdmin)
# 「我要把 Category 這個模型，用 CategoryAdmin 這個設定來管理。」
# super()去呼叫「父類別」的方法


# 客製化後台
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['indented_name', 'parent', 'order', 'is_active', 'created_at']
    list_filter = ['is_active', 'parent']
    search_fields = ['name']
    prepopulated_fields = {'slug':('name',)}
    list_editable = ['order', 'is_active']

    # 樹狀結構(自訂查詢集，控制排序)
    # def get_queryset(self, request):
    #     qs = super().get_queryset(request)
    #     return qs.filter(parent__isnull=True)

    fields = ['name', 'slug', 'parent', 'banner', 'order', 'is_active']

    def indented_name(self, obj):
        """顯示帶縮排的分類名稱"""
        level = 0
        parent = obj.parent
        while parent:
            level += 1
            parent = parent.parent
        indent = ">>" * level
        return f"{indent}{obj.name}"
    indented_name.short_description = '分類名稱'


class ProductImageInline(admin.TabularInline):
    """在商品編輯頁面直接管理多張圖片"""
    model = ProductImage
    extra = 3   # 預設顯示3個空白欄位



@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'category',
        'price',
        'discount',
        'stock',
        'is_new',
        'is_available',
        'created_at'
    ]
    list_filter = ['category', 'is_new', 'is_available']
    search_fields = ['name']        # 上方的搜尋框，可以搜名稱
    prepopulated_filters = {'slug':('name',)}
    list_editable = ['price', 'discount', 'stock', 'is_new', 'is_available']
    inlines = [ProductImageInline]      # 內嵌圖片管理

    # 分類階層過濾器
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "category":
            kwargs['queryset'] = Category.objects.filter(is_active=True)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
    
    