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
            {}
                <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
                    <div className="sidebar-header">
                        <h2 className="sidebar-title">Dashboard</h2>
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
                            <li><Link to="/dashboard/productos">Productos</Link></li>
                            <li><Link to="/dashboard/historial">Historial</Link></li>
                            <li><Link to="/dashboard/finanzas">Finanzas</Link></li>
                            <li><Link to="/dashboard/usuarios">Usuarios</Link></li>
                        </ul>
                    </nav>
                    <button
                        onClick={logout}
                        style={{
                            marginTop: "40px",
                            width: "80%",
                            marginLeft: "10%",
                            marginRight: "10%"
                        }}
                    >
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