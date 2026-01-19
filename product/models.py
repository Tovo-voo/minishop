# SlugField是網域名稱的一小部分，方便給管理者看正在用什麼
# 例如 name = '女生衣著'， slug = 'nvsheng-yizhuo'

# ImageField:是Django專門用來「存圖片」的欄位型別，如果在Django後台上傳圖片，Django會把圖存在專案底下的media/category_icons/
# 資料庫裡只會紀錄那張圖的路徑(ex:category_icons/xxx.jpg)
# Django不會內建處理圖片功能，需先安裝Pillow(圖片處理函示庫，pip install pilloww
# related_name是「反向查詢的名稱」，blank=True是代表Django後台可以留空，例如在後台新增分類，如果不想指定的parents，允許不選
# null=True，就是在建立Category時，parent_id的欄位不能是null，它是代表「在資料表層級，這個欄位是NULL」
# auto_now_add:建立時紀錄 ， auto_now:每次更新時紀錄

from django.db import models


class Category(models.Model):
    """分類模型(支援多層)"""
    name = models.CharField(max_length=50, verbose_name="分類名稱")
    slug = models.SlugField(max_length=60, unique=True, verbose_name="網址代稱")

    # 父分類
    parent = models.ForeignKey(
        'self',                          # 指自己
        on_delete = models.CASCADE,
        related_name='subcategories',    # 定義名字:子類別
        blank = True,
        null = True,
        verbose_name="父分類"
    )
    banner = models.ImageField(
        upload_to='category_banner/',
        blank=True,
        null=True,
        verbose_name='大圖橫幅'
    )
    order = models.IntegerField(default=0, verbose_name="排序")
    is_active = models.BooleanField(default=True, verbose_name="是否啟用")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="建立時間")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新時間")


    # 用來定義資料表行為的地方
    class Meta:
        # 同一個父類底下的name不可以重複
        constraints = [
            models.UniqueConstraint(
                fields=['parent', 'name'],      # 要一起檢查唯一性的欄位
                name ='unique_parent_name'       # 這條限制的名稱
            )                              
        ]       # 舊寫法unique_together = ('parent', 'name')
        verbose_name = "分類"
        verbose_name_plural = '商品分類'    # 複數顯示名稱(在admin中)

        # 預設排序: 先按order，再按name
        ordering = ['order', 'name']

    def __str__(self):
        # 顯示完整路徑：女裝 > T恤 > 短袖T恤
        if self.parent:
            return f"{self.parent} > {self.name}"
        return self.name

    def get_absolute_url(self):
        from django.urls import reverse
        return reverse("category_products", args=[self.slug])
    

class Product(models.Model):
    """商品模型"""
    name = models.CharField(max_length=100, verbose_name="商品名稱")
    slug = models.SlugField(max_length=20, unique=True, verbose_name="網址代稱")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="售價")
    price_int = models.PositiveIntegerField(null=True, blank=True, verbose_name="售價")
    category = models.ForeignKey(
        Category,
        related_name='products',
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        verbose_name="分類"
    )
    image = models.ImageField(upload_to='product_images/', blank=True, null=True, verbose_name="商品圖片")

    # 庫存相關
    stock = models.PositiveBigIntegerField(default=0, verbose_name="庫存數量")
    is_available = models.BooleanField(default=True, verbose_name="是否上架")
    is_new = models.BooleanField(default=False, verbose_name="新品")
    discount = models.IntegerField(
        null=True,
        blank=True,
        help_text="折扣百分比",
        verbose_name="折扣"
    )

    # 時間戳記
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="建立時間")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新時間")


    class Meta:
        verbose_name = "商品"
        verbose_name_plural = "商品管理"
        ordering = ['created_at']       # 依創建最早時間排序

    def __str__(self):
        return self.name
    
    def get_absolute_url(self):
        from django.urls import reverse
        return reverse("product_detail", args=[self.slug])
    
    @property
    def discount_price(self):
        """計算折扣價格"""
        if self.discount:
            return self.price * (1 - self.discount / 100)
        return self.price
    

class ProductImage(models.Model):
    """商品多圖(一個商品可以有多張圖，多種角度的商品圖之類)"""
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name="商品"
    )
    image = models.ImageField(upload_to='products/gallery/', verbose_name="圖片")
    order = models.IntegerField(default=0, verbose_name="排序")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="上傳時間")

    class Meta:
        verbose_name = "商品圖片"
        verbose_name_plural = "商品圖片"
        ordering = ['order']
    
    def __str__(self):
        return f"{self.product.name} -圖片 {self.order}"