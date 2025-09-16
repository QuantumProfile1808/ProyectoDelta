import { useState, useEffect } from "react";

export default function useProductosDisponibles() {
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [errorProductos, setErrorProductos] = useState(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/producto/");
        const data = await res.json();
        const productos = Array.isArray(data) ? data : data.results || [];
        const options = productos.map((p) => ({
          value: p.id,
          label: p.descripcion || ` ${p.id}`,
        }));
        setProductosDisponibles(options);
      } catch (err) {
        setErrorProductos("Error al cargar productos.");
      } finally {
        setLoadingProductos(false);
      }
    };

    fetchProductos();
  }, []);

  return { productosDisponibles, loadingProductos, errorProductos };
}
