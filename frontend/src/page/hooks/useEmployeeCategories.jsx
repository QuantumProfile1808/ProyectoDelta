import { useSelector } from "react-redux";
import { useGetCategoriesQuery } from "../../api/bffApi";
import { getErrorMessage } from "../../api/client";

const EMPTY = [];
export default function useCategories() {
  const user = useSelector((state) => state.auth.user);
  const { data = EMPTY, error } = useGetCategoriesQuery(undefined, { skip: !user });
  return { categories: data, categoriesError: getErrorMessage(error) };
}