// src/components/admin/Header.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import usePerfilyProductos from "../hooks/usePerfilyProductos";
import "../css/Header.css";
import { FaArrowLeft } from "react-icons/fa"; // ⬅️ Ícono moderno

const PESTANIA_MAP = {
  "": "Inicio",
  productos: "Productos",
  historial: "Historial",
  finanzas: "Finanzas",
  usuarios: "Usuarios",
  tablausuario: "Usuarios",
  tablaproductos: "Productos",
  promociones: "Promociones",
  User: "Usuarios"
};

export default function Header({ sidebarOpen }) {
  const location = useLocation();
  const { perfil, loading } = usePerfilyProductos();
  const sucursal = perfil?.sucursal?.localidad || "Sucursal";

  const getPestania = () => {
    const parts = location.pathname.split("/").filter(Boolean);
    const key = parts[1] ? parts[1].toLowerCase() : "";
    return PESTANIA_MAP[key] || "Panel";
  };

  if (loading) return null;

  return (
    <header className={`admin-header ${sidebarOpen ? "compact" : "expanded"}`}>
      <button
        className="stylish-back-btn"
        title="Volver"
        onClick={() => window.history.back()}
        aria-label="Volver"
      >
        <FaArrowLeft />
      </button>

      <div className="admin-header__title">
        {`Sucursal: ${sucursal} - ${getPestania()}`}
      </div>

      <div className="admin-header__icons">
        <span className="admin-header__icon" title="Notificaciones"></span>
        <span className="admin-header__icon" title="Perfil"></span>
      </div>
    </header>
  );
}
