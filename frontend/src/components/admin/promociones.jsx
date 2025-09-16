import { useState, useEffect } from "react";
import Select from "react-select";
import "../css/Promociones.css";
import "../css/inputs.css";
import useProductosDisponibles from "../hooks/useProductosDisponibles";

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

  const { productosDisponibles, loadingProductos, errorProductos } = useProductosDisponibles();
  const [loading, setLoading] = useState(false);
  const [errorForm, setErrorForm] = useState(null);

  const validarFormulario = () => {
    if (!form.nombre.trim()) return "El nombre es obligatorio.";

    if (form.tipo === "PORCENTAJE" && !form.porcentaje)
      return "Debes ingresar un porcentaje.";

    if (form.tipo === "PRECIO_FIJO") {
      if (!form.precio_fijo) return "Debes ingresar un precio fijo.";
      if (form.productos.length < 2)
        return "Un combo de precio fijo debe tener al menos 2 productos.";
    }

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
    if (error) {
      setErrorForm(error);
      return;
    }

    setLoading(true);
    setErrorForm(null);

    const payload = {
      ...form,
      porcentaje: form.porcentaje || null,
      precio_fijo: form.precio_fijo || null,
      cantidad_requerida: form.cantidad_requerida || null,
      cantidad_pagada: form.cantidad_pagada || null,
      productos:
        form.tipo === "PRECIO_FIJO"
          ? form.productos.map((p) => ({
              id: p.value,
              cantidad: p.cantidad || 1,
            }))
          : form.productos.map((p) => ({
              id: p.value,
            })),
    };

    const res = await fetch("http://127.0.0.1:8000/api/descuento/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      setErrorForm(
        errorData?.detail || "Error al crear el descuento. Verificá los datos."
      );
      setLoading(false);
      return;
    }

    alert("Descuento creado!");
    setLoading(false);
    setForm({
      nombre: "",
      tipo: "PORCENTAJE",
      porcentaje: "",
      precio_fijo: "",
      cantidad_requerida: "",
      cantidad_pagada: "",
      productos: [],
    });
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
        <>
          <input
            name="precio_fijo"
            placeholder="Precio fijo"
            value={form.precio_fijo}
            onChange={(e) =>
              setForm({ ...form, precio_fijo: e.target.value })
            }
          />
          {form.productos.length < 2 && (
            <p style={{ color: "red", fontSize: "0.9em" }}>
              Este tipo de descuento requiere al menos 2 productos para formar un combo.
            </p>
          )}
          {form.productos.length >= 2 && (
            <div className="combo-preview">
              <h4>Combo seleccionado</h4>
              <ul>
                {form.productos.map((p, index) => (
                  <li
                    key={p.value}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    {p.label}
                    <input
                      type="number"
                      min="1"
                      value={p.cantidad}
                      style={{ width: 60 }}
                      onChange={(e) => {
                        const nuevos = [...form.productos];
                        nuevos[index].cantidad =
                          parseInt(e.target.value) || 1;
                        setForm({ ...form, productos: nuevos });
                      }}
                    />
                    <span>unidades</span>
                  </li>
                ))}
              </ul>
              <strong>Precio total: ${form.precio_fijo}</strong>
              <p style={{ fontStyle: "italic", marginTop: 5 }}>
                Total unidades en combo:{" "}
                {form.productos.reduce(
                  (acc, p) => acc + (p.cantidad || 1),
                  0
                )}
              </p>
            </div>
          )}
        </>
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
      <div className="select-wrapper">
        <Select
          isMulti
          options={productosDisponibles}
          value={form.productos}
          onChange={(selected) => {
            const actualizados = selected.map((p) => {
              const existente = form.productos.find(
                (fp) => fp.value === p.value
              );
              return form.tipo === "PRECIO_FIJO"
                ? { ...p, cantidad: existente?.cantidad || 1 }
                : { ...p };
            });
            setForm({ ...form, productos: actualizados });
          }}
          placeholder="Buscar productos..."
          classNamePrefix="react-select"
        />
      </div>

      {errorForm && (
        <p style={{ color: "red", marginTop: 10 }}>{errorForm}</p>
      )}

      <button type="submit" disabled={loading || !!errorForm}>
        {loading ? "Guardando..." : "Guardar descuento"}
      </button>
    </form>
  );
}
