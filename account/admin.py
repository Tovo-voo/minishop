from django.contrib import admin
from .models import Address

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ("user", "receiver", "address", "is_default")
    list_filter = ("is_default",)   # 不能寫("is_default") ，因為python會判斷為字串，有逗號才會判定為元組
    search_fields = ("receiver", "address")

