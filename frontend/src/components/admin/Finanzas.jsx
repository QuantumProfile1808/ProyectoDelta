import React, { useEffect, useState } from "react";
import "../css/Finanzas.css";
import useFinanzas from "../hooks/useFinanzas";

export const Finanzas = () => {
  const { movimientos, loading } = useFinanzas();
  const [selected, setSelected] = useState(null);
  const [searchDate, setSearchDate] = useState("");
  const movimientosFiltrados = searchDate
    ? movimientos.filter(m => m.fecha === searchDate)
    : movimientos;
  

  return (
    <div className="finanzas-container">
      <h2>Finanzas</h2>
      <div className="search-container">
            <input
              type="date"
              value={searchDate}
              onChange={e => setSearchDate(e.target.value)}
              placeholder="Filtrar por fecha"
            />
      </div>
      {loading ? (
        <p>Cargando movimientos...</p>
      ) : (
        <table className="finanzas-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Tipo</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Método de pago</th>
              <th>Subtotal</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {movimientosFiltrados.map(m => (
              <tr
                key={m.id}
                className={selected?.id === m.id ? "selected-row" : ""}
                onClick={() => setSelected(m)}
                title="Ver detalles">
                <td>{m.fecha}</td>
                <td>{m.hora}</td>
                <td>{m.tipo_de_movimiento}</td>
                <td>{m.producto}</td>
                <td>{m.cantidad}</td>
                <td>{m.metodo_de_pago}</td>
                <td>${Number(m.subtotal).toFixed(2)}</td>
                <td>{m.descripcion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {selected && (
        <div className="finanzas-popup">
          <div className="finanzas-popup-header">
            <strong>Detalles del movimiento</strong>
            <button className="finanzas-popup-close"
            onClick={() => setSelected(null)}
            title="Cerrar">
              &#10006;
            </button>
          </div>
          <div>
            <div>Producto vendido: <b>{selected.producto}</b></div>
            <div>Cantidad vendida: <b>{selected.cantidad}</b></div>
            <div>Precio por unidad: <b>${selected.precio ? Number(selected.precio).toFixed(2) : "-"}</b></div>
            <div>Total de la venta: <b>${selected.subtotal ? Number(selected.subtotal).toFixed(2) : "-"}</b></div>
            <div>Realizada por: <b>{selected.usuario || "-"}</b></div>
            <div>Método de pago: <b>{selected.metodo_de_pago || "-"}</b></div>
            <div>Descripción: <b>{selected.descripcion}</b></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finanzas;