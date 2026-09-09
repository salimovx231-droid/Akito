import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'novamc.settings')
django.setup()

from shop.models import ServerMode, Category, Product

# Barcha serverlarni yaratamiz (yo'q bo'lsa yaratiladi, bor bo'lsa o'zgarishsiz qoladi)
anarxiya1, _ = ServerMode.objects.get_or_create(
    slug='anarxiya1',
    defaults={'name': 'Anarxiya1', 'order': 1, 'is_active': True}
)
anarxiya2, _ = ServerMode.objects.get_or_create(
    slug='anarxiya2',
    defaults={'name': 'Anarxiya2', 'order': 2, 'is_active': True}
)
boxpvp, _ = ServerMode.objects.get_or_create(
    slug='boxpvp',
    defaults={'name': 'BoxPvP', 'order': 3, 'is_active': True}
)

servers = [anarxiya1, anarxiya2, boxpvp]

mamuriyat_products = [
    {
        'name': 'Homiy',
        'price': 200000,
        'commands': '/titul\n/uc menu',
        'features': 'Homiy rangi va titul\nUnikal titul - /titul\nUnikal effektlar - /uc menu\nServer homiysi sifatida tanilish',
    },
    {
        'name': 'Admin',
        'price': 150000,
        'commands': '/titul\n/uc menu',
        'features': 'Admin rangi va titul\nUnikal titul - /titul\nUnikal effektlar - /uc menu',
    },
    {
        'name': 'Moder',
        'price': 100000,
        'commands': '/titul\n/uc menu',
        'features': 'Moder rangi va titul\nUnikal titul - /titul\nUnikal effektlar - /uc menu',
    },
    {
        'name': 'Helper',
        'price': 50000,
        'commands': '/titul\n/uc menu',
        'features': 'Helper rangi va titul\nUnikal titul - /titul\nUnikal effektlar - /uc menu',
    },
]

boshqa_products = [
    {
        'name': 'Donate Case',
        'price': 10000,
        'commands': '',
        'features': 'Donate Case - maxsus sovrinlar bilan quti',
    },
    {
        'name': 'Token Case',
        'price': 5000,
        'commands': '',
        'features': 'Token Case - tokenlar bilan quti',
    },
    {
        'name': 'Maxsus Titul',
        'price': 5000,
        'commands': '/titul',
        'features': 'Maxsus unikal titul - /titul',
    },
    {
        'name': 'Narsani nusxalash',
        'price': 5000,
        'commands': '',
        'features': "Qolinizdagi buyumni nusxalash xizmati",
    },
    {
        'name': '1000 Token',
        'price': 1000,
        'commands': '',
        'features': '1000 ta server tokeni',
    },
]


def make_slug(server_slug, name):
    return server_slug + '-' + name.lower().replace(' ', '-')


for server in servers:
    s = server.slug
    print(f'\n=== {server.name} ===')

    # --- Ma'muriyat va Maxsus ---
    mcat, _ = Category.objects.get_or_create(
        slug=s + '-mamuriyat-va-maxsus',
        defaults={'name': "Ma'muriyat va Maxsus", 'server': server, 'order': 2}
    )
    mcat.server = server
    mcat.save()
    print(f"Kategoriya: {mcat.name}")

    for p in mamuriyat_products:
        slug = make_slug(s, p['name'])
        obj, created = Product.objects.update_or_create(
            slug=slug,
            defaults={
                'name': p['name'],
                'category': mcat,
                'price': p['price'],
                'commands': p['commands'],
                'features': p['features'],
                'is_active': True,
            }
        )
        status = '+ Yaratildi' if created else '~ Yangilandi'
        print(f"  {status}: {obj.name} - {obj.price:,} UZS")

    # --- Boshqa Narsalar ---
    bcat, _ = Category.objects.get_or_create(
        slug=s + '-boshqa-narsalar',
        defaults={'name': 'Boshqa Narsalar', 'server': server, 'order': 3}
    )
    bcat.server = server
    bcat.save()
    print(f"Kategoriya: {bcat.name}")

    for p in boshqa_products:
        slug = make_slug(s, p['name'])
        obj, created = Product.objects.update_or_create(
            slug=slug,
            defaults={
                'name': p['name'],
                'category': bcat,
                'price': p['price'],
                'commands': p['commands'],
                'features': p['features'],
                'is_active': True,
            }
        )
        status = '+ Yaratildi' if created else '~ Yangilandi'
        print(f"  {status}: {obj.name} - {obj.price:,} UZS")

print('\nHammasi tayyor!')
