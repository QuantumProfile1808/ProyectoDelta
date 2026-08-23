import React, { useState } from "react";
import { useCategorias } from "../hooks/useCategorias";
import { useSucursales } from "../hooks/useSucursales";
import "../../components/css/Usuario.css";
import "../css/fab.css";
import "../css/adminForms.css";

import CreateSucursal from "./CreateSucursal";
import CreateCategoria from "./CreateCategoria";

const Productos = () => {
  const [form, setForm] = useState({
    descripcion: "",
    precio: "",
    stock: "",
    sucursal: "",
    categoria: "",
    medida: "",
  });

  const sucursales = useSucursales();
  const categorias = useCategorias();

  const [showSucursal, setShowSucursal] = useState(false);
  const [showCategoria, setShowCategoria] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      descripcion: form.descripcion,
      precio: form.precio,
      stock: form.stock,
      sucursal: form.sucursal,
      categoria: form.categoria,
      medida: form.medida === "true",
    };

    const productRes = await fetch("http://127.0.0.1:8000/api/producto/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!productRes.ok) {
      throw new Error("Failed to create product");
    }

    setForm({
      descripcion: "",
      precio: "",
      stock: "",
      sucursal: "",
      categoria: "",
      medida: "",
    });
  };

  const handleCreated = () => {
    window.location.reload();
  };

  return (
    <div>
      <h1>Productos</h1>
      <div className="admin-form-card">
        <h3 className="admin-form-title">Crear producto</h3>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-grid">
            <div className="admin-form-field">
              <label>Descripción</label>
              <input
                type="text"
                name="descripcion"
                placeholder="Descripción"
                value={form.descripcion}
                onChange={handleChange}
              />
            </div>
            <div className="admin-form-field">
              <label>Precio</label>
              <input
                type="number"
                name="precio"
                placeholder="Precio"
                value={form.precio}
                onChange={handleChange}
              />
            </div>
            <div className="admin-form-field">
              <label>Stock</label>
              <input
                type="number"
                name="stock"
                placeholder="Stock"
                value={form.stock}
                onChange={handleChange}
              />
            </div>
            <div className="admin-form-field">
              <label>Sucursal</label>
              <select
                name="sucursal"
                value={form.sucursal}
                onChange={handleChange}
              >
                <option value="">Seleccione una sucursal</option>
                {sucursales.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.localidad} - {s.direccion}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-form-field">
              <label>Categoría</label>
              <select
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
              >
                <option value="">Seleccione una categoría</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.descripcion}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-form-field">
              <label>Medida</label>
              <select
                name="medida"
                value={form.medida}
                onChange={handleChange}
              >
                <option value="">Seleccione un tipo de medición</option>
                <option value="false">Unidad</option>
                <option value="true">KG</option>
              </select>
            </div>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="admin-form-btn admin-form-btn--primary">Crear Producto</button>
          </div>
        </form>
      </div>

      {/* FABs */}
      <div className="fab-container" aria-hidden={false}>
        <div className="fab-row">
          <div style={{ display: "flex", alignItems: "center" }}>
            <span className="fab-label">Nueva categoría</span>
            <button
              className="fab"
              title="Crear categoría"
              onClick={() => setShowCategoria(true)}
            >
              +
            </button>
          </div>
        </div>

        <div className="fab-row">
          <div style={{ display: "flex", alignItems: "center" }}>
            <span className="fab-label">Nueva sucursal</span>
            <button
              className="fab small"
              title="Crear sucursal"
              onClick={() => setShowSucursal(true)}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {showSucursal && (
        <CreateSucursal
          onClose={() => setShowSucursal(false)}
          onCreated={handleCreated}
        />
      )}
      {showCategoria && (
        <CreateCategoria
          onClose={() => setShowCategoria(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
};

export default Productos;
