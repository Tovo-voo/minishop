# 歷史用的
from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Order(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    total_price = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_paid = models.BooleanField(default=False)

    def __str__(self):
        return f"Order #{self.id}"
    

# 這筆訂單成立當下的收件地址(不能被修改) ， 它是不能變動的，訂單歷史的一部份
class OrderAddress(models.Model):
    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name="shipping_address"
    )
    receiver = models.CharField(max_length=50)
    phone = models.CharField(max_length=20)
    address = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.receiver} - {self.address}"