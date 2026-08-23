import React, { useState, useContext } from "react";
import "../css/menuDashboard.css";
import "../css/Tabla.css";
import { useDashboardData } from "../hooks/useDashboardData";
import AuthContext from "../../AuthContext";
import { Link } from "react-router-dom";

export default function MenuDashboard() {
  const { user } = useContext(AuthContext);
  const sucursalID = user?.perfil?.sucursal?.id;

  const isAdmin = user?.perfil?.permiso?.descripcion === "admin" || user?.is_staff;

  const {
    ultimos,
    ventasHoy,
    ventasSemana,
    ventasMes,
    gananciaMes,
    alertasStock,
  } = useDashboardData(sucursalID, isAdmin);

  const [selectedStockType, setSelectedStockType] = useState(null);
  const sinStock = alertasStock.items_sin_stock || [];
  const bajoStock = alertasStock.items_bajo_stock || [];

  const productosAMostrar =
    selectedStockType === "sin"
      ? sinStock
      : selectedStockType === "bajo"
      ? bajoStock
      : [];

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const ventasHoyMonto = ventasHoy.reduce(
    (acc, item) => acc + Number(item.subtotal || item.total || 0),
    0
  );

  const ventasSemanaMonto = ventasSemana.reduce(
    (acc, item) => acc + Number(item.subtotal || item.total || 0),
    0
  );

  const ventasMesMonto = ventasMes.reduce(
    (acc, item) => acc + Number(item.subtotal || item.total || 0),
    0
  );

  const fechaHoy = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const tituloSaludo = user?.username ? `Hola, ${user.username}` : "Hola";

  const movimientoTipos = ultimos.reduce((acc, m) => {
    const tipo = m.tipo_de_movimiento || "Otro";
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {});

  const tipoData = Object.entries(movimientoTipos).map(([tipo, cantidad], index) => ({
    tipo,
    cantidad,
    color: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"][index % 5],
  }));

  const totalMovimientos = tipoData.reduce((acc, item) => acc + item.cantidad, 0);
  const pieData = tipoData.map((item, index) => {
    const start = tipoData
      .slice(0, index)
      .reduce((acc, previous) => acc + previous.cantidad, 0);
    return {
      ...item,
      ratio: totalMovimientos ? item.cantidad / totalMovimientos : 0,
      start: totalMovimientos ? start / totalMovimientos : 0,
    };
  });

  const productosAlerta = [
    ...sinStock.map((p) => ({ ...p, estado: "Sin stock", rowClass: "alert-row-tall" })),
    ...bajoStock.map((p) => ({ ...p, estado: "Bajo stock", rowClass: "alert-row-medium" })),
  ];

  return (
    <div className="menu-dashboard">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Panel de control</p>
          <h2>{tituloSaludo} 👋</h2>
          <p className="hero-text">
            Aquí tienes una vista clara de ventas, stock y actividad reciente para tu sucursal.
          </p>
        </div>

        <div className="hero-card">
          <span>Resumen de hoy</span>
          <strong>{fechaHoy}</strong>
          <Link to="/dashboard/ventas" className="hero-link">
            Ver ventas
          </Link>
        </div>
      </section>

      <section className="summary-cards">
        <div className="summary-card">
          <p className="eyebrow">Últimos movimientos</p>
          <strong>{ultimos.length}</strong>
          <span>Registros recientes</span>
        </div>

        <div className="summary-card">
          <p className="eyebrow">Ventas hoy</p>
          <strong>{formatCurrency(ventasHoyMonto)}</strong>
          <span>Monto</span>
        </div>

        <div className="summary-card">
          <p className="eyebrow">Ventas semana</p>
          <strong>{formatCurrency(ventasSemanaMonto)}</strong>
          <span>Monto</span>
        </div>

        <div className="summary-card">
          <p className="eyebrow">Ventas mes</p>
          <strong>{formatCurrency(ventasMesMonto)}</strong>
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
                      key={segment.tipo}
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
                <strong>{totalMovimientos}</strong>
                <span>Movimientos</span>
              </div>
            </div>

            <div className="legend-list">
              {tipoData.length === 0 ? (
                <p className="empty-state">No hay datos de movimiento recientes.</p>
              ) : (
                tipoData.map((item) => (
                  <div key={item.tipo} className="legend-item">
                    <span className="legend-swatch" style={{ background: item.color }} />
                    <div>
                      <strong>{item.tipo}</strong>
                      <p>{item.cantidad} registro{item.cantidad === 1 ? "" : "s"}</p>
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
            {productosAlerta.length === 0 ? (
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
                  {productosAlerta.slice(0, 8).map((item) => (
                    <tr key={item.id} className={item.rowClass}>
                      <td>{item.descripcion || item.nombre || "Sin nombre"}</td>
                      <td>{Number(item.stock)}</td>
                      <td>
                        <span className={`alert-badge ${
                          item.estado === "Sin stock" ? "badge-danger" : "badge-warning"
                        }`}>
                          {item.estado}
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
            {ultimos.length === 0 ? (
              <p className="empty-state">No hay movimientos recientes todavía.</p>
            ) : (
              ultimos.slice(0, 6).map((m) => (
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
              <p className="eyebrow">Control de stock</p>
              <h3>Alertas rápidas</h3>
            </div>
          </div>

          <div className="stock-actions">
            <button
              type="button"
              className="stock-pill"
              onClick={() => setSelectedStockType("sin")}
            >
              Sin stock: {sinStock.length}
            </button>
            <button
              type="button"
              className="stock-pill"
              onClick={() => setSelectedStockType("bajo")}
            >
              Bajo stock: {bajoStock.length}
            </button>
          </div>

          <div className="stock-preview">
            <p>Revisa productos urgentes para evitar quedarte sin inventario.</p>
          </div>
        </article>
      </section>

      {selectedStockType && (
        <div className="stock-overlay" onClick={() => setSelectedStockType(null)}>
          <div className="stock-modal" onClick={(e) => e.stopPropagation()}>
            <div className="historial-popup-header">
              <strong className="historial-popup-title">
                {selectedStockType === "sin"
                  ? "Productos sin stock"
                  : "Productos con bajo stock"}
              </strong>
              <button
                className="historial-popup-close"
                onClick={() => setSelectedStockType(null)}
              >
                ✕
              </button>
            </div>

            {productosAMostrar.length === 0 ? (
              <p className="empty-state">No hay productos en esta categoría.</p>
            ) : (
              <div className="stock-table-container">
                <table className="historial-tabla">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosAMostrar.map((p) => (
                      <tr key={p.id}>
                        <td className="col-producto" title={p.descripcion}>
                          {p.descripcion}
                        </td>
                        <td>{Number(p.stock)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
