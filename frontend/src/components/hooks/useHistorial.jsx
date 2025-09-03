import { useEffect, useState } from "react";

export default function useHistorial() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/movimiento/")
      .then(res => res.json())
      .then(data => {
        const ordenados = [...data].sort((a, b) => {
          if (a.fecha < b.fecha) return -1;
          if (a.fecha > b.fecha) return 1;
          if (a.hora < b.hora) return -1;
          if (a.hora > b.hora) return 1;
          return 0;
        });
        setMovimientos(ordenados);
        setLoading(false);
      });
  }, []);

  return { movimientos, loading };
}
