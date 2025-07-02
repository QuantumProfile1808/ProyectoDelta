import React, { useContext, useState } from "react";
import AuthContext from "../../AuthContext";
import { Navigate, Link, Outlet } from "react-router-dom";
import "../css/Dashboard.css";

export const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="dashboard-container">
            {/* Sidebar toggle button */}


            <button className={`hamburger${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
                <span />
                <span />
                <span />
            </button>
            <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>



                <h2 className="sidebar-title">Admin</h2>
                <nav>
                    <ul>
                        <li><Link to="/dashboard">Inicio</Link></li>
                        <li><Link to="/dashboard/productos">Productos</Link></li>
                        <li><Link to="/dashboard/historial">Historial</Link></li>
                        <li><Link to="/dashboard/finanzas">Finanzas</Link></li>
                        <li><Link to="/dashboard/usuarios">Usuarios</Link></li>
                    </ul>
                </nav>
                <button onClick={logout} style={{ marginTop: "40px", width: "80%", marginLeft: "10%" }}>
                    Logout
                </button>
            </aside>
            <main className="dashboard-content">
                <h2>Dashboard</h2>
                <p>Welcome, {user.username}!</p>
                <Outlet />
            </main>
        </div>
    );
};