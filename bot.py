import os
import django
import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton, ReplyKeyboardMarkup, KeyboardButton
from io import BytesIO
from django.core.files.base import ContentFile

# Django muhitini yuklash
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "novamc.settings")
django.setup()

from shop.models import Category, Product, Order, SiteSettings

# Botni sozlash
settings = SiteSettings.load()
TOKEN = settings.telegram_bot_token

if not TOKEN:
    print("XATO: Telegram bot tokeni topilmadi. Sayt admin panelidan (SiteSettings) kiriting.")
    exit(1)

bot = telebot.TeleBot(TOKEN)
admin_chat_id = settings.telegram_admin_chat_id

# Vaqtinchalik holatni saqlash uchun lug'at (Production uchun redis yoki bazadan foydalanish tavsiya etiladi)
user_data = {}

def get_main_menu():
    markup = ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    markup.add(KeyboardButton("🛍 Tovarlar"), KeyboardButton("ℹ️ Yordam"))
    return markup

@bot.message_handler(commands=['start'])
def send_welcome(message):
    bot.reply_to(message, "Assalomu alaykum! NovaMc serverimiz do'koniga xush kelibsiz.\nQuyidagi menyudan foydalaning:", reply_markup=get_main_menu())

@bot.message_handler(func=lambda message: message.text == "ℹ️ Yordam")
def send_help(message):
    help_text = (
        "Bu bot orqali NovaMc serveri uchun donate (rank, buyumlar) sotib olishingiz mumkin.\n"
        "1. '🛍 Tovarlar' tugmasini bosing.\n"
        "2. Kategoriyani tanlang.\n"
        "3. Tovarni tanlang va to'lov qiling.\n"
        "4. To'lov chekini yuboring.\n\n"
        "Yordam uchun adminlar bilan bog'laning:\n"
        "@NovaMc_admin\n"
        "@Zero_dev_0\n"
        "@dev_amirbek"
    )
    bot.reply_to(message, help_text)

@bot.message_handler(func=lambda message: message.text == "🛍 Tovarlar")
def show_categories(message):
    settings = SiteSettings.load()
    if not settings.is_shop_open:
        bot.send_message(message.chat.id, "Kechirasiz, do'kon hozircha vaqtincha yopiq.")
        return
        
    categories = Category.objects.all().order_by('order')
    if not categories.exists():
        bot.send_message(message.chat.id, "Hozircha hech qanday kategoriya yo'q.")
        return
        
    markup = InlineKeyboardMarkup(row_width=1)
    for cat in categories:
        markup.add(InlineKeyboardButton(cat.name, callback_data=f"cat_{cat.id}"))
        
    bot.send_message(message.chat.id, "Kategoriyani tanlang:", reply_markup=markup)

@bot.callback_query_handler(func=lambda call: call.data.startswith('cat_'))
def show_products(call):
    cat_id = call.data.split('_')[1]
    products = Product.objects.filter(category_id=cat_id, is_active=True).order_by('-price')
    
    if not products.exists():
        bot.answer_callback_query(call.id, "Bu kategoriyada tovarlar yo'q.")
        return
        
    markup = InlineKeyboardMarkup(row_width=1)
    for prod in products:
        markup.add(InlineKeyboardButton(f"{prod.name} - {prod.price:,} UZS", callback_data=f"prod_{prod.id}"))
        
    markup.add(InlineKeyboardButton("⬅️ Ortga", callback_data="back_to_cats"))
    
    bot.edit_message_text("Tovarni tanlang:", chat_id=call.message.chat.id, message_id=call.message.message_id, reply_markup=markup)

@bot.callback_query_handler(func=lambda call: call.data == "back_to_cats")
def back_to_cats(call):
    categories = Category.objects.all().order_by('order')
    markup = InlineKeyboardMarkup(row_width=1)
    for cat in categories:
        markup.add(InlineKeyboardButton(cat.name, callback_data=f"cat_{cat.id}"))
    bot.edit_message_text("Kategoriyani tanlang:", chat_id=call.message.chat.id, message_id=call.message.message_id, reply_markup=markup)

@bot.callback_query_handler(func=lambda call: call.data.startswith('prod_'))
def product_detail(call):
    prod_id = call.data.split('_')[1]
    product = Product.objects.get(id=prod_id)
    
    text = f"📦 <b>{product.name}</b>\n\n"
    text += f"💰 Narxi: {product.price:,} UZS\n\n"
    
    if product.features:
        text += f"✨ <b>Imkoniyatlari:</b>\n{product.features}\n\n"
        
    markup = InlineKeyboardMarkup()
    markup.add(InlineKeyboardButton("🛒 Sotib olish", callback_data=f"buy_{product.id}"))
    markup.add(InlineKeyboardButton("⬅️ Ortga", callback_data=f"cat_{product.category_id}"))
    
    bot.edit_message_text(text, chat_id=call.message.chat.id, message_id=call.message.message_id, reply_markup=markup, parse_mode="HTML")

@bot.callback_query_handler(func=lambda call: call.data.startswith('buy_'))
def start_buy(call):
    prod_id = call.data.split('_')[1]
    product = Product.objects.get(id=prod_id)
    
    user_data[call.message.chat.id] = {'product_id': product.id, 'step': 'nick'}
    
    msg = bot.send_message(call.message.chat.id, f"Siz <b>{product.name}</b> sotib olishni tanladingiz.\n\nIltimos, o'yindagi Nikingizni (ismingizni) yuboring:", parse_mode="HTML")
    bot.register_next_step_handler(msg, process_nick_step)

def process_nick_step(message):
    chat_id = message.chat.id
    if chat_id not in user_data or user_data[chat_id].get('step') != 'nick':
        return
        
    nick = message.text
    if not nick:
        msg = bot.send_message(chat_id, "Iltimos, nikingizni matn ko'rinishida yuboring.")
        bot.register_next_step_handler(msg, process_nick_step)
        return
        
    user_data[chat_id]['nick'] = nick
    user_data[chat_id]['step'] = 'receipt'
    
    settings = SiteSettings.load()
    card_number = settings.payment_card_number
    card_owner = settings.payment_card_owner
    
    text = f"Nikingiz: {nick}\n\n"
    text += f"To'lov qilish uchun quyidagi kartaga pul o'tkazing:\n"
    text += f"💳 Karta raqami: <code>{card_number}</code>\n"
    if card_owner:
        text += f"👤 Karta egasi: {card_owner}\n"
    
    text += "\nTo'lov qilganingizdan so'ng, to'lov cheki (skrinshot) ni shu yerga rasm qilib yuboring."
    
    msg = bot.send_message(chat_id, text, parse_mode="HTML")
    bot.register_next_step_handler(msg, process_receipt_step)

def process_receipt_step(message):
    chat_id = message.chat.id
    if chat_id not in user_data or user_data[chat_id].get('step') != 'receipt':
        return
        
    if not message.photo:
        msg = bot.send_message(chat_id, "Iltimos, to'lov chekini rasm (skrinshot) qilib yuboring.")
        bot.register_next_step_handler(msg, process_receipt_step)
        return
        
    # Get highest resolution photo
    photo = message.photo[-1]
    file_info = bot.get_file(photo.file_id)
    downloaded_file = bot.download_file(file_info.file_path)
    
    # Save to database
    data = user_data[chat_id]
    product = Product.objects.get(id=data['product_id'])
    nick = data['nick']
    
    # Create order
    order = Order(
        player_nick=nick,
        product=product,
        status='pending'
    )
    
    # Save image
    file_name = f"receipt_{chat_id}_{photo.file_id}.jpg"
    order.receipt_image.save(file_name, ContentFile(downloaded_file), save=True)
    
    # Send notification to admin if they are different from the bot's standard mechanism
    # The API view usually sends a telegram notification on creation, but since we create it directly,
    # the signal/hook might not trigger if it was in the view. We will send manually to be sure.
    bot.send_message(chat_id, "✅ Buyurtmangiz qabul qilindi! Admin tekshirgandan so'ng xizmat ko'rsatiladi.", reply_markup=get_main_menu())
    
    admin_ids = ["7196559126", "5448530421"]
    if admin_chat_id:
        admin_ids.append(str(admin_chat_id))
        
    caption = (
        f"🛒 <b>Yangi buyurtma (Bot orqali)!</b>\n\n"
        f"👤 O'yinchi: {nick}\n"
        f"🛍 Tovar: {product.name}\n"
        f"💰 Narxi: {product.price:,} UZS\n"
    )
    
    for a_id in set(admin_ids):
        try:
            bot.send_photo(a_id, photo.file_id, caption=caption, parse_mode="HTML")
        except Exception as e:
            print(f"Adminga xabar yuborishda xatolik ({a_id}): {e}")
            
    # Clear user data
    del user_data[chat_id]

if __name__ == "__main__":
    print("Bot ishga tushdi! (Sotuv boti)")
    bot.infinity_polling()
