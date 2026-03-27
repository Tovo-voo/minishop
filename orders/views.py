from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from product.models import Product
from account.models import Address
from orders.models import Order, OrderItem
import uuid
from datetime import datetime
from decimal import Decimal
from django.db.models import Q


# 確認訂單
@login_required
def checkout_view(request):
    """
    結帳頁面:顯示表單(GET)或處理訂單(POST)
    """
    if request.method == 'GET':
        # 一定要有購物車
        cart = request.session.get('cart')
        if not cart:
            return redirect('cart')
        
        # 商品與金額(和cart_view一樣，只顯示金額)
        product_ids = cart.keys()
        products = Product.objects.filter(id__in=product_ids)

        cart_items = []


        for product in products:
            quantity = cart[str(product.id)]['quantity']
            subtotal = product.price_int * quantity
            cart_items.append({
                "product" : product,
                "quantity" : quantity,
                "subtotal" : subtotal,
            })

        total = sum(item['subtotal'] for item in cart_items)
        shipping_fee = 60   # 運費
        total_with_shipping = total + shipping_fee      # 總金額+運費



        # 取出使用者所有地址(反向，從外鍵查找address)
        addresses = request.user.addresses.all()

        # 取得預設地址，可以寫成 default_address = Address.objects.filter(user=request.user, is_default=True).first()
        default_address = addresses.filter(is_default=True).first()     # 查詢使用者的所有地址之後篩選第一個設為預設的地址

        context = {
            'current_step': 2,
            'cart_items' : cart_items,
            'total' : total,
            'shipping_fee' : shipping_fee,
            'total_with_shipping' : total_with_shipping,
            'addresses' : addresses,
            'default_address' : default_address,    # 傳預設的地址
        }
        return render(request, 'order/checkout.html', context)


    # POST 處理訂單提交
    elif request.method == 'POST':
        cart = request.session.get('cart')
        if not cart:
            messages.error(request, '購物車是空的，無法建立訂單')
            return redirect('cart')
        
        delivery_method = request.POST.get('delivery_method')
        payment_method = request.POST.get('payment_method')


        if not delivery_method or not payment_method:
            messages.error(request, '請選擇配送方式和付款方式')
            return redirect('orders:checkout')
        
        shipping_info = {}
        selected_address = None
        if delivery_method == '711':    # 如果配送方式是711
            store_id = request.POST.get('store_id')
            store_name = request.POST.get('store_name')
            store_address = request.POST.get('store_address')

            # 驗證門市資訊
            if not store_id or not store_name:
                messages.error(request, '請選擇7-11取貨門市')
                return redirect('orders:checkout')
            
            shipping_info = {
                'type' : '7-11',
                'store_id' : store_id,
                'store_name' : store_name,
                'store_address' : store_address,
            }
        
        elif delivery_method == 'home_delivery':    # 如果配送方式是宅配
            # 宅配到府
            address_id = request.POST.get('address_id')

            if address_id:
                selected_address = get_object_or_404(
                    Address,
                    id=address_id,
                    user=request.user
                )
                        
                shipping_info = {
                    'type' : '宅配',
                    'receiver' : selected_address.receiver,
                    'phone' : selected_address.phone,
                    'city' : selected_address.city,
                    'district' : selected_address.district,
                    'street_address' : selected_address.street_address,
                    'full_address' : selected_address.full_address
                }

            else:
                messages.error(request, '請選擇配送地址')
                return redirect('orders:checkout')



        # 處理付款方式資訊
        payment_info = {'method': payment_method}

        if payment_method == 'credit_card':
            # 收信用卡資訊
            card_number = request.POST.get('card_number', '')
            card_holder = request.POST.get('card_holder', '')

            # 簡單驗證
            if not card_number or not card_holder:
                messages.error(request, '請填寫完整的信用卡資訊')
                return redirect('orders:checkout')

            # 只儲存後四碼(安全考量)
            payment_info['last_4_digits'] = card_number[-4:] if len(card_number) >= 4 else ''
            payment_info['card_holder'] = card_holder

        # 後端重新計算金額
        product_ids = cart.keys()
        products = Product.objects.filter(id__in=product_ids)

        total = 0
        for product in products:
            quantity = cart[str(product.id)]['quantity']
            total += quantity * product.price_int
        shipping_fee = 60
        total_with_shipping = total + shipping_fee


        # 建立訂單
        order = Order.objects.create(
            user=request.user,
            order_number=generate_order_number(),
            delivery_method=delivery_method,
            payment_method=payment_method,
            shipping_address=selected_address,
            shipping_info=shipping_info,
            payment_info=payment_info,
            subtotal=Decimal(total),
            shipping_fee=Decimal(shipping_fee),
            total_amount=Decimal(total_with_shipping),
            status='pending',
        )


        # 建立訂單項目(記錄當時價格)
        for product in products:
            quantity = cart[str(product.id)]['quantity']
            price = product.price_int
            subtotal = price * quantity

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=price,    # 紀錄下單時的價格
                subtotal=Decimal(subtotal)   # 紀錄下單時的小計
            )

        # 清空購物車
        request.session['cart'] = {}
        request.session.modified = True

        messages.success(request, f"訂單建立成功！訂單編號:{order.order_number}")
        return redirect('orders:order_success', order_id=order.id)


def generate_order_number():
    """
    生成唯一訂單號碼
    """
    date_str = datetime.now().strftime('%Y%m%d')
    unique_id = uuid.uuid4().hex[:8].upper()
    return f"ORD{date_str}-{unique_id}"

@login_required
def order_success_view(request, order_id):
    """
    訂單成功頁面
    """
    order = get_object_or_404(Order, id=order_id, user=request.user)
    order_items = order.items.all()

    context = {
        'current_step': 3,
        'order' : order,
        'order_items' : order_items,
        'is_success': True,
    }
    return render(request, 'order/order_success.html', context)


# 地址管理API
@login_required
def address_create_view(request):
    """建立新地址(AJAX)"""
    if request.method != 'POST':
        return JsonResponse({'success' : False, 'error' : '無效的請求方法'}, status=405)
    

    receiver = request.POST.get('receiver')
    phone = request.POST.get('phone')
    city = request.POST.get('city')
    district = request.POST.get('district')
    street_address = request.POST.get('street_address')
    postal_code = request.POST.get('postal_code', '')

    # 驗證
    if not all([receiver, phone, city, district, street_address]):
        return JsonResponse({'success' : False, 'error' : '請填寫完整資訊'}, status=400)
    
    # 建立地址(成功就建立地址)
    address = Address.objects.create(
        user=request.user,
        receiver=receiver,
        phone=phone,
        city=city,
        district=district,
        street_address=street_address,
        postal_code=postal_code,
        is_default=Address.objects.filter(user=request.user).count() == 0   # 第一筆為預設
        )

        
    return JsonResponse({
        'success' : True,
        'message' : '地址新增成功',
        'address' : {
            'id' : address.id,
            'receiver' : address.receiver,
            'phone' : address.phone,
            'full_address' : address.full_address,
            'is_default' : address.is_default,
        }
    }, status=201)





@login_required
def address_set_default_view(request):
    """設為預設地址"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': '無效的請求'}, status=405)

    address_id = request.POST.get('address_id')
    try:
        # 取消其他預設地址
        Address.objects.filter(user=request.user, is_default=True).update(is_default=False)

        # 設定新的預設地址
        address = Address.objects.get(id=address_id, user=request.user)
        address.is_default = True
        address.save()

        return JsonResponse({'success': True}, status=200)
    except Address.DoesNotExist:
        return JsonResponse({'success': False, 'error': '地址不存在'}, status=404)
    
    



@login_required
def address_detail_view(request, address_id):
    """取得地址詳細資料(AJAX)"""
    try:
        address = Address.objects.get(id=address_id, user=request.user)
    except Address.DoesNotExist:
        return JsonResponse({'success': False, 'error': '地址不存在'}, status=404)
    
    return JsonResponse({
    'success': True,
    'address': {
        'id': address_id,
        'receiver': address.receiver,
        'phone': address.phone,
        'city': address.city,
        'district': address.district,
        'street_address': address.street_address,
        'postal_code': address.postal_code
    }
}, status=200)


@login_required
def address_update_view(request, address_id):
    """編輯地址(AJAX)"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': '無效的請求'}, status=405)
    try:
        address = Address.objects.get(id=address_id, user=request.user)
    except Address.DoesNotExist:
        return JsonResponse({'success': False, 'error': '地址不存在'}, status=404)
    
    receiver = request.POST.get('receiver')
    phone = request.POST.get('phone')
    city = request.POST.get('city')
    district = request.POST.get('district')
    street_address = request.POST.get('street_address')
    postal_code = request.POST.get('postal_code')

    if not all([receiver, phone, city, district, street_address, postal_code]):
        return JsonResponse({'success': False, 'error': '請填寫完整資訊'}, status=400)
    
    address.receiver = receiver
    address.phone = phone
    address.city = city
    address.district = district
    address.street_address = street_address
    address.postal_code = postal_code
    address.save()

    return JsonResponse({
        'success': True,
        'address':{
            'id': address.id,
            'receiver': address.receiver,
            'phone': address.phone,
            'full_address':address.full_address,
            'is_default': address.is_default,
        }
    }, status=200)

@login_required
def address_delete_view(request, address_id):
    """刪除地址"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': '無效的請求'}, status=405)
    try:
        address = Address.objects.get(id=address_id, user=request.user)
    except Address.DoesNotExist:
        return JsonResponse({'success': False, 'error': '地址不存在'}, status=404)
    
    address.delete()
    return JsonResponse({'success': True}, status=200)



@login_required
def order_list_view(request):
    """
    訂單列表頁面(使用者的所有訂單)
    """
    orders = Order.objects.filter(user=request.user).order_by('-created_at')

    q = request.GET.get('q', '').strip()
    start_date = request.GET.get('start_date', '').strip()
    end_date = request.GET.get('end_date', '').strip()

    if q:
        orders = orders.filter(
            Q(order_number__icontains=q) |      # 查詢條件icontains是不分大小寫得包含搜尋
            Q(items__product__name__icontains=q)
        ).distinct()    # 去除重複資料

    if start_date:
        orders = orders.filter(created_at__date__gte=start_date)   # gte大於等於這個日期
        
    if end_date:
        orders = orders.filter(created_at__date__lte=end_date)     # lte小於等於這個日期

    context = {
        'orders' : orders,
        'q': q,
        'start_date': start_date,
        'end_date': end_date,
    }
    return render(request, 'order/order_list.html', context)




@login_required
def order_detail_view(request, order_id):
    """
    每筆訂單的詳情
    """

    order = get_object_or_404(Order, id=order_id, user=request.user)
    order_items = order.items.all()  # 從order反向查詢每筆商品細項
    context = {
        'is_success': False,
        'order': order,
        'order_items': order_items,
    }

    return render(request, 'order/order_success.html', context)
    