import "./Header.css";
// Shared page header.
import React from "react";
import { useLocation } from "react-router-dom";

import { FaArrowLeft } from "react-icons/fa";
import { SlArrowLeft } from "react-icons/sl";
import { useProfile } from "../../page/hooks/useProfile";

const TAB_LABELS = {
  "": "Inicio",
  productos: "Productos",
  historial: "Historial",
  ventas: "Ventas",
  usuarios: "Usuarios",
  tablausuario: "Usuarios",
  tablaproductos: "Productos",
  promociones: "Promociones",
  User: "Usuarios",
};

export default function Header({ sidebarOpen }) {
  const location = useLocation();
  const profile = useProfile();
  if (!profile) return null;

  const branch = profile.sucursal?.localidad || "Sucursal";

  const getTabLabel = () => {
    const parts = location.pathname.split("/").filter(Boolean);
    const key = parts[1] ? parts[1].toLowerCase() : "";
    return TAB_LABELS[key] || "Panel";
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
        {`Sucursal: ${branch} - ${getTabLabel()}`}
      </div>

      <div className="admin-header__icons">
        <span className="admin-header__icon" title="Notificaciones"></span>
        <span className="admin-header__icon" title="Perfil"></span>
      </div>
    </header>
  );
}
