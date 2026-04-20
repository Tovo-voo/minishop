# minishop

A UNIQLO-inspired e-commerce website built with Django as a portfolio project.

UNIQLO 風格的電商網站，使用 Django 開發，作為作品集展示用途。

---

## 🔗 Live Demo
[https://minishop-pygj.onrender.com](https://minishop-pygj.onrender.com)

> ⚠️ Hosted on Render free plan. The server may take 1–2 minutes to wake up on first visit.
>
> ⚠️ 部署於 Render 免費方案，首次訪問可能需要 1–2 分鐘喚醒伺服器。

---

## 🛠️ Tech Stack / 技術棧

| Category | Technology |
|---|---|
| Backend | Python 3.12 / Django |
| Database | PostgreSQL (production) / SQLite (local) |
| Image Storage | Cloudinary |
| Deployment | Render |
| Frontend | HTML / CSS / JavaScript / Bootstrap |

---

## ✅ Features / 功能

- **Product Browsing** / 商品瀏覽 — Browse products by category and subcategory / 依分類與子分類瀏覽商品
- **Shopping Cart** / 購物車 — Add, update, and remove items / 新增、修改、刪除商品
- **Checkout** / 結帳 — Place orders with shipping address management / 填寫收貨地址並下單
- **Order Management** / 訂單管理 — View order list, details, and search orders / 查看訂單列表、詳情與搜尋
- **User Authentication** / 使用者驗證 — Register, login, and logout / 註冊、登入、登出

---

## 🗺️ Roadmap

- [ ] Member profile page (personal info & address management) / 會員頁面（個人資料與地址管理）
- [ ] Wishlist / 願望清單
- [ ] Product search / 商品搜尋
- [ ] Product reviews / 商品評價
- [ ] Multiple product images / 商品多圖

---

## 🚀 Local Setup / 本地安裝

**1. Clone the repository / 複製專案**
```bash
git clone https://github.com/your-username/minishop.git
cd minishop
```

**2. Create virtual environment / 建立虛擬環境**
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
```

**3. Install dependencies / 安裝套件**
```bash
pip install -r requirements.txt
```

**4. Set up environment variables / 設定環境變數**

Create a `.env` file in the root directory / 在根目錄建立 `.env` 檔案：

```
SECRET_KEY=your_secret_key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**5. Run migrations / 執行資料庫遷移**
```bash
python manage.py migrate
```

**6. Load sample data / 載入範例資料**
```bash
python manage.py loaddata fixtures/initial_data.json
```

**7. Start the server / 啟動伺服器**
```bash
python manage.py runserver
```

Visit / 訪問 `http://127.0.0.1:8000`

---

## 📁 Project Structure / 專案結構

```
minishop/
├── core/          # Homepage / 首頁
├── product/       # Products & categories / 商品與分類
├── orders/        # Cart, checkout, orders / 購物車、結帳、訂單
├── account/       # User auth & addresses / 使用者驗證與地址
├── static/        # CSS, JS, images / 靜態檔案
├── templates/     # HTML templates / HTML 模板
├── fixtures/      # Sample data / 範例資料
└── build.sh       # Render build script / 部署腳本
```
