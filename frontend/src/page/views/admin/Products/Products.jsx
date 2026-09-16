import "./Products.css";
import React, { useState } from "react";
import { useCategories } from "../../../hooks/useCategories";
import { useBranches } from "../../../hooks/useBranches";




import { useCreateProductMutation } from "../../../../api/bffApi";
import { getErrorMessage } from "../../../../api/client";

import CreateBranch from "./components/CreateBranch";
import CreateCategory from "./components/CreateCategory";

const Products = () => {
  const [form, setForm] = useState({
    descripcion: "",
    precio: "",
    stock: "",
    sucursal: "",
    categoria: "",
    medida: "",
  });

  const [createProduct, { isLoading, error }] = useCreateProductMutation();
  const branches = useBranches();
  const categories = useCategories();

  const [showBranch, setShowBranch] = useState(false);
  const [showCategory, setShowCategory] = useState(false);

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

    try {
      await createProduct(payload).unwrap();
    } catch {
      return;
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
                {branches.map((s) => (
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
                {categories.map((c) => (
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

          {error && <p role="alert">{getErrorMessage(error)}</p>}
          <div className="admin-form-actions">
            <button type="submit" disabled={isLoading} className="admin-form-btn admin-form-btn--primary">Crear Producto</button>
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
              onClick={() => setShowCategory(true)}
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
              onClick={() => setShowBranch(true)}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {showBranch && (
        <CreateBranch
          onClose={() => setShowBranch(false)}
        />
      )}
      {showCategory && (
        <CreateCategory
          onClose={() => setShowCategory(false)}
        />
      )}
    </div>
  );
};

export default Products;
