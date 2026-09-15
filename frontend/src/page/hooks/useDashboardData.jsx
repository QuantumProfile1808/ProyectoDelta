import { useSelector } from "react-redux";
import { useGetDashboardQuery } from "../../api/bffApi";
import { getErrorMessage } from "../../api/client";

const EMPTY = [];
const EMPTY_ALERTS = { items_sin_stock: [], items_bajo_stock: [] };

export function useDashboardData(branchId, isAdmin = false) {
  const user = useSelector((state) => state.auth.user);
  const query = useGetDashboardQuery(branchId || undefined, {
    skip: !user || (!branchId && !isAdmin),
  });
  const data = query.currentData;
  return {
    latestMovements: data?.ultimos ?? EMPTY,
    salesToday: data?.ventas_hoy ?? EMPTY,
    salesWeek: data?.ventas_semana ?? EMPTY,
    salesMonth: data?.ventas_mes ?? EMPTY,
    monthlyRevenue: Number(data?.ganancia_mes ?? 0),
    stockAlerts: data?.alertas_stock ?? EMPTY_ALERTS,
    loading: query.isLoading || (query.isFetching && !data),
    fetching: query.isFetching,
    error: getErrorMessage(query.error),
    refetch: query.refetch,
  };
}