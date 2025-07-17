from djoser.serializers import UserSerializer as BaseUserSerializer
from .models import Perfil, Sucursal, Permiso, Categoria, Producto, Movimiento
from django.contrib.auth.models import User
from rest_framework import serializers
from django.db import models


class CustomUserSerializer(BaseUserSerializer):
    class Meta(BaseUserSerializer.Meta):
        model = User
        fields = BaseUserSerializer.Meta.fields + ('is_staff', 'is_superuser')

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'is_staff', 'is_active']
        extra_kwargs = {'password': {'write_only': True}}


    def create(self, validated_data):
        is_staff = validated_data.pop('is_staff', False)
        user = User.objects.create_user(**validated_data)
        user.is_staff = is_staff
        user.save()
        return user
class SucursalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sucursal
        fields = '__all__'
class PermisoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permiso
        fields = '__all__'
class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'
class ProductoSerializer(serializers.ModelSerializer):
    sucursal = serializers.PrimaryKeyRelatedField(queryset=Sucursal.objects.all())
    categoria = serializers.PrimaryKeyRelatedField(queryset=Categoria.objects.all())
    class Meta:
        model = Producto
        fields = '__all__'
class PerfilSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    sucursal = serializers.PrimaryKeyRelatedField(queryset=Sucursal.objects.all(), allow_null=True)
    permiso = serializers.PrimaryKeyRelatedField(queryset=Permiso.objects.all(), allow_null=True)

    class Meta:
        model = Perfil
        fields = ['id', 'user', 'sucursal', 'permiso', 'dni']

class MovimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movimiento
        fields = '__all__'
