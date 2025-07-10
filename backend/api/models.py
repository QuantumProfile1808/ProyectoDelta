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
    stock = models.IntegerField(max_length=10)
    medida = models.BooleanField(default=False)
    descripcion = models.CharField(max_length=255)
    precio = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.descripcion

class Movimiento(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    fecha_hora = models.DateTimeField(auto_now_add=True)
    tipo_movimiento = models.CharField(max_length=50)
    metodo_pago = models.CharField(max_length=50)
    cantidad = models.IntegerField()
    descripcion = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.tipo_movimiento} - {self.producto.descripcion} ({self.cantidad})"

class Perfil(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    sucursal = models.ForeignKey(Sucursal, on_delete=models.SET_NULL, null=True, blank=True)
    permiso = models.ForeignKey(Permiso, on_delete=models.SET_NULL, null=True, blank=True)
    dni = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"Perfil de {self.user.username}"

