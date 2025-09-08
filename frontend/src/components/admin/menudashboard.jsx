import React, { useEffect, useState } from "react";
import "../css/menuDashboard.css";
import { useDashboardData } from "../hooks/useDashboardData";

  export default function MenuDashboard() {
  const { movimientos, productos } = useDashboardData();
  // Últimos 3 movimientos
  const ultimosMovimientos = [...movimientos]
  .filter(m => m.tipo_de_movimiento !== "total")
  .sort((a, b) => {
    const fechaHoraA = new Date(`${a.fecha || "1970-01-01"}T${a.hora || "00:00:00"}`); //epoch de Unix
    const fechaHoraB = new Date(`${b.fecha || "1970-01-01"}T${b.hora || "00:00:00"}`);
    return fechaHoraB - fechaHoraA;
  })
  .slice(0, 3);

  // Ganancia del mes
  const mesActual = new Date().getMonth();
  const gananciaMes = movimientos
    .filter(m => m.tipo_de_movimiento === "salida" && new Date(m.fecha).getMonth() === mesActual)
    .reduce((acc, m) => acc + (m.subtotal || 0), 0);

  // Informes ventas
  const hoy = new Date().toISOString().split("T")[0];
  const inicioSemana = new Date();
  inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());

  const ventasHoy = movimientos.filter(m => m.tipo_de_movimiento === "salida" && m.fecha === hoy).length;
  const ventasSemana = movimientos.filter(m => {
    const fecha = new Date(m.fecha);
    return m.tipo_de_movimiento === "salida" && fecha >= inicioSemana;
  }).length;
  const ventasMes = movimientos.filter(m => m.tipo_de_movimiento === "salida" && new Date(m.fecha).getMonth() === mesActual).length;

  // Avisos stock
  const sinStock = productos.filter(p => p.stock === 0).length;
  const bajoStock = productos.filter(p => p.stock > 0 && p.stock < 5).length;

return (
  <div className="menu-dashboard">
    <div className="dashboard-content">
      <div className="grid">
        {/* Últimos movimientos */}
        <section className="card">
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
              {ultimosMovimientos.map((m, i) => (
                <tr key={i}>
                  <td>{m.fecha}</td>
                  <td>{m.usuario}</td>
                  <td>{m.tipo_de_movimiento}</td>
                  <td>{m.producto}</td>
                  <td>{m.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Ganancia del mes */}
        <section className="card">
          <h3>Ganancia del mes</h3>
          <p>${gananciaMes.toFixed(2)}</p>
        </section>

        {/* Informes ventas */}
        <section className="card">
          <h3>Informes ventas</h3>
          <p>Hoy: {ventasHoy} productos</p>
          <p>Semana: {ventasSemana} productos</p>
          <p>Mes: {ventasMes} productos</p>
        </section>

        {/* Avisos stock */}
        <section className="card">
          <h3>Avisos Stock</h3>
          <p>Sin stock: {sinStock}</p>
          <p>Bajo stock: {bajoStock}</p>
        </section>
      </div>
    </div>
  </div>
);
}