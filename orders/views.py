from django.shortcuts import render, redirect, get_object_or_404
from product.models import Product
from account.models import Address
from orders.models import Order, OrderAddress

# 確認訂單
def checkout_view(request):
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


    # 一定要有選好的地址(cart_view已經鋪好了)
    address_id = request.session.get("shipping_address_id")
    if not address_id:
        return redirect('cart')
    
    address = get_object_or_404(
        Address,
        id=address_id,
        user=request.user
    )

    return render(request, "order/checkout.html", {
        "cart_items" : cart_items,
        "total" : total,
        "address" : address,
    })



def confirm_order_view(request):
    # 只接受POST
    if request.method != "POST":
        return redirect('checkout')
    
    # 一定要有購物車
    cart = request.session.get('cart')   
    if not cart:
        return redirect('cart')
    

    # 重新計算商品與總金額
    product_ids = cart.keys()
    products = Product.objects.filter(id__in=product_ids)

    cart_items = []
    for product in products:
        quantity = cart[str(product.id)]['quantity']
        cart_items.append({
            "product" : product,
            "quantity" : quantity,
            "subtotal" : product.price_int * quantity
        })

    total = sum(item['subtotal'] for item in cart_items)

    # 建立order(現在才算下單)
    order = Order.objects.create(
        user=request.user,
        total_price=total,
        is_paid=False   # 之後金流才放
    )

    # 取得本次使用的 Address(最後一次使用Address本尊)
    address_id = request.session.get('shipping_address_id')
    address = get_object_or_404(
        Address,
        id=address_id,
        user=request.user
    )



    # 複製 Address -->  OrderAddress
    OrderAddress.objects.create(
        order=order,
        receiver=address.receiver,
        phone=address.phone,
        address=address.address
    )


    # 清除 session (下單成功，流程結束)
    del request.session['cart']
    del request.session['shipping_address_id']


    # 導向成功頁面
    return redirect("order_success", order_id=order.id)