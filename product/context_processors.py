# 全域模板變數:方便不用在每個views手動加上categories = Category.objecs.all()
from .models import Category


# filter篩選 (欄位名稱__查詢條件=值)這是Django的欄位查詢語法
# modeels裡Category類的parent變數(這個欄位)只要是null就取

def categories_context(request):
    categories = Category.objects.filter(parent__isnull=True)   # 只撈出了父類
    return {'categories' : categories}