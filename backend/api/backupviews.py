from django.http import HttpResponse
from django.core import serializers
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django.apps import apps
from django.http import JsonResponse

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

        with transaction.atomic():
            # Borrar datos previos de los modelos que quieras resetear
            for model_name in ["Producto", "Categoria", "Movimiento", "Sucursal", "Perfil", "Permiso", "Descuento"]:
                model = apps.get_model("api", model_name)
                model.objects.all().delete()

            # Cargar los objetos del backup
            for obj in objetos:
                obj.save()

        return Response({"status": "ok", "mensaje": "Datos restaurados desde backup"})
