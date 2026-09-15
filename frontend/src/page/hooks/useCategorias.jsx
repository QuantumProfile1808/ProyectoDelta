import { useSelector } from "react-redux";
import { useGetCategoriesQuery } from "../../api/bffApi";

const EMPTY = [];
export function useCategorias() {
  const user = useSelector((state) => state.auth.user);
  const { data = EMPTY } = useGetCategoriesQuery(undefined, { skip: !user });
  return data;
}