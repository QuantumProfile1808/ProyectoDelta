import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,  setUser]    = useState(null);
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
          "Authorization": `JWT ${access}`,
        },
      });

      if (res.status === 401 && refresh) {
        const refreshRes = await fetch("hthttp://127.0.0.1:8000/api-auth/jwt/refresh/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh }),
        });
        if (!refreshRes.ok) throw new Error("Refresh token invalido");
        const { access: newAccess } = await refreshRes.json();
        access = newAccess;
        localStorage.setItem("token", newAccess);

        res = await fetch("http://127.0.0.1:8000/api-auth/users/me/", {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `JWT ${newAccess}`,
          },
        });
      }

      if (!res.ok) throw new Error("User fetch falló");
      const userData = await res.json();
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

      const response = await fetch("http://127.0.0.1:8000/api-auth/jwt/blacklist/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh }),
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api-auth/jwt/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const text = await response.text();
      console.log('Login response status', response.status, 'body:', text);

      let data = null;
      try { data = JSON.parse(text); } catch (e) { /* not json */ }

      if (!response.ok) {
        // log server message if existe
        console.error('Login error body:', data ?? text);
        return null;
      }

      if (data && data.access && data.refresh) {
        localStorage.setItem("token", data.access);
        localStorage.setItem("refresh", data.refresh);

        // Fetch user data
        const userResponse = await fetch("http://127.0.0.1:8000/api-auth/users/me/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `JWT ${data.access}`, // o 'Bearer' si tu backend lo requiere
          },
        });

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await userResponse.json();
        console.log("User data fetched:", userData);
        setUser(userData);
        return userData;
      }
      return null;
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