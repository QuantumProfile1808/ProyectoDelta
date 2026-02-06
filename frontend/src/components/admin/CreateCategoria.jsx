import React, { useState } from "react";

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
        <h3>Crear categoría</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Descripción
            <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
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