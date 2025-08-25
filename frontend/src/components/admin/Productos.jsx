import React, { useState } from "react";
import { useCategorias } from "../hooks/useCategorias";
import { useSucursales } from "../hooks/useSucursales";

const Productos = () => {
  const [form, setForm] = useState({
      descripcion: "",
      precio: "",
      stock: "",
      sucursal: "",
      categoria: "",
      medicion: "",
  });
const sucursales= useSucursales();
const categorias = useCategorias();
const [loading, setLoading] = useState(false);

const handleChange = e => {
  const { name, value, type, checked } = e.target;
  setForm({ ...form, [name]: type === "checkbox" ? checked : value });
};

const handleSubmit = async e => {
  e.preventDefault();
  setLoading(true);

  const productRes = await fetch("http://127.0.0.1:8000/api/producto/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      {
        descripcion: form.descripcion,
        precio: form.precio,
        stock: form.stock,
        sucursal: form.sucursal,
        categoria: form.categoria,
        medicion: form.medicion,
      }
    ),
  });

  if (!productRes.ok) {
    throw new Error("Failed to create product");
  }

  const productData = await productRes.json();

  setForm({
    descripcion: "",
    precio: "",
    stock: "",
    sucursal: "",
    categoria: "",
    medicion: "",
  });

  setLoading(false);
};

  return (
    <div>
      <h1>Productos</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={handleChange}
        />
        <input
          type="number"
          name="precio"
          placeholder="Precio"
          value={form.precio}
          onChange={handleChange}
        />
        <input
          type="number"
          name="stock"
          placeholder="Stock"
          value={form.stock}
          onChange={handleChange}
        />
        <select
          name="sucursal"
          value={form.sucursal}
          onChange={handleChange}
        >
          <option value="">Seleccione una sucursal</option>
          {sucursales.map(s => (
            <option key={s.id} value={s.id}>
              {s.localidad} - {s.direccion}
            </option>
          ))}
        </select>
        <select
          name="categoria"
          value={form.categoria}
          onChange={handleChange}
        >
          <option value="">Seleccione una categoría</option>
          {categorias.map(c => (
            <option key={c.id} value={c.id}>
              {c.descripcion}
            </option>
          ))}
        </select>
        <select
          name="medicion"
          value={form.medicion}
          onChange={handleChange}
        >
          <option value="">Seleccione un tipo de medición</option>
          <option value="false">Unidad</option>
          <option value="true">KG</option>
        </select>
        <button type="submit">Crear Producto</button>
      </form>
    </div>
  );
};
  
export default Productos;