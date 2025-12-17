import { useEffect, useState } from "react";

export function useDescuentosAplicados(productosSeleccionados) {
  const [lineas, setLineas] = useState([]);

  useEffect(() => {
    async function aplicar() {
      if (!productosSeleccionados || productosSeleccionados.length === 0) {
        setLineas([]);
        return;
      }

      const items = productosSeleccionados.map((p) => ({
        producto_id: p.id,
        cantidad: p.cantidad,
      }));

      const res = await fetch(
        "http://127.0.0.1:8000/api/descuento/aplicar/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        }
      );

      const data = await res.json();
      setLineas(data.lineas || []);
    }

    aplicar().catch(console.error);
  }, [productosSeleccionados]);

  return lineas;
}
