import React, { useEffect, useState } from "react";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import "../css/TablaProductos.css";

// Componente Popup para agregar stock
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
        <h3>Agregar stock a: {producto.descripcion}</h3>
        <input
          type="number"
          placeholder="Cantidad"
          value={cantidad}
          onChange={e => setCantidad(e.target.value)}
        />
        <div className="popup-buttons">
          <button onClick={handleSubmit} className="btn-confirm">Guardar</button>
          <button onClick={onClose} className="btn-cancel">Cancelar</button>
        </div>
      </div>
    </div>
  );
}

const TablaProductos = () => {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/producto/")
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  const abrirPopup = (producto) => {
    setProductoSeleccionado(producto);
  };

  const cerrarPopup = () => {
    setProductoSeleccionado(null);
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
      .then(res => res.json())
      .then(() => {
        setProductos(prev =>
          prev.map(p => (p.id === id ? { ...p, stock: nuevoStock } : p))
        );
        cerrarPopup();
      })
      .catch(err => console.error("Error actualizando stock:", err));
  };

  return (
    <div className="tabla-container">
      <h2 className="tabla-titulo">Lista de Productos</h2>
      <table className="tabla-productos">
        <thead>
          <tr>
            <th>ID</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Sucursal</th>
            <th>Categoría</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.descripcion}</td>
              <td>{p.precio}</td>
              <td>{p.stock}</td>
              <td>{p.sucursal ? `${p.sucursal.localidad} - ${p.sucursal.direccion}` : ''}</td>
              <td>{p.categoria ? p.categoria.descripcion : ''}</td>
              <td>
                <button className="btn-delete"><FaTrash /></button>
                <button className="btn-edit"><FaEdit /></button>
                <button className="btn-add" onClick={() => abrirPopup(p)}><FaPlus /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {productoSeleccionado && (
        <AddStock
          producto={productoSeleccionado}
          onClose={cerrarPopup}
          onGuardar={guardarStock}
        />
      )}
    </div>
  );
};

export default TablaProductos;
