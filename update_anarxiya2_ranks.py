import os
import sys
import django

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "novamc.settings")
django.setup()

from shop.models import Product, Category

RANKS = [
    {
        "name": "Askar",
        "price": 6000,
        "commands": "/kit askar\n/hat\n/top",
        "features": "Homelar soni: 4\nRG bloklar: 4\nAuksion slotlari: 8\nEnderchest 4 qator\nTeleport soniyasi: 6 soniya",
    },
    {
        "name": "Qahramon",
        "price": 10500,
        "commands": "/kit qahramon\n/clear\n/feed\n/heal\n/me",
        "features": "Homelar soni: 5\nRG bloklar: 4\nAuksion slotlari: 9\nEnderchest 4 qator\nTeleport soniyasi: 6 soniya",
    },
    {
        "name": "Ritsar",
        "price": 16000,
        "commands": "/kit ritsar\n/back\n/ec\n/wbench\n/itemname",
        "features": "O'limda XP ni saqlab qolish\nRangli yoza olish\nHomelar soni: 6\nRG bloklar: 6\nAuksion slotlari: 10\nEnderchest 4 qator\nTeleport soniyasi: 5 soniya",
    },
    {
        "name": "Alpomish",
        "price": 22000,
        "commands": "/kit alpomish\n/bc\n/ext\n/msgtoggle\n/paytoggle\n/tptoggle\n/feed [o'yinchi]\n/heal [o'yinchi]",
        "features": "Homelar soni: 8\nRG bloklar: 7\nAuksion slotlari: 11\nEnderchest 5 qator\nTeleport soniyasi: 4 soniya",
    },
    {
        "name": "Titan",
        "price": 29000,
        "commands": "/kit titan\n/time\n/weather\n/loom\n/carttable\n/eztooka\n/firework",
        "features": "Homelar soni: 10\nRG bloklar: 7\nAuksion slotlari: 12\nEnderchest 5 qator\nTeleport soniyasi: 4 soniya",
    },
    {
        "name": "Elita",
        "price": 37000,
        "commands": "/kit elita\n/jump\n/afk\n/setwarp\n/delwarp\n/repair",
        "features": "AFK da kick qilinmaydi\nHomelar soni: 12\nRG bloklar: 8\nAuksion slotlari: 12\nEnderchest 5 qator\nTeleport soniyasi: 3 soniya",
    },
    {
        "name": "Afsona",
        "price": 48000,
        "commands": "/kit afsona\n/smithtable\n/stonecutter\n/grindstone",
        "features": "Homelar soni: 15\nRG bloklar: 10\nAuksion slotlari: 14\nEnderchest 5 qator\nTeleport soniyasi: 3 soniya",
    },
    {
        "name": "General",
        "price": 68000,
        "commands": "/kit general",
        "features": "Teleportga cheklov yo'q\nHomelar soni: 18\nRG bloklar: 15\nAuksion slotlari: 13\nEnderchest 6 qator\nTeleport soniyasi: 0 soniya",
    },
    {
        "name": "Imperator",
        "price": 86000,
        "commands": "/kit imperator\n/fly",
        "features": "Teleportga cheklov yo'q\nHomelar soni: 20\nRG bloklar: 15\nAuksion slotlari: 16\nEnderchest 6 qator\nTeleport soniyasi: 0 soniya",
    },
]

# Anarxiya2 Asosiy Ranklar kategoriyasi (ID=1)
category = Category.objects.get(id=1)

updated = 0
not_found = []

for rank_data in RANKS:
    try:
        product = Product.objects.get(name__iexact=rank_data["name"], category=category)
        product.price = rank_data["price"]
        product.commands = rank_data["commands"]
        product.features = rank_data["features"]
        product.save()
        updated += 1
        print(f"[OK] Yangilandi: {product.name} ({product.price:,} UZS)")
    except Product.DoesNotExist:
        not_found.append(rank_data["name"])
        print(f"[YOQ] Topilmadi: {rank_data['name']} -- yangi yaratilmoqda...")
        Product.objects.create(
            name=rank_data["name"],
            slug=rank_data["name"].lower().replace(" ", "-") + "-a2",
            category=category,
            price=rank_data["price"],
            commands=rank_data["commands"],
            features=rank_data["features"],
            is_active=True,
        )
        print(f"[OK] Yaratildi: {rank_data['name']}")

print(f"\n[OK] Jami yangilangan: {updated}")
if not_found:
    print(f"[!] Yangi yaratilganlar: {not_found}")
