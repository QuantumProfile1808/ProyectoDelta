import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function ProtectedRoute({ children, onlyAdmin = false }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (onlyAdmin && !user.is_staff) {
    return <Navigate to="/no-staff" replace />;
  }

  return children;
}