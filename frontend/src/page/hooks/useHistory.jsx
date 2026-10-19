import { apiFetch } from "../../api/client";
import { useEffect, useState } from "react";

export default function useHistory() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/movimiento/")
      .then(data => {
        const sortedItems = [...data].sort((a, b) => {
          if (a.fecha > b.fecha) return -1;
          if (a.fecha < b.fecha) return 1;
          if (a.hora > b.hora) return -1;
          if (a.hora < b.hora) return 1;
          return 0;
        });
        setMovements(sortedItems);
      })
      .catch((error) => console.error("Failed to load history:", error))
      .finally(() => setLoading(false));
  }, []);

  return { movements, loading };
}

