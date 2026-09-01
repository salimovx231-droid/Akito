from .models import SiteSettings


def site_settings(request):
    """Barcha shablonlarga sayt sozlamalarini (karta raqami, telegram, IP) qo'shadi.
    Bu qiymatlar to'liq Django admin panelidan boshqariladi."""
    return {
        'site_settings': SiteSettings.load(),
    }
