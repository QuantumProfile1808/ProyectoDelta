from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import viewsets
from django.contrib.auth.models import User
from .models import Perfil, Sucursal, Permiso, Categoria, Producto
from .serializers import UserSerializer, PerfilSerializer, SucursalSerializer, PermisoSerializer, CategoriaSerializer, ProductoSerializer
from rest_framework import generics

# Create your views here.

def home(request):
    return HttpResponse("Hello, world! This is the API home page.")


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer

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

