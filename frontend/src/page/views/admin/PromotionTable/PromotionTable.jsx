import "./PromotionTable.css";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";

import { useResponsiveItemsPerPage } from "../../../hooks/usePromotionPageSize";

export const PromotionList = () => {
  const [allItems, setAllItems] = useState([]);

  // Filters
  const [searchPromotionType, setSearchPromotionType] = useState("");
  const [searchProduct, setSearchProduct] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = useResponsiveItemsPerPage();
  const navigate = useNavigate();

  const loadPromotions = useCallback(async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/descuento/");
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results || [];
      setAllItems(list);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to load promotions:", err);
    }
  }, []);

  useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

  const promotionTypes = ["PORCENTAJE", "PRECIO_FIJO", "CANTIDAD", "MAYORISTA"];

  // Unique products for filtering
  const uniqueProducts = useMemo(() => {
    const fromItems = allItems.flatMap((d) =>
      Array.isArray(d.items)
        ? d.items.map((i) => i.descripcion).filter(Boolean)
        : []
    );
    const fromProducts = allItems.flatMap((d) =>
      Array.isArray(d.productos)
        ? d.productos.map((p) =>
            typeof p === "string"
              ? p
              : p?.descripcion || p?.nombre || String(p?.id || "")
          )
        : []
    );
    return [...new Set([...fromItems, ...fromProducts])]
      .filter(Boolean)
      .sort();
  }, [allItems]);

  const filteredDiscounts = useMemo(() => {
    return allItems
      .filter((d) => (searchPromotionType ? d.tipo === searchPromotionType : true))
      .filter((d) => {
        if (!searchProduct) return true;

        const matchesItems =
          Array.isArray(d.items) &&
          d.items.some((i) => i.descripcion === searchProduct);

        const matchesProducts =
          Array.isArray(d.productos) &&
          d.productos.some((p) => {
            if (typeof p === "string") return p === searchProduct;
            if (typeof p === "object" && p !== null) {
              return (
                p.descripcion === searchProduct ||
                p.nombre === searchProduct ||
                String(p.id) === searchProduct
              );
            }
            return false;
          });

        return matchesItems || matchesProducts;
      });
  }, [allItems, searchPromotionType, searchProduct]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedDiscounts = filteredDiscounts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredDiscounts.length / itemsPerPage) || 1;

  const toggleActive = async (id, curr) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/descuento/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !curr }),
      });
      if (!res.ok) throw new Error("Error al actualizar estado");
      await loadPromotions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>Promociones</h2>
      </div>

      {/* Filters */}
      <div className="search-container">
        <select
          className="search-select"
          value={searchPromotionType}
          onChange={(e) => {
            setSearchPromotionType(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Todos los tipos</option>
          {promotionTypes.map((movementType) => (
            <option key={movementType} value={movementType}>
              {movementType}
            </option>
          ))}
        </select>

        <select
          className="search-select"
          value={searchProduct}
          onChange={(e) => {
            setSearchProduct(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Todos los productos</option>
          {uniqueProducts.map((prod) => (
            <option key={prod} value={prod}>
              {prod}
            </option>
          ))}
        </select>
      </div>

      {/* Pagination */}
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

      {/* Table */}
      <table className="history-table">
        <thead className="history-table-encabezado">
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Etiqueta</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginatedDiscounts.map((d) => (
            <tr key={d.id} className="history-row">
              <td
                className="history-cell"
                onClick={() => navigate(`/dashboard/promociones/${d.id}`)}
              >
                {d.nombre}
              </td>

              <td
                className="history-cell"
                onClick={() => navigate(`/dashboard/promociones/${d.id}`)}
              >
                {d.tipo}
              </td>

              <td className="history-cell-status">
                <label className="switch" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={d.activo}
                    onChange={() => toggleActive(d.id, d.activo)}
                  />
                  <span className="slider round"></span>
                </label>
              </td>

              <td className="history-cell">
                <span style={{ color: d.activo ? "green" : "red" }}>
                  {d.activo ? "Activa" : "Inactiva"}
                </span>
              </td>

              <td className="history-cell-actions">
                <button
                  className="btn-edit"
                  onClick={() => navigate(`/dashboard/promociones/${d.id}`)}
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Floating button */}
      <button
        className="button-floating"
        onClick={() => navigate("/dashboard/promociones")}
        title="Agregar nueva promoción"
      >
        <FaPlus size={20} />
      </button>
    </div>
  );
};

export default PromotionList;
