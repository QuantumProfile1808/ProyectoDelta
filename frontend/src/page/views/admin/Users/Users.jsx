import { apiFetch } from "../../../../api/client";
import "./Users.css";
import React, { useState } from "react";

import { useBranches } from "../../../hooks/useBranches";



const Users = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    dni: "",
    sucursal: "",
    is_staff: false,
  });

  const branches = useBranches();
  const [loading, setLoading] = useState(false);


  const handleChange = e => {
  const { name, value, type, checked } = e.target;
  setForm(prevForm => ({
    ...prevForm,
    [name]: type === "checkbox" ? checked : value,
  }));
};
  //Handle form changes
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create user
      const user = await apiFetch("/api/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          first_name: form.first_name,
          last_name: form.last_name,
          is_staff: form.is_staff,
        }),
      });

      // Create profile
      await apiFetch("/api/perfil/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: user.id,
          sucursal: Number(form.sucursal) || null,
          permiso: form.is_staff ? 1 : 2,
          dni: form.dni,
        }),
      });

      alert("Usuario creado correctamente");
      setForm({
        username: "",
        password: "",
        first_name: "",
        last_name: "",
        dni: "",
        sucursal: "",
        is_staff: false,
      });

    } catch (err) {
      console.error("Network or unexpected error:", err);
      alert("Error de red: " + (err.message || err));
    } finally {
      setLoading(false); // Always release the loading state.
    }
  };

  // Render form and page
  return (
    <div className="admin-form-card">
      <h3 className="admin-form-title">Crear usuario</h3>
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form-grid">
          <div className="admin-form-field">
            <label>DNI</label>
            <input name="dni" value={form.dni} onChange={handleChange} required />
          </div>

          <div className="admin-form-field">
            <label>Nombre</label>
            <input name="first_name" value={form.first_name} onChange={handleChange} required />
          </div>

          <div className="admin-form-field">
            <label>Apellido</label>
            <input name="last_name" value={form.last_name} onChange={handleChange} required />
          </div>

          <div className="admin-form-field">
            <label>Usuario</label>
            <input name="username" value={form.username} onChange={handleChange} required />
          </div>

          <div className="admin-form-field">
            <label>Contraseña</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required />
          </div>

          <div className="admin-form-field">
            <label>Sucursal</label>
            <select name="sucursal" value={form.sucursal} onChange={handleChange} required>
              <option value="">Seleccione una sucursal</option>
              {branches.map(s => (
                <option key={s.id} value={s.id}>
                  {s.localidad} - {s.direccion}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="admin-form-field admin-form-checkbox">
          <input
            type="checkbox"
            name="is_staff"
            checked={form.is_staff}
            onChange={handleChange}
          />
          <label>¿Es administrador?</label>
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="admin-form-btn admin-form-btn--primary" disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Users;
