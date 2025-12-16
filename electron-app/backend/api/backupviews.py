from django.http import HttpResponse
from django.core import serializers
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django.utils import timezone
from django.apps import apps
from django.db import transaction

from .models import Categoria, Sucursal, Permiso, Perfil, Producto, Descuento, Movimiento, ProductoDescuento


class BackupExportView(APIView):
    def get(self, request):
        data = serializers.serialize(
            "json",
            list(Categoria.objects.all()) +
            list(Sucursal.objects.all()) +
            list(Permiso.objects.all()) +
            list(Perfil.objects.all()) +
            list(Producto.objects.all()) +
            list(Descuento.objects.all()) +
            list(Movimiento.objects.all()) +
            list(ProductoDescuento.objects.all())
        )

        now = timezone.now().strftime("%d-%m-%Y_%H-%M")
        nombre_archivo = f"backup_{now}.json"

        response = HttpResponse(data, content_type="application/json")
        response["Content-Disposition"] = f'attachment; filename="{nombre_archivo}"'
        return response


class BackupImportView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    ORDER = [
        "api.categoria",
        "api.sucursal",
        "api.permiso",
        "api.perfil",
        "api.producto",
        "api.descuento",
        "api.productodescuento",
        "api.movimiento",
    ]

    def post(self, request):
        if "archivo" not in request.FILES:
            return Response({"error": "No se recibió archivo"}, status=400)

        contenido = request.FILES["archivo"].read().decode("utf-8")

        try:
            objetos = list(serializers.deserialize("json", contenido))
        except Exception as e:
            return Response({"error": f"JSON inválido: {e}"}, status=400)

        # Agrupar por modelo
        agrupados = {}
        for obj in objetos:
            modelo = f"{obj.object._meta.app_label}.{obj.object._meta.model_name}"
            agrupados.setdefault(modelo, []).append(obj)

        try:
            with transaction.atomic():

                # DELETE en orden inverso
                for modelo in reversed(self.ORDER):
                    app_label, model_name = modelo.split(".")
                    model = apps.get_model(app_label, model_name)
                    model.objects.all().delete()

                # INSERT en orden correcto
                for modelo in self.ORDER:
                    if modelo in agrupados:
                        for obj in agrupados[modelo]:
                            obj.save()

            return Response({"status": "ok", "mensaje": "Backup restaurado con éxito"})

        except Exception as e:
            return Response({"error": f"Error al restaurar: {e}"}, status=500)
