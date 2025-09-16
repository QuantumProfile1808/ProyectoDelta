import { useEffect, useState } from "react";

export function useDashboardData() {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    // Fetch movimientos
    fetch("http://localhost:8000/api/movimiento/")
      .then(res => res.json())
      .then(data => {
        const parsed = data.map(m => ({
          ...m,
          usuario: m.usuario_nombre || m.usuario, // prioriza el nombre
          producto: m.producto_nombre || m.producto // prioriza el nombre
        }));
        setMovimientos(parsed);
      })
      .catch(err => console.error("Error cargando movimientos:", err));

    // Fetch productos
    fetch("http://localhost:8000/api/producto/")
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(err => console.error("Error cargando productos:", err));
  }, []);

  return { movimientos, productos };
}