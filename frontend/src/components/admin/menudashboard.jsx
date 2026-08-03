import React, { useState, useContext } from "react";
import "../css/menuDashboard.css";
import { useDashboardData } from "../hooks/useDashboardData";
import AuthContext from "../../AuthContext";
import { Link } from "react-router-dom";

export default function MenuDashboard() {
  const { user } = useContext(AuthContext);
  const sucursalID = user?.perfil?.sucursal?.id;

  const {
    ultimos,
    ventasHoy,
    ventasSemana,
    ventasMes,
    gananciaMes,
    alertasStock,
  } = useDashboardData(sucursalID);

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

      <section className="summary-grid">
        <article className="summary-card accent-blue">
          <p className="summary-label">Ventas hoy</p>
          <h3>{formatCurrency(ventasHoyMonto)}</h3>
          <span>{ventasHoy.length} movimientos</span>
        </article>

        <article className="summary-card accent-green">
          <p className="summary-label">Esta semana</p>
          <h3>{formatCurrency(ventasSemanaMonto)}</h3>
          <span>{ventasSemana.length} movimientos</span>
        </article>

        <article className="summary-card accent-purple">
          <p className="summary-label">Este mes</p>
          <h3>{formatCurrency(ventasMesMonto)}</h3>
          <span>{ventasMes.length} movimientos</span>
        </article>

        <article className="summary-card accent-orange">
          <p className="summary-label">Ganancia del mes</p>
          <h3>{formatCurrency(gananciaMes)}</h3>
          <span>Base para decisiones rápidas</span>
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
