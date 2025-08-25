from django.contrib import admin
from .models import Sucursal, Proveedor, Categoria, Permiso, Producto, Movimiento

admin.site.register(Sucursal)
admin.site.register(Proveedor)
admin.site.register(Categoria)
admin.site.register(Permiso)
admin.site.register(Producto)
admin.site.register(Movimiento)
