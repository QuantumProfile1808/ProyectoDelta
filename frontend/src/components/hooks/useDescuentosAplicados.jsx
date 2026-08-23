import { useEffect, useState } from "react";

export function useDescuentosAplicados(productosSeleccionados) {
  const [lineas, setLineas] = useState([]);

  useEffect(() => {
    let cancelado = false;

    async function aplicar() {
      if (!productosSeleccionados || productosSeleccionados.length === 0) {
        if (!cancelado) setLineas([]);
        return;
      }

      const items = productosSeleccionados.map((p) => ({
        producto_id: p.id,
        cantidad: p.cantidad,
      }));

      try {
        const res = await fetch("http://127.0.0.1:8000/api/descuento/aplicar/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const nextLineas = Array.isArray(data.lineas) && data.lineas.length > 0
          ? data.lineas
          : productosSeleccionados.map((p) => ({
              id: p.id,
              producto_id: p.id,
              producto_nombre: p.descripcion,
              cantidad: p.cantidad,
              precio_unitario: Number(p.precio),
              descuento_unitario: 0,
              line_total: Number(p.precio) * p.cantidad,
            }));

        if (!cancelado) setLineas(nextLineas);
      } catch (error) {
        console.error("No se pudieron aplicar descuentos", error);
        if (!cancelado) {
          setLineas(
            productosSeleccionados.map((p) => ({
              id: p.id,
              producto_id: p.id,
              producto_nombre: p.descripcion,
              cantidad: p.cantidad,
              precio_unitario: Number(p.precio),
              descuento_unitario: 0,
              line_total: Number(p.precio) * p.cantidad,
            }))
          );
        }
      }
    }

    aplicar().catch(console.error);

    return () => {
      cancelado = true;
    };
  }, [productosSeleccionados]);

  return lineas;
}
