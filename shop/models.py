from django.db import models

class ServerMode(models.Model):
    """Serverlar (Anarxiya2, Boxpvp va h.k.)"""
    name = models.CharField(max_length=100, verbose_name="Server nomi")
    slug = models.SlugField(unique=True)
    order = models.IntegerField(default=0, verbose_name="Tartib raqami")
    is_active = models.BooleanField(default=True, verbose_name="Faolmi?")

    class Meta:
        verbose_name = "Server"
        verbose_name_plural = "Serverlar"
        ordering = ['order']

    def __str__(self):
        return self.name


class Category(models.Model):
    """Tovar guruhlari (Asosiy Ranklar, Ma'muriyat, Boshqa)"""
    name = models.CharField(max_length=100, verbose_name="Guruh nomi")
    slug = models.SlugField(unique=True)
    server = models.ForeignKey(
        ServerMode, 
        on_delete=models.CASCADE, 
        related_name='categories', 
        verbose_name="Server",
        null=True, blank=True
    )
    order = models.IntegerField(default=0, verbose_name="Tartib raqami")

    class Meta:
        verbose_name = "Kategoriya"
        verbose_name_plural = "Kategoriyalar"
        ordering = ['order']

    def __str__(self):
        return self.name


class Product(models.Model):
    """Ranklar va tovarlar"""
    name = models.CharField(max_length=100, verbose_name="Nomi")
    slug = models.SlugField(unique=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='products',
        verbose_name="Kategoriya"
    )
    price = models.IntegerField(verbose_name="Narxi (UZS)")
    commands = models.TextField(
        blank=True,
        verbose_name="Buyruqlar",
        help_text="Har bir buyruqni yangi qatorga yozing. Masalan: /kit askar"
    )
    features = models.TextField(
        blank=True,
        verbose_name="Imkoniyatlar",
        help_text="Har bir imkoniyatni yangi qatorga yozing. Masalan: Homelar soni: 4"
    )
    is_active = models.BooleanField(default=True, verbose_name="Faolmi?")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Tovar"
        verbose_name_plural = "Tovarlar"
        ordering = ['-price']

    def __str__(self):
        return f"{self.name} — {self.price:,} UZS"

    def get_commands_list(self):
        """Buyruqlar ro'yxatini qaytaradi"""
        if not self.commands:
            return []
        return [cmd.strip() for cmd in self.commands.strip().split('\n') if cmd.strip()]

    def get_features_list(self):
        """Imkoniyatlar ro'yxatini qaytaradi"""
        if not self.features:
            return []
        return [f.strip() for f in self.features.strip().split('\n') if f.strip()]


class Order(models.Model):
    """Buyurtmalar"""
    STATUS_CHOICES = [
        ('pending', 'Kutilmoqda'),
        ('approved', 'Tasdiqlangan'),
        ('delivered', 'Yetkazilgan'),
        ('rejected', 'Rad etilgan'),
    ]

    player_nick = models.CharField(max_length=50, verbose_name="O'yinchi niki")
    email = models.EmailField(blank=True, null=True, verbose_name="Email manzil")
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='orders',
        verbose_name="Tovar"
    )
    receipt_image = models.ImageField(
        upload_to='receipts/',
        verbose_name="To'lov cheki"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name="Holat"
    )
    admin_note = models.TextField(
        blank=True,
        verbose_name="Admin izohi",
        help_text="Ichki izoh (faqat adminlar ko'radi)"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Yaratilgan vaqt")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Yangilangan vaqt")

    class Meta:
        verbose_name = "Buyurtma"
        verbose_name_plural = "Buyurtmalar"
        ordering = ['-created_at']

    def __str__(self):
        return f"#{self.pk} — {self.player_nick} → {self.product.name} ({self.get_status_display()})"


class SiteSettings(models.Model):
    """Sayt bo'ylab ishlatiladigan sozlamalar (faqat 1 ta yozuv bo'ladi)"""
    server_ip = models.CharField(
        max_length=100, default="novamc.uz", verbose_name="Server IP manzili"
    )
    server_version = models.CharField(
        max_length=50, default="1.16.5 - 1.20+", verbose_name="Server versiyasi"
    )
    online_players_text = models.CharField(
        max_length=100, default="245 O'yinchi onlayn", verbose_name="Onlayn o'yinchilar matni"
    )
    payment_card_number = models.CharField(
        max_length=30, default="8800 5122 5832 6811", verbose_name="To'lov karta raqami"
    )
    payment_card_owner = models.CharField(
        max_length=100, blank=True, verbose_name="Karta egasi (ixtiyoriy)"
    )
    telegram_username = models.CharField(
        max_length=100, default="NovaMc_org", verbose_name="Telegram username (@ siz)"
    )
    discord_url = models.URLField(
        default="https://discord.gg/yswhhQKdB", verbose_name="Discord havolasi"
    )
    is_shop_open = models.BooleanField(
        default=True, verbose_name="Do'kon ochiqmi?",
        help_text="O'chirilsa, saytda xarid formasi vaqtincha yopiladi"
    )
    telegram_bot_token = models.CharField(
        max_length=255, blank=True, null=True, verbose_name="8980335834:AAFNNx5vuxShDk6xrVxtuSw_siinTOw_IE8",
        help_text="BotFather'dan olingan token (masalan: 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11)"
    )
    telegram_admin_chat_id = models.CharField(
        max_length=100, blank=True, null=True, verbose_name="8997272977",
        help_text="Xaridlarni qabul qiluvchi adminning chat ID si (yoki guruh ID si)"
    )

    class Meta:
        verbose_name = "Sayt sozlamasi"
        verbose_name_plural = "Sayt sozlamalari"

    def __str__(self):
        return "Sayt sozlamalari"

    def save(self, *args, **kwargs):
        # Faqat bitta yozuv bo'lishini ta'minlaymiz (singleton)
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class ChatMessage(models.Model):
    """Foydalanuvchi va Admin o'rtasidagi onlayn chat xabarlari"""
    SENDER_CHOICES = [
        ('user', 'Foydalanuvchi'),
        ('admin', 'Admin'),
    ]

    session_id = models.CharField(
        max_length=100, db_index=True, verbose_name="Sessiya ID"
    )
    user_nick = models.CharField(
        max_length=100, default="Mehmon", verbose_name="Foydalanuvchi niki"
    )
    sender = models.CharField(
        max_length=10, choices=SENDER_CHOICES, default='user', verbose_name="Yuboruvchi"
    )
    message = models.TextField(verbose_name="Xabar")
    is_read_by_admin = models.BooleanField(default=False, verbose_name="Admin o'qidimi?")
    is_read_by_user = models.BooleanField(default=False, verbose_name="Foydalanuvchi o'qidimi?")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Yuborilgan vaqt")

    class Meta:
        verbose_name = "Chat xabari"
        verbose_name_plural = "Chat xabarlari"
        ordering = ['created_at']

    def __str__(self):
        return f"[{self.get_sender_display()}] {self.user_nick}: {self.message[:30]}"

class PlayerAccount(models.Model):
    """Telegram va Minecraft niki o'rtasidagi bog'liqlikni saqlovchi jadval"""
    telegram_id = models.CharField(max_length=100, unique=True, verbose_name="Telegram ID")
    minecraft_nick = models.CharField(max_length=100, unique=True, verbose_name="Minecraft Niki")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ulangan vaqt")

    class Meta:
        verbose_name = "Ulangan Akkaunt"
        verbose_name_plural = "Ulangan Akkauntlar"

    def __str__(self):
        return f"{self.minecraft_nick} (TG: {self.telegram_id})"

class LinkCode(models.Model):
    """Minecraftdan yuborilgan vaqtinchalik ulanish kodlari"""
    minecraft_nick = models.CharField(max_length=100, unique=True, verbose_name="Minecraft Niki")
    code = models.CharField(max_length=6, verbose_name="Tasdiqlash Kodi")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Yaratilgan vaqt")

    class Meta:
        verbose_name = "Ulanish Kodi"
        verbose_name_plural = "Ulanish Kodlari"

    def __str__(self):
        return f"{self.minecraft_nick} - {self.code}"
