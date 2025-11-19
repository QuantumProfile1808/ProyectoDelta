from django.http import HttpResponse
from django.core import serializers
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django.apps import apps
from django.http import JsonResponse
from django.db import transaction, connection, transaction

from .models import Producto, Categoria, Movimiento, Sucursal, Perfil, Permiso, Descuento

class BackupExportView(APIView):
    def get(self, request):
        data = serializers.serialize(
            "json",
            list(Producto.objects.all()) +
            list(Categoria.objects.all()) +
            list(Movimiento.objects.all()) +
            list(Sucursal.objects.all()) +
            list(Perfil.objects.all()) +
            list(Permiso.objects.all()) +
            list(Descuento.objects.all())
        )
        response = HttpResponse(data, content_type="application/json")
        response['Content-Disposition'] = 'attachment; filename="backup.json"'
        return response


class BackupImportView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        if "archivo" not in request.FILES:
            return Response({"status": "error", "mensaje": "No se recibió archivo"}, status=400)

        archivo = request.FILES["archivo"].read().decode("utf-8")
        objetos = list(serializers.deserialize("json", archivo))

        # Model names list (se eliminarán antes de importar).
        # Orden de borrado: hijos primero para evitar FK conflicts (si PRAGMA no está desactivado)
        model_names = [
            "Movimiento",
            "ProductoDescuento",  # si existe en tu app
            "Descuento",
            "Perfil",
            "Producto",
            "Permiso",
            "Sucursal",
            "Categoria"
        ]

        try:
            with transaction.atomic():
                # Desactivar FK checks en SQLite para permitir restaurar en cualquier orden
                using_sqlite = connection.vendor == "sqlite"
                if using_sqlite:
                    with connection.cursor() as cursor:
                        cursor.execute("PRAGMA foreign_keys = OFF;")

                # Borrar datos previos de los modelos indicados
                for model_name in model_names:
                    try:
                        model = apps.get_model("api", model_name)
                        model.objects.all().delete()
                    except LookupError:
                        # Si un modelo no existe (p. ej. ProductoDescuento), seguimos
                        continue

                # Guardar los objetos del backup
                for obj in objetos:
                    obj.save()

        finally:
            # Volver a activar FK checks si usamos SQLite
            if connection.vendor == "sqlite":
                with connection.cursor() as cursor:
                    cursor.execute("PRAGMA foreign_keys = ON;")

        return Response({"status": "ok", "mensaje": "Datos restaurados desde backup"})
