import React, { useState } from "react";

export default function CreateSucursal({ onClose, onCreated }) {
  const [form, setForm] = useState({ direccion: "", localidad: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/sucursal/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const text = await res.text();
        setError(text || "Error al crear sucursal");
        setLoading(false);
        return;
      }
      setLoading(false);
      onCreated && onCreated();
      onClose && onClose();
    } catch (err) {
      setError(err.message || "Error de red");
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Crear sucursal</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Dirección
            <input name="direccion" value={form.direccion} onChange={handleChange} required />
          </label>
          <label>
            Localidad
            <input name="localidad" value={form.localidad} onChange={handleChange} required />
          </label>

          {error && <div className="modal-error">{String(error)}</div>}

          <div className="modal-actions">
            <button type="button" className="btn secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? "Creando..." : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}