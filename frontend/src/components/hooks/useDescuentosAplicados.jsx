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
        const resultado = calcularDescuento(producto, cantidad, activos);
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

function calcularDescuento(producto, cantidad, descuentos) {
  const aplicables = descuentos.filter((d) =>
    d.productos.includes(producto.id)
  );

  if (aplicables.length === 0) {
    return { monto: 0, nombre: null, tipo: null };
  }

  const d = aplicables[0]; // suponemos uno por producto
  let monto = 0;

  if (d.tipo === "PORCENTAJE") {
    monto = producto.precio * (d.porcentaje / 100);
  } else if (d.tipo === "PRECIO_FIJO") {
    monto = producto.precio - d.precio_fijo;
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