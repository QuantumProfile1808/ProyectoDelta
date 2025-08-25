// TablaProductos.jsx (corregido)
import React, { useEffect, useState } from "react";
import { FaEdit, FaMinus, FaPlus, FaTrash } from "react-icons/fa";
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
          <button onClick={onClose} className="btn-cancel">
            ✕
          </button>
          <button onClick={handleSubmit} className="btn-confirm">
            ✓
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

  const reloadProductos = async () => {
    const url = mostrarInactivos
      ? "http://127.0.0.1:8000/api/producto/inactivos/"
      : "http://127.0.0.1:8000/api/producto/";
    const res = await fetch(url);
    const data = await res.json();
    setProductos(data);
  };

  useEffect(() => {
    reloadProductos();
  }, [mostrarInactivos]);

  const abrirPopup = (producto) => {
    setProductoSeleccionado(producto);
  };

  const cerrarPopup = () => {
    setProductoSeleccionado(null);
  };

  const desactivarProducto = (id) => {
    fetch(`http://127.0.0.1:8000/api/producto/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ is_active: false }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error al actualizar producto");
        }
        return res.json();
      })
      .then(() => {
        reloadProductos();
      })
      .catch((err) => console.error("Error desactivando producto:", err));
  };

  const reactivarProducto = (id) => {
    fetch(`http://127.0.0.1:8000/api/producto/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ is_active: true }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error al reactivar producto");
        }
        return res.json();
      })
      .then(() => {
        reloadProductos();
      })
      .catch((err) => console.error("Error reactivando producto:", err));
  };
  const guardarStock = (cantidad) => {
    const id = productoSeleccionado.id;
    const nuevoStock = productoSeleccionado.stock + cantidad;

    fetch(`http://127.0.0.1:8000/api/producto/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stock: nuevoStock }),
    })
      .then((res) => res.json())
      .then(() => {
        reloadProductos();
        cerrarPopup();
      })
      .catch((err) => console.error("Error actualizando stock:", err));
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
        headers: {
          "Content-Type": "application/json",
        },
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

  return (
    <div className="tabla-container">
      <button
        onClick={() => setMostrarInactivos(!mostrarInactivos)}
        className="btn-toggle"
      >
        {mostrarInactivos ? "Mostrar activos" : "Mostrar desactivados"}
      </button>
      <h2 className="tabla-titulo">Lista de Productos</h2>
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
          {productos.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.descripcion}</td>
              <td>{p.precio}</td>
              <td>{p.stock}</td>
              <td>
                {sucursal.find((s) => s.id === p.sucursal)?.localidad} -{" "}
                {sucursal.find((s) => s.id === p.sucursal)?.direccion}
              </td>
              <td>
                {categoria.find((c) => c.id === p.categoria)?.descripcion}
              </td>
              <td>
                {mostrarInactivos ? (
                  <button className="btn-reactivar" onClick={() => reactivarProducto(p.id)}>Reactivar</button>
                ) : (
                  <>
                    <button className="btn-delete" onClick={() => desactivarProducto(p.id)}><FaMinus /></button>
                    <button className="btn-edit" onClick={() => openEditModal(p)}><FaEdit /></button>
                    <button className="btn-add" onClick={() => abrirPopup(p)}><FaPlus /></button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link to="/dashboard/productos" className="fab-boton">
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
