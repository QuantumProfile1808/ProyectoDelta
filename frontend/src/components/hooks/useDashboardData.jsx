// src/hooks/useDashboardData.js
import { useEffect, useState } from "react";

export function useDashboardData() {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    // Fetch movimientos
    fetch("http://localhost:8000/api/movimiento/")
      .then(res => res.json())
      .then(data => {
        console.log("Movimientos:", data);
        setMovimientos(data);
      })
      .catch(err => console.error("Error cargando movimientos:", err));

    // Fetch productos
    fetch("http://localhost:8000/api/producto/")
      .then(res => res.json())
      .then(data => {
        console.log("Productos:", data);
        setProductos(data);
      })
      .catch(err => console.error("Error cargando productos:", err));
  }, []);

  return { movimientos, productos };
}
