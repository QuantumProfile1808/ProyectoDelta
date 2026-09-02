import React, { createContext, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initializeUser, loginUser, logoutUser } from "./store/authSlice";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(initializeUser());
  }, [dispatch]);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      login: async (username, password) => {
        try {
          return await dispatch(loginUser({ username, password })).unwrap();
        } catch (error) {
          console.error("Login failed:", error);
          return null;
        }
      },
      logout: async () => {
        await dispatch(logoutUser());
      },
    }),
    [dispatch, error, loading, user]
  );

  if (loading) {
    return <div>Cargando...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => React.useContext(AuthContext);
export default AuthContext;
