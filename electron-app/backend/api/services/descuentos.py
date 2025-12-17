from decimal import Decimal, ROUND_HALF_UP

# =========================
# CONFIGURACIÓN
# =========================

PRIORIDAD = {
    "MAYORISTA": 100,
    "PRECIO_FIJO": 80,
    "CANTIDAD": 60,
    "PORCENTAJE": 40,
}

def d2(val):
    return Decimal(str(val or 0)).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )

# =========================
# FUNCIÓN PRINCIPAL
# =========================

def calcular_descuentos(carrito, productos, descuentos):
    """
    carrito: [{producto_id, cantidad}]
    productos: queryset Producto
    descuentos: queryset Descuento (activo, prefetch items)
    """

    precios = {p.id: d2(p.precio) for p in productos}
    cantidades = {
        int(i["producto_id"]): Decimal(str(i["cantidad"]))
        for i in carrito
    }

    combos = calcular_combos_precio_fijo(cantidades, precios, descuentos)
    lineas = []

    for pid, cantidad in cantidades.items():
        precio_unitario = precios.get(pid, d2(0))
        candidatos = []

        # --- combo precio fijo ---
        if pid in combos:
            candidatos.append(combos[pid])

        # --- descuentos individuales ---
        for d in descuentos:
            if not aplica_a_producto(d, pid):
                continue

            if d.tipo == "MAYORISTA":
                c = cand_mayorista(d, precio_unitario, cantidad)
            elif d.tipo == "CANTIDAD":
                c = cand_cantidad(d, precio_unitario, cantidad)
            elif d.tipo == "PORCENTAJE":
                c = cand_porcentaje(d, precio_unitario, cantidad)
            else:
                c = None

            if c:
                candidatos.append(c)

        elegido = elegir_promocion(candidatos)

        descuento_unitario = elegido["descuento_unitario"] if elegido else d2(0)
        line_total = (precio_unitario - descuento_unitario) * cantidad

        lineas.append({
            "producto_id": pid,
            "cantidad": int(cantidad) if cantidad == int(cantidad) else float(cantidad),
            "precio_unitario": float(precio_unitario),
            "descuento_unitario": float(descuento_unitario),
            "line_total": float(d2(line_total)),
            "promocion": elegido and {
                "id": elegido["id"],
                "nombre": elegido["nombre"],
                "tipo": elegido["tipo"],
            }
        })

    return lineas


# =========================
# ELECCIÓN FINAL
# =========================

def elegir_promocion(candidatos):
    if not candidatos:
        return None

    return max(
        candidatos,
        key=lambda c: (
            PRIORIDAD.get(c["tipo"], 0),
            c["ahorro_total"]
        )
    )


# =========================
# VALIDACIÓN
# =========================

def aplica_a_producto(descuento, producto_id):
    return descuento.items.filter(producto_id=producto_id).exists()


# =========================
# DESCUENTOS INDIVIDUALES
# =========================

def cand_mayorista(d, precio, cantidad):
    if not d.min_unidades or not d.porcentaje:
        return None
    if cantidad < d.min_unidades:
        return None

    du = precio * (d2(d.porcentaje) / d2(100))

    return {
        "id": d.id,
        "nombre": d.nombre,
        "tipo": "MAYORISTA",
        "descuento_unitario": d2(du),
        "ahorro_total": d2(du) * cantidad,
    }


def cand_cantidad(d, precio, cantidad):
    if not d.cantidad_requerida or not d.cantidad_pagada:
        return None

    grupos = int(cantidad // d.cantidad_requerida)
    gratis = grupos * (d.cantidad_requerida - d.cantidad_pagada)

    if gratis <= 0:
        return None

    ahorro = precio * d2(gratis)
    du = ahorro / cantidad

    return {
        "id": d.id,
        "nombre": d.nombre,
        "tipo": "CANTIDAD",
        "descuento_unitario": d2(du),
        "ahorro_total": d2(ahorro),
    }


def cand_porcentaje(d, precio, cantidad):
    if not d.porcentaje:
        return None

    du = precio * (d2(d.porcentaje) / d2(100))

    return {
        "id": d.id,
        "nombre": d.nombre,
        "tipo": "PORCENTAJE",
        "descuento_unitario": d2(du),
        "ahorro_total": d2(du) * cantidad,
    }


# =========================
# COMBOS PRECIO FIJO
# =========================

def calcular_combos_precio_fijo(cantidades, precios, descuentos):
    resultado = {}

    for d in descuentos:
        if d.tipo != "PRECIO_FIJO" or not d.precio_fijo:
            continue

        items = list(d.items.all())
        if not items:
            continue

        veces = min(
            int(cantidades.get(i.producto_id, 0) // i.cantidad)
            for i in items
        )

        if veces <= 0:
            continue

        total_normal = sum(
            precios[i.producto_id] * i.cantidad
            for i in items
        ) * veces

        total_fijo = d2(d.precio_fijo) * veces
        descuento_total = total_normal - total_fijo

        if descuento_total <= 0:
            continue

        for i in items:
            pid = i.producto_id
            aporte = precios[pid] * i.cantidad * veces
            proporcion = aporte / total_normal
            descuento_prod = descuento_total * proporcion
            du = descuento_prod / (i.cantidad * veces)

            resultado[pid] = {
                "id": d.id,
                "nombre": d.nombre,
                "tipo": "PRECIO_FIJO",
                "descuento_unitario": d2(du),
                "ahorro_total": d2(descuento_prod),
            }

    return resultado
