from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal

class Sucursal(models.Model):
    direccion = models.CharField(max_length=255)
    localidad = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.localidad} - {self.direccion}"

class Proveedor(models.Model):
    descripcion = models.CharField(max_length=255)
    contacto = models.CharField(max_length=255)

    def __str__(self):
        return self.descripcion

class Categoria(models.Model):
    descripcion = models.CharField(max_length=100)

    def __str__(self):
        return self.descripcion

class Permiso(models.Model):
    descripcion = models.CharField(max_length=100)

    def __str__(self):
        return self.descripcion

class Producto(models.Model):
    sucursal = models.ForeignKey(Sucursal, on_delete=models.SET_NULL, null=True, blank=True)
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True)
    stock = models.IntegerField(default=0)
    medida = models.BooleanField(default=False)
    descripcion = models.CharField(max_length=255)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.descripcion

class Perfil(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    sucursal = models.ForeignKey(Sucursal, on_delete=models.SET_NULL, null=True, blank=True)
    permiso = models.ForeignKey(Permiso, on_delete=models.SET_NULL, null=True, blank=True)
    dni = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"Perfil de {self.user.username}"

class Movimiento(models.Model):
    TIPO_CHOICES = [
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
    ]

    METODO_PAGO_CHOICES = [
        ('efectivo', 'Efectivo'),
        ('debito', 'Débito'),
        ('credito', 'Crédito'),
        ('transferencia', 'Transferencia'),
        ('otro', 'Otro'),
    ]

    producto = models.ForeignKey('Producto', on_delete=models.CASCADE)
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    fecha = models.DateField(null=True, blank=True)
    hora = models.TimeField(null=True, blank=True)

    tipo_de_movimiento = models.CharField(max_length=10, choices=TIPO_CHOICES, null=True, blank=True)
    metodo_de_pago = models.CharField(max_length=20, choices=METODO_PAGO_CHOICES, null=True, blank=True)

    cantidad = models.FloatField()
    descripcion = models.TextField(blank=True)

    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)


    def aplicar_descuentos(self):
        """Calcula el precio total aplicando los descuentos activos."""
        subtotal = Decimal(self.producto.precio) * Decimal(self.cantidad)

        for descuento in self.producto.descuentos.filter(activo=True):
            if descuento.tipo == "PORCENTAJE" and descuento.porcentaje:
                subtotal -= subtotal * (descuento.porcentaje / Decimal(100))

            elif descuento.tipo == "PRECIO_FIJO" and descuento.precio_fijo:
                # aplica precio fijo si la cantidad de productos >= cantidad_requerida
                if self.cantidad >= (descuento.cantidad_requerida or 1):
                    subtotal = descuento.precio_fijo

            elif descuento.tipo == "CANTIDAD":
                # Ejemplo: 2x1 → cantidad_requerida=2, cantidad_pagada=1
                if descuento.cantidad_requerida and descuento.cantidad_pagada:
                    grupos = int(self.cantidad // descuento.cantidad_requerida)
                    resto = int(self.cantidad % descuento.cantidad_requerida)
                    subtotal = (
                        grupos * descuento.cantidad_pagada * self.producto.precio
                        + resto * self.producto.precio
                    )

        return subtotal

    def save(self, *args, **kwargs):
        # Antes de guardar, calcular el total con descuentos aplicados
        self.total = self.aplicar_descuentos()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Movimiento #{self.id} - {self.producto} - {self.tipo_de_movimiento}"

    

class Descuento(models.Model):
    TIPO_DESCUENTO = [
        ("PORCENTAJE", "Porcentaje sobre el total"),
        ("PRECIO_FIJO", "Precio fijo por combo"),
        ("CANTIDAD", "Ej: 2x1, 3x2"),
    ]

    nombre = models.CharField(max_length=100)
    tipo = models.CharField(max_length=20, choices=TIPO_DESCUENTO)

    productos = models.ManyToManyField(Producto, through="ProductoDescuento", related_name="descuentos")

    porcentaje = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    precio_fijo = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cantidad_requerida = models.PositiveIntegerField(null=True, blank=True)
    cantidad_pagada = models.PositiveIntegerField(null=True, blank=True)

    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre
    
class ProductoDescuento(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    descuento = models.ForeignKey(Descuento, on_delete=models.CASCADE, related_name="items")
    cantidad = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.producto} x{self.cantidad} en {self.descuento.nombre}"

