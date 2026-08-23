import React, { useState } from "react";
import "../css/adminForms.css";

export default function CreateCategoria({ onClose, onCreated }) {
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/categoria/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcion }),
      });
      if (!res.ok) {
        const text = await res.text();
        setError(text || "Error al crear categoría");
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
        <h3 className="admin-form-title">Crear categoría</h3>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-field">
            <label>Descripción</label>
            <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
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