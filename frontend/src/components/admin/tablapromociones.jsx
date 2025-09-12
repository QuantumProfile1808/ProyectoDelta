import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import "../../components/css/promociones.css";
import "../css/Historial.css";

export const ListaPromociones = () => {
  const [todas, setTodas] = useState([]);
  const [selected, setSelected] = useState(null);
  const [mostrarInactivas, setMostrarInactivas] = useState(false);

  // Filtros (combobox) con mismas clases que Historial
  const [searchPromoTipo, setSearchPromoTipo] = useState("");
  const [searchProducto, setSearchProducto] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  const cargarPromociones = useCallback(async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/descuento/");
      const data = await res.json();
      const lista = Array.isArray(data) ? data : data.results || [];
      setTodas(lista);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error cargando promociones:", err);
    }
  }, []);

  useEffect(() => {
    cargarPromociones();
  }, [cargarPromociones, mostrarInactivas]);

  // Tipos y productos únicos para los combobox
  const tiposPromocion = ["PORCENTAJE", "PRECIO_FIJO", "CANTIDAD"];

  const productosUnicos = useMemo(() => {
    const fromItems = todas.flatMap(d =>
      Array.isArray(d.items) ? d.items.map(i => i.descripcion).filter(Boolean) : []
    );
    const fromProductos = todas.flatMap(d =>
      Array.isArray(d.productos)
        ? d.productos.map(p =>
            typeof p === "string"
              ? p
              : typeof p === "object" && p !== null
              ? (p.descripcion || p.nombre || String(p.id || ""))
              : String(p)
          )
        : []
    );
    return [...new Set([...fromItems, ...fromProductos])].filter(Boolean).sort();
  }, [todas]);

  // Aplicación de filtros
  const descuentosFiltrados = useMemo(() => {
    return todas
      .filter(d => (searchPromoTipo ? d.tipo === searchPromoTipo : true))
      .filter(d => {
        if (!searchProducto) return true;
        const matchItems =
          Array.isArray(d.items) &&
          d.items.some(i => i.descripcion === searchProducto);
        const matchProductos =
          Array.isArray(d.productos) &&
          d.productos.some(p => {
            if (typeof p === "string") return p === searchProducto;
            if (typeof p === "object" && p !== null) {
              return (
                p.descripcion === searchProducto ||
                p.nombre === searchProducto ||
                String(p.id) === searchProducto
              );
            }
            return String(p) === searchProducto;
          });
        return matchItems || matchProductos;
      });
  }, [todas, mostrarInactivas, searchPromoTipo, searchProducto]);

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const descuentosPaginados = descuentosFiltrados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(descuentosFiltrados.length / itemsPerPage) || 1;

  const toggleActivo = async (id, curr) => {
    const nuevo = !curr;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/descuento/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: nuevo }),
      });
      if (!res.ok) throw new Error("Error al actualizar estado");
      await cargarPromociones();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="historial-container">
      <div className="historial-header">
        <h2>Promociones</h2>
      </div>

      {/* Filtros con mismas clases que Historial */}
      <div className="search-container">
        <select
          className="search-select"
          value={searchPromoTipo}
          onChange={e => {
            setSearchPromoTipo(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Todos los tipos de promoción</option>
          {tiposPromocion.map(tipo => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>

        <select
          className="search-select"
          value={searchProducto}
          onChange={e => {
            setSearchProducto(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Todos los productos</option>
          {productosUnicos.map(prod => (
            <option key={prod} value={prod}>
              {prod}
            </option>
          ))}
        </select>
      </div>

      {/* Paginación arriba */}
      <div className="pagination">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </button>
      </div>

      <table className="historial-tabla">
        <thead className="historial-tabla-encabezado">
          <tr className="historial-fila-encabezado">
            <th className="historial-columna">Nombre</th>
            <th className="historial-columna">Tipo</th>
            <th className="historial-columna">Estado</th>
            <th className="historial-columna">Etiqueta</th>
          </tr>
        </thead>
        <tbody className="historial-tabla-cuerpo">
          {descuentosPaginados.map(d => (
            <tr
              key={d.id}
              className={`historial-fila ${selected?.id === d.id ? "historial-fila-seleccionada" : ""}`}
            >
              <td className="historial-celda" onClick={() => setSelected(d)} title="Ver detalles">
                {d.nombre}
              </td>
              <td className="historial-celda" onClick={() => setSelected(d)}>
                {d.tipo}
              </td>
              <td className="historial-celda">
                <label className="switch" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={d.activo}
                    onChange={e => {
                      e.stopPropagation();
                      toggleActivo(d.id, d.activo);
                    }}
                  />
                  <span className="slider round"></span>
                </label>
              </td>
              <td className="historial-celda">
                <span
                  style={{ color: d.activo ? "green" : "red", cursor: "pointer" }}
                  onClick={() => setSelected(d)}
                >
                  {d.activo ? "Activa" : "Inactiva"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de detalles */}
      {selected && (
        <div className="historial-overlay" onClick={() => setSelected(null)}>
          <div
            className="historial-popup"
            onClick={e => e.stopPropagation()}
            style={{ transform: "translate(-50%, -52%)" }}
          >
            <div className="historial-popup-header">
              <strong>Detalles de la promoción</strong>
              <button
                className="historial-popup-close"
                onClick={() => setSelected(null)}
                title="Cerrar"
              >
                &#10006;
              </button>
            </div>

            <div className="historial-popup-details">
              <div><b>ID:</b> {selected.id}</div>
              <div><b>Nombre:</b> {selected.nombre}</div>
              <div><b>Tipo:</b> {selected.tipo}</div>

              {selected.tipo === "PORCENTAJE" && (
                <div><b>Porcentaje:</b> {selected.porcentaje ?? "-"}</div>
              )}

              {selected.tipo === "PRECIO_FIJO" && (
                <div><b>Precio fijo:</b> ${selected.precio_fijo ?? "-"}</div>
              )}

              {selected.tipo === "CANTIDAD" && (
                <>
                  <div><b>Promoción:</b> Llevás {selected.cantidad_requerida} y pagás {selected.cantidad_pagada}</div>
                  <div><b>Items incluidos:</b></div>
                  <ul style={{ paddingLeft: "1.2rem", marginBottom: "1rem" }}>
                    {Array.isArray(selected.items) && selected.items.length > 0 ? (
                      selected.items.map(item => (
                        <li key={item.id}>
                          {item.descripcion} (ID producto: {item.producto}, cantidad: {item.cantidad})
                        </li>
                      ))
                    ) : (
                      <li>No hay items asignados</li>
                    )}
                  </ul>
                </>
              )}

              <div>
                <b>Estado:</b>{" "}
                <span style={{ color: selected.activo ? "green" : "red" }}>
                  {selected.activo ? "Activa" : "Inactiva"}
                </span>
              </div>

              <div>
                <b>Productos aplicables:</b>{" "}
                {Array.isArray(selected.productos) && selected.productos.length > 0
                  ? Array.isArray(selected.productos)
                    ? selected.productos
                        .map(p =>
                          typeof p === "string"
                            ? p
                            : typeof p === "object" && p !== null
                            ? (p.descripcion || p.nombre || String(p.id || ""))
                            : String(p)
                        )
                        .join(", ")
                    : "No asignados"
                  : "No asignados"}
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        className="boton-flotante"
        onClick={() => navigate("/dashboard/promociones")}
        title="Agregar nueva promoción"
      >
        <FaPlus size={20} />
      </button>
    </div>
  );
};

export default ListaPromociones;
