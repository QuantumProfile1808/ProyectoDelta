import React, { useState } from "react";
import "../css/adminForms.css";

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
        <h3 className="admin-form-title">Crear sucursal</h3>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-grid">
            <div className="admin-form-field">
              <label>Dirección</label>
              <input name="direccion" value={form.direccion} onChange={handleChange} required />
            </div>
            <div className="admin-form-field">
              <label>Localidad</label>
              <input name="localidad" value={form.localidad} onChange={handleChange} required />
            </div>
          </div>

          {error && <div className="admin-form-error">{String(error)}</div>}

          <div className="admin-form-actions">
            <button type="button" className="admin-form-btn admin-form-btn--secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="admin-form-btn admin-form-btn--primary" disabled={loading}>
              {loading ? "Creando..." : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}