from django.shortcuts import render
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from rest_framework import viewsets
from django.contrib.auth.models import User
from .models import Perfil, Sucursal, Permiso, Categoria, Producto, Movimiento, Descuento
from .serializers import UserSerializer, PerfilSerializer, SucursalSerializer, PermisoSerializer, CategoriaSerializer, ProductoSerializer, MovimientoSerializer, DescuentoSerializer
from rest_framework import generics
from rest_framework.decorators import action
from rest_framework.response import Response

def home(request):
    return HttpResponse("Hello, world! This is the API home page.")


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.filter(is_active=True)
    serializer_class = ProductoSerializer

    @action(detail=False, methods=['get'], url_path='inactivos')
    def productos_inactivos(self, request):
        productos = Producto.objects.filter(is_active=False)
        serializer = self.get_serializer(productos, many=True)
        return Response(serializer.data)
    def get_object(self):
        queryset = Producto.objects.all()
        return get_object_or_404(queryset, pk=self.kwargs["pk"])
    
class SucursalViewSet(viewsets.ModelViewSet):
    queryset = Sucursal.objects.all()
    serializer_class = SucursalSerializer

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

class PermisoViewSet(viewsets.ModelViewSet):
    queryset = Permiso.objects.all()
    serializer_class = PermisoSerializer

class PerfilList(generics.ListAPIView):
    queryset = Perfil.objects.select_related('user', 'sucursal', 'permiso').all()
    serializer_class = PerfilSerializer

class PerfilViewSet(viewsets.ModelViewSet):
    queryset = Perfil.objects.select_related('user', 'sucursal', 'permiso').all()
    serializer_class = PerfilSerializer

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        for perfil in response.data:
            user = User.objects.get(id=perfil['user'])
            sucursal = Sucursal.objects.get(id=perfil['sucursal']) if perfil['sucursal'] else None
            permiso = Permiso.objects.get(id=perfil['permiso']) if perfil['permiso'] else None

            perfil['user'] = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_active': user.is_active,
                'is_staff': user.is_staff
            }

            if sucursal:
                perfil['sucursal'] = {
                    'id': sucursal.id,
                    'direccion': sucursal.direccion,
                    'localidad': sucursal.localidad
                }

            if permiso:
                perfil['permiso'] = {
                    'id': permiso.id,
                    'descripcion': permiso.descripcion
                }

        return response

class MovimientoViewSet(viewsets.ModelViewSet):
    queryset = Movimiento.objects.all()
    serializer_class = MovimientoSerializer

    @action(detail=False, methods=['get'], url_path='ultimos')
    def ultimos_movimientos(self, request):
        sucursal_id = request.query_params.get("sucursal")

        if not sucursal_id:
            return Response(
                {"error": "Debe enviar ?sucursal=<id>"},
                status=400
            )

        movimientos = (
            Movimiento.objects
            .filter(producto__sucursal_id=sucursal_id, tipo_de_movimiento='salida')
            .select_related("producto", "usuario")
            .order_by('-fecha', '-hora')[:3]
        )

        serializer = self.get_serializer(movimientos, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        producto = serializer.validated_data['producto']
        cantidad = serializer.validated_data['cantidad']
        tipo = serializer.validated_data.get('tipo_de_movimiento')

        if tipo == 'salida':
            if producto.stock is None or cantidad > producto.stock:
                raise serializer.ValidationError("No hay suficiente stock para esta venta.")

        movimiento = serializer.save()

        # Actualizar stock según el tipo de movimiento
        if movimiento.tipo_de_movimiento == 'salida':
            producto.stock -= movimiento.cantidad
        elif movimiento.tipo_de_movimiento == 'entrada':
            producto.stock += movimiento.cantidad

        producto.save()



class DescuentoViewSet(viewsets.ModelViewSet):
    queryset = Descuento.objects.all()
    serializer_class = DescuentoSerializer


