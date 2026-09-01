# NovaMc.uz — Django REST Framework loyihasi

Loyiha to'liq Django + Django REST Framework arxitekturasiga o'tkazildi.
Sotib olishga bog'liq **hamma narsa** (tovarlar, narxlar, buyurtmalar, to'lov
karta raqami, Telegram, server IP) endi **Django admin panelidan** boshqariladi.

## Nima o'zgardi

- `templates/` bo'sh edi — endi `base.html`, `index.html`, `qoidalar.html`,
  `qanday.html` to'liq Django shablonlariga aylantirildi.
- Bosh sahifadagi mahsulotlar ro'yxati endi bazadan (`Product` modeli) DRF
  serializer orqali JSON qilib olinadi va JS bilan chizib chiqiladi — mahsulot
  qattiq (hardcoded) yozilmagan.
- Xarid formasi endi haqiqatan ishlaydi: `fetch()` orqali chek rasmi bilan
  birga `/api/orders/` manziliga (DRF `CreateAPIView`) yuboriladi. Avval faqat
  `alert()` chiqarardi.
- Yangi `SiteSettings` modeli qo'shildi — to'lov karta raqami, karta egasi,
  Telegram username, server IP/versiyasi, "do'kon ochiq/yopiq" tugmasi —
  bularning barchasi admin panelda, kodga tegmasdan o'zgartiriladi.
- `OrderAdmin`ga tezkor amallar qo'shildi: ✅ Tasdiqlash, 📦 Yetkazilgan deb
  belgilash, ❌ Rad etish — bir nechta buyurtmani bir vaqtda tanlab bajarish
  mumkin.
- Mavjud 18 ta tovar (Askar dan Imperator gacha, Helper/Moder/Admin/Homiy,
  Case/Token/Titul) ma'lumotlar migratsiyasi orqali avtomatik bazaga
  joylanadi — `manage.py migrate` ishga tushirilganda o'zi yaratiladi.

## O'rnatish

```bash
# 1. Virtual muhit (tavsiya etiladi)
python -m venv venv
venv\Scripts\activate      # Windows
# yoki: source venv/bin/activate   # Linux/Mac

# 2. Kerakli paketlarni o'rnatish
pip install -r requirements.txt

# 3. Bazani yaratish (Category/Product/Order jadvallari va boshlang'ich
#    18 ta tovar avtomatik qo'shiladi)
python manage.py migrate

# 4. Admin panel uchun foydalanuvchi yaratish
python manage.py createsuperuser

# 5. Serverni ishga tushirish
python manage.py runserver
```

Sayt: http://127.0.0.1:8000/
Admin panel: http://127.0.0.1:8000/admin/

## Admin panelda nima boshqariladi

- **Kategoriyalar** (`/admin/shop/category/`) — guruhlar va ularning tartibi.
- **Tovarlar** (`/admin/shop/product/`) — nomi, narxi, buyruqlari,
  imkoniyatlari, faol/nofaolligi. Yangi tovar qo'shish yoki narx
  o'zgartirish uchun kodga tegish shart emas.
- **Buyurtmalar** (`/admin/shop/order/`) — har bir xariddan kelgan chek
  rasmini ko'rish, holatini (Kutilmoqda/Tasdiqlangan/Yetkazilgan/Rad
  etilgan) o'zgartirish, admin izohi yozish. Ro'yxatdan bir nechtasini
  tanlab, tepadagi "Amal" (Action) menyusidan tezkor tasdiqlash/rad etish
  mumkin.
- **Sayt sozlamalari** (`/admin/shop/sitesettings/`) — to'lov karta raqami,
  Telegram, server IP/versiyasi, do'konni vaqtincha yopish. Bitta yagona
  yozuv — saytga kirishingiz bilan to'g'ridan-to'g'ri tahrirlash sahifasiga
  yo'naltiradi.

## API endpointlari (DRF)

| Metod | Manzil              | Vazifasi                                    |
|-------|---------------------|----------------------------------------------|
| GET   | `/api/products/`    | Faol tovarlar ro'yxati (kategoriyasi bilan)  |
| POST  | `/api/orders/`      | Yangi buyurtma yaratish (chek rasmi bilan)   |
| GET   | `/api/settings/`    | To'lov karta raqami va boshqa sozlamalar     |

## Eslatma (production uchun)

- `settings.py` da `DEBUG = True` va `SECRET_KEY` hozircha development
  uchun. Serverga chiqarishdan oldin `DEBUG = False` qiling, yangi
  `SECRET_KEY` generatsiya qiling va `ALLOWED_HOSTS` ga domeningizni
  qo'shing.
- Media fayllar (chek rasmlari) `media/receipts/` papkasida saqlanadi —
  production serverda bu papka uchun alohida serve qilish (nginx/S3 va h.k.)
  sozlanishi kerak.
