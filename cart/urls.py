from django.urls import path
from . import views

urlpatterns = [
    path('', views.cart_view, name='cart'),
    path('cart_product/<int:product_id>/', views.add_cart_view, name='add_cart'),
    path('removefrom_cart/<int:product_id>/', views.remove_cartproduct_view, name='removecart'),
    path('mergepm_cart/<int:product_id>/<str:action>/', views.mergePandM_method, name='merge'),
    # path('cart_plus/<int:product_id>/', views.plus, name='cart_plus'),
    # path('cart_minus/<int:product_id>/', views.minus, name='cart_minus'),
]