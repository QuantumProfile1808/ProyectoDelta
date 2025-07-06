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

class PerfilViewSet(viewsets.ModelViewSet):
    queryset = Perfil.objects.all()
    serializer_class = PerfilSerializer

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

