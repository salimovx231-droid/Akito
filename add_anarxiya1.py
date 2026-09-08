import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'novamc.settings')
django.setup()

from shop.models import ServerMode, Category, Product

# Anarxiya1 serverini yaratish yoki topish
anarxiya1, created = ServerMode.objects.get_or_create(
    slug='anarxiya1',
    defaults={'name': 'Anarxiya1', 'order': 3, 'is_active': True}
)
if not created:
    anarxiya1.name = 'Anarxiya1'
    anarxiya1.order = 3
    anarxiya1.save()
print(f'Server: {anarxiya1.name} ({"Yaratildi" if created else "Mavjud"})')

# Donator Ranklar kategoriyasi
cat, _ = Category.objects.get_or_create(
    slug='anarxiya1-donator-ranklar',
    defaults={'name': 'Donator Ranklar', 'server': anarxiya1, 'order': 1}
)
cat.server = anarxiya1
cat.save()
print(f'Kategoriya: {cat.name} (id={cat.id})')

# Yangilangan narx va ma'lumotlar bilan ranklar
ranks = [
    {
        'name': 'STARLIGHT',
        'slug': 'anarxiya1-starlight',
        'price': 10000,
        'commands': '/kit starlight\n/workbench\n/titul\n/feed\n/clearinv\n/back\n/hat',
        'features': (
            'STARLIGHT to\'plami – /kit starlight\n'
            'Virtual dastgoh – /workbench\n'
            'Unikal titullar – /titul\n'
            'Ochlikni to\'ldirish – /feed\n'
            'Inventarni tozalash – /clearinv\n'
            'O\'lim joyiga qaytish – /back\n'
            'Boshga blok kiyish – /hat\n'
            'Maosh: 750\n'
            'Uylar soni: 5\n'
            'Regionlar soni: 4\n'
            'Auksiondagi slotlar soni: 12\n'
            'Xaridor ko\'paytiruvchisi: x1.1\n'
            'PASTDAGI PRIVILEGIYALARNING barcha imkoniyatlari'
        ),
    },
    {
        'name': 'LUNAR',
        'slug': 'anarxiya1-lunar',
        'price': 20000,
        'commands': '/kit lunar\n/titul\n/uc menu\n/fix\n/loom\n/near',
        'features': (
            'LUNAR to\'plami – /kit lunar\n'
            'Unikal titullar – /titul\n'
            'Unikal effektlar – /uc menu\n'
            'Buyumni ta\'mirlash – /fix\n'
            'To\'quv stanogini ochish – /loom\n'
            'Yaqindagi o\'yinchilarni bilish – /near\n'
            'Maosh: 1000\n'
            'Uylar soni: 10\n'
            'Regionlar soni: 5\n'
            'Auksiondagi slotlar soni: 16\n'
            'Xaridor ko\'paytiruvchisi: x1.1\n'
            'PASTDAGI PRIVILEGIYALARNING barcha imkoniyatlari'
        ),
    },
    {
        'name': 'ECLIPSE',
        'slug': 'anarxiya1-eclipse',
        'price': 35000,
        'commands': '/kit eclipse\n/titul\n/uc menu\n/ptime set\n/ptime reset\n/ec\n/setwarp\n/afk\n/me',
        'features': (
            'ECLIPSE to\'plami – /kit eclipse\n'
            'Unikal titullar – /titul\n'
            'Unikal effektlar – /uc menu\n'
            'SHAXSIY vaqtni o\'zgartirish – /ptime set/reset\n'
            'Ender-sandiqni ochish – /ec\n'
            'Varp o\'rnatish – /setwarp\n'
            'Uzoqlashish/AFK – /afk\n'
            'Harakat (xabar) – /me\n'
            'Maosh: 1500\n'
            'Uylar soni: 15\n'
            'Regionlar soni: 6\n'
            'Auksiondagi slotlar soni: 20\n'
            'Xaridor ko\'paytiruvchisi: x1.2\n'
            'PASTDAGI PRIVILEGIYALARNING barcha imkoniyatlari'
        ),
    },
    {
        'name': 'ASTRAL',
        'slug': 'anarxiya1-astral',
        'price': 50000,
        'commands': '/kit astral\n/titul\n/uc menu\n/invsee\n/heal',
        'features': (
            'ASTRAL to\'plami – /kit astral\n'
            'Unikal titullar – /titul\n'
            'Unikal effektlar – /uc menu\n'
            'O\'yinchining inventarini ko\'rish – /invsee\n'
            'Sog\'likni to\'ldirish – /heal\n'
            'Maosh: 2000\n'
            'Uylar soni: 20\n'
            'Regionlar soni: 7\n'
            'Auksiondagi slotlar soni: 24\n'
            'Xaridor ko\'paytiruvchisi: x1.2\n'
            'PASTDAGI PRIVILEGIYALARNING barcha imkoniyatlari'
        ),
    },
    {
        'name': 'CELESTIAL',
        'slug': 'anarxiya1-celestial',
        'price': 75000,
        'commands': '/kit celestial\n/titul\n/uc menu\n/changenick\n/time day\n/time night\n/hat',
        'features': (
            'CELESTIAL to\'plami – /kit celestial\n'
            'Unikal titullar – /titul\n'
            'Unikal effektlar – /uc menu\n'
            'O\'yindagi nikni o\'zgartirish – /changenick (nik)\n'
            'Serverdagi vaqtni o\'zgartirish – /time day/night\n'
            'Boshga blok kiyish – /hat\n'
            'Maosh: 3000\n'
            'Uylar soni: 35\n'
            'Regionlar soni: 9\n'
            'Auksiondagi slotlar soni: 30\n'
            'Xaridor ko\'paytiruvchisi: x1.5\n'
            'PASTDAGI PRIVILEGIYALARNING barcha imkoniyatlari'
        ),
    },
    {
        'name': 'MOONLORD',
        'slug': 'anarxiya1-moonlord',
        'price': 100000,
        'commands': '/kit moonlord\n/titul\n/uc menu\n/fixall\n/fly\n/itemlore add\n/item name',
        'features': (
            'MOONLORD to\'plami – /kit moonlord\n'
            'Unikal titullar – /titul\n'
            'Unikal effektlar – /uc menu\n'
            'Barcha buyumlarni ta\'mirlash – /fixall\n'
            'Parvoz rejimini yoqish – /fly\n'
            'Buyumga tavsif qo\'shish – /itemlore add\n'
            'Qo\'ldagi buyum nomini o\'zgartirish – /item name\n'
            'Maosh: 4000\n'
            'Uylar soni: 50\n'
            'Regionlar soni: 10\n'
            'Auksiondagi slotlar soni: 32\n'
            'Xaridor ko\'paytiruvchisi: x1.75\n'
            'PASTDAGI PRIVILEGIYALARNING barcha imkoniyatlari'
        ),
    },
    {
        'name': 'LUNACY',
        'slug': 'anarxiya1-lunacy',
        'price': 150000,
        'commands': '/kit lunacy\n/titul\n/uc menu',
        'features': (
            'LUNACY to\'plami – /kit lunacy\n'
            'Unikal titullar – /titul\n'
            'Unikal effektlar – /uc menu\n'
            'Maosh: 5000\n'
            'Uylar soni: 100\n'
            'Regionlar soni: 11\n'
            'Auksiondagi slotlar soni: 60\n'
            'Xaridor ko\'paytiruvchisi: x2.0\n'
            'PASTDAGI PRIVILEGIYALARNING barcha imkoniyatlari'
        ),
    },
]

for r in ranks:
    obj, created = Product.objects.update_or_create(
        slug=r['slug'],
        defaults={
            'name': r['name'],
            'category': cat,
            'price': r['price'],
            'features': r['features'],
            'commands': r['commands'],
            'is_active': True,
        }
    )
    status = 'Yaratildi' if created else 'Yangilandi'
    print(f'  {status}: {obj.name} — {obj.price:,} UZS')

print()
print('✅ Hammasi tayyor! Anarxiya1 yangilandi.')
