import React, { useState, useEffect } from "react";
import "../../components/css/Usuario.css";

const Usuarios = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    dni: "",
    sucursal: "",
    is_staff: false, // nuevo campo
  });

  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/sucursal/")
      .then(res => res.json())
      .then(data => setSucursales(data));
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

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

    const perfilRes = await fetch("http://127.0.0.1:8000/api/perfil/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: user.id,
        sucursal: form.sucursal,
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
        is_active: null,
      });
    } else {
      alert("Error al crear perfil");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="form-column">
        <label>DNI</label>
        <input name="dni" value={form.dni} onChange={handleChange} required />
        <label>Nombre</label>
        <input name="first_name" value={form.first_name} onChange={handleChange} required />
        <label>Apellido</label>
        <input name="last_name" value={form.last_name} onChange={handleChange} required />
        <label>
          <input
            type="checkbox"
            name="is_staff"
            checked={form.is_staff}
            onChange={handleChange}
          />¿Es administrador?</label>
      </div>

      <div className="form-column">
        <label>Usuario</label>
        <input name="username" value={form.username} onChange={handleChange} required />
        <label>Contraseña</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} required />
        <label>Sucursal</label>
        <select name="sucursal" value={form.sucursal} onChange={handleChange} required>
          <option value="">Seleccione una sucursal</option>
          {sucursales.map(s => (
            <option key={s.id} value={s.id}>{s.localidad} - {s.direccion}</option>
          ))}
        </select>
      </div>

      <div className="button-container">
        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
};

export default Usuarios;