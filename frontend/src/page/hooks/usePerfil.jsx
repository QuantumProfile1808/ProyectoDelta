import { useContext } from "react";
import AuthContext from "../../AuthContext";

export function usePerfil() {
  const { user } = useContext(AuthContext);
  return user?.perfil || null;
}
