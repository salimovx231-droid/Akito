from django.urls import path
from . import views
from . import api_views

urlpatterns = [
    # Pages
    path('', views.index, name='home'),
    path('qoidalar/', views.qoidalar, name='qoidalar'),
    path('qanday/', views.qanday, name='qanday'),
    path('qollab-quvvatlash/', views.qollab_quvvatlash, name='support'),

    # API
    path('api/products/', api_views.ProductListView.as_view(), name='api-products'),
    path('api/orders/', api_views.OrderCreateView.as_view(), name='api-orders'),
    path('api/settings/', api_views.SiteSettingsView.as_view(), name='api-settings'),
    path('api/chat/messages/', api_views.ChatMessageListCreateView.as_view(), name='api-chat-messages'),
    path('api/chat/send/', api_views.ChatMessageListCreateView.as_view(), name='api-chat-send'),
]
