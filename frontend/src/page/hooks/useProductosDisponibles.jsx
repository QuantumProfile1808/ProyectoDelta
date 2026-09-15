import { useMemo } from "react";
import useProfileAndProducts from "./usePerfilyProductos";

export default function useProductosDisponibles() {
  const { products, loading, error } = useProfileAndProducts();
  const productosDisponibles = useMemo(() => products.map((p) => ({
    value: p.id,
    label: p.descripcion || ` ${p.id}`,
  })), [products]);
  return { productosDisponibles, loadingProductos: loading, errorProductos: error };
}