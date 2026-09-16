import { useSelector } from "react-redux";
import { useGetBranchesQuery } from "../../api/bffApi";

const EMPTY = [];
export function useBranches() {
  const user = useSelector((state) => state.auth.user);
  const { data = EMPTY } = useGetBranchesQuery(undefined, { skip: !user });
  return data;
}