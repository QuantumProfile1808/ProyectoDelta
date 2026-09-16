import { useSelector } from "react-redux";
import { useGetCatalogQuery } from "../../api/bffApi";
import { getErrorMessage } from "../../api/client";

const EMPTY = [];

export default function useProfileAndProducts() {
  const user = useSelector((state) => state.auth.user);
  const query = useGetCatalogQuery(undefined, { skip: !user });
  return {
    profile: query.currentData?.perfil ?? user?.perfil ?? null,
    products: query.currentData?.productos ?? EMPTY,
    loading: query.isLoading,
    error: getErrorMessage(query.error),
  };
}