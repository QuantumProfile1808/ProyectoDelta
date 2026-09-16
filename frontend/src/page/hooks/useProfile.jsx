import { useContext } from "react";
import AuthContext from "../../AuthContext";

export function useProfile() {
  const { user } = useContext(AuthContext);
  return user?.perfil || null;
}
