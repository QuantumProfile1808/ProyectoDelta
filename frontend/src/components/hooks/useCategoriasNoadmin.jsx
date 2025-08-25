import { useState, useEffect } from "react";

export default function useCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [errorCategorias, setErrorCategorias] = useState("");

  useEffect(() => {
    let mounted = true;

    fetch("http://127.0.0.1:8000/api/categoria/", { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Error al cargar categorías");
        return res.json();
      })
      .then(data => {
        if (mounted) setCategorias(data);
      })
      .catch(err => {
        console.error("Categorías:", err);
        setErrorCategorias(err.message);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { categorias, errorCategorias };
}
