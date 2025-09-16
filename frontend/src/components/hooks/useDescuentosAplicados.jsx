import { useState, useEffect } from "react";

export function useDescuentosAplicados(productosSeleccionados) {
  const [lineasConDescuento, setLineasConDescuento] = useState([]);

  useEffect(() => {
    async function cargarDescuentosYAplicar() {
      const res = await fetch("http://127.0.0.1:8000/api/descuento/");
      const descuentos = await res.json();
      const activos = descuentos.filter((d) => d.activo);

      const lineas = productosSeleccionados.map((producto) => {
        const cantidad = producto.cantidad;
        const resultado = calcularDescuento(producto, cantidad, activos, productosSeleccionados);
        const precioFinal = producto.precio - resultado.monto;

        return {
          id: producto.id,
          descripcion: producto.descripcion,
          qty: cantidad,
          unitPrice: producto.precio,
          descuentoAplicado: resultado.monto,
          nombreDescuento: resultado.nombre,
          tipoDescuento: resultado.tipo,
          lineTotal: precioFinal * cantidad,
        };
      });

      setLineasConDescuento(lineas);
    }

    if (productosSeleccionados.length > 0) {
      cargarDescuentosYAplicar();
    }
  }, [productosSeleccionados]);

  return lineasConDescuento;
}

function calcularDescuento(producto, cantidad, descuentos, carritoCompleto) {
  const aplicables = descuentos.filter((d) =>
    Array.isArray(d.items) &&
    d.items.some((i) => i.producto === producto.id)
  );

  if (aplicables.length === 0) {
    return { monto: 0, nombre: null, tipo: null };
  }

  const d = aplicables[0];
  let monto = 0;

  if (d.tipo === "PORCENTAJE") {
    monto = producto.precio * (d.porcentaje / 100);
  } else if (d.tipo === "PRECIO_FIJO") {
    const comboCompleto = d.items.every((i) => {
      const enCarrito = carritoCompleto.find((p) => p.id === i.producto);
      return enCarrito && enCarrito.cantidad >= i.cantidad;
    });

    if (comboCompleto) {
      const totalCombo = d.items.reduce((acc, i) => {
        const p = carritoCompleto.find((x) => x.id === i.producto);
        return acc + (p?.precio || 0) * i.cantidad;
      }, 0);

      const descuentoTotal = totalCombo - d.precio_fijo;
      const proporcion = descuentoTotal / totalCombo;
      monto = producto.precio * proporcion;
    }
  } else if (d.tipo === "CANTIDAD") {
    const grupos = Math.floor(cantidad / d.cantidad_requerida);
    const unidadesGratis = grupos * (d.cantidad_requerida - d.cantidad_pagada);
    monto = (unidadesGratis * producto.precio) / cantidad;
  }

  return {
    monto,
    nombre: d.nombre || null,
    tipo: d.tipo || null,
  };
}