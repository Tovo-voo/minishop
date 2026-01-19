from django.urls import path
from . import views

app_name = "orders"

urlpatterns = [
    path('check/', views.checkout_view, name='checkout'),
    path('order_buying/', views.confirm_order_view, name='order_success'),
]
