import { useState, useEffect } from "react";
import Select from "react-select";
import "../css/Promociones.css";


export default function promociones() {
  const [form, setForm] = useState({
    nombre: "",
    tipo: "PORCENTAJE",
    porcentaje: "",
    precio_fijo: "",
    cantidad_requerida: "",
    cantidad_pagada: "",
    productos: [],
  });

  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  fetch("http://127.0.0.1:8000/api/producto/")
    .then((res) => res.json())
    .then((data) => {
      console.log("Respuesta del backend:", data);
      const productos = Array.isArray(data) ? data : data.results || [];
      const options = productos.map((p) => ({
        value: p.id,
        label: p.descripcion || ` ${p.id}`,
      }));
      setProductosDisponibles(options);
    });
}, []);

  const validarFormulario = () => {
    if (!form.nombre.trim()) return "El nombre es obligatorio.";

    if (form.tipo === "PORCENTAJE" && !form.porcentaje)
      return "Debes ingresar un porcentaje.";

    if (form.tipo === "PRECIO_FIJO" && !form.precio_fijo)
      return "Debes ingresar un precio fijo.";

    if (
      form.tipo === "CANTIDAD" &&
      (!form.cantidad_requerida || !form.cantidad_pagada)
    )
      return "Debes ingresar cantidades requeridas y pagadas.";

    if (form.productos.length === 0)
      return "Seleccioná al menos un producto.";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validarFormulario();
    if (error) return alert(error);

    setLoading(true);
    const payload = {
      ...form,
      productos: form.productos.map((p) => p.value),
    };

    await fetch("http://127.0.0.1:8000/api/descuento/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    alert("Descuento creado!");
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: "auto" }}>
      <h2>Crear nuevo descuento</h2>

      <input
        name="nombre"
        placeholder="Nombre del descuento"
        value={form.nombre}
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
      />

      <select
        name="tipo"
        value={form.tipo}
        onChange={(e) => setForm({ ...form, tipo: e.target.value })}
      >
        <option value="PORCENTAJE">Porcentaje</option>
        <option value="PRECIO_FIJO">Precio fijo</option>
        <option value="CANTIDAD">2x1 / 3x2</option>
      </select>

      {form.tipo === "PORCENTAJE" && (
        <input
          name="porcentaje"
          placeholder="% descuento"
          value={form.porcentaje}
          onChange={(e) => setForm({ ...form, porcentaje: e.target.value })}
        />
      )}

      {form.tipo === "PRECIO_FIJO" && (
        <input
          name="precio_fijo"
          placeholder="Precio fijo"
          value={form.precio_fijo}
          onChange={(e) => setForm({ ...form, precio_fijo: e.target.value })}
        />
      )}

      {form.tipo === "CANTIDAD" && (
        <>
          <input
            name="cantidad_requerida"
            placeholder="Cantidad requerida"
            value={form.cantidad_requerida}
            onChange={(e) =>
              setForm({ ...form, cantidad_requerida: e.target.value })
            }
          />
          <input
            name="cantidad_pagada"
            placeholder="Cantidad pagada"
            value={form.cantidad_pagada}
            onChange={(e) =>
              setForm({ ...form, cantidad_pagada: e.target.value })
            }
          />
        </>
      )}

      <label style={{ marginTop: 10 }}>Productos aplicables:</label>
      <Select
        isMulti
        options={productosDisponibles}
        value={form.productos}
        onChange={(selected) => setForm({ ...form, productos: selected })}
        placeholder="Buscar productos..."
      />

      <button type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Guardar descuento"}
      </button>
    </form>
  );
}
