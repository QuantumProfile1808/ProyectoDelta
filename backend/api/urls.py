from django.urls import path, include
from .views import home
import rest_framework.routers as routers
from .views import UserViewSet, PerfilViewSet, SucursalViewSet, PermisoViewSet, CategoriaViewSet, ProductoViewSet, MovimientoViewSet

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'perfil', PerfilViewSet)
router.register(r'sucursal', SucursalViewSet)
router.register(r'producto', ProductoViewSet)
router.register(r'categoria', CategoriaViewSet)
router.register(r'permiso', PermisoViewSet)
router.register(r'movimiento', MovimientoViewSet)


urlpatterns = [
    path('', home, name='home'),  # Si tienes una vista de inicio
    path('api/', include(router.urls)),  # Incluye las URLs del enrutador
]