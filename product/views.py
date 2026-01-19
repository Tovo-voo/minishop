from django.shortcuts import render,get_object_or_404,redirect
from . models import Category, Product

# get_object_or_404(model, 404):就是安全取資料，找不到就回傳404
# return render(request, 'product/category_products.html', {'category':category, 'products':products})
# {'category':category, 'products':products}是傳回給模板的資料，左邊的鍵是模板裡可以用的變數名稱，而右邊的值是views裡的變數
def category_products(request, slug):
    """分類商品列表"""
    category = get_object_or_404(Category, slug=slug, is_active=True)
    products = Product.objects.filter(
        category=category,
        is_available=True
    )
    
    return render(request, 'product/category_products.html', {
        'category' : category,
        'products' : products
    })

