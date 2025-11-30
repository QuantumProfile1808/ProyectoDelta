import { useEffect, useState } from "react";

export default function useProductosSucursal(sucursalID) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sucursalID) return;

    fetch(`http://127.0.0.1:8000/api/producto/?sucursal=${sucursalID}`)
      .then(res => res.json())
      .then(data => setProductos(data))
      .finally(() => setLoading(false));
  }, [sucursalID]);

  return { productos, loading };
}
