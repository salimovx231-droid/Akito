import json
from django.shortcuts import render
from .models import Product
from .serializers import ProductSerializer


def index(request):
    """Bosh sahifa. Tovarlar ro'yxati DRF serializer orqali JSON sifatida
    shablonga uzatiladi va JS tomonidan xarid formasida ishlatiladi."""
    products = Product.objects.filter(is_active=True).select_related('category').order_by(
        'category__order', '-price'
    )
    products_data = ProductSerializer(products, many=True).data
    return render(request, 'index.html', {
        # json.dumps() atayin chaqirilmaydi — {{ products_json|json_script:"..." }}
        # shablonda buni o'zi bajaradi. Ikkalasini ham qilish JSON matnni
        # ikki marta kodlab, JS massiv o'rniga string qaytarib yuborardi.
        'products_json': list(products_data),
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
