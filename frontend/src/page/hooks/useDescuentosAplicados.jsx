import { useGetAppliedDiscountsQuery } from "../../api/bffApi";
import { getErrorMessage } from "../../api/client";

const EMPTY = [];

export function useDescuentosAplicados(productosSeleccionados) {
  const items = productosSeleccionados.map((p) => ({
    producto_id: p.id,
    cantidad: p.cantidad,
  }));
  const query = useGetAppliedDiscountsQuery(items, { skip: items.length === 0 });
  return {
    lineas: items.length ? query.currentData?.lineas ?? EMPTY : EMPTY,
    loading: query.isFetching,
    error: getErrorMessage(query.error),
    refetch: query.refetch,
  };
}