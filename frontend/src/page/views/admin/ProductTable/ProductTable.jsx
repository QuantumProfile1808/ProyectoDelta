import "./ProductTable.css";
// Product table.
import React, { useState } from "react";
import { FaCheck, FaEdit, FaMinus, FaPlus, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";

import EditProductModal from "./components/EditProductModal";
import { useBranches } from "../../../hooks/useBranches";
import { useCategories } from "../../../hooks/useCategories";
import { useResponsiveItemsPerPage } from "../../../hooks/useProductPageSize";
import { useProfile } from "../../../hooks/useProfile";
import { useGetCatalogQuery, useUpdateProductMutation, useCreateMovementMutation } from "../../../../api/bffApi";
import { getErrorMessage } from "../../../../api/client";
import { useAuth } from "../../../../AuthContext";

function AddStock({ product, onClose, onSave }) {
  const [quantity, setQuantity] = useState("");
  if (!product) return null;

  const handleSubmit = () => {
    const normalized = String(quantity).replace(',', '.').trim();
    const numericValue = parseFloat(normalized);

    if (isNaN(numericValue) || numericValue <= 0) {
      alert("Ingrese un número válido");
      return;
    }

    // Unit quantities must be integers.
    if (!product.medida && !Number.isInteger(numericValue)) {
      alert("Este producto solo acepta unidades enteras");
      return;
    }

    onSave(numericValue);
    setQuantity("");
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <h3>Agregar stock a {product.descripcion}</h3>

        <input
          type="number"
          step={product.medida ? "0.001" : "1"}
          min="0"
          placeholder="Cantidad"
          value={quantity}
          onChange={(e) => {
            let v = e.target.value;

            // Normalize comma to dot for decimals
            v = v.replace(',', '.');

            if (!product.medida) {
              // Unit quantities must be integers.
              v = v.replace(/\D+/g, "");
            } else {
              // Allow up to three decimals for kilograms.
              if (!/^\d*\.?\d{0,3}$/.test(v)) return;
            }

            setQuantity(v);
          }}
        />

        <div className="popup-buttons">
          <button onClick={onClose} className="btn-cancel">
            <FaTimes />
          </button>
          <button onClick={handleSubmit} className="btn-confirm">
            <FaCheck />
          </button>
        </div>
      </div>
    </div>
  );
}

const ProductTable = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formValues, setFormValues] = useState({
    descripcion: "",
    precio: "",
    stock: 0,
    sucursal: "",
    categoria: "",
    medida: false,
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const branch = useBranches();
  const category = useCategories();
  const [showInactive, setShowInactive] = useState(false);
  const profile = useProfile();
  const { user } = useAuth();
  // Filters
  const [nameFilter, setNameFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = useResponsiveItemsPerPage();

  const { currentData, isLoading, isFetching, error, refetch } = useGetCatalogQuery(
    { inactivos: showInactive }, { skip: !user }
  );
  const productList = currentData?.productos ?? [];
  const [updateProduct] = useUpdateProductMutation();
  const [createMovement, { isLoading: savingStock }] = useCreateMovementMutation();

  const openPopup = (product) => setSelectedProduct(product);
  const closePopup = () => setSelectedProduct(null);

  const changeStatus = async (id, is_active) => {
    try {
      await updateProduct({ id, is_active }).unwrap();
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };
  const deactivateProduct = (id) => changeStatus(id, false);
  const reactivateProduct = (id) => changeStatus(id, true);

  const saveStock = async (quantity) => {
    if (savingStock) return;
    try {
      await createMovement({
        producto: selectedProduct.id,
        usuario: profile?.user?.id || user?.id,
        tipo_de_movimiento: "entrada",
        cantidad: quantity,
        descripcion: "Ingreso de stock para " + selectedProduct.descripcion,
        fecha: new Date().toISOString().split("T")[0],
        hora: new Date().toLocaleTimeString("es-AR", { hour12: false }),
      }).unwrap();
      closePopup();
      alert("Stock agregado correctamente");
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormValues({
      descripcion: product.descripcion || "",
      precio: parseFloat(product.precio) || "",
      stock: parseFloat(product.stock, 10) || 0,
      medida: product.medida || false,
      sucursal: product.sucursal || "",
      categoria: product.categoria || "",
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const id = editingProduct.id;

    const payload = {
      ...formValues,
      precio: parseFloat(formValues.precio),
      stock: formValues.medida
        ? parseFloat(formValues.stock).toFixed(3)
        : parseInt(formValues.stock, 10),
      sucursal: parseInt(formValues.sucursal, 10),
      categoria: parseInt(formValues.categoria, 10),
    };

    try {
      await updateProduct({ id, ...payload }).unwrap();
      setShowEditModal(false);
      setEditingProduct(null);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  if (isLoading || (isFetching && !currentData)) return <p role="status">Cargando productos...</p>;
  if (error) return <div role="alert">{getErrorMessage(error)} <button onClick={refetch}>Reintentar</button></div>;

  // Combined filters
  const filteredProducts = productList.filter((p) => {
    const matchesName = nameFilter
      ? p.descripcion?.toLowerCase().includes(nameFilter.toLowerCase())
      : true;
    const matchesCategory = categoryFilter
      ? p.categoria === parseInt(categoryFilter, 10)
      : true;
    return matchesName && matchesCategory;
  });

  // Paginate filtered results
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / itemsPerPage)
  );

  return (
    <div className="table-container">
      <button
        onClick={() => { setShowInactive(!showInactive); setCurrentPage(1); }}
        className="btn-toggle"
      >
        {showInactive ? "Mostrar activos" : "Mostrar desactivados"}
      </button>

      <h2 className="table-title">Lista de Productos</h2>

      {/* Filters */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Filtrar por nombre"
          value={nameFilter}
          onChange={(e) => {
            setNameFilter(e.target.value);
            setCurrentPage(1);
          }}
        />
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Todas las categorías</option>
          {category.map((c) => (
            <option key={c.id} value={c.id}>
              {c.descripcion}
            </option>
          ))}
        </select>
      </div>

      {/* Top pagination */}
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

      {/* Table */}
      <table className="table-products">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Sucursal</th>
            <th>Categoría</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginatedProducts.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.descripcion}</td>
              <td>{p.precio}</td>
              <td>{Number(p.stock)}</td>
              <td>
                {branch.find((s) => s.id === p.sucursal)?.localidad} -{" "}
                {branch.find((s) => s.id === p.sucursal)?.direccion}
              </td>
              <td>
                {category.find((c) => c.id === p.categoria)?.descripcion}
              </td>
              <td>
                <div className="actions">
                  {showInactive ? (
                    <button
                      className="btn-reactivar"
                      onClick={() => reactivateProduct(p.id)}
                    >
                      Reactivar
                    </button>
                  ) : (
                    <>
                      <button
                        className="btn-delete"
                        onClick={() => deactivateProduct(p.id)}
                        title="Desactivar"
                      >
                        <FaMinus />
                      </button>
                      <button
                        className="btn-edit"
                        onClick={() => openEditModal(p)}
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-add"
                        onClick={() => openPopup(p)}
                        title="Agregar stock"
                      >
                        <FaPlus />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {paginatedProducts.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "12px" }}>
                Sin resultados
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Link
        to="/dashboard/productos"
        className="fab-button"
        title="Nuevo producto"
      >
        <FaPlus />
      </Link>

      {selectedProduct && (
        <AddStock
          product={selectedProduct}
          onClose={closePopup}
          onSave={saveStock}
        />
      )}

      <EditProductModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditSubmit}
        formValues={formValues}
        onChange={setFormValues}
        sucursal={branch}
        categoria={category}
      />
    </div>
  );
};

export default ProductTable;
