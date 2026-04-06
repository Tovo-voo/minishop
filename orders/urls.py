from django.urls import path
from . import views

app_name = "orders"

urlpatterns = [
    path('checkout/', views.checkout_view, name='checkout'),
    path('success/<int:order_id>/', views.order_success_view, name='order_success'),
    path('address_create/', views.address_create_view, name='address_create'),
    path('address/set-default/', views.address_set_default_view, name='address_set_default'),
    path('address/<int:address_id>/detail/', views.address_detail_view, name='address_detail'),
    path('address/<int:address_id>/update/', views.address_update_view, name='address_update'),
    path('address/<int:address_id>/delete/', views.address_delete_view, name='address_delete'),
    path('order_list/', views.order_list_view, name='order_list'),
    path('order_detail/<int:order_id>/', views.order_detail_view, name='order_detail'),
]
