from product.models import Product

def calculate_cart_total(cart):
    """
    cart 結構:
    {
        "1" : {'quantity': 2},
        "5" : {'quantity': 1}
    }
    這是計算總total
    """

    product_ids = cart.keys()
    products = Product.objects.filter(id__in=product_ids)

    total = 0
    for product in products:
        quantity = cart[str(product.id)]['quantity']
        total += product.price * quantity

    return total