from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Product, Order, SiteSettings, ChatMessage
from .serializers import ProductSerializer, OrderSerializer, SiteSettingsSerializer, ChatMessageSerializer


class ProductListView(generics.ListAPIView):
    """Barcha faol tovarlar ro'yxati (kategoriyasi bilan birga)"""
    queryset = Product.objects.filter(is_active=True).select_related('category')
    serializer_class = ProductSerializer


class OrderCreateView(generics.CreateAPIView):
    """Yangi buyurtma yaratish (chek bilan). Buyurtma admin panelda ko'rinadi va shu yerda boshqariladi."""
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    parser_classes = [MultiPartParser, FormParser]
    # Bu ochiq (login talab qilmaydigan) forma. Agar brauzerda admin panelga
    # kirilgan bo'lsa, SessionAuthentication o'zining CSRF tekshiruvini yoqib,
    # "CSRF Failed: CSRF token from POST incorrect." xatosini beradi.
    # Bu yerda autentifikatsiya kerak emas, shuning uchun uni o'chiramiz.
    authentication_classes = []
    permission_classes = []

    def create(self, request, *args, **kwargs):
        settings_obj = SiteSettings.load()
        if not settings_obj.is_shop_open:
            return Response(
                {"message": "Kechirasiz, do'kon hozircha vaqtincha yopiq. Iltimos keyinroq urinib ko'ring."},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {"message": "Buyurtmangiz qabul qilindi! Admin tez orada ko'rib chiqadi va emailingizga xabar beriladi."},
            status=status.HTTP_201_CREATED
        )


class SiteSettingsView(APIView):
    """Sayt sozlamalari (to'lov karta raqami, server IP va h.k) - admin panelda tahrirlanadi"""

    def get(self, request):
        settings_obj = SiteSettings.load()
        serializer = SiteSettingsSerializer(settings_obj)
        return Response(serializer.data)


class ChatMessageListCreateView(APIView):
    """Foydalanuvchi va Admin o'rtasida chat xabarlarini saqlash va yuklash API-si"""
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        session_id = request.query_params.get('session_id')
        if not session_id:
            return Response([], status=status.HTTP_200_OK)

        messages_qs = ChatMessage.objects.filter(session_id=session_id).order_by('created_at')
        serializer = ChatMessageSerializer(messages_qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        session_id = request.data.get('session_id')
        message_text = request.data.get('message')
        user_nick = request.data.get('user_nick', 'Mehmon')

        if not session_id or not message_text:
            return Response(
                {"error": "session_id va message talab qilinadi."},
                status=status.HTTP_400_BAD_REQUEST
            )

        msg_obj = ChatMessage.objects.create(
            session_id=session_id,
            user_nick=user_nick,
            sender='user',
            message=message_text,
            is_read_by_admin=False
        )
        serializer = ChatMessageSerializer(msg_obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED)