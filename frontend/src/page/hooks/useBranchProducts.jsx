import { useSelector } from "react-redux";
import { useGetCatalogQuery } from "../../api/bffApi";
import { getErrorMessage } from "../../api/client";

const EMPTY = [];

export default function useBranchProducts(branchId) {
  const user = useSelector((state) => state.auth.user);
  const query = useGetCatalogQuery(branchId ? { sucursal: branchId } : undefined, {
    skip: !user,
  });
  const data = query.currentData;
  return {
    products: data?.productos ?? EMPTY,
    categories: data?.categorias ?? EMPTY,
    loading: query.isLoading || (query.isFetching && !data),
    fetching: query.isFetching,
    error: getErrorMessage(query.error),
    refetch: query.refetch,
  };
}