from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework_simplejwt.views import TokenBlacklistView
from django.urls import path
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    re_path(r'^api-auth/', include('djoser.urls')),  # For browsable API authentication
    re_path(r'^api-auth/', include('djoser.urls.authtoken')),  # For token authentication
    re_path(r'^api-auth/', include('djoser.urls.jwt')),  # For browsable API authentication
    path('api-auth/jwt/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),
    path('api/', include('api.urls')),
    path('', TemplateView.as_view(template_name='index.html')),
]
