from django.urls import path
from . import views

app_name = "orders"

urlpatterns = [
    path('checkout/', views.checkout_view, name='checkout'),
    path('success/<int:order_id>/', views.order_success_view, name='order_success'),
    path('address_create/', views.address_create_view, name='address_create'),
    # path('detail/<int:order_id>/', views.order_detail_view, name='order_detail'),
    # path('list/', views.order_list_view, name='order_list')
]
