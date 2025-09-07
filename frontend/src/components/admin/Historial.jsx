import React, { useState } from "react";
import "../css/Historial.css";
import useHistorial from "../hooks/useHistorial.jsx";

export const Historial = () => {
  const { movimientos, loading } = useHistorial();
  const [selected, setSelected] = useState(null);
  const [searchDate, setSearchDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // cantidad de filas por página

  const movimientosFiltrados = searchDate
    ? movimientos.filter(m => m.fecha === searchDate)
    : movimientos;

  // Calcular índices para la paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = movimientosFiltrados.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(movimientosFiltrados.length / itemsPerPage);

  return (
    <div className="historial-container">
      <h2>Historial</h2>
      <div className="search-container">
        <input
          type="date"
          value={searchDate}
          onChange={e => {
            setSearchDate(e.target.value);
            setCurrentPage(1); // resetear a la primera página al filtrar
          }}
          placeholder="Filtrar por fecha"
        />
      </div>

      {loading ? (
        <p>Cargando movimientos...</p>
      ) : (
        <>
          <table className="historial-table">
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
              {currentItems.map(m => (
                <tr
                  key={m.id}
                  className={selected?.id === m.id ? "selected-row" : ""}
                  onClick={() => setSelected(m)}
                  title="Ver detalles"
                >
                  <td>{m.fecha}</td>
                  <td>{m.hora}</td>
                  <td>{m.tipo_de_movimiento}</td>
                  <td className="producto-col" title={m.producto_nombre}>
                    {m.producto_nombre}
                  </td>
                  <td>{m.cantidad}</td>
                  <td>{m.metodo_de_pago}</td>
                  <td>${Number(m.subtotal).toFixed(2)}</td>
                  <td>{m.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Controles de paginación */}
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      {selected && (
  <div
    className="historial-overlay"
    onClick={() => setSelected(null)} // cerrar al hacer click afuera
  >
    <div
      className="historial-popup"
      onClick={(e) => e.stopPropagation()} // evita que el click dentro cierre
    >
      <div className="historial-popup-header">
        <strong>Detalles del movimiento</strong>
        <button
          className="historial-popup-close"
          onClick={() => setSelected(null)}
          title="Cerrar"
        >
          &#10006;
        </button>
      </div>
      <div>
        <div>ID del movimiento: <b>{selected.id}</b></div>
        <div>Producto vendido: <b>{selected.producto_nombre}</b></div>
        <div>Cantidad vendida: <b>{selected.cantidad}</b></div>
        <div>Precio por unidad: <b>{selected.precio_unitario ? `$${Number(selected.precio_unitario).toFixed(2)}` : "-"}</b></div>
        <div>Total de la venta: <b>{selected.subtotal ? `$${Number(selected.subtotal).toFixed(2)}` : "-"}</b></div>
        <div>Realizada por: <b>{selected.usuario_nombre || "-"}</b></div>
        <div>Método de pago: <b>{selected.metodo_de_pago || "-"}</b></div>
        <div>Descripción: <b>{selected.descripcion}</b></div>
        {selected.descuentos_aplicados && (
          <div>
            <div>Descuento aplicado: <b>{selected.descuentos_aplicados.nombre}</b></div>
            <div>Tipo de descuento: <b>{selected.descuentos_aplicados.tipo}</b></div>
          </div>
)}
        
      </div>
    </div>
  </div>
)}
    </div>
  );
}
export default Historial;
