from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from product.models import Product
from cart.utils import calculate_cart_total
from django.http import JsonResponse


@login_required(login_url='login')
def cart_view(request):

    # 取得商品資訊、計算每項商品價格，還有商品總價格
    cart = request.session.get('cart', {})
    product_ids = cart.keys()       # 取得cart的id
    products = Product.objects.filter(id__in=product_ids)   # 查詢商品資訊，篩選出有在cart裡的id

    # 把每項商品加到cart_items列表
    cart_items = []

    for product in products:
        quantity = cart[str(product.id)]['quantity']
        cart_items.append({
            'product' : product,
            'quantity' : quantity,
            'subtotal' : product.price_int * quantity   # 計算一項商品的總價
        })

    
    total = sum(item['subtotal'] for item in cart_items)    # 計算全部商品的總價




    return render(request, 'cart/cart.html', {
        'current_step': 1,
        'cart_items':cart_items,
        'total':total,
    })



def add_cart_view(request, product_id):
    """
    計數點商品幾次，並加入購物車
    """
    # cart = request.session.get('cart', [])
    # product = Product.objects.get(id=product_id)    # 確認商品存在，拿商品資訊(Product物件)
    # cart.append(product.id)     # 只存id後續要用查的
    # request.sessions['cart'] = cart     # 存回session
    # return redirect('cart') # 跳到cart路由(做name=cart的views)

    cart = request.session.get('cart', {})
    
    if str(product_id) in cart:
        cart[str(product_id)]['quantity'] += 1
    else:
        cart[str(product_id)] = {'quantity' : 1}
    
    request.session['cart'] = cart


    return redirect(request.META.get('HTTP_REFERER', 'home'))



def remove_cartproduct_view(request, product_id):
    """
    移除購物車的商品項目
    """
    cart = request.session.get('cart', {})
    cart.pop(str(product_id), None)
    request.session['cart'] = cart

    return redirect('cart')










# 將plus和minus合併一起，利用事件方式
def mergePandM_method(request, product_id, action):
    cart = request.session.get('cart', {})
    pid = str(product_id)

    if pid not in cart:
        cart[pid] = {'quantity':1}

    if action == 'plus':
        if cart[pid]['quantity'] < 50:
            cart[pid]['quantity'] += 1
    
    elif action == 'minus':
        if cart[pid]['quantity'] > 1:
            cart[pid]['quantity'] -= 1

    request.session['cart'] = cart

    product = Product.objects.get(id=product_id)
    quantity = cart[pid]['quantity']
    subtotal = product.price_int * quantity
    total = calculate_cart_total(cart)

    return JsonResponse({
        'product_id' : product_id,
        'quantity' : quantity,
        'subtotal' : subtotal,
        'total' : total,
        'cart_count' : sum(item['quantity'] for item in cart.values())
    })