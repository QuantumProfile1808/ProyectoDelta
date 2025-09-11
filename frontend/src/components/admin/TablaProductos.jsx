// TablaProductos.jsx
import React, { useEffect, useState, useCallback } from "react";
import { FaCheck, FaEdit, FaMinus, FaPlus, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../css/TablaProductos.css";
import EditProductModal from "./EditProductModal";
import { useSucursales } from "../hooks/useSucursales";
import { useCategorias } from "../hooks/useCategorias";

function AddStock({ producto, onClose, onGuardar }) {
  const [cantidad, setCantidad] = useState("");
  if (!producto) return null;

  const handleSubmit = () => {
    const nuevoStock = parseInt(cantidad, 10);
    if (!isNaN(nuevoStock)) {
      onGuardar(nuevoStock);
      setCantidad("");
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <h3>Agregar stock a {producto.descripcion}</h3>
        <input
          type="number"
          placeholder="Cantidad"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
        />
        <div className="popup-buttons">
          <button onClick={onClose} className="btn-cancel" title="Cancelar">
            <FaTimes />
          </button>
          <button onClick={handleSubmit} className="btn-confirm" title="Confirmar">
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
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const sucursal = useSucursales();
  const categoria = useCategorias();
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  // Filtros
  const [filtroId, setFiltroId] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const reloadProductos = useCallback(async () => {
    const url = mostrarInactivos
      ? "http://127.0.0.1:8000/api/producto/inactivos/"
      : "http://127.0.0.1:8000/api/producto/";
    const res = await fetch(url);
    const data = await res.json();
    setProductos(data);
    setCurrentPage(1);
  }, [mostrarInactivos]);

  useEffect(() => {
    reloadProductos();
  }, [reloadProductos]);

  const abrirPopup = (producto) => setProductoSeleccionado(producto);
  const cerrarPopup = () => setProductoSeleccionado(null);

  const desactivarProducto = (id) => {
    fetch(`http://127.0.0.1:8000/api/producto/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: false }),
    })
      .then((res) => res.ok && res.json())
      .then(() => reloadProductos())
      .catch((err) => console.error("Error desactivando producto:", err));
  };

  const reactivarProducto = (id) => {
    fetch(`http://127.0.0.1:8000/api/producto/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: true }),
    })
      .then((res) => res.ok && res.json())
      .then(() => reloadProductos())
      .catch((err) => console.error("Error reactivando producto:", err));
  };

  const guardarStock = async (cantidad) => {
    const id = productoSeleccionado.id;
    const nuevoStock = productoSeleccionado.stock + cantidad;

    try {
      await fetch(`http://127.0.0.1:8000/api/producto/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: nuevoStock }),
      });

      await fetch(`http://127.0.0.1:8000/api/movimiento/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          producto: id,
          usuario: 1,
          tipo_de_movimiento: "entrada",
          cantidad,
          descripcion: `Ingreso de stock para ${productoSeleccionado.descripcion}`,
          fecha: new Date().toISOString().split("T")[0],
          hora: new Date().toLocaleTimeString("es-AR", { hour12: false }),
        }),
      });

      reloadProductos();
      cerrarPopup();
    } catch (err) {
      console.error("Error actualizando stock o creando movimiento:", err);
    }
  };

  const openEditModal = (producto) => {
    setProductoEditando(producto);
    setFormValues({
      descripcion: producto.descripcion || "",
      precio: parseFloat(producto.precio) || "",
      stock: parseInt(producto.stock, 10) || 0,
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
      stock: parseInt(formValues.stock, 10),
      sucursal: parseInt(formValues.sucursal, 10),
      categoria: parseInt(formValues.categoria, 10),
    };

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/producto/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al editar producto");

      await reloadProductos();
      setShowEditModal(false);
      setProductoEditando(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Filtrado combinado
  const productosFiltrados = productos.filter((p) => {
    const matchId = filtroId ? p.id.toString().includes(filtroId) : true;
    const matchNombre = filtroNombre
      ? p.descripcion?.toLowerCase().includes(filtroNombre.toLowerCase())
      : true;
    const matchCategoria = filtroCategoria
      ? p.categoria === parseInt(filtroCategoria, 10)
      : true;
    return matchId && matchNombre && matchCategoria;
  });

  // Paginación sobre filtrados
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const productosPaginados = productosFiltrados.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.max(1, Math.ceil(productosFiltrados.length / itemsPerPage));

  return (
    <div className="tabla-container">
      <button
        onClick={() => setMostrarInactivos(!mostrarInactivos)}
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
              <td>{p.stock}</td>
              <td>
                {sucursal.find((s) => s.id === p.sucursal)?.localidad} -{" "}
                {sucursal.find((s) => s.id === p.sucursal)?.direccion}
              </td>
              <td>{categoria.find((c) => c.id === p.categoria)?.descripcion}</td>
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

      <Link to="/dashboard/productos" className="fab-boton" title="Nuevo producto">
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
