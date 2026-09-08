from django.contrib import admin
from django.utils.html import format_html
from django.contrib import messages
from django import forms
from .models import Category, Product, Order, SiteSettings, ChatMessage, ServerMode


class ChatMessageAdminForm(forms.ModelForm):
    admin_reply = forms.CharField(
        widget=forms.Textarea(attrs={'rows': 3, 'placeholder': "Foydalanuvchiga javobingizni shu yerga yozing..."}),
        required=False,
        label="💬 Javob qaytarish (Admin javobi)"
    )

    class Meta:
        model = ChatMessage
        fields = '__all__'


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    form = ChatMessageAdminForm
    list_display = (
        'id', 'colored_sender', 'user_nick', 'message_snippet',
        'is_read_by_admin', 'created_at'
    )
    list_filter = ('sender', 'is_read_by_admin', 'created_at')
    search_fields = ('session_id', 'user_nick', 'message')
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'

    fieldsets = (
        ("Xabar ma'lumotlari", {
            'fields': ('session_id', 'user_nick', 'sender', 'message', 'is_read_by_admin', 'created_at')
        }),
        ("Admin Javobi", {
            'fields': ('admin_reply',),
            'description': "Ushbu maydonga javob yozsangiz va saqlasangiz, foydalanuvchining chatida darhol admin javobi paydo bo'ladi."
        }),
    )

    def colored_sender(self, obj):
        color = '#00e676' if obj.sender == 'admin' else '#03dac6'
        label = "ADMIN" if obj.sender == 'admin' else "FOYDALANUVCHI"
        return format_html(
            '<span style="color: {}; font-weight: bold; background: rgba(0,0,0,0.2); padding: 3px 8px; border-radius: 4px;">{}</span>',
            color, label
        )
    colored_sender.short_description = "Yuboruvchi"

    def message_snippet(self, obj):
        return obj.message[:60] + ('...' if len(obj.message) > 60 else '')
    message_snippet.short_description = "Xabar matni"

    def save_model(self, request, obj, form, change):
        admin_reply_text = form.cleaned_data.get('admin_reply')
        super().save_model(request, obj, form, change)

        if obj.sender == 'user':
            ChatMessage.objects.filter(session_id=obj.session_id, sender='user').update(is_read_by_admin=True)

        if admin_reply_text and admin_reply_text.strip():
            ChatMessage.objects.create(
                session_id=obj.session_id,
                user_nick="NovaMc Support (Admin)",
                sender='admin',
                message=admin_reply_text.strip(),
                is_read_by_admin=True,
                is_read_by_user=False
            )
            self.message_user(
                request,
                f"✅ Admin javobi yuborildi!",
                messages.SUCCESS
            )


# Admin site customization
admin.site.site_header = "NovaMc.uz Admin Panel"
admin.site.site_title = "NovaMc Admin"
admin.site.index_title = "Boshqaruv paneli"
@admin.register(ServerMode)
class ServerModeAdmin(admin.ModelAdmin):
    list_display = ('colored_name', 'slug', 'order', 'is_active', 'category_count')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['order']
    list_editable = ('is_active', 'order')

    # Har bir server uchun rang belgilash
    SERVER_COLORS = {
        'anarxiya2': ('#ff4757', '#ff6b81'),  # Qizil - Anarxiya2
        'boxpvp':    ('#2ed573', '#7bed9f'),  # Yashil - Boxpvp
    }
    DEFAULT_COLOR = ('#ffa502', '#ffcc02')   # Sariq - boshqalar

    def _get_colors(self, obj):
        return self.SERVER_COLORS.get(obj.slug, self.DEFAULT_COLOR)

    def colored_name(self, obj):
        bg, fg = self._get_colors(obj)
        icon = '🔮' if obj.slug == 'anarxiya2' else '⚔️' if obj.slug == 'boxpvp' else '🎮'
        return format_html(
            '<span style="background: {}; color: #fff; padding: 4px 14px; '
            'border-radius: 20px; font-weight: 800; font-size: 13px; '
            'letter-spacing: 0.5px; display: inline-block;">{} {}</span>',
            bg, icon, obj.name
        )
    colored_name.short_description = 'Server nomi'
    colored_name.admin_order_field = 'name'

    def category_count(self, obj):
        count = obj.categories.count()
        return format_html('<b>{}</b> ta kategoriya', count)
    category_count.short_description = 'Kategoriyalar'


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'colored_server', 'slug', 'order', 'product_count')
    list_filter = ('server',)
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['server__order', 'order']

    SERVER_COLORS = {
        'anarxiya2': '#ff4757',
        'boxpvp':    '#2ed573',
    }
    DEFAULT_COLOR = '#ffa502'

    def colored_server(self, obj):
        if not obj.server:
            return format_html('<span style="color: #aaa;">—</span>')
        color = self.SERVER_COLORS.get(obj.server.slug, self.DEFAULT_COLOR)
        icon = '🔮' if obj.server.slug == 'anarxiya2' else '⚔️' if obj.server.slug == 'boxpvp' else '🎮'
        return format_html(
            '<span style="background: {}; color: #fff; padding: 3px 10px; '
            'border-radius: 12px; font-weight: 700; font-size: 12px;">{} {}</span>',
            color, icon, obj.server.name
        )
    colored_server.short_description = 'Server'
    colored_server.admin_order_field = 'server'

    def product_count(self, obj):
        count = obj.products.count()
        return format_html('<b>{}</b>', count)
    product_count.short_description = 'Tovarlar'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'colored_server_badge', 'category', 'formatted_price', 'is_active')
    list_filter = ('category__server', 'category', 'is_active')
    search_fields = ('name', 'commands', 'features')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('is_active',)

    SERVER_COLORS = {
        'anarxiya2': '#ff4757',
        'boxpvp':    '#2ed573',
    }
    DEFAULT_COLOR = '#ffa502'

    def colored_server_badge(self, obj):
        srv = obj.category.server if obj.category else None
        if not srv:
            return format_html('<span style="color: #aaa;">—</span>')
        color = self.SERVER_COLORS.get(srv.slug, self.DEFAULT_COLOR)
        icon = '🔮' if srv.slug == 'anarxiya2' else '⚔️' if srv.slug == 'boxpvp' else '🎮'
        return format_html(
            '<span style="background: {}; color: #fff; padding: 2px 9px; '
            'border-radius: 10px; font-weight: 700; font-size: 11px;">{} {}</span>',
            color, icon, srv.name
        )
    colored_server_badge.short_description = 'Server'
    colored_server_badge.admin_order_field = 'category__server'
    fieldsets = (
        ('Asosiy ma\'lumotlar', {
            'fields': ('name', 'slug', 'category', 'price', 'is_active')
        }),
        ('Buyruqlar va Imkoniyatlar', {
            'fields': ('commands', 'features'),
            'classes': ('wide',),
        }),
    )

    def formatted_price(self, obj):
        return f"{obj.price:,} UZS"
    formatted_price.short_description = "Narxi"
    formatted_price.admin_order_field = 'price'


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'player_nick', 'colored_server_badge', 'product', 'formatted_price',
        'colored_status', 'receipt_preview', 'created_at'
    )
    list_filter = ('product__category__server', 'status', 'product__category', 'created_at')
    search_fields = ('player_nick', 'email', 'product__name')
    readonly_fields = ('created_at', 'updated_at', 'receipt_preview_large')
    date_hierarchy = 'created_at'
    actions = ['mark_approved', 'mark_delivered', 'mark_rejected']

    # Add custom field for status with dropdown
    list_display_links = ('id', 'player_nick')

    @admin.action(description="✅ Tanlangan buyurtmalarni TASDIQLASH")
    def mark_approved(self, request, queryset):
        updated = queryset.update(status='approved')
        self.message_user(request, f"{updated} ta buyurtma tasdiqlandi.", messages.SUCCESS)

    @admin.action(description="📦 Tanlangan buyurtmalarni YETKAZILGAN deb belgilash")
    def mark_delivered(self, request, queryset):
        updated = queryset.update(status='delivered')
        self.message_user(request, f"{updated} ta buyurtma yetkazilgan deb belgilandi.", messages.SUCCESS)

    @admin.action(description="❌ Tanlangan buyurtmalarni RAD ETISH")
    def mark_rejected(self, request, queryset):
        updated = queryset.update(status='rejected')
        self.message_user(request, f"{updated} ta buyurtma rad etildi.", messages.WARNING)

    fieldsets = (
        ("O'yinchi ma'lumotlari", {
            'fields': ('player_nick', 'email', 'product')
        }),
        ("To'lov", {
            'fields': ('receipt_image', 'receipt_preview_large', 'status')
        }),
        ("Admin", {
            'fields': ('admin_note', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    def formatted_price(self, obj):
        return f"{obj.product.price:,} UZS"
    formatted_price.short_description = "Narxi"

    SERVER_COLORS = {
        'anarxiya2': '#ff4757',
        'boxpvp':    '#2ed573',
    }
    DEFAULT_SERVER_COLOR = '#ffa502'

    def colored_server_badge(self, obj):
        try:
            srv = obj.product.category.server if obj.product and obj.product.category else None
        except Exception:
            srv = None
        if not srv:
            return format_html('<span style="color: #aaa;">—</span>')
        color = self.SERVER_COLORS.get(srv.slug, self.DEFAULT_SERVER_COLOR)
        icon = '🔮' if srv.slug == 'anarxiya2' else '⚔️' if srv.slug == 'boxpvp' else '🎮'
        return format_html(
            '<span style="background: {}; color: #fff; padding: 3px 10px; '
            'border-radius: 12px; font-weight: 700; font-size: 12px;">{} {}</span>',
            color, icon, srv.name
        )
    colored_server_badge.short_description = 'Server'
    colored_server_badge.admin_order_field = 'product__category__server'

    def colored_status(self, obj):
        colors = {
            'pending': '#ffb86c',
            'approved': '#00e676',
            'delivered': '#03dac6',
            'rejected': '#ff5252',
        }
        color = colors.get(obj.status, '#ffffff')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_status_display()
        )
    colored_status.short_description = "Holat"
    colored_status.admin_order_field = 'status'

    def receipt_preview(self, obj):
        if obj.receipt_image:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;" />',
                obj.receipt_image.url
            )
        return "—"
    receipt_preview.short_description = "Chek"

    def receipt_preview_large(self, obj):
        if obj.receipt_image:
            return format_html(
                '<img src="{}" style="max-width: 400px; border-radius: 10px;" />',
                obj.receipt_image.url
            )
        return "Chek yuklanmagan"
    receipt_preview_large.short_description = "To'lov cheki (ko'rish)"


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    """Sayt bo'ylab bitta yozuv - to'lov karta raqami, server IP va h.k."""
    fieldsets = (
        ("Server ma'lumotlari", {
            'fields': ('server_ip', 'server_version', 'online_players_text')
        }),
        ("To'lov ma'lumotlari", {
            'fields': ('payment_card_number', 'payment_card_owner', 'is_shop_open')
        }),
        ("Aloqa", {
            'fields': ('telegram_username',)
        }),
    )

    def has_add_permission(self, request):
        # Faqat bitta yozuv bo'lishi kerak
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        # Ro'yxat sahifasiga o'tmasdan to'g'ridan-to'g'ri yagona obyektni tahrirlashga yo'naltiramiz
        obj = SiteSettings.load()
        from django.shortcuts import redirect
        return redirect('admin:shop_sitesettings_change', obj.pk)


# Admin site customization
admin.site.site_header = "NovaMc.uz Admin Panel"
admin.site.site_title = "NovaMc Admin"
admin.site.index_title = "Boshqaruv paneli"
