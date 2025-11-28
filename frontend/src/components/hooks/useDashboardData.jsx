import { useEffect, useState } from "react";

export function useDashboardData(sucursalID) {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    if (!sucursalID) return;

    fetch(
      `http://127.0.0.1:8000/api/movimiento/ultimos/?sucursal=${sucursalID}`
    )
      .then((res) => res.json())
      .then((data) => {
        const parsed = data.map((m) => ({
          ...m,
          usuario: m.usuario_nombre || m.usuario,
          producto: m.producto_nombre || m.producto,
        }));
        setMovimientos(parsed);
      })
      .catch((err) => console.error("Error cargando movimientos:", err));

    // Productos
    fetch("http://127.0.0.1:8000/api/producto/")
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch((err) => console.error("Error cargando productos:", err));
  }, [sucursalID]);

  return { movimientos, productos };
}
