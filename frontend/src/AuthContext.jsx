import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await initializeUser();
      setLoading(false);
    })();
  }, []);

  const initializeUser = async () => {
    try {
      let access = localStorage.getItem("token");
      const refresh = localStorage.getItem("refresh");
      if (!access) return;

      let res = await fetch("http://127.0.0.1:8000/api-auth/users/me/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${access}`,
        },
      });

      // Refresh token si el access venció
      if (res.status === 401 && refresh) {
        const refreshRes = await fetch(
          "http://127.0.0.1:8000/api-auth/jwt/refresh/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh }),
          }
        );

        if (!refreshRes.ok) throw new Error("Refresh token invalido");

        const { access: newAccess } = await refreshRes.json();
        access = newAccess;
        localStorage.setItem("token", newAccess);

        res = await fetch("http://127.0.0.1:8000/api-auth/users/me/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `JWT ${newAccess}`,
          },
        });
      }

      if (!res.ok) throw new Error("User fetch fallo");

      const userData = await res.json();

      // === NUEVO === traer perfil también en inicialización
      const perfilResponse = await fetch(
        `http://127.0.0.1:8000/api/perfil/?user=${userData.id}`,
        { credentials: "include" }
      );

      const perfilData = await perfilResponse.json();
      userData.perfil = Array.isArray(perfilData) ? perfilData[0] : perfilData;

      setUser(userData);

    } catch (error) {
      console.error("initializeUser:", error);
      setUser(null);
    }
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      if (!refresh) return;

      await fetch("http://127.0.0.1:8000/api-auth/jwt/blacklist/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });

      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
      setUser(null);

    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api-auth/jwt/create/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const text = await response.text();
      let data = null;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("Error parseando JSON");
      }

      if (!response.ok) return null;

      // Guardar tokens
      localStorage.setItem("token", data.access);
      localStorage.setItem("refresh", data.refresh);

      // Fetch user
      const userResponse = await fetch(
        "http://127.0.0.1:8000/api-auth/users/me/",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `JWT ${data.access}`,
          },
        }
      );

      const userData = await userResponse.json();

      // Fetch perfil
      const perfilResponse = await fetch(
        `http://127.0.0.1:8000/api/perfil/?user=${userData.id}`,
        { credentials: "include" }
      );

      const perfilData = await perfilResponse.json();
      userData.perfil = Array.isArray(perfilData) ? perfilData[0] : perfilData;

      setUser(userData);
      return userData;

    } catch (error) {
      console.error("Login failed:", error);
      return null;
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
