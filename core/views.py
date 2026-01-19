from django.shortcuts import render


def homepage(request):
    """首頁"""
    return render(request, 'core/home.html')
