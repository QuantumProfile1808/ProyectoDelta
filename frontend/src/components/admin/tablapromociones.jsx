import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import "../css/Tabla.css";
import { useResponsiveItemsPerPage } from "../hooks/useResponsiveItemsPerPagePromociones";

export const ListaPromociones = () => {
  const [todas, setTodas] = useState([]);

  // Filtros
  const [searchPromoTipo, setSearchPromoTipo] = useState("");
  const [searchProducto, setSearchProducto] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = useResponsiveItemsPerPage();
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
  }, [cargarPromociones]);

  const tiposPromocion = ["PORCENTAJE", "PRECIO_FIJO", "CANTIDAD", "MAYORISTA"];

  // Productos únicos (para filtro)
  const productosUnicos = useMemo(() => {
    const fromItems = todas.flatMap((d) =>
      Array.isArray(d.items)
        ? d.items.map((i) => i.descripcion).filter(Boolean)
        : []
    );
    const fromProductos = todas.flatMap((d) =>
      Array.isArray(d.productos)
        ? d.productos.map((p) =>
            typeof p === "string"
              ? p
              : p?.descripcion || p?.nombre || String(p?.id || "")
          )
        : []
    );
    return [...new Set([...fromItems, ...fromProductos])]
      .filter(Boolean)
      .sort();
  }, [todas]);

  const descuentosFiltrados = useMemo(() => {
    return todas
      .filter((d) => (searchPromoTipo ? d.tipo === searchPromoTipo : true))
      .filter((d) => {
        if (!searchProducto) return true;

        const matchItems =
          Array.isArray(d.items) &&
          d.items.some((i) => i.descripcion === searchProducto);

        const matchProductos =
          Array.isArray(d.productos) &&
          d.productos.some((p) => {
            if (typeof p === "string") return p === searchProducto;
            if (typeof p === "object" && p !== null) {
              return (
                p.descripcion === searchProducto ||
                p.nombre === searchProducto ||
                String(p.id) === searchProducto
              );
            }
            return false;
          });

        return matchItems || matchProductos;
      });
  }, [todas, searchPromoTipo, searchProducto]);

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const descuentosPaginados = descuentosFiltrados.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(descuentosFiltrados.length / itemsPerPage) || 1;

  const toggleActivo = async (id, curr) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/descuento/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !curr }),
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

      {/* Filtros */}
      <div className="search-container">
        <select
          className="search-select"
          value={searchPromoTipo}
          onChange={(e) => {
            setSearchPromoTipo(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Todos los tipos</option>
          {tiposPromocion.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>

        <select
          className="search-select"
          value={searchProducto}
          onChange={(e) => {
            setSearchProducto(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Todos los productos</option>
          {productosUnicos.map((prod) => (
            <option key={prod} value={prod}>
              {prod}
            </option>
          ))}
        </select>
      </div>

      {/* Paginación */}
      <div className="pagination">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </button>
      </div>

      {/* Tabla */}
      <table className="historial-tabla">
        <thead className="historial-tabla-encabezado">
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Etiqueta</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {descuentosPaginados.map((d) => (
            <tr key={d.id} className="historial-fila">
              <td
                className="historial-celda"
                onClick={() => navigate(`/dashboard/promociones/${d.id}`)}
              >
                {d.nombre}
              </td>

              <td
                className="historial-celda"
                onClick={() => navigate(`/dashboard/promociones/${d.id}`)}
              >
                {d.tipo}
              </td>

              <td className="historial-celda-estado">
                <label className="switch" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={d.activo}
                    onChange={() => toggleActivo(d.id, d.activo)}
                  />
                  <span className="slider round"></span>
                </label>
              </td>

              <td className="historial-celda">
                <span style={{ color: d.activo ? "green" : "red" }}>
                  {d.activo ? "Activa" : "Inactiva"}
                </span>
              </td>

              <td className="historial-celda-acciones">
                <button
                  className="btn-editar"
                  onClick={() => navigate(`/dashboard/promociones/${d.id}`)}
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Botón flotante */}
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
