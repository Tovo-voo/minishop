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

    city = models.CharField(max_length=10, blank=True, null=True, verbose_name="縣市")
    district = models.CharField(max_length=20, blank=True, null=True, verbose_name="鄉鎮市區")
    street_address = models.CharField(max_length=100, blank=True, null=True, verbose_name="街道地址")

    postal_code = models.CharField(
        max_length=6,
        blank=True,
        null=True,
        verbose_name="郵遞區號"
    )

        
    is_default = models.BooleanField(default=False, verbose_name="預設地址")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="建立時間")
    update_at = models.DateTimeField(auto_now=True,verbose_name="更新時間")

    class Meta:
        verbose_name = '收件地址'
        verbose_name_plural = '收件地址'
        ordering = ['-is_default', '-created_at']

    def __str__(self):
        return f"{self.receiver}  {self.city}{self.district}"
    

    @property
    def full_address(self):
        """完整地址"""
        return f"{self.city}{self.district}{self.street_address}"
    
    def save(self, *args, **kwargs):
        """如果設為預設地址，取消其他地址的預設狀態"""
        if self.is_default:
            Address.objects.filter(
                user=self.user,
                is_default=True
            ).update(is_default=False)
        super().save(*args, **kwargs)


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name="使用者")
    city = models.CharField(max_length=10, blank=True, null=True, verbose_name="縣市")
    district = models.CharField(max_length=20, blank=True, null=True, verbose_name="鄉鎮市區")
    street_address = models.CharField(max_length=50, blank=True, null=True, verbose_name="街道地址")
    postal_code = models.CharField(
        max_length=6,
        blank=True,
        null=True,
        verbose_name="郵遞區號"
    )
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="手機號碼")

    GENDER_CHOICES = [
        ('male', '男性'),
        ('female', '女性'),
        ('private', '不公開'),
    ]

    gender = models.CharField(max_length=10, blank=True, null=True, choices=GENDER_CHOICES, verbose_name="性別")
    birthday = models.DateField(blank=True, null=True, verbose_name="生日")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="建立時間")
    update_at = models.DateTimeField(auto_now=True, verbose_name="更新時間")
