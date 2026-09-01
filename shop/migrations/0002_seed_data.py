from django.db import migrations


CATEGORIES = [
    {"name": "Asosiy Ranklar", "slug": "asosiy-ranklar", "order": 1},
    {"name": "Ma'muriyat va Maxsus", "slug": "mamuriyat-va-maxsus", "order": 2},
    {"name": "Boshqa Narsalar", "slug": "boshqa-narsalar", "order": 3},
]

ADMIN_FEATURES = (
    "Serverda qoidalarni nazorat qilish huquqi\n"
    "O'yinchilarga yordam berish majburiyati\n"
    "Maxsus komandalar (mute, kick, ban va h.k - darajaga qarab)"
)

CASE_FEATURES = (
    "Kutib olinmagan qimmatbaho buyumlar chiqish imkoniyati\n"
    "Omad sinab ko'rish imkoniyati"
)

PRODUCTS = [
    # Asosiy Ranklar
    {
        "category": "asosiy-ranklar", "name": "Askar", "slug": "askar", "price": 6000,
        "commands": "/kit askar\n/hat\n/top",
        "features": "Homelar soni: 4\nRG Bloklar: 4\nAuksion slotlari: 8\nEnderchest: 4 qator\nTeleport soniyasi: 6 soniya",
    },
    {
        "category": "asosiy-ranklar", "name": "Qahramon", "slug": "qahramon", "price": 10500,
        "commands": "/kit qahramon\n/clear\n/feed\n/heal\n/me",
        "features": "Homelar soni: 5\nRG Bloklar: 4\nAuksion slotlari: 9\nEnderchest: 4 qator\nTeleport soniyasi: 6 soniya",
    },
    {
        "category": "asosiy-ranklar", "name": "Ritsar", "slug": "ritsar", "price": 16000,
        "commands": "/kit ritsar\n/back\n/ec\n/wbench\n/itemname",
        "features": "Imkoniyatlar: O'limda XP ni saqlab qolish, Rangli yoza olish\nHomelar soni: 6\nRG Bloklar: 6\nAuksion slotlari: 10\nEnderchest: 4 qator\nTeleport soniyasi: 5 soniya",
    },
    {
        "category": "asosiy-ranklar", "name": "Alpomish", "slug": "alpomish", "price": 22000,
        "commands": "/kit alpomish\n/bc\n/ext\n/msgtoggle\n/paytoggle\n/tptoggle\n/feed\n/heal",
        "features": "Homelar soni: 8\nRG Bloklar: 7\nAuksion slotlari: 11\nEnderchest: 5 qator\nTeleport soniyasi: 4 soniya",
    },
    {
        "category": "asosiy-ranklar", "name": "Titan", "slug": "titan", "price": 29000,
        "commands": "/kit titan\n/time\n/weather\n/loom\n/carttable\n/eztooka\n/firework",
        "features": "Homelar soni: 10\nRG Bloklar: 7\nAuksion slotlari: 12\nEnderchest: 5 qator\nTeleport soniyasi: 4 soniya",
    },
    {
        "category": "asosiy-ranklar", "name": "Elita", "slug": "elita", "price": 37000,
        "commands": "/kit elita\n/jump\n/afk\n/setwarp\n/delwarp\n/repair",
        "features": "Imkoniyatlar: AFK da kick qilinmaydi\nHomelar soni: 12\nRG Bloklar: 8\nAuksion slotlari: 12\nEnderchest: 5 qator\nTeleport soniyasi: 3 soniya",
    },
    {
        "category": "asosiy-ranklar", "name": "Afsona", "slug": "afsona", "price": 48000,
        "commands": "/kit afsona\n/smithtable\n/stonecutter\n/grindstone",
        "features": "Homelar soni: 15\nRG Bloklar: 10\nAuksion slotlari: 14\nEnderchest: 5 qator\nTeleport soniyasi: 3 soniya",
    },
    {
        "category": "asosiy-ranklar", "name": "General", "slug": "general", "price": 68000,
        "commands": "/kit general",
        "features": "Imkoniyatlar: Teleportga cheklov yo'q\nHomelar soni: 18\nRG Bloklar: 15\nAuksion slotlari: 13\nEnderchest: 6 qator\nTeleport soniyasi: 0 soniya",
    },
    {
        "category": "asosiy-ranklar", "name": "Imperator", "slug": "imperator", "price": 86000,
        "commands": "/kit imperator\n/fly",
        "features": "Imkoniyatlar: Teleportga cheklov yo'q\nHomelar soni: 20\nRG Bloklar: 15\nAuksion slotlari: 16\nEnderchest: 6 qator\nTeleport soniyasi: 0 soniya",
    },
    # Ma'muriyat va Maxsus
    {
        "category": "mamuriyat-va-maxsus", "name": "Helper", "slug": "helper", "price": 50000,
        "commands": "", "features": ADMIN_FEATURES,
    },
    {
        "category": "mamuriyat-va-maxsus", "name": "Moder", "slug": "moder", "price": 100000,
        "commands": "", "features": ADMIN_FEATURES,
    },
    {
        "category": "mamuriyat-va-maxsus", "name": "Admin", "slug": "admin-rank", "price": 150000,
        "commands": "", "features": ADMIN_FEATURES,
    },
    {
        "category": "mamuriyat-va-maxsus", "name": "Homiy", "slug": "homiy", "price": 200000,
        "commands": "",
        "features": (
            "/op huquqiga ega bo'lasiz\nMaxsus rank\n"
            "Barcha muhim narsalar u bilan birga muhokama qilinadi\n"
            "Adminlar unga tega olmaydi\nO'ynash huquqiga ega\n"
            "O'yinchilarga moddiy narsalar (token, kit, donate, pul) bera OLMAYDI\n"
            "Xohlagan rankga o'ta oladi va o'z rankini o'zgartira oladi\nMahsus titul"
        ),
    },
    # Boshqa Narsalar
    {
        "category": "boshqa-narsalar", "name": "Donate Case", "slug": "donate-case", "price": 10000,
        "commands": "", "features": CASE_FEATURES,
    },
    {
        "category": "boshqa-narsalar", "name": "Token Case", "slug": "token-case", "price": 5000,
        "commands": "", "features": CASE_FEATURES,
    },
    {
        "category": "boshqa-narsalar", "name": "Maxsus Titul", "slug": "titul", "price": 5000,
        "commands": "",
        "features": "O'zingiz xohlagan ixtiyoriy titulni yaratib berish\nChatda hammadan ajralib turish",
    },
    {
        "category": "boshqa-narsalar", "name": "Narsani nusxalash", "slug": "copy", "price": 5000,
        "commands": "", "features": "Xohlagan buyumni nusxalash huquqi",
    },
    {
        "category": "boshqa-narsalar", "name": "1000 Token", "slug": "token-1000", "price": 1000,
        "commands": "",
        "features": "O'yin ichidagi maxsus valyuta\nNodir buyumlarni xarid qilish uchun sarflanadi",
    },
]


def seed_data(apps, schema_editor):
    Category = apps.get_model('shop', 'Category')
    Product = apps.get_model('shop', 'Product')
    SiteSettings = apps.get_model('shop', 'SiteSettings')

    slug_to_category = {}
    for cat in CATEGORIES:
        obj, _ = Category.objects.get_or_create(
            slug=cat["slug"],
            defaults={"name": cat["name"], "order": cat["order"]},
        )
        slug_to_category[cat["slug"]] = obj

    for prod in PRODUCTS:
        Product.objects.get_or_create(
            slug=prod["slug"],
            defaults={
                "name": prod["name"],
                "category": slug_to_category[prod["category"]],
                "price": prod["price"],
                "commands": prod["commands"],
                "features": prod["features"],
                "is_active": True,
            },
        )

    SiteSettings.objects.get_or_create(pk=1)


def remove_data(apps, schema_editor):
    Category = apps.get_model('shop', 'Category')
    Product = apps.get_model('shop', 'Product')
    slugs = [p["slug"] for p in PRODUCTS]
    Product.objects.filter(slug__in=slugs).delete()
    Category.objects.filter(slug__in=[c["slug"] for c in CATEGORIES]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('shop', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_data, remove_data),
    ]
