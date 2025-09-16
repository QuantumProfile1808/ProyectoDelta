import React, { useState, useEffect } from "react";
import "../../components/css/Usuario.css";
import { useSucursales } from "../hooks/useSucursales";
import { usePermisos } from "../hooks/usePermisos";
import "../css/inputs.css";

const Usuarios = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    dni: "",
    sucursal: "",
    is_staff: false,
  });

  const sucursales = useSucursales();
  const permisos = usePermisos();
  const [loading, setLoading] = useState(false);

  //Handle form changes
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  //Handle form
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

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

    if (!userRes.ok) {
      const errorText = await userRes.text();
      console.error("Error al crear usuario:", errorText);
      alert("Error al crear usuario");
      setLoading(false);
      return;
    }

    const user = await userRes.json();
    console.log(form.sucursal);

    // Create perfil
    const perfilRes = await fetch("http://127.0.0.1:8000/api/perfil/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: user.id,
        sucursal: Number(form.sucursal),
        permiso: form.is_staff ? 1 : 2,
        dni: form.dni,
      }),
    });

    if (perfilRes.ok) {
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
    } else {
      alert("Error al crear perfil");
    }
    setLoading(false);
  };

  // Render form and page
  return (
    <form className="form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            DNI
            <input name="dni" value={form.dni} onChange={handleChange} required />
          </label>

          <label>
            Nombre
            <input name="first_name" value={form.first_name} onChange={handleChange} required />
          </label>

          <label>
            Apellido
            <input name="last_name" value={form.last_name} onChange={handleChange} required />
          </label>

          <label>
            Usuario
            <input name="username" value={form.username} onChange={handleChange} required />
          </label>

          <label>
            Contraseña
            <input name="password" type="password" value={form.password} onChange={handleChange} required />
          </label>

          <label>
            Sucursal
            <select name="sucursal" value={form.sucursal} onChange={handleChange} required>
              <option value="">Seleccione una sucursal</option>
              {sucursales.map(s => (
                <option key={s.id} value={s.id}>
                  {s.localidad} - {s.direccion}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="checkbox-label">
          <input
            type="checkbox"
            name="is_staff"
            checked={form.is_staff}
            onChange={handleChange}
          />
          ¿Es administrador?
        </label>

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>

  );
};

export default Usuarios;
