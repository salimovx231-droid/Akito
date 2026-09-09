import os
import sys
import django

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "novamc.settings")
django.setup()

from shop.models import ServerMode, Category, Product

# ===========================================================================
# SERVERLAR
# ===========================================================================

anarxiya2, _ = ServerMode.objects.get_or_create(
    slug='anarxiya2',
    defaults={'name': 'Anarxiya2', 'order': 1, 'is_active': True}
)
anarxiya2.name = 'Anarxiya2'; anarxiya2.order = 1; anarxiya2.save()

anarxiya1, _ = ServerMode.objects.get_or_create(
    slug='anarxiya1',
    defaults={'name': 'Anarxiya1', 'order': 2, 'is_active': True}
)
anarxiya1.name = 'Anarxiya1'; anarxiya1.order = 2; anarxiya1.save()

boxpvp, _ = ServerMode.objects.get_or_create(
    slug='boxpvp',
    defaults={'name': 'BoxPvP', 'order': 3, 'is_active': True}
)
boxpvp.name = 'BoxPvP'; boxpvp.order = 3; boxpvp.save()

print("Serverlar tayyor.")

# ===========================================================================
# ANARXIYA2 — ASOSIY RANKLAR
# ===========================================================================
a2_asosiy, _ = Category.objects.get_or_create(
    slug='anarxiya2-asosiy-ranklar',
    defaults={'name': 'Asosiy Ranklar', 'server': anarxiya2, 'order': 1}
)
a2_asosiy.server = anarxiya2; a2_asosiy.order = 1; a2_asosiy.save()

a2_ranks = [
    {
        'slug': 'a2-askar',
        'name': 'Askar',
        'price': 6000,
        'commands': '/kit askar\n/hat\n/top',
        'features': (
            'Homelar soni: 4\n'
            'RG bloklar: 4\n'
            'Auksion slotlari: 8\n'
            'Enderchest 4 qator\n'
            'Teleport soniyasi: 6 soniya'
        ),
    },
    {
        'slug': 'a2-qahramon',
        'name': 'Qahramon',
        'price': 10500,
        'commands': '/kit qahramon\n/clear\n/feed\n/heal\n/me',
        'features': (
            'Homelar soni: 5\n'
            'RG bloklar: 4\n'
            'Auksion slotlari: 9\n'
            'Enderchest 4 qator\n'
            'Teleport soniyasi: 6 soniya'
        ),
    },
    {
        'slug': 'a2-ritsar',
        'name': 'Ritsar',
        'price': 16000,
        'commands': '/kit ritsar\n/back\n/ec\n/wbench\n/itemname',
        'features': (
            "O'limda XP ni saqlab qolish\n"
            'Rangli yoza olish\n'
            'Homelar soni: 6\n'
            'RG bloklar: 6\n'
            'Auksion slotlari: 10\n'
            'Enderchest 4 qator\n'
            'Teleport soniyasi: 5 soniya'
        ),
    },
    {
        'slug': 'a2-alpomish',
        'name': 'Alpomish',
        'price': 22000,
        'commands': '/kit alpomish\n/bc\n/ext\n/msgtoggle\n/paytoggle\n/tptoggle\n/feed [oyinchi]\n/heal [oyinchi]',
        'features': (
            'Homelar soni: 8\n'
            'RG bloklar: 7\n'
            'Auksion slotlari: 11\n'
            'Enderchest 5 qator\n'
            'Teleport soniyasi: 4 soniya'
        ),
    },
    {
        'slug': 'a2-titan',
        'name': 'Titan',
        'price': 29000,
        'commands': '/kit titan\n/time\n/weather\n/loom\n/carttable\n/eztooka\n/firework',
        'features': (
            'Homelar soni: 10\n'
            'RG bloklar: 7\n'
            'Auksion slotlari: 12\n'
            'Enderchest 5 qator\n'
            'Teleport soniyasi: 4 soniya'
        ),
    },
    {
        'slug': 'a2-elita',
        'name': 'Elita',
        'price': 37000,
        'commands': '/kit elita\n/jump\n/afk\n/setwarp\n/delwarp\n/repair',
        'features': (
            "AFK da kick qilinmaydi\n"
            'Homelar soni: 12\n'
            'RG bloklar: 8\n'
            'Auksion slotlari: 12\n'
            'Enderchest 5 qator\n'
            'Teleport soniyasi: 3 soniya'
        ),
    },
    {
        'slug': 'a2-afsona',
        'name': 'Afsona',
        'price': 48000,
        'commands': '/kit afsona\n/smithtable\n/stonecutter\n/grindstone',
        'features': (
            'Homelar soni: 15\n'
            'RG bloklar: 10\n'
            'Auksion slotlari: 14\n'
            'Enderchest 5 qator\n'
            'Teleport soniyasi: 3 soniya'
        ),
    },
    {
        'slug': 'a2-general',
        'name': 'General',
        'price': 68000,
        'commands': '/kit general',
        'features': (
            "Teleportga cheklov yo'q\n"
            'Homelar soni: 18\n'
            'RG bloklar: 15\n'
            'Auksion slotlari: 13\n'
            'Enderchest 6 qator\n'
            'Teleport soniyasi: 0 soniya'
        ),
    },
    {
        'slug': 'a2-imperator',
        'name': 'Imperator',
        'price': 86000,
        'commands': '/kit imperator\n/fly',
        'features': (
            "Teleportga cheklov yo'q\n"
            'Homelar soni: 20\n'
            'RG bloklar: 15\n'
            'Auksion slotlari: 16\n'
            'Enderchest 6 qator\n'
            'Teleport soniyasi: 0 soniya'
        ),
    },
]

print("\n--- Anarxiya2 Asosiy Ranklar ---")
for r in a2_ranks:
    obj, created = Product.objects.update_or_create(
        slug=r['slug'],
        defaults={
            'name': r['name'], 'category': a2_asosiy,
            'price': r['price'], 'commands': r['commands'],
            'features': r['features'], 'is_active': True,
        }
    )
    print(f"  {'[+]' if created else '[~]'} {obj.name} — {obj.price:,} UZS")

# ===========================================================================
# ANARXIYA1 — DONATOR RANKLAR
# ===========================================================================
a1_donator, _ = Category.objects.get_or_create(
    slug='anarxiya1-donator-ranklar',
    defaults={'name': 'Donator Ranklar', 'server': anarxiya1, 'order': 1}
)
a1_donator.server = anarxiya1; a1_donator.order = 1; a1_donator.save()

a1_ranks = [
    {
        'slug': 'anarxiya1-starlight',
        'name': 'STARLIGHT',
        'price': 10000,
        'commands': '/kit starlight\n/workbench\n/titul\n/feed\n/clearinv\n/back\n/hat',
        'features': (
            "STARLIGHT to'plami – /kit starlight\n"
            "Virtual dastgoh – /workbench\n"
            "Unikal titullar – /titul\n"
            "Ochlikni to'ldirish – /feed\n"
            "Inventarni tozalash – /clearinv\n"
            "O'lim joyiga qaytish – /back\n"
            "Boshga blok kiyish – /hat\n"
            "Maosh: 750\n"
            "Uylar soni: 5\n"
            "Regionlar soni: 4\n"
            "Auksiondagi slotlar soni: 12\n"
            "Xaridor ko'paytiruvchisi: x1.1"
        ),
    },
    {
        'slug': 'anarxiya1-lunar',
        'name': 'LUNAR',
        'price': 20000,
        'commands': '/kit lunar\n/titul\n/uc menu\n/fix\n/loom\n/near',
        'features': (
            "LUNAR to'plami – /kit lunar\n"
            "Unikal titullar – /titul\n"
            "Unikal effektlar – /uc menu\n"
            "Buyumni ta'mirlash – /fix\n"
            "To'quv stanogini ochish – /loom\n"
            "Yaqindagi o'yinchilarni bilish – /near\n"
            "Maosh: 1000\n"
            "Uylar soni: 10\n"
            "Regionlar soni: 5\n"
            "Auksiondagi slotlar soni: 16\n"
            "Xaridor ko'paytiruvchisi: x1.1"
        ),
    },
    {
        'slug': 'anarxiya1-eclipse',
        'name': 'ECLIPSE',
        'price': 35000,
        'commands': '/kit eclipse\n/titul\n/uc menu\n/ptime set\n/ptime reset\n/ec\n/setwarp\n/afk\n/me',
        'features': (
            "ECLIPSE to'plami – /kit eclipse\n"
            "Unikal titullar – /titul\n"
            "Unikal effektlar – /uc menu\n"
            "Shaxsiy vaqtni o'zgartirish – /ptime\n"
            "Ender-sandiqni ochish – /ec\n"
            "Varp o'rnatish – /setwarp\n"
            "AFK – /afk\n"
            "Maosh: 1500\n"
            "Uylar soni: 15\n"
            "Regionlar soni: 6\n"
            "Auksiondagi slotlar soni: 20\n"
            "Xaridor ko'paytiruvchisi: x1.2"
        ),
    },
    {
        'slug': 'anarxiya1-astral',
        'name': 'ASTRAL',
        'price': 50000,
        'commands': '/kit astral\n/titul\n/uc menu\n/invsee\n/heal',
        'features': (
            "ASTRAL to'plami – /kit astral\n"
            "Unikal titullar – /titul\n"
            "Unikal effektlar – /uc menu\n"
            "O'yinchining inventarini ko'rish – /invsee\n"
            "Sog'likni to'ldirish – /heal\n"
            "Maosh: 2000\n"
            "Uylar soni: 20\n"
            "Regionlar soni: 7\n"
            "Auksiondagi slotlar soni: 24\n"
            "Xaridor ko'paytiruvchisi: x1.2"
        ),
    },
    {
        'slug': 'anarxiya1-celestial',
        'name': 'CELESTIAL',
        'price': 75000,
        'commands': '/kit celestial\n/titul\n/uc menu\n/changenick\n/time day\n/time night\n/hat',
        'features': (
            "CELESTIAL to'plami – /kit celestial\n"
            "Unikal titullar – /titul\n"
            "Unikal effektlar – /uc menu\n"
            "O'yindagi nikni o'zgartirish – /changenick\n"
            "Serverdagi vaqtni o'zgartirish – /time day/night\n"
            "Boshga blok kiyish – /hat\n"
            "Maosh: 3000\n"
            "Uylar soni: 35\n"
            "Regionlar soni: 9\n"
            "Auksiondagi slotlar soni: 30\n"
            "Xaridor ko'paytiruvchisi: x1.5"
        ),
    },
    {
        'slug': 'anarxiya1-moonlord',
        'name': 'MOONLORD',
        'price': 100000,
        'commands': '/kit moonlord\n/titul\n/uc menu\n/fixall\n/fly\n/itemlore add\n/item name',
        'features': (
            "MOONLORD to'plami – /kit moonlord\n"
            "Unikal titullar – /titul\n"
            "Unikal effektlar – /uc menu\n"
            "Barcha buyumlarni ta'mirlash – /fixall\n"
            "Parvoz rejimini yoqish – /fly\n"
            "Buyumga tavsif qo'shish – /itemlore add\n"
            "Maosh: 4000\n"
            "Uylar soni: 50\n"
            "Regionlar soni: 10\n"
            "Auksiondagi slotlar soni: 32\n"
            "Xaridor ko'paytiruvchisi: x1.75"
        ),
    },
    {
        'slug': 'anarxiya1-lunacy',
        'name': 'LUNACY',
        'price': 150000,
        'commands': '/kit lunacy\n/titul\n/uc menu',
        'features': (
            "LUNACY to'plami – /kit lunacy\n"
            "Unikal titullar – /titul\n"
            "Unikal effektlar – /uc menu\n"
            "Maosh: 5000\n"
            "Uylar soni: 100\n"
            "Regionlar soni: 11\n"
            "Auksiondagi slotlar soni: 60\n"
            "Xaridor ko'paytiruvchisi: x2.0"
        ),
    },
]

print("\n--- Anarxiya1 Donator Ranklar ---")
for r in a1_ranks:
    obj, created = Product.objects.update_or_create(
        slug=r['slug'],
        defaults={
            'name': r['name'], 'category': a1_donator,
            'price': r['price'], 'commands': r['commands'],
            'features': r['features'], 'is_active': True,
        }
    )
    print(f"  {'[+]' if created else '[~]'} {obj.name} — {obj.price:,} UZS")

# ===========================================================================
# BOXPVP — DONATOR RANKLAR
# ===========================================================================
bp_donator, _ = Category.objects.get_or_create(
    slug='boxpvp-donator-ranklar',
    defaults={'name': 'Donator Ranklar', 'server': boxpvp, 'order': 1}
)
bp_donator.server = boxpvp; bp_donator.order = 1; bp_donator.save()

bp_ranks = [
    {
        'slug': 'boxpvp-vip',
        'name': 'VIP',
        'price': 19000,
        'commands': '/rank give {player} VIP',
        'features': (
            '2x XP Multiplier\n'
            '+1 AFK Shard every 15m\n'
            'VIP Kit Access\n'
            'VIP Mine Access\n'
            '2x Enderchest Rows\n'
            '/ptime Command'
        ),
    },
    {
        'slug': 'boxpvp-pro',
        'name': 'PRO',
        'price': 37000,
        'commands': '/rank give {player} PRO',
        'features': (
            '2x XP Multiplier\n'
            '+1 AFK Shard every 15m\n'
            '2x Concurrent Active Quests\n'
            'Pro Kit Access (+ Kits from earlier ranks)\n'
            'Pro Mine Access (+ Mines from earlier ranks)\n'
            '3x Enderchest Rows\n'
            '/ptime Command\n'
            '/craft Command\n'
            '/spectate Command\n'
            '/hat Command'
        ),
    },
    {
        'slug': 'boxpvp-mvp',
        'name': 'MVP',
        'price': 54000,
        'commands': '/rank give {player} MVP',
        'features': (
            '2x XP Multiplier\n'
            '+1 AFK Shard every 15m\n'
            '2x Concurrent Active Quests\n'
            'MVP Kit Access (+ Kits from earlier ranks)\n'
            'MVP Mine Access (+ Mines from earlier ranks)\n'
            '4x Enderchest Rows\n'
            '/ptime, /craft, /spectate, /hat Command\n'
            '/enderchest Command'
        ),
    },
    {
        'slug': 'boxpvp-elite',
        'name': 'ELITE',
        'price': 65000,
        'commands': '/rank give {player} ELITE',
        'features': (
            '2x XP Multiplier\n'
            '+1 AFK Shard every 15m\n'
            '3x Concurrent Active Quests\n'
            'Elite Kit Access (+ Kits from earlier ranks)\n'
            'Elite Mine Access (+ Mines from earlier ranks)\n'
            '5x Enderchest Rows\n'
            '/ptime, /craft, /spectate, /hat Command\n'
            '/enderchest, /disposal, /invsee Command'
        ),
    },
    {
        'slug': 'boxpvp-immortal',
        'name': 'IMMORTAL',
        'price': 87000,
        'commands': '/rank give {player} IMMORTAL',
        'features': (
            '2x XP Multiplier\n'
            '+1 AFK Shard every 15m\n'
            '3x Concurrent Active Quests\n'
            'Immortal Kit Access (+ Kits from earlier ranks)\n'
            'Immortal Mine Access (+ Mines from earlier ranks)\n'
            '6x Enderchest Rows\n'
            '/ptime, /craft, /spectate, /hat Command\n'
            '/enderchest, /disposal, /invsee Command\n'
            '/heal Command (10m Cooldown)'
        ),
    },
]

print("\n--- BoxPvP Donator Ranklar ---")
for r in bp_ranks:
    obj, created = Product.objects.update_or_create(
        slug=r['slug'],
        defaults={
            'name': r['name'], 'category': bp_donator,
            'price': r['price'], 'commands': r['commands'],
            'features': r['features'], 'is_active': True,
        }
    )
    print(f"  {'[+]' if created else '[~]'} {obj.name} — {obj.price:,} UZS")

# ===========================================================================
# BARCHA SERVERLAR — MA'MURIYAT VA MAXSUS + BOSHQA NARSALAR
# ===========================================================================
mamuriyat_products = [
    {
        'name': 'Homiy', 'price': 200000,
        'commands': '/titul\n/uc menu',
        'features': "Homiy rangi va titul\nUnikal titul - /titul\nUnikal effektlar - /uc menu\nServer homiysi sifatida tanilish",
    },
    {
        'name': 'Admin', 'price': 150000,
        'commands': '/titul\n/uc menu',
        'features': "Admin rangi va titul\nUnikal titul - /titul\nUnikal effektlar - /uc menu",
    },
    {
        'name': 'Moder', 'price': 100000,
        'commands': '/titul\n/uc menu',
        'features': "Moder rangi va titul\nUnikal titul - /titul\nUnikal effektlar - /uc menu",
    },
    {
        'name': 'Helper', 'price': 50000,
        'commands': '/titul\n/uc menu',
        'features': "Helper rangi va titul\nUnikal titul - /titul\nUnikal effektlar - /uc menu",
    },
]

boshqa_products = [
    {
        'name': 'Donate Case', 'price': 10000,
        'commands': '', 'features': "Donate Case - maxsus sovrinlar bilan quti",
    },
    {
        'name': 'Token Case', 'price': 5000,
        'commands': '', 'features': "Token Case - tokenlar bilan quti",
    },
    {
        'name': 'Maxsus Titul', 'price': 5000,
        'commands': '/titul', 'features': "Maxsus unikal titul - /titul",
    },
    {
        'name': 'Narsani nusxalash', 'price': 5000,
        'commands': '', 'features': "Qolinizdagi buyumni nusxalash xizmati",
    },
    {
        'name': '1000 Token', 'price': 1000,
        'commands': '', 'features': "1000 ta server tokeni",
    },
]

for server in [anarxiya2, anarxiya1, boxpvp]:
    s = server.slug
    print(f"\n--- {server.name} Ma'muriyat va Boshqa ---")

    mcat, _ = Category.objects.get_or_create(
        slug=s + '-mamuriyat-va-maxsus',
        defaults={'name': "Ma'muriyat va Maxsus", 'server': server, 'order': 2}
    )
    mcat.server = server; mcat.save()

    for p in mamuriyat_products:
        obj, created = Product.objects.update_or_create(
            slug=s + '-' + p['name'].lower().replace(' ', '-'),
            defaults={
                'name': p['name'], 'category': mcat,
                'price': p['price'], 'commands': p['commands'],
                'features': p['features'], 'is_active': True,
            }
        )
        print(f"  {'[+]' if created else '[~]'} {obj.name}")

    bcat, _ = Category.objects.get_or_create(
        slug=s + '-boshqa-narsalar',
        defaults={'name': 'Boshqa Narsalar', 'server': server, 'order': 3}
    )
    bcat.server = server; bcat.save()

    for p in boshqa_products:
        obj, created = Product.objects.update_or_create(
            slug=s + '-' + p['name'].lower().replace(' ', '-'),
            defaults={
                'name': p['name'], 'category': bcat,
                'price': p['price'], 'commands': p['commands'],
                'features': p['features'], 'is_active': True,
            }
        )
        print(f"  {'[+]' if created else '[~]'} {obj.name}")

print("\n===== HAMMASI TAYYOR! =====")
