from decimal import Decimal, ROUND_HALF_UP


DISCOUNT_TYPE_PRIORITY = {
    "MAYORISTA": 100,
    "PRECIO_FIJO": 80,
    "CANTIDAD": 60,
    "PORCENTAJE": 40,
}


def round_currency(value):
    """Convert a value to Decimal and round to cents using half-up rounding."""
    return Decimal(str(value or 0)).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )


def calculate_discounts(cart_items, products, discounts):
    """Price cart items using active discounts with prefetched product links.

    Model fields, discount type values and response keys retain their Spanish
    names to preserve the database and frontend API contracts.
    """
    unit_prices_by_product = {
        product.id: round_currency(product.precio) for product in products
    }
    quantities_by_product = {
        int(cart_item["producto_id"]): Decimal(str(cart_item["cantidad"]))
        for cart_item in cart_items
    }

    bundle_candidates = calculate_fixed_price_bundles(
        quantities_by_product, unit_prices_by_product, discounts
    )
    priced_lines = []

    for product_id, quantity in quantities_by_product.items():
        unit_price = unit_prices_by_product.get(product_id, round_currency(0))
        discount_candidates = []

        if product_id in bundle_candidates:
            discount_candidates.append(bundle_candidates[product_id])

        for discount in discounts:
            if not discount_applies_to_product(discount, product_id):
                continue

            if discount.tipo == "MAYORISTA":
                candidate = build_wholesale_discount_candidate(discount, unit_price, quantity)
            elif discount.tipo == "CANTIDAD":
                candidate = build_quantity_discount_candidate(discount, unit_price, quantity)
            elif discount.tipo == "PORCENTAJE":
                candidate = build_percentage_discount_candidate(discount, unit_price, quantity)
            else:
                candidate = None

            if candidate:
                discount_candidates.append(candidate)

        selected_discount = select_discount_candidate(discount_candidates)
        total_savings = selected_discount["total_savings"] if selected_discount else round_currency(0)
        line_total = unit_price * quantity - total_savings
        discount_per_unit = total_savings / quantity

        priced_lines.append({
            "producto_id": product_id,
            "cantidad": int(quantity) if quantity == int(quantity) else float(quantity),
            "precio_unitario": float(unit_price),
            "descuento_unitario": float(discount_per_unit),
            "line_total": float(round_currency(line_total)),
            "promocion": selected_discount and {
                "id": selected_discount["id"],
                "nombre": selected_discount["name"],
                "tipo": selected_discount["type"],
            }
        })

    return priced_lines


def select_discount_candidate(discount_candidates):
    """Choose by discount type priority, then by total savings."""
    if not discount_candidates:
        return None

    return max(
        discount_candidates,
        key=lambda candidate: (
            DISCOUNT_TYPE_PRIORITY.get(candidate["type"], 0),
            candidate["total_savings"]
        )
    )


def discount_applies_to_product(discount, product_id):
    return any(item.producto_id == product_id for item in discount.items.all())


def build_wholesale_discount_candidate(discount, unit_price, quantity):
    if not getattr(discount, "min_unidades", None) or not discount.porcentaje:
        return None
    if quantity < discount.min_unidades:
        return None

    discount_per_unit = unit_price * (round_currency(discount.porcentaje) / round_currency(100))

    return {
        "id": discount.id,
        "name": discount.nombre,
        "type": "MAYORISTA",
        "discount_per_unit": round_currency(discount_per_unit),
        "total_savings": round_currency(discount_per_unit) * quantity,
    }


def build_quantity_discount_candidate(discount, unit_price, quantity):
    if not discount.cantidad_requerida or not discount.cantidad_pagada:
        return None

    complete_groups = int(quantity // discount.cantidad_requerida)
    free_units = complete_groups * (discount.cantidad_requerida - discount.cantidad_pagada)

    if free_units <= 0:
        return None

    total_savings = unit_price * round_currency(free_units)
    discount_per_unit = total_savings / quantity

    return {
        "id": discount.id,
        "name": discount.nombre,
        "type": "CANTIDAD",
        "discount_per_unit": round_currency(discount_per_unit),
        "total_savings": round_currency(total_savings),
    }


def build_percentage_discount_candidate(discount, unit_price, quantity):
    if not discount.porcentaje:
        return None

    discount_per_unit = unit_price * (round_currency(discount.porcentaje) / round_currency(100))

    return {
        "id": discount.id,
        "name": discount.nombre,
        "type": "PORCENTAJE",
        "discount_per_unit": round_currency(discount_per_unit),
        "total_savings": round_currency(discount_per_unit) * quantity,
    }


def calculate_fixed_price_bundles(quantities_by_product, unit_prices_by_product, discounts):
    bundle_candidates_by_product = {}

    for discount in discounts:
        if discount.tipo != "PRECIO_FIJO" or not discount.precio_fijo:
            continue

        bundle_items = list(discount.items.all())
        if not bundle_items or any(item.cantidad <= 0 for item in bundle_items):
            continue

        complete_bundles = min(
            int(quantities_by_product.get(item.producto_id, 0) // item.cantidad)
            for item in bundle_items
        )

        if complete_bundles <= 0:
            continue

        regular_bundle_total = sum(
            unit_prices_by_product[item.producto_id] * item.cantidad
            for item in bundle_items
        ) * complete_bundles

        discounted_bundle_total = round_currency(discount.precio_fijo) * complete_bundles
        total_bundle_savings = regular_bundle_total - discounted_bundle_total

        if total_bundle_savings <= 0:
            continue

        for item in bundle_items:
            product_id = item.producto_id
            product_subtotal = unit_prices_by_product[product_id] * item.cantidad * complete_bundles
            product_share = product_subtotal / regular_bundle_total
            product_savings = total_bundle_savings * product_share
            discount_per_unit = product_savings / quantities_by_product[product_id]

            bundle_candidates_by_product[product_id] = {
                "id": discount.id,
                "name": discount.nombre,
                "type": "PRECIO_FIJO",
                "discount_per_unit": round_currency(discount_per_unit),
                "total_savings": round_currency(product_savings),
            }

    return bundle_candidates_by_product
