from django.db import models
from django.contrib.auth.models import User

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

    def __str__(self):
        return f"Movimiento #{self.id} - {self.producto} - {self.tipo_de_movimiento}"