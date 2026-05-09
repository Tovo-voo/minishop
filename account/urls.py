from django.urls import path, include
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register_view, name='register'),
    path('address/add/', views.add_address_view, name='add_address'),
    path('profile_info/', views.profile_view, name='profile_info'),
]
