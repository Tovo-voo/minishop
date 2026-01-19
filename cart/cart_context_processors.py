# 全域變數 (為了讓購物車上面的數量也追蹤到，所以設置了全域變數)
def cart_count(request):
    cart = request.session.get('cart', {})
    total_qty = sum(item['quantity'] for item in cart.values())
    return {
        'cart_count' : total_qty
    }