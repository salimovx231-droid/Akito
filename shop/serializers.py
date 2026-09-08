from rest_framework import serializers
from .models import Product, Order, Category, SiteSettings, ChatMessage


class CategorySerializer(serializers.ModelSerializer):
    server_id = serializers.IntegerField(source='server.id', read_only=True)
    server_name = serializers.CharField(source='server.name', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'order', 'server_id', 'server_name']


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    commands = serializers.SerializerMethodField()
    features = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category', 'price',
            'commands', 'features'
        ]

    def get_commands(self, obj):
        return obj.get_commands_list()

    def get_features(self, obj):
        return obj.get_features_list()


class OrderSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.IntegerField(source='product.price', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'player_nick', 'email', 'product', 'product_name',
            'product_price', 'receipt_image', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'created_at']

    def validate_product(self, value):
        if not value.is_active:
            raise serializers.ValidationError("Bu tovar hozirda faol emas.")
        return value


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            'server_ip', 'server_version', 'online_players_text',
            'payment_card_number', 'payment_card_owner',
            'telegram_username', 'is_shop_open',
        ]


class ChatMessageSerializer(serializers.ModelSerializer):
    created_at_formatted = serializers.DateTimeField(source='created_at', format='%H:%M', read_only=True)

    class Meta:
        model = ChatMessage
        fields = [
            'id', 'session_id', 'user_nick', 'sender',
            'message', 'created_at', 'created_at_formatted'
        ]
        read_only_fields = ['id', 'created_at', 'created_at_formatted']
