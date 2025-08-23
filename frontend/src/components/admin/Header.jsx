import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import usePerfilyProductos from "../hooks/usePerfilyProductos";
import "../css/Header.css";

const PESTANIA_MAP = {
  "": "Inicio",
  productos: "Productos",
  historial: "Historial",
  finanzas: "Finanzas",
  usuarios: "Usuarios",
  tablausuario: "Usuarios",
  tablaproductos: "Productos",
};

export default function Header() {
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
    <header className="admin-header">
      <button className="admin-header__back" title="Volver" onClick={() => window.history.back()}>
        &#8592;
      </button>
      <div className="admin-header__title">
        Sucursal:{sucursal} - {getPestania()}
      </div>
      <div className="admin-header__icons">
        <span className="admin-header__icon" title="Notificaciones">&#128276;</span>
        <span className="admin-header__icon" title="Opciones">&#128196;</span>
      </div>
    </header>
  );
}