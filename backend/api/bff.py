"""New helpers use English; existing model, serializer, and API names are preserved."""

from datetime import timedelta

from django.db.models import Prefetch, Sum
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import (
    Categoria,
    Descuento,
    Movimiento,
    Perfil,
    Producto,
    Sucursal,
)
from .serializers import (
    CategoriaSerializer,
    MovimientoSerializer,
    ProductoSerializer,
)


def _serialize_user(user):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
        "is_active": user.is_active,
    }


def _serialize_profile(profile):
    if not profile:
        return None

    return {
        "id": profile.id,
        "user": _serialize_user(profile.user),
        "dni": profile.dni,
        "sucursal": (
            {
                "id": profile.sucursal.id,
                "direccion": profile.sucursal.direccion,
                "localidad": profile.sucursal.localidad,
            }
            if profile.sucursal
            else None
        ),
        "permiso": (
            {
                "id": profile.permiso.id,
                "descripcion": profile.permiso.descripcion,
            }
            if profile.permiso
            else None
        ),
    }


def _get_user_profile(user):
    return (
        Perfil.objects.select_related("user", "sucursal", "permiso")
        .filter(user=user)
        .first()
    )


def _resolve_branch_id(request, profile):
    raw_id = request.query_params.get("sucursal")
    branch_id = None
    if raw_id is not None:
        try:
            branch_id = int(raw_id)
            if branch_id <= 0:
                raise ValueError
        except (TypeError, ValueError):
            raise ValidationError({"sucursal": "Debe ser un entero positivo."})

    if not request.user.is_staff:
        if not profile or not profile.sucursal_id:
            raise PermissionDenied("El usuario no tiene sucursal asignada.")
        if branch_id is not None and branch_id != profile.sucursal_id:
            raise PermissionDenied("No puede acceder a otra sucursal.")
        return profile.sucursal_id

    if branch_id is not None and not Sucursal.objects.filter(pk=branch_id).exists():
        raise NotFound("La sucursal no existe.")
    return branch_id


def _products_queryset(branch_id=None, active=True):
    queryset = Producto.objects.select_related("sucursal", "categoria").filter(
        is_active=active
    )
    if branch_id:
        queryset = queryset.filter(sucursal_id=branch_id)
    return queryset


def _stock_alerts(branch_id=None):
    products = _products_queryset(branch_id)
    low_unit_stock = products.filter(medida=False, stock__gt=0, stock__lt=5)
    low_weight_stock = products.filter(medida=True, stock__gt=0, stock__lt=1)
    out_of_stock = products.filter(stock=0)
    low_stock_items = list(low_unit_stock) + list(low_weight_stock)

    return {
        "sin_stock": out_of_stock.count(),
        "bajo_stock": len(low_stock_items),
        "bajo_stock_unidad": low_unit_stock.count(),
        "bajo_stock_kg": low_weight_stock.count(),
        "items_sin_stock": ProductoSerializer(out_of_stock, many=True).data,
        "items_bajo_stock": ProductoSerializer(low_stock_items, many=True).data,
        "items_bajo_stock_unidad": ProductoSerializer(low_unit_stock, many=True).data,
        "items_bajo_stock_kg": ProductoSerializer(low_weight_stock, many=True).data,
    }


def _movements_queryset():
    return Movimiento.objects.select_related(
        "producto__sucursal", "usuario"
    ).prefetch_related(
        Prefetch(
            "producto__descuentos",
            queryset=Descuento.objects.filter(activo=True).order_by("pk"),
            to_attr="bff_active_discounts",
        )
    )


def _sales_queryset(start_date, end_date, branch_id=None):
    queryset = _movements_queryset().filter(
        tipo_de_movimiento="salida",
        fecha__gte=start_date,
        fecha__lte=end_date,
    )
    if branch_id:
        queryset = queryset.filter(producto__sucursal_id=branch_id)
    return queryset


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def session(request):
    profile = _get_user_profile(request.user)
    return Response(
        {
            "user": {
                **_serialize_user(request.user),
                "perfil": _serialize_profile(profile),
            },
            "perfil": _serialize_profile(profile),
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def catalog(request):
    profile = _get_user_profile(request.user)
    branch_id = _resolve_branch_id(request, profile)

    inactive = request.query_params.get("inactivos", "false")
    if inactive not in ("true", "false"):
        raise ValidationError({"inactivos": "Debe ser true o false."})
    if inactive == "true" and not request.user.is_staff:
        raise PermissionDenied("Solo staff puede consultar productos inactivos.")

    products = _products_queryset(
        branch_id, active=inactive != "true"
    ).order_by("id")
    categories = Categoria.objects.all()

    return Response(
        {
            "perfil": _serialize_profile(profile),
            "sucursal": branch_id,
            "productos": ProductoSerializer(products, many=True).data,
            "categorias": CategoriaSerializer(categories, many=True).data,
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard(request):
    profile = _get_user_profile(request.user)
    branch_id = _resolve_branch_id(request, profile)

    today = timezone.localdate()
    week_start = today - timedelta(days=today.weekday())
    month_start = today.replace(day=1)

    latest_movements = _movements_queryset().order_by("-fecha", "-hora", "-id")
    if branch_id:
        latest_movements = latest_movements.filter(producto__sucursal_id=branch_id)

    today_sales = _sales_queryset(today, today, branch_id)
    week_sales = _sales_queryset(week_start, today, branch_id)
    month_sales = _sales_queryset(month_start, today, branch_id)

    return Response(
        {
            "perfil": _serialize_profile(profile),
            "sucursal": branch_id,
            "ultimos": MovimientoSerializer(latest_movements[:3], many=True).data,
            "ventas_hoy": MovimientoSerializer(today_sales, many=True).data,
            "ventas_semana": MovimientoSerializer(week_sales, many=True).data,
            "ventas_mes": MovimientoSerializer(month_sales, many=True).data,
            "ganancia_mes": month_sales.aggregate(total=Sum("total"))["total"] or 0,
            "alertas_stock": _stock_alerts(branch_id),
        }
    )
