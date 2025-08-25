import { useEffect, useState } from "react";

export function useSucursales() {
  const [sucursales, setSucursales] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/sucursal/")
      .then((res) => res.json())
      .then((data) => setSucursales(data))
      .catch((err) => console.error("Error al obtener Sucursales:", err));
  }, []);

  return sucursales;
}
