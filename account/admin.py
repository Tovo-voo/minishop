from django.contrib import admin
from .models import Address

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ["receiver", "user", "city", "district", "phone", "is_default", "created_at"]
    list_filter = ["city", "is_default",]   # 不能寫("is_default") ，因為python會判斷為字串，有逗號才會判定為元組
    search_fields = ["receiver", "phone", "street_address"]
    list_editable = ['is_default']


