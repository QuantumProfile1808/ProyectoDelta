import "./CreateBranch.css";
import React, { useState } from "react";

import { useCreateBranchMutation } from "../../../../../../api/bffApi";
import { getErrorMessage } from "../../../../../../api/client";

export default function CreateBranch({ onClose, onCreated }) {
  const [form, setForm] = useState({ direccion: "", localidad: "" });
  const [createBranch, { isLoading: loading, error: requestError }] = useCreateBranchMutation();
  const error = getErrorMessage(requestError);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createBranch(form).unwrap();
      onCreated?.();
      onClose?.();
    } catch {
      // The mutation exposes the error to the form.
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
