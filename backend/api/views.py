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
from rest_framework.exceptions import ValidationError



# Create your views here.

def home(request):
    return HttpResponse("Hello, world! This is the API home page.")


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.filter(is_active=True)
    serializer_class = ProductoSerializer

    @action(detail=False, methods=['get'], url_path='stock/alertas')
    def stock_alertas(self, request):
        sucursal_id = request.query_params.get("sucursal")

        productos_qs = Producto.objects.filter(is_active=True)

        if sucursal_id:
            productos_qs = productos_qs.filter(sucursal_id=sucursal_id)

        bajo_unidad = productos_qs.filter(
            medida=False,
            stock__gt=0,
            stock__lt=5
        )

        bajo_kg = productos_qs.filter(
            medida=True,
            stock__gt=0,
            stock__lt=1
        )

        sin_stock = productos_qs.filter(stock=0)

        items_bajo_total = list(bajo_unidad) + list(bajo_kg)

        return Response({
            "sin_stock": sin_stock.count(),
            "bajo_stock": len(items_bajo_total),
            "bajo_stock_unidad": bajo_unidad.count(),
            "bajo_stock_kg": bajo_kg.count(),
            "items_sin_stock": ProductoSerializer(sin_stock, many=True).data,
            "items_bajo_stock": ProductoSerializer(items_bajo_total, many=True).data,
            "items_bajo_stock_unidad": ProductoSerializer(bajo_unidad, many=True).data,
            "items_bajo_stock_kg": ProductoSerializer(bajo_kg, many=True).data,
        })

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

    def get_queryset(self):
        user_id = self.request.query_params.get("user")
        qs = super().get_queryset()
        if user_id:
            qs = qs.filter(user_id=user_id)
        return qs

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
        # If no sucursal is provided, only allow global view for staff users
        if not sucursal_id and not request.user.is_staff:
            return Response({"error": "Debe enviar ?sucursal=<id>"}, status=400)

        # allow optional filtering by tipo (entrada/salida). By default include both types.
        tipo = request.query_params.get('tipo')

        movimientos_qs = Movimiento.objects.all()
        if tipo in ('entrada', 'salida'):
            movimientos_qs = movimientos_qs.filter(tipo_de_movimiento=tipo)

        if sucursal_id:
            movimientos_qs = movimientos_qs.filter(producto__sucursal_id=sucursal_id)

        movimientos = (
            movimientos_qs.select_related("producto", "usuario").order_by('-fecha', '-hora')[:3]
        )

        serializer = self.get_serializer(movimientos, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='resumen')
    def resumen(self, request):
        sucursal_id = request.query_params.get("sucursal")
        desde = request.query_params.get("desde")
        hasta = request.query_params.get("hasta")

        # If no sucursal is provided, only allow global view for staff users
        if not sucursal_id and not request.user.is_staff:
            return Response({"error": "Debe enviar ?sucursal="}, status=400)

        queryset = Movimiento.objects.filter(tipo_de_movimiento="salida")
        if sucursal_id:
            queryset = queryset.filter(producto__sucursal_id=sucursal_id)

        if desde:
            queryset = queryset.filter(fecha__gte=desde)
        if hasta:
            queryset = queryset.filter(fecha__lte=hasta)

        queryset = queryset.select_related("producto", "usuario")

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        movimientos = serializer.data

        total_ventas = sum(item['subtotal'] for item in movimientos)

        movimientos.append({
            'id': None,
            'producto': None,
            'usuario': None,
            'fecha': None,
            'hora': None,
            'tipo_de_movimiento': 'total',
            'metodo_de_pago': None,
            'cantidad': None,
            'descripcion': f'Total de ventas: ${total_ventas:.2f}',
            'subtotal': total_ventas,
        })

        return Response(movimientos)

    def perform_create(self, serializer):
        producto = serializer.validated_data['producto']
        cantidad = serializer.validated_data['cantidad']
        tipo = serializer.validated_data.get('tipo_de_movimiento')

        if tipo == 'salida':
            if producto.stock is None or cantidad > producto.stock:
                raise ValidationError("No hay suficiente stock para esta venta.")

        movimiento = serializer.save()

        if movimiento.tipo_de_movimiento == 'salida':
            producto.stock -= movimiento.cantidad
        elif movimiento.tipo_de_movimiento == 'entrada':
            producto.stock += movimiento.cantidad

        producto.save()



class DescuentoViewSet(viewsets.ModelViewSet):
    queryset = Descuento.objects.all()
    serializer_class = DescuentoSerializer


