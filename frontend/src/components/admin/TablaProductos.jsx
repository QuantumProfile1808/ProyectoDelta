// TablaProductos.jsx
import React, { useState } from "react";
import { FaCheck, FaEdit, FaMinus, FaPlus, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../css/Tabla.css";
import EditProductModal from "./EditProductModal";
import { useSucursales } from "../hooks/useSucursales";
import { useCategorias } from "../hooks/useCategorias";
import { useResponsiveItemsPerPage } from "../hooks/useResponsiveItemsPerPageProductos";
import { usePerfil } from "../hooks/usePerfil";
import { useGetCatalogQuery, useUpdateProductMutation, useCreateMovementMutation } from "../../api/bffApi";
import { getErrorMessage } from "../../api/client";
import { useAuth } from "../../AuthContext";

function AddStock({ producto, onClose, onGuardar }) {
  const [cantidad, setCantidad] = useState("");
  if (!producto) return null;

  const handleSubmit = () => {
    const normalized = String(cantidad).replace(',', '.').trim();
    const valor = parseFloat(normalized);

    if (isNaN(valor) || valor <= 0) {
      alert("Ingrese un número válido");
      return;
    }

    // UNIDAD → SOLO ENTEROS
    if (!producto.medida && !Number.isInteger(valor)) {
      alert("Este producto solo acepta unidades enteras");
      return;
    }

    onGuardar(valor);
    setCantidad("");
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <h3>Agregar stock a {producto.descripcion}</h3>

        <input
          type="number"
          step={producto.medida ? "0.001" : "1"}
          min="0"
          placeholder="Cantidad"
          value={cantidad}
          onChange={(e) => {
            let v = e.target.value;

            // Normalize comma to dot for decimals
            v = v.replace(',', '.');

            if (!producto.medida) {
              // UNIDAD → SOLO ENTEROS
              v = v.replace(/\D+/g, "");
            } else {
              // KG → allow up to 3 decimals
              if (!/^\d*\.?\d{0,3}$/.test(v)) return;
            }

            setCantidad(v);
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

const TablaProductos = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [formValues, setFormValues] = useState({
    descripcion: "",
    precio: "",
    stock: 0,
    sucursal: "",
    categoria: "",
    medida: false,
  });
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const sucursal = useSucursales();
  const categoria = useCategorias();
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const perfil = usePerfil();
  const { user } = useAuth();
  // Filtros
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = useResponsiveItemsPerPage();

  const { currentData, isLoading, isFetching, error, refetch } = useGetCatalogQuery(
    { inactivos: mostrarInactivos }, { skip: !user }
  );
  const productos = currentData?.productos ?? [];
  const [updateProduct] = useUpdateProductMutation();
  const [createMovement, { isLoading: savingStock }] = useCreateMovementMutation();

  const abrirPopup = (producto) => setProductoSeleccionado(producto);
  const cerrarPopup = () => setProductoSeleccionado(null);

  const cambiarEstado = async (id, is_active) => {
    try {
      await updateProduct({ id, is_active }).unwrap();
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };
  const desactivarProducto = (id) => cambiarEstado(id, false);
  const reactivarProducto = (id) => cambiarEstado(id, true);

  const guardarStock = async (cantidad) => {
    if (savingStock) return;
    try {
      await createMovement({
        producto: productoSeleccionado.id,
        usuario: perfil?.user?.id || user?.id,
        tipo_de_movimiento: "entrada",
        cantidad,
        descripcion: "Ingreso de stock para " + productoSeleccionado.descripcion,
        fecha: new Date().toISOString().split("T")[0],
        hora: new Date().toLocaleTimeString("es-AR", { hour12: false }),
      }).unwrap();
      cerrarPopup();
      alert("Stock agregado correctamente");
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  const openEditModal = (producto) => {
    setProductoEditando(producto);
    setFormValues({
      descripcion: producto.descripcion || "",
      precio: parseFloat(producto.precio) || "",
      stock: parseFloat(producto.stock, 10) || 0,
      medida: producto.medida || false,
      sucursal: producto.sucursal || "",
      categoria: producto.categoria || "",
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const id = productoEditando.id;

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
      setProductoEditando(null);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  if (isLoading || (isFetching && !currentData)) return <p role="status">Cargando productos...</p>;
  if (error) return <div role="alert">{getErrorMessage(error)} <button onClick={refetch}>Reintentar</button></div>;

  // Filtrado combinado
  const productosFiltrados = productos.filter((p) => {
    const matchNombre = filtroNombre
      ? p.descripcion?.toLowerCase().includes(filtroNombre.toLowerCase())
      : true;
    const matchCategoria = filtroCategoria
      ? p.categoria === parseInt(filtroCategoria, 10)
      : true;
    return matchNombre && matchCategoria;
  });

  // Paginación sobre filtrados
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const productosPaginados = productosFiltrados.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.max(
    1,
    Math.ceil(productosFiltrados.length / itemsPerPage)
  );

  return (
    <div className="tabla-container">
      <button
        onClick={() => { setMostrarInactivos(!mostrarInactivos); setCurrentPage(1); }}
        className="btn-toggle"
      >
        {mostrarInactivos ? "Mostrar activos" : "Mostrar desactivados"}
      </button>

      <h2 className="tabla-titulo">Lista de Productos</h2>

      {/* Filtros */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Filtrar por nombre"
          value={filtroNombre}
          onChange={(e) => {
            setFiltroNombre(e.target.value);
            setCurrentPage(1);
          }}
        />
        <select
          value={filtroCategoria}
          onChange={(e) => {
            setFiltroCategoria(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Todas las categorías</option>
          {categoria.map((c) => (
            <option key={c.id} value={c.id}>
              {c.descripcion}
            </option>
          ))}
        </select>
      </div>

      {/* Paginación arriba */}
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

      {/* Tabla */}
      <table className="tabla-productos">
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
          {productosPaginados.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.descripcion}</td>
              <td>{p.precio}</td>
              <td>{Number(p.stock)}</td>
              <td>
                {sucursal.find((s) => s.id === p.sucursal)?.localidad} -{" "}
                {sucursal.find((s) => s.id === p.sucursal)?.direccion}
              </td>
              <td>
                {categoria.find((c) => c.id === p.categoria)?.descripcion}
              </td>
              <td>
                <div className="acciones">
                  {mostrarInactivos ? (
                    <button
                      className="btn-reactivar"
                      onClick={() => reactivarProducto(p.id)}
                    >
                      Reactivar
                    </button>
                  ) : (
                    <>
                      <button
                        className="btn-delete"
                        onClick={() => desactivarProducto(p.id)}
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
                        onClick={() => abrirPopup(p)}
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
          {productosPaginados.length === 0 && (
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
        className="fab-boton"
        title="Nuevo producto"
      >
        <FaPlus />
      </Link>

      {productoSeleccionado && (
        <AddStock
          producto={productoSeleccionado}
          onClose={cerrarPopup}
          onGuardar={guardarStock}
        />
      )}

      <EditProductModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditSubmit}
        formValues={formValues}
        onChange={setFormValues}
        sucursal={sucursal}
        categoria={categoria}
      />
    </div>
  );
};

export default TablaProductos;
