import React, { useState, useContext } from "react";
import "../css/menuDashboard.css";
import { useDashboardData } from "../hooks/useDashboardData";
import AuthContext from "../../AuthContext";

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

  // SECCIONES

  const UltimosMovimientos = (
    <section className="dashboard-card">
      <h3>Últimos Movimientos</h3>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Tipo</th>
            <th>Producto</th>
            <th>Cant</th>
          </tr>
        </thead>
        <tbody>
          {ultimos.map((m) => (
            <tr key={m.id}>
              <td>{m.fecha}</td>
              <td>{m.usuario}</td>
              <td>{m.tipo_de_movimiento}</td>
              <td>{m.producto}</td>
              <td>{Number(m.cantidad)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );

  const GananciaMes = (
    <section className="dashboard-card">
      <h3>Ganancia del mes</h3>
      <p>${gananciaMes.toFixed(2)}</p>
    </section>
  );

  const InformesVentas = (
    <section className="dashboard-card">
      <h3>Informes ventas</h3>
      <p>Hoy: {ventasHoy.length} productos</p>
      <p>Semana: {ventasSemana.length} productos</p>
      <p>Mes: {ventasMes.length} productos</p>
    </section>
  );

  const StockInfo = (
    <section className="dashboard-card">
      <h3>Avisos Stock</h3>
      <p onClick={() => setSelectedStockType("sin")} className="stock-link">
        Sin stock: {sinStock.length}
      </p>
      <p onClick={() => setSelectedStockType("bajo")} className="stock-link">
        Bajo stock: {bajoStock.length}
      </p>
    </section>
  );

  const StockModal = selectedStockType && (
    <div
      className="historial-overlay"
      onClick={() => setSelectedStockType(null)}
    >
      <div className="historial-popup" onClick={(e) => e.stopPropagation()}>
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
          <p>No hay productos en esta categoría.</p>
        ) : (
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
                  <td>{p.descripcion}</td>
                  <td>{Number(p.stock)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  return (
    <div className="menu-dashboard">
      <div className="grid">
        {UltimosMovimientos}
        {GananciaMes}
        {InformesVentas}
        {StockInfo}
      </div>

      {StockModal}
    </div>
  );
}
