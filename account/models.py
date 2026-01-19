from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Address(models.Model):
    user = models.ForeignKey(       # 一個使用者有多個地址可以選擇
        User,
        on_delete=models.CASCADE,
        related_name="addresses",
    )
    receiver = models.CharField(max_length=50, verbose_name="收件人")
    phone = models.CharField(max_length=20, verbose_name="聯絡電話")
    address = models.CharField(max_length=255, verbose_name="收件地址")
        
    is_default = models.BooleanField(default=False, verbose_name="預設地址")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="建立時間")

    def __str__(self):
        return f"{self.receiver} - {self.address}"
