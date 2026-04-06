from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.models import User
from .models import Address
from django.http import JsonResponse
import re

# authenticate:是Django內建方法，用來「驗證帳號密碼是否正確」
# 第一次開登入頁是 GET請求 ，顯示頁面。按下登入是 POST請求，檢查帳號密碼
# login:Django內建方法，用來「建立登入狀態」，讓Django知道「這位使用者已登入」
# messages:Django的「訊息系統」，會在前端顯示一個提示(ex:紅色警告)
# request.POST是一個類似字典的物件，ex: data={'username':'xx', 'password':'12'}
# render:「顯示一個畫面」, redirect:「跳轉到一個路由(網址名稱)」

# 登入功能
def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        if not all([username, password]):
            messages.error(request, '請填寫完整資訊')
            return redirect('login')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)

            # 讀取 next 參數，如果有就跳回原頁面，沒有就跳回首頁
            # request.GET.get('next'):讀取URL中的 ?next=/cart/  (讀取下一個的意思)
            # requset.POST.get('next'):黏貼下一個 (如果有的話)
            next_url = request.GET.get('next') or request.POST.get('next') or 'Home'
            return redirect(next_url)
        else:
            messages.error(request, '帳號或密碼錯誤')
    return render(request, 'accounts/login.html')


# 登出
def logout_view(request):
    logout(request)
    return redirect('Home')



# 註冊
def register_view(request):
    # 當使用者按下「送出」時，取得表單資料、檢查密碼、建立帳號
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        password2 = request.POST.get('password2')
        phonenumber = request.POST.get('phonenumber')

        if not all([username, password, password2, phonenumber]):
            messages.error(request, '請完整填寫資訊')
            return redirect('register')
        
        if len(username) < 4 or len(username) > 20:
            messages.error(request, '使用者名稱長度錯誤')
            return redirect('register')

        if not re.match(r'^[\w.@#]+$', username):
            messages.error(request, '使用者名稱只能包含英文、數字、_.@#')
            return redirect('register')
        
        if not (re.search(r'[a-zA-Z]', username) and re.search(r'\d', username)):
            messages.error(request, '使用者名稱至少需同時包含一個英文和數字')
            return redirect('register')


        if len(password) < 8 or len(password) > 16:
            messages.error(request, '密碼長度不符')
            return redirect('register')
        
        if not re.fullmatch(r'[\w@]+', password):
            messages.error(request, '密碼只能包含英文、數字、_ 和 @')
            return redirect('register')

        if not (re.search(r'[a-zA-Z]', password) and re.search(r'\d', password)):
            messages.error(request, '密碼至少需同時包含一個英文和數字')
            return redirect('register')


        # 確認密碼是否一致
        if password != password2:
            messages.error(request, '輸入密碼不一致')
            return redirect('register')

        # 檢查帳號是否已存在
        if User.objects.filter(username=username).exists():
            messages.error(request, '帳號已被使用')
            return redirect('register')
        
        # 建立使用者
        user = User.objects.create_user(
            username = username,
            password = password
        )

        # 註冊完成提示
        messages.success(request, '註冊成功，請重新登入頁面')
        return redirect('login')
    
    # 如果是 GET(使用者第一次打開頁面時)，只顯示註冊畫面
    return render(request, 'accounts/register.html')





# 新增地址
def add_address_view(request):
    if request.method == 'POST':
        address = Address.objects.create(
            user=request.user,
            receiver=request.POST['receiver'],
            phone=request.POST['phone'],
            address=request.POST['address'],
        )
    #     return redirect('orders:checkout')
    # return render(request, 'accounts/partials/add_address.html')

    # AJAX版 把新地址 id 存進 session > 自動選擇
        request.session['shipping_address_id'] = address.id

        return JsonResponse({
            'success' : True,
            'address_id' : address.id,
            'receiver' : address.receiver,
            'phone' : address.phone,
            'address' : address.address,
        })

    return JsonResponse({'success':False}, status=400)