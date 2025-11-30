// src/components/admin/Header.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import "../css/Header.css";
import { FaArrowLeft } from "react-icons/fa";
import { SlArrowLeft } from "react-icons/sl";
import { usePerfil } from "../hooks/usePerfil";

const PESTANIA_MAP = {
  "": "Inicio",
  productos: "Productos",
  historial: "Historial",
  finanzas: "Finanzas",
  usuarios: "Usuarios",
  tablausuario: "Usuarios",
  tablaproductos: "Productos",
  promociones: "Promociones",
  User: "Usuarios",
};

export default function Header({ sidebarOpen }) {
  const location = useLocation();
  const perfil = usePerfil();
  if (!perfil) return null;

  const sucursal = perfil.sucursal?.localidad || "Sucursal";

  const getPestania = () => {
    const parts = location.pathname.split("/").filter(Boolean);
    const key = parts[1] ? parts[1].toLowerCase() : "";
    return PESTANIA_MAP[key] || "Panel";
  };

  return (
    <header className={`admin-header ${sidebarOpen ? "compact" : "expanded"}`}>
      <button
        className="admin-header__back"
        title="Volver"
        onClick={() => window.history.back()}
        aria-label="Volver"
      >
        <SlArrowLeft />
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
