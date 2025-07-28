import { useState, useEffect } from "react";

export default function usePerfilYProductos() {
  const [perfil, setPerfil] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    fetch("http://127.0.0.1:8000/api/perfil/", { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Error al cargar perfil");
        return res.json();
      })
      .then(data => {
        const p = Array.isArray(data) ? data[0] : data;
        if (!mounted) return;
        setPerfil(p);

        return fetch(`http://127.0.0.1:8000/api/producto/?sucursal=${p.sucursal.id}`, {
          credentials: "include"
        });
      })
      .then(res => {
        if (!res.ok) throw new Error("Error al cargar productos");
        return res.json();
      })
      .then(data => {
        if (mounted) setProductos(data);
      })
      .catch(err => {
        if (mounted) setError(err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { perfil, productos, loading, error };
}