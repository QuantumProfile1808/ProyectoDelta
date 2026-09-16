import "./History.css";
import React, { useState } from "react";

import useHistory from "../../../hooks/useHistory";
import { useResponsiveItemsPerPage } from "../../../hooks/useUserPageSize";

export const History = () => {
  const { movements, loading } = useHistory();
  const [selected, setSelected] = useState(null);
  const [searchDate, setSearchDate] = useState("");
  const [searchType, setSearchType] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = useResponsiveItemsPerPage();

  // Combined filters
  const filteredMovements = movements.filter((m) => {
    const matchesDate = searchDate ? m.fecha === searchDate : true;
    const matchesType = searchType ? m.tipo_de_movimiento === searchType : true;
    const matchesUser = searchUser
      ? m.usuario_nombre === searchUser
      : true;
    return matchesDate && matchesType && matchesUser;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMovements.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);

  // Get unique users
  const uniqueUsers = [
    ...new Set(movements.map((m) => m.usuario_nombre).filter(Boolean)),
  ];

  return (
    <div className="history-container">
      <h2>Historial</h2>

      {/* Filters */}
      <div className="search-container">
        <input
          type="date"
          value={searchDate}
          onChange={(e) => {
            setSearchDate(e.target.value);
            setCurrentPage(1);
          }}
        />
        <select
          value={searchType}
          onChange={(e) => {
            setSearchType(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Todos los tipos</option>
          <option value="entrada">Entrada</option>
          <option value="salida">Salida</option>
        </select>
        <select
          value={searchUser}
          onChange={(e) => {
            setSearchUser(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Todos los usuarios</option>
          {uniqueUsers.map((accountUser) => (
            <option key={accountUser} value={accountUser}>
              {accountUser}
            </option>
          ))}
        </select>
      </div>

      {/* Top pagination */}
      {!loading && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p>Cargando movimientos...</p>
      ) : (
        <div className="history-table-wrapper">
          <table className="history-table">
            <thead className="history-table-encabezado">
              <tr className="history-row-encabezado">
                <th className="history-column">Fecha</th>
                <th className="history-column">Hora</th>
                <th className="history-column">Tipo</th>
                <th className="history-column">Sucursal</th>
                <th className="history-column">Producto</th>
                <th className="history-column">Cantidad</th>
                <th className="history-column">Método de pago</th>
                <th className="history-column">Subtotal</th>
                <th className="history-column">Descripción</th>
              </tr>
            </thead>
            <tbody className="history-table-cuerpo">
              {currentItems.map((m) => (
                <tr
                  key={m.id}
                  className={`history-row ${
                    selected?.id === m.id ? "history-row-selected" : ""
                  }`}
                  onClick={() => setSelected(m)}
                  title="Ver detalles"
                >
                  <td className="history-cell">{m.fecha}</td>
                  <td className="history-cell">{m.hora}</td>
                  <td className="history-cell">{m.tipo_de_movimiento}</td>
                  <td className="history-cell">{m.sucursal ? m.sucursal.localidad : (m.producto && m.producto.sucursal ? m.producto.sucursal.localidad : '')}</td>
                  <td
                    className="history-cell history-product"
                    title={m.producto_nombre}
                  >
                    {m.producto_nombre}
                  </td>
                  <td className="history-cell">{Number(m.cantidad)}</td>
                  <td className="history-cell">{m.metodo_de_pago}</td>
                  <td className="history-cell">
                    {" "}
                    {m.tipo_de_movimiento === "entrada"
                      ? "-"
                      : `$${Number(m.subtotal).toFixed(2)}`}{" "}
                  </td>
                  <td className="history-cell">{m.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pop-up */}
      {selected && (
        <div className="history-overlay" onClick={() => setSelected(null)}>
          <div className="history-popup" onClick={(e) => e.stopPropagation()}>
            <div className="history-popup-header">
              <strong>Detalles del movimiento</strong>
              <button
                className="history-popup-close"
                onClick={() => setSelected(null)}
                title="Cerrar"
              >
                &#10006;
              </button>
            </div>
            <div>
              <div>
                ID del movimiento: <b>{selected.id}</b>
              </div>
              <div>
                Producto vendido: <b>{selected.producto_nombre}</b>
              </div>
              <div>
                Cantidad vendida: <b>{Number(selected.cantidad)}</b>
              </div>
              <div>
                Precio por unidad:{" "}
                <b>
                  {selected.precio_unitario
                    ? `$${Number(selected.precio_unitario).toFixed(2)}`
                    : "-"}
                </b>
              </div>
              {selected.tipo_de_movimiento === "entrada" ? (
                <div>
                  Total de la venta: <b>-</b>
                </div>
              ) : (
                <div>
                  Total de la venta:{" "}
                  <b>
                    {selected.subtotal
                      ? `$${Number(selected.subtotal).toFixed(2)}`
                      : "-"}
                  </b>
                </div>
              )}
              <div>
                Realizada por: <b>{selected.usuario_nombre || "-"}</b>
              </div>
              <div>
                Método de pago: <b>{selected.metodo_de_pago || "-"}</b>
              </div>
              <div>
                Descripción: <b>{selected.descripcion}</b>
              </div>
              {selected.descuentos_aplicados && (
                <div>
                  <div>
                    Descuento aplicado:{" "}
                    <b>{selected.descuentos_aplicados.nombre}</b>
                  </div>
                  <div>
                    Tipo de descuento:{" "}
                    <b>{selected.descuentos_aplicados.tipo}</b>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
