import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Product, LinkCode, ServerMode
from .serializers import ProductSerializer


def index(request):
    """Bosh sahifa. Tovarlar ro'yxati DRF serializer orqali JSON sifatida
    shablonga uzatiladi va JS tomonidan xarid formasida ishlatiladi."""
    products = Product.objects.filter(is_active=True).select_related('category__server').order_by(
        'category__server__order', 'category__order', '-price'
    )
    products_data = ProductSerializer(products, many=True).data

    servers = ServerMode.objects.filter(is_active=True).order_by('order')
    servers_json = [{'id': s.id, 'name': s.name, 'slug': s.slug} for s in servers]

    return render(request, 'index.html', {
        'products_json': list(products_data),
        'servers_json': servers_json,
        'page': 'home',
    })


def qoidalar(request):
    """Qoidalar sahifasi"""
    return render(request, 'qoidalar.html', {'page': 'qoidalar'})


def qanday(request):
    """Qanday sotib olinadi sahifasi"""
    return render(request, 'qanday.html', {'page': 'qanday'})


def qollab_quvvatlash(request):
    """Qo'llab-quvvatlash (Support) sahifasi"""
    return render(request, 'qollab_quvvatlash.html', {'page': 'support'})

@csrf_exempt
def api_link_code(request):
    """Minecraft serverdan keladigan tasdiqlash kodlarini qabul qiladi"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            nick = data.get('minecraft_nick')
            code = data.get('code')
            
            if nick and code:
                # Eski kodlarni o'chirish (ixtiyoriy)
                LinkCode.objects.filter(minecraft_nick=nick).delete()
                # Yangisini yaratish
                LinkCode.objects.create(minecraft_nick=nick, code=code)
                return JsonResponse({"status": "success", "message": "Code saved"})
            else:
                return JsonResponse({"status": "error", "message": "Missing fields"}, status=400)
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)
    
    return JsonResponse({"status": "error", "message": "Only POST allowed"}, status=405)
