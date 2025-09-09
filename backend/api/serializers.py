from djoser.serializers import UserSerializer as BaseUserSerializer
from .models import Perfil, Sucursal, Permiso, Categoria, Producto, Movimiento, Descuento, ProductoDescuento
from django.contrib.auth.models import User
from rest_framework import serializers
from decimal import Decimal

# --- Usuarios y perfiles ---

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

class PerfilSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    sucursal = serializers.PrimaryKeyRelatedField(queryset=Sucursal.objects.all(), allow_null=True)
    permiso = serializers.PrimaryKeyRelatedField(queryset=Permiso.objects.all(), allow_null=True)

    class Meta:
        model = Perfil
        fields = ['id', 'user', 'sucursal', 'permiso', 'dni']

# --- Entidades básicas ---

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

# --- Movimiento con descuentos aplicados ---

class MovimientoSerializer(serializers.ModelSerializer):
    subtotal = serializers.SerializerMethodField()
    producto_nombre = serializers.SerializerMethodField()
    precio_unitario = serializers.SerializerMethodField()
    usuario_nombre = serializers.SerializerMethodField()
    descuentos_aplicados = serializers.SerializerMethodField()

    class Meta:
        model = Movimiento
        fields = [
            'id', 'producto', 'producto_nombre', 'precio_unitario',
            'usuario', 'usuario_nombre', 'fecha', 'hora',
            'tipo_de_movimiento', 'metodo_de_pago', 'cantidad',
            'descripcion', 'subtotal', 'descuentos_aplicados'
        ]

    def get_producto_nombre(self, obj):
        return str(obj.producto) if obj.producto else None

    def get_precio_unitario(self, obj):
        return obj.producto.precio if obj.producto and obj.producto.precio else 0

    def get_usuario_nombre(self, obj):
        if obj.usuario:
            return obj.usuario.get_full_name() or obj.usuario.username
        return None

    def get_subtotal(self, obj):
        return float(obj.total or 0)

    def get_descuentos_aplicados(self, obj):
        if not obj.producto:
            return None

        descuento = obj.producto.descuentos.filter(activo=True).first()
        if not descuento:
            return None

        tipo = descuento.tipo
        nombre = descuento.nombre
        precio = Decimal(obj.producto.precio or 0)
        cantidad = obj.cantidad or 1
        monto = Decimal("0.00")

        if tipo == "PORCENTAJE":
            porcentaje = Decimal(descuento.porcentaje or 0)
            monto = precio * (porcentaje / Decimal("100"))
        elif tipo == "PRECIO_FIJO":
            precio_fijo = Decimal(descuento.precio_fijo or 0)
            monto = precio - precio_fijo
        elif tipo == "CANTIDAD":
            grupos = cantidad // descuento.cantidad_requerida
            unidadesGratis = grupos * (descuento.cantidad_requerida - descuento.cantidad_pagada)
            monto = (Decimal(unidadesGratis) * precio) / Decimal(cantidad)

        return {
            "nombre": nombre,
            "tipo": tipo,
            "monto_por_unidad": round(monto, 2)
        }

# --- Descuentos ---

class ProductoDescuentoReadSerializer(serializers.ModelSerializer):
    descripcion = serializers.CharField(source="producto.descripcion")

    class Meta:
        model = ProductoDescuento
        fields = ["id", "producto", "descripcion", "cantidad"]

class DescuentoSerializer(serializers.ModelSerializer):
    productos = serializers.ListField(child=serializers.DictField(), write_only=True)
    items = ProductoDescuentoReadSerializer(many=True, read_only=True)

    class Meta:
        model = Descuento
        fields = [
            "id", "nombre", "tipo", "porcentaje", "precio_fijo",
            "cantidad_requerida", "cantidad_pagada", "activo",
            "productos", "items"
        ]

    def validate(self, data):
        tipo = data.get("tipo", getattr(self.instance, "tipo", None))
        productos = data.get("productos", [])

        # Evitar validación completa en PATCH parcial
        if self.partial or (self.instance and not productos and "productos" not in self.initial_data):
            return data

        if not productos:
            raise serializers.ValidationError("Debes seleccionar al menos un producto.")

        if tipo == "PRECIO_FIJO":
            if not data.get("precio_fijo"):
                raise serializers.ValidationError("Debes ingresar un precio fijo.")
            if len(productos) < 2:
                raise serializers.ValidationError("El combo debe tener al menos 2 productos.")
            for p in productos:
                if "id" not in p or "cantidad" not in p:
                    raise serializers.ValidationError("Cada producto debe tener id y cantidad.")
        elif tipo == "PORCENTAJE":
            if not data.get("porcentaje"):
                raise serializers.ValidationError("Debes ingresar un porcentaje.")
            for p in productos:
                if "id" not in p:
                    raise serializers.ValidationError("Cada producto debe tener un id.")
        elif tipo == "CANTIDAD":
            if not data.get("cantidad_requerida") or not data.get("cantidad_pagada"):
                raise serializers.ValidationError("Debes ingresar cantidades requeridas y pagadas.")
            for p in productos:
                if "id" not in p:
                    raise serializers.ValidationError("Cada producto debe tener un id.")

        return data

    def create(self, validated_data):
        productos_data = validated_data.pop("productos", [])
        descuento = Descuento.objects.create(**validated_data)

        if validated_data["tipo"] == "PRECIO_FIJO":
            for p in productos_data:
                producto = Producto.objects.get(id=p["id"])
                cantidad = p.get("cantidad", 1)
                ProductoDescuento.objects.create(
                    producto=producto,
                    descuento=descuento,
                    cantidad=cantidad
                )
        else:
            for p in productos_data:
                producto = Producto.objects.get(id=p["id"])
                descuento.productos.add(producto)

        return descuento

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
