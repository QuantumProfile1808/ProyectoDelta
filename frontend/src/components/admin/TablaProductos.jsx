import React, { useEffect, useState } from "react";

const TablaProductos = () => {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/producto/")
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(error => console.error('Error fetching products:', error));
  }, []);

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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablaProductos;

