import React, { useContext, useState } from "react";
import AuthContext from "../../AuthContext";
import { Navigate, Link, Outlet, useLocation } from "react-router-dom";
import "../css/Dashboard.css";
import Header from "../../components/admin/Header";
import { FaBars } from "react-icons/fa";

export const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace />;
  const isDashboardRoot = location.pathname === "/dashboard";

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`} aria-hidden={!sidebarOpen}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Dashboard</h2>

          {/* Botón hamburguesa dentro del sidebar cuando está abierto */}
          {sidebarOpen && (
            <button
              className="hamburger inside"
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar sidebar"
            >
              <FaBars />
            </button>
          )}
        </div>

        <nav>
          <ul>
            <li><Link to="/dashboard">Inicio</Link></li>
            <li><Link to="/dashboard/tablaproductos">Productos</Link></li>
            <li><Link to="/dashboard/historial">Historial</Link></li>
            <li><Link to="/dashboard/finanzas">Finanzas</Link></li>
            <li><Link to="/dashboard/tablausuario">Usuarios</Link></li>
            <li><Link to="/dashboard/tablapromociones">Promociones</Link></li>
          </ul>
        </nav>

        <button onClick={logout} className="sidebar-logout">Logout</button>
      </aside>

      {/* Botón hamburguesa fuera del sidebar cuando está cerrado */}
      {!sidebarOpen && (
        <button
          className="hamburger outside"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir sidebar"
        >
          <FaBars />
        </button>
      )}

      {/* Contenido principal */}
      <main className="dashboard-content">
        {isDashboardRoot && <div className="dashboard-welcome" />}
        <Outlet />
      </main>
    </div>
  );
};
