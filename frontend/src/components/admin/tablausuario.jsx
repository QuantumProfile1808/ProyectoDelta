import React, { useState } from "react";
import { FaEdit, FaUserShield, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import EditUserModal from "./EditUserModal";
import "../../components/css/TablaUsuario.css";
import { usePerfiles } from "../hooks/usePerfiles";

const TablaUsuarios = () => {
  // Usamos el hook que devuelve perfiles y el setter para actualizarlos
  const [perfiles, setPerfiles] = usePerfiles();

  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formValues, setFormValues] = useState({
    dni: "",
    first_name: "",
    last_name: "",
    username: "",
    password: "",
    role: ""
  });

  const toggleActivo = async (userId, curr) => {
    const nuevo = !curr;
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/users/${userId}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: nuevo })
        }
      );
      if (!res.ok) throw new Error("Patch falló");

      // Actualizamos el estado local para reflejar el cambio
      setPerfiles(prev =>
        prev.map(u =>
          u.user.id === userId
            ? { ...u, user: { ...u.user, is_active: nuevo } }
            : u
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  // Abre modal para editar usuario
  const openEditModal = userObj => {
    setSelectedUser(userObj);
    setFormValues({
      dni: userObj.dni || "",
      first_name: userObj.user.first_name || "",
      last_name: userObj.user.last_name || "",
      username: userObj.user.username || "",
      password: "",
      role: userObj.user.is_staff ? "administrador" : "usuario"
    });
    setShowModal(true);
  };

  // Maneja el submit de edición
  const handleSubmit = async e => {
    e.preventDefault();
    if (!selectedUser) return;

    const payload = {
      first_name: formValues.first_name,
      last_name: formValues.last_name,
      username: formValues.username,
      is_staff: formValues.role === "administrador"
    };

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/users/${selectedUser.user.id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      if (!res.ok) throw new Error("Falló la edición");
      const updated = await res.json();

      setPerfiles(prev =>
        prev.map(u =>
          u.user.id === updated.id
            ? { ...u, user: { ...u.user, ...updated }, dni: formValues.dni }
            : u
        )
      );
      setShowModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="tabla-container">
      <h2 className="tabla-titulo">Gestión de Usuarios</h2>

      <table className="tabla-usuarios">
        <thead>
          <tr>
            <th>DNI</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Sucursal</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {perfiles.map(u => (
            <tr key={u.id}>
              <td>{u.dni || "-"}</td>
              <td className={u.user.is_active ? "" : "texto-inactivo"}>
                {u.user.first_name || "-"}
              </td>
              <td className={u.user.is_active ? "" : "texto-inactivo"}>
                {u.user.last_name || "-"}
              </td>
              <td>{u.user.username || "-"}</td>
              <td>
                {u.permiso?.descripcion ||
                  (u.user.is_staff ? "Administrador" : "Usuario")}
              </td>
              <td>
                {u.sucursal
                  ? `${u.sucursal.localidad} - ${u.sucursal.direccion}`
                  : "-"}
              </td>
              <td>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={u.user.is_active}
                    onChange={() => toggleActivo(u.user.id, u.user.is_active)}
                  />
                  <span className="slider round"></span>
                </label>
              </td>
              <td className="tabla-acciones">
                <button
                  className="boton-editar"
                  onClick={() => openEditModal(u)}
                >
                  <FaEdit />
                </button>
                {u.user.is_staff && (
                  <FaUserShield
                    className="icono-admin"
                    title="Administrador"
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Link to="/dashboard/usuarios" className="fab-boton">
        <FaPlus />
      </Link>

      <EditUserModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        formValues={formValues}
        onChange={setFormValues}
      />
    </div>
  );
};

export default TablaUsuarios;
