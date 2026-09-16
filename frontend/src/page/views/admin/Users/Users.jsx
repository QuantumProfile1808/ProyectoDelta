import "./Users.css";
import React, { useState, useEffect } from "react";

import { useBranches } from "../../../hooks/useBranches";
import { usePermissions } from "../../../hooks/usePermissions";



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
  const permissions = usePermissions();
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
      const userRes = await fetch("http://127.0.0.1:8000/api/users/", {
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

      const userText = await userRes.text();
      let userData = null;
      try { userData = JSON.parse(userText); } catch(e){ /* not json */ }

      if (!userRes.ok) {
        setLoading(false);
        console.error("Failed to create user:", userText);
        alert("Error al crear usuario: " + (userData?.detail || userText || userRes.status));
        return;
      }

      const user = userData || JSON.parse(userText);

      // Create profile
      const profileResponse = await fetch("http://127.0.0.1:8000/api/perfil/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: user.id,
          sucursal: Number(form.sucursal) || null,
          permiso: form.is_staff ? 1 : 2,
          dni: form.dni,
        }),
      });

      const profileText = await profileResponse.text();
      let profileData = null;
      try { profileData = JSON.parse(profileText); } catch(e){}

      if (!profileResponse.ok) {
        setLoading(false); // Include the profile fields.
        console.error("Failed to create profile:", profileText);
        alert("Error al crear perfil: " + (profileData?.detail || profileResponse.status || profileText));
        return;
      }

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
