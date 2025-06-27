from django.contrib import admin
from django.urls import path, include, re_path


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('api.urls')),
    re_path(r'^api-auth/', include('djoser.urls')),  # For browsable API authentication
    re_path(r'^api-auth/', include('djoser.urls.authtoken')),  # For token authentication
    re_path(r'^api-auth/', include('djoser.urls.jwt')),  # For browsable API authentication
]
