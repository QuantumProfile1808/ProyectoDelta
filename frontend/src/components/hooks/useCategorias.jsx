import { useEffect, useState } from "react";

export function useCategorias() {
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/categoria/")
      .then((res) => res.json())
      .then((data) => setCategorias(data))
      .catch((err) => console.error("Error al obtener categorías:", err));
  }, []);

  return categorias;
}
