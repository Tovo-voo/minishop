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


    # 取出使用者所有地址(反向，從外鍵查找address)
    addresses = request.user.addresses.all()

    # 目前選擇的地址
    selected_address_id = request.session.get("shipping_address_id")    # id是創建地址的id


    # 如果 session 沒選地址，自動使用預設地址
    if not selected_address_id:
        default_address = addresses.filter(is_default=True).first()
        if default_address:
            request.session['shipping_address_id'] = default_address.id
            selected_address_id = default_address.id

    return render(request, 'cart/cart.html', {
        'cart_items':cart_items,
        'total':total,
        'addresses':addresses,
        'selected_address_id':selected_address_id
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






# def plus(request, product_id):
#     """
#     增加商品數量(+號) ajax版
#     """

#     cart = request.session.get('cart', {})
#     pid = str(product_id)

#     if pid in cart:
#         if cart[pid]['quantity'] < 50:
#             cart[pid]['quantity'] += 1
    
#     request.session['cart'] = cart

#     # 查商品價格，算小計，更新價格
#     product = Product.objects.get(id=product_id)
#     quantity = cart[pid]['quantity']
#     subtotal = quantity * product.price
#     total = calculate_cart_total(cart)

#     # return redirect('cart') 舊的(非ajax版)


#     # 將商品價格、數量、商品總價傳給前端更新，不刷新頁面
#     return JsonResponse({
#         'product_id' : product_id,
#         'quantity' : quantity,
#         'subtotal' : subtotal,
#         'total' : total,
#         'cart_count' : sum(item['quantity'] for item in cart.values())
#     })



# def minus(request, product_id):
#     """
#     減少商品數量(-號) ajax版
#     """

#     cart = request.session.get('cart', {})
#     pid = str(product_id)
    
#     if pid in cart:
#         if cart[pid]['quantity'] > 1:
#             cart[pid]['quantity'] -= 1
    
#     request.session['cart'] = cart

#     product = Product.objects.get(id=product_id)
#     quantity = cart[pid]['quantity']
#     subtotal = product.price * quantity
#     total = calculate_cart_total(cart)

#     # return redirect('cart')  舊的(非ajax版)


#     return JsonResponse({
#         'product_id' : product_id,
#         'quantity' : quantity,
#         'subtotal' : subtotal,
#         'total' : total,
#         'cart_count' : sum(item['quantity'] for item in cart.values())
#     })






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