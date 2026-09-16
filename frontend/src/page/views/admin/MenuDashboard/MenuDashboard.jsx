import "./MenuDashboard.css";
import React, { useState, useContext } from "react";


import { useDashboardData } from "../../../hooks/useDashboardData";
import AuthContext from "../../../../AuthContext";
import { Link } from "react-router-dom";

export default function MenuDashboard() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.is_staff;
  const profileBranchId = isAdmin ? null : user?.perfil?.sucursal?.id;

  const {
    latestMovements,
    salesToday,
    salesWeek,
    salesMonth,
    stockAlerts,
    loading,
    error,
    refetch,
  } = useDashboardData(profileBranchId, isAdmin);

  // Widget period: day, week, or month.
  // The sales API already returns only outgoing movements.
  const [selectedSalesPeriod, setSelectedSalesPeriod] = useState("today");
  if (loading) return <p role="status">Cargando dashboard...</p>;
  if (error) return <div role="alert">{error} <button onClick={refetch}>Reintentar</button></div>;
  const outOfStock = stockAlerts.items_sin_stock || [];
  const lowStock = stockAlerts.items_bajo_stock || [];

  const salesPeriodMap = {
    today: salesToday,
    week: salesWeek,
    month: salesMonth,
  };

  const selectedPeriod = salesPeriodMap[selectedSalesPeriod] || [];

  // Group subtotals by branch for the comparison chart.
  const branchSales = Object.values(
    selectedPeriod.reduce((acc, item) => {
      const branch = item.sucursal || {};
      const selectedBranchId = branch.id || "sin-sucursal";
      const displayName = branch.localidad || branch.direccion || `Sucursal ${selectedBranchId}`;
      const subtotal = Number(item.subtotal || item.total || 0);

      if (!acc[selectedBranchId]) {
        acc[selectedBranchId] = { name: displayName, total: 0 };
      }

      acc[selectedBranchId].total += subtotal;
      return acc;
    }, {})
  ).sort((a, b) => b.total - a.total);

  const maxBranchSales = Math.max(...branchSales.map((item) => item.total), 1);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const todaySalesAmount = salesToday.reduce(
    (acc, item) => acc + Number(item.subtotal || item.total || 0),
    0
  );

  const weekSalesAmount = salesWeek.reduce(
    (acc, item) => acc + Number(item.subtotal || item.total || 0),
    0
  );

  const monthSalesAmount = salesMonth.reduce(
    (acc, item) => acc + Number(item.subtotal || item.total || 0),
    0
  );

  const todayDate = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const greetingTitle = user?.username ? `Hola, ${user.username}` : "Hola";

  const movementTypes = latestMovements.reduce((acc, m) => {
    const movementType = m.tipo_de_movimiento || "Otro";
    acc[movementType] = (acc[movementType] || 0) + 1;
    return acc;
  }, {});

  const typeData = Object.entries(movementTypes).map(([movementType, quantity], index) => ({
    type: movementType,
    count: quantity,
    color: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"][index % 5],
  }));

  const totalMovements = typeData.reduce((acc, item) => acc + item.count, 0);
  const pieData = typeData.map((item, index) => {
    const start = typeData
      .slice(0, index)
      .reduce((acc, previous) => acc + previous.count, 0);
    return {
      ...item,
      ratio: totalMovements ? item.count / totalMovements : 0,
      start: totalMovements ? start / totalMovements : 0,
    };
  });

  const alertProducts = [
    ...outOfStock.map((p) => ({ ...p, status: "Sin stock", rowClass: "alert-row-tall" })),
    ...lowStock.map((p) => ({ ...p, status: "Bajo stock", rowClass: "alert-row-medium" })),
  ];

  return (
    <div className="menu-dashboard">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Panel de control</p>
          <h2>{greetingTitle} 👋</h2>
          <p className="hero-text">
            Aquí tienes una vista clara de ventas, stock y actividad reciente para tu sucursal.
          </p>
        </div>

        <div className="hero-card">
          <span>Resumen de hoy</span>
          <strong>{todayDate}</strong>
          <Link to="/dashboard/ventas" className="hero-link">
            Ver ventas
          </Link>
        </div>
      </section>

      <section className="summary-cards">
        <div className="summary-card">
          <p className="eyebrow">Últimos movimientos</p>
          <strong>{latestMovements.length}</strong>
          <span>Registros recientes</span>
        </div>

        <div className="summary-card">
          <p className="eyebrow">Ventas hoy</p>
          <strong>{formatCurrency(todaySalesAmount)}</strong>
          <span>Monto</span>
        </div>

        <div className="summary-card">
          <p className="eyebrow">Ventas semana</p>
          <strong>{formatCurrency(weekSalesAmount)}</strong>
          <span>Monto</span>
        </div>

        <div className="summary-card">
          <p className="eyebrow">Ventas mes</p>
          <strong>{formatCurrency(monthSalesAmount)}</strong>
          <span>Monto</span>
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="panel-card chart-card">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Insights</p>
              <h3>Distribución de movimientos</h3>
            </div>
          </div>

          <div className="chart-layout">
            <div className="donut-chart" aria-label="Distribución de tipos de movimiento">
              <svg viewBox="0 0 120 120" className="donut-svg">
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="transparent"
                  stroke="#e5e7eb"
                  strokeWidth="20"
                />
                {pieData.map((segment) => {
                  const circumference = 2 * Math.PI * 48;
                  const dashLength = segment.ratio * circumference;
                  return (
                    <circle
                      key={segment.type}
                      cx="60"
                      cy="60"
                      r="48"
                      fill="transparent"
                      stroke={segment.color}
                      strokeWidth="20"
                      strokeDasharray={`${dashLength} ${circumference}`}
                      strokeDashoffset={circumference * (1 - segment.start)}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                    />
                  );
                })}
              </svg>
              <div className="donut-center">
                <strong>{totalMovements}</strong>
                <span>Movimientos</span>
              </div>
            </div>

            <div className="legend-list">
              {typeData.length === 0 ? (
                <p className="empty-state">No hay datos de movimiento recientes.</p>
              ) : (
                typeData.map((item) => (
                  <div key={item.type} className="legend-item">
                    <span className="legend-swatch" style={{ background: item.color }} />
                    <div>
                      <strong>{item.type}</strong>
                      <p>{item.count} registro{item.count === 1 ? "" : "s"}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Inventario</p>
              <h3>Productos en alerta</h3>
            </div>
            <Link to="/dashboard/tablaproductos">Ver inventario</Link>
          </div>

          <div className="alert-table-wrapper">
            {alertProducts.length === 0 ? (
              <p className="empty-state">No hay productos en alerta en este momento.</p>
            ) : (
              <table className="alert-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Stock</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {alertProducts.slice(0, 8).map((item) => (
                    <tr key={item.id} className={item.rowClass}>
                      <td>{item.descripcion || item.nombre || "Sin nombre"}</td>
                      <td>{Number(item.stock)}</td>
                      <td>
                        <span className={`alert-badge ${
                          item.status === "Sin stock" ? "badge-danger" : "badge-warning"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel-card">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Actividad reciente</p>
              <h3>Últimos movimientos</h3>
            </div>
            <Link to="/dashboard/historial">Ver historial</Link>
          </div>

          <div className="activity-list">
            {latestMovements.length === 0 ? (
              <p className="empty-state">No hay movimientos recientes todavía.</p>
            ) : (
              latestMovements.slice(0, 6).map((m) => (
                <div key={m.id} className="activity-item">
                  <div>
                    <strong>{m.producto_nombre}</strong>
                    <p>
                      {m.usuario_nombre} • {m.tipo_de_movimiento}
                    </p>
                  </div>
                  <span>{Number(m.cantidad)} und</span>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Ventas</p>
              <h3>Por sucursal</h3>
            </div>
          </div>

          <div className="sales-filter-row">
            {[
              { key: "today", label: "Día" },
              { key: "week", label: "Semana" },
              { key: "month", label: "Mes" },
            ].map((period) => (
              <button
                key={period.key}
                type="button"
                className={`filter-chip ${selectedSalesPeriod === period.key ? "active" : ""}`}
                onClick={() => setSelectedSalesPeriod(period.key)}
              >
                {period.label}
              </button>
            ))}
          </div>

          <div className="branch-sales-chart">
            {branchSales.length === 0 ? (
              <p className="empty-state">No hay ventas para este período.</p>
            ) : (
              branchSales.map((branch) => (
                <div key={branch.name} className="branch-sales-row">
                  <div className="branch-sales-meta">
                    <span>{branch.name}</span>
                    <strong>{formatCurrency(branch.total)}</strong>
                  </div>
                  <div className="branch-sales-track">
                    <div
                      className="branch-sales-fill"
                      style={{ width: `${(branch.total / maxBranchSales) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
