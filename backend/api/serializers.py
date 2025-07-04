from djoser.serializers import UserSerializer as BaseUserSerializer
from .models import Perfil, Sucursal, Permiso
from django.contrib.auth.models import User
from rest_framework import serializers


class CustomUserSerializer(BaseUserSerializer):
    class Meta(BaseUserSerializer.Meta):
        model = User
        fields = BaseUserSerializer.Meta.fields + ('is_staff', 'is_superuser')

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'first_name', 'last_name']
        extra_kwargs = {'password': {'write_only': True}}

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'is_staff']  # agregá is_staff acá
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        is_staff = validated_data.pop('is_staff', False)  # sacar is_staff del dict, o usar False por defecto
        user = User.objects.create_user(**validated_data)  # crea usuario con password encriptado
        user.is_staff = is_staff  # asigna is_staff
        user.save()
        return user

class PerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Perfil
        fields = ['id', 'user', 'sucursal', 'permiso', 'dni']

class SucursalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sucursal
        fields = '__all__'

class PermisoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permiso
        fields = '__all__'