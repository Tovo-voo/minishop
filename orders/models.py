# 歷史用的
from django.db import models
from django.contrib.auth.models import User
from product.models import Product
from account.models import Address


class Order(models.Model):  # 訂單本身(一張)
    DELIVER_CHOICES = [
        ('711', '7-11 門市取貨'),
        ('home_delivery', '宅配'),
    ]

    PAYMENT_CHOICES = [
        ('cod', '貨到付款'),
        ('credit_card', '信用卡'),
    ]

    STATUS_CHOICES = [
        ('pending', '待處理'),
        ('processing', '處理中'),
        ('shipped', '已出貨'),
        ('delivered', '已送達'),
        ('cancelled', '已取消'),
    ]


    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="使用者")
    order_number = models.CharField(max_length=50, unique=True, verbose_name="訂單編號")

    delivery_method = models.CharField(max_length=20, choices=DELIVER_CHOICES, verbose_name="配送方式")
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, verbose_name="付款方式")

    shipping_address = models.ForeignKey(
        Address,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders',
        verbose_name='配送地址'
    )


    # 使用JSONField 儲存彈性資料夾(快照)
    shipping_info = models.JSONField(default=dict, verbose_name="配送資訊")
    payment_info = models.JSONField(default=dict, verbose_name="付款資訊")

    subtotal = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='商品小計')
    shipping_fee = models.DecimalField(max_digits=10, decimal_places=2,default=60, verbose_name='運費ˇ')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="總金額")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="訂單狀態")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="建立時間")
    update_at = models.DateTimeField(auto_now=True, verbose_name="更新時間")

    class Meta:
        ordering = ['-created_at']
        verbose_name = '訂單'
        verbose_name_plural = '訂單'

    def __str__(self):
        return f"{self.order_number} - {self.user.username}"
    

class OrderItem(models.Model):  # 訂單中的每個商品(多筆)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items', verbose_name='訂單')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name="商品")
    quantity = models.PositiveIntegerField(verbose_name="數量")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="單價")
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="小計")


    class Meta:
        verbose_name = '訂單項目'
        verbose_name_plural = '訂單項目'

    def __str__(self):
        return f"{self.order.order_number} - {self.product.name} * {self.quantity}"