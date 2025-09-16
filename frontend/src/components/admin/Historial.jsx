import React, { useState } from "react";
import "../css/Historial.css";
import useHistorial from "../hooks/useHistorial.jsx";
import { useResponsiveItemsPerPage } from "../hooks/useResponsiveItemsPerPageUsuarios.jsx";

export const Historial = () => {
  const { movimientos, loading } = useHistorial();
  const [selected, setSelected] = useState(null);
  const [searchDate, setSearchDate] = useState("");
  const [searchTipo, setSearchTipo] = useState("");
  const [searchUsuario, setSearchUsuario] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = useResponsiveItemsPerPage();

  // Filtrado combinado
  const movimientosFiltrados = movimientos.filter(m => {
    const matchFecha = searchDate ? m.fecha === searchDate : true;
    const matchTipo = searchTipo ? m.tipo_de_movimiento === searchTipo : true;
    const matchUsuario = searchUsuario ? m.usuario_nombre === searchUsuario : true;
    return matchFecha && matchTipo && matchUsuario;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = movimientosFiltrados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(movimientosFiltrados.length / itemsPerPage);

  // Obtener lista única de usuarios
  const usuariosUnicos = [...new Set(movimientos.map(m => m.usuario_nombre).filter(Boolean))];

  return (
    <div className="historial-container">
      <h2>Historial</h2>

      {/* Filtros */}
      <div className="search-container">
        <input
          type="date"
          value={searchDate}
          onChange={e => {
            setSearchDate(e.target.value);
            setCurrentPage(1);
          }}
        />
        <select
          value={searchTipo}
          onChange={e => {
            setSearchTipo(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Todos los tipos</option>
          <option value="entrada">Entrada</option>
          <option value="salida">Salida</option>
        </select>
        <select
          value={searchUsuario}
          onChange={e => {
            setSearchUsuario(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Todos los usuarios</option>
          {usuariosUnicos.map(usuario => (
            <option key={usuario} value={usuario}>{usuario}</option>
          ))}
        </select>
      </div>

      {/* Paginación arriba */}
      {!loading && (
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
      )}

      {/* Tabla */}
      {loading ? (
        <p>Cargando movimientos...</p>
      ) : (
        <div className="historial-tabla-wrapper">
          <table className="historial-tabla">
            <thead className="historial-tabla-encabezado">
              <tr className="historial-fila-encabezado">
                <th className="historial-columna">Fecha</th>
                <th className="historial-columna">Hora</th>
                <th className="historial-columna">Tipo</th>
                <th className="historial-columna">Producto</th>
                <th className="historial-columna">Cantidad</th>
                <th className="historial-columna">Método de pago</th>
                <th className="historial-columna">Subtotal</th>
                <th className="historial-columna">Descripción</th>
              </tr>
            </thead>
            <tbody className="historial-tabla-cuerpo">
              {currentItems.map(m => (
                <tr
                  key={m.id}
                  className={`historial-fila ${selected?.id === m.id ? "historial-fila-seleccionada" : ""}`}
                  onClick={() => setSelected(m)}
                  title="Ver detalles"
                >
                  <td className="historial-celda">{m.fecha}</td>
                  <td className="historial-celda">{m.hora}</td>
                  <td className="historial-celda">{m.tipo_de_movimiento}</td>
                  <td className="historial-celda historial-producto" title={m.producto_nombre}>
                    {m.producto_nombre}
                  </td>
                  <td className="historial-celda">{m.cantidad}</td>
                  <td className="historial-celda">{m.metodo_de_pago}</td>
                  <td className="historial-celda"> {m.tipo_de_movimiento === "entrada" ? "-" : `$${Number(m.subtotal).toFixed(2)}`} </td>
                  <td className="historial-celda">{m.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pop-up */}
      {selected && (
        <div className="historial-overlay" onClick={() => setSelected(null)}>
          <div className="historial-popup" onClick={e => e.stopPropagation()}>
            <div className="historial-popup-header">
              <strong>Detalles del movimiento</strong>
              <button className="historial-popup-close" onClick={() => setSelected(null)} title="Cerrar">
                &#10006;
              </button>
            </div>
            <div>
              <div>ID del movimiento: <b>{selected.id}</b></div>
              <div>Producto vendido: <b>{selected.producto_nombre}</b></div>
              <div>Cantidad vendida: <b>{selected.cantidad}</b></div>
              <div>Precio por unidad: <b>{selected.precio_unitario ? `$${Number(selected.precio_unitario).toFixed(2)}` : "-"}</b></div>
              {selected.tipo_de_movimiento === "entrada" ? (
                  <div>Total de la venta: <b>-</b></div>
                ) : (
                  <div>Total de la venta: <b>{selected.subtotal ? `$${Number(selected.subtotal).toFixed(2)}` : "-"}</b></div>
                )}
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
};

export default Historial;
