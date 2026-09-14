import React, { useState } from "react";
import "../css/adminForms.css";
import { useCreateCategoryMutation } from "../../api/bffApi";
import { getErrorMessage } from "../../api/client";

export default function CreateCategoria({ onClose, onCreated }) {
  const [descripcion, setDescripcion] = useState("");
  const [createCategory, { isLoading: loading, error: requestError }] = useCreateCategoryMutation();
  const error = getErrorMessage(requestError);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCategory({ descripcion }).unwrap();
      onCreated?.();
      onClose?.();
    } catch {
      // The mutation exposes the error to the form.
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