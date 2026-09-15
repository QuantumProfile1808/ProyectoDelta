import { useEffect, useState } from "react";

export function usePermisos() {
  const [permisos, setPermisos] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/permiso/")
      .then((res) => res.json())
      .then((data) => setPermisos(data))
      .catch((err) => console.error("Error al obtener permisos:", err));
  }, []);

  return permisos;
}
