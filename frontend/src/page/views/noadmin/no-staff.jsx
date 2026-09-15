import React from "react";
import { useNavigate } from "react-router-dom";

export const NoStaff = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#fafafa"
    }}>
      <div style={{
        background: "#fff",
        padding: "32px 40px",
        borderRadius: "12px",
        boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
        textAlign: "center"
      }}>
        <h2 style={{ color: "#222" }}>Acceso restringido</h2>
        <p style={{ color: "#444" }}>
          No tienes permisos de staff para acceder a esta sección.
        </p>
        <button
          style={{
            marginTop: "18px",
            background: "#222",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 22px",
            cursor: "pointer"
          }}
          onClick={() => navigate("/login")}
        >
          Volver al login
        </button>
      </div>
    </div>
  );
};

export default NoStaff;