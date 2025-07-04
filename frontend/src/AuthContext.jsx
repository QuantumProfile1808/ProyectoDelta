import { createContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    inizializeUser();
  }, []);


  const inizializeUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://localhost:8000/api-auth/users/me/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `JWT ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error("Initialization failed:", error);
    }
  }

  const logout = async () => {
    
    try {
      const refresh = localStorage.getItem("refresh");
      if (!refresh) return;

      const response = await fetch("http://localhost:8000/api-auth/jwt/blacklist/", {
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
      const response = await fetch("http://localhost:8000/api-auth/jwt/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();

      if (data.access && data.refresh) {
        localStorage.setItem("token", data.access);
        localStorage.setItem("refresh", data.refresh);

        // Fetch user data
        const userResponse = await fetch("http://localhost:8000/api-auth/users/me/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `JWT ${data.access}`,
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

  return (
    <AuthContext.Provider value={{ user, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;