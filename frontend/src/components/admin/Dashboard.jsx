// src/components/admin/Dashboard.jsx
import React, { useContext, useState } from "react";
import AuthContext from "../../AuthContext";
import { Navigate, Link, Outlet, useLocation } from "react-router-dom";
import "../css/Dashboard.css";
import Header from "../../components/admin/Header";

export const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isDashboardRoot = location.pathname === "/dashboard";

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`} aria-hidden={!sidebarOpen}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Dashboard</h2>

          {/* Hamburger: fijo en pantalla, siempre visible */}
          <button
            className={`hamburger${sidebarOpen ? " open" : ""}`}
            style={{
              left: sidebarOpen ? 180 : 24
            }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <nav>
          <ul>
            <li><Link to="/dashboard">Inicio</Link></li>
            <li><Link to="/dashboard/tablaproductos">Productos</Link></li>
            <li><Link to="/dashboard/historial">Historial</Link></li>
            <li><Link to="/dashboard/finanzas">Finanzas</Link></li>
            <li><Link to="/dashboard/tablausuario">Usuarios</Link></li>
          </ul>
        </nav>

        <button
          onClick={logout}
          className="sidebar-logout"
        >
          Logout
        </button>
      </aside>

      {/* Header recibe estado del sidebar para animar el back button */}
      <Header sidebarOpen={sidebarOpen} />

      {/* Contenido principal */}
      <main className="dashboard-content">
        {isDashboardRoot && (
          <div className="dashboard-welcome">
            <h1>Bienvenido al Dashboard</h1>
            <p>Selecciona una opción del menú para comenzar.</p>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
};
