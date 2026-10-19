from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import BasePermission, SAFE_METHODS

from .models import Perfil


class IsStaffOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (
            request.user.is_staff or request.method in SAFE_METHODS
        ))


class IsStaffOrCreateReadOnly(IsStaffOrReadOnly):
    def has_permission(self, request, view):
        return super().has_permission(request, view) or bool(
            request.user and request.user.is_authenticated and view.action == "create"
        )


def request_branch_id(request):
    """Employees cannot select a branch other than their assigned branch."""
    branch_id = request.query_params.get("sucursal")
    if branch_id is not None:
        try:
            branch_id = int(branch_id)
            if branch_id <= 0:
                raise ValueError
        except (TypeError, ValueError):
            raise ValidationError({"sucursal": "Debe ser un entero positivo."})
    if request.user.is_staff:
        return branch_id
    assigned_id = Perfil.objects.filter(user=request.user).values_list(
        "sucursal_id", flat=True
    ).first()
    if not assigned_id:
        raise PermissionDenied("El usuario no tiene sucursal asignada.")
    if branch_id is not None and branch_id != assigned_id:
        raise PermissionDenied("No puede acceder a otra sucursal.")
    return assigned_id
