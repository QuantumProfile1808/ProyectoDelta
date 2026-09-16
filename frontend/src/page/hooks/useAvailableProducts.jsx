import { useMemo } from "react";
import useProfileAndProducts from "./useProfileAndProducts";

export default function useAvailableProducts() {
  const { products, loading, error } = useProfileAndProducts();
  const availableProducts = useMemo(() => products.map((p) => ({
    value: p.id,
    label: p.descripcion || ` ${p.id}`,
  })), [products]);
  return { availableProducts, productsLoading: loading, productsError: error };
}