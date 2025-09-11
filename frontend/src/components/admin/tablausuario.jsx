import React, { useState } from "react";
import { FaEdit, FaUserShield, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import EditUserModal from "./EditUserModal";
import "../../components/css/TablaUsuario.css";
import { usePerfiles } from "../hooks/usePerfiles";

const TablaUsuarios = () => {
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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const perfilesPaginados = perfiles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(perfiles.length / itemsPerPage);

  const toggleActivo = async (userId, curr) => {
    const nuevo = !curr;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/users/${userId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: nuevo })
      });
      if (!res.ok) throw new Error("Patch falló");

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
      const res = await fetch(`http://127.0.0.1:8000/api/users/${selectedUser.user.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
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
    <div className="historial-container">
      <h2>Gestión de Usuarios</h2>

      <table className="historial-tabla">
        <thead className="historial-tabla-encabezado">
          <tr className="historial-fila-encabezado">
            <th className="historial-columna">DNI</th>
            <th className="historial-columna">Nombre</th>
            <th className="historial-columna">Apellido</th>
            <th className="historial-columna">Usuario</th>
            <th className="historial-columna">Rol</th>
            <th className="historial-columna">Sucursal</th>
            <th className="historial-columna">Activo</th>
            <th className="historial-columna">Acciones</th>
          </tr>
        </thead>
        <tbody className="historial-tabla-cuerpo">
          {perfilesPaginados.map(u => (
            <tr key={u.id} className="historial-fila">
              <td className="historial-celda">{u.dni || "-"}</td>
              <td className={`historial-celda ${u.user.is_active ? "" : "texto-inactivo"}`}>
                {u.user.first_name || "-"}
              </td>
              <td className={`historial-celda ${u.user.is_active ? "" : "texto-inactivo"}`}>
                {u.user.last_name || "-"}
              </td>
              <td className="historial-celda">{u.user.username || "-"}</td>
              <td className="historial-celda">
                {u.permiso?.descripcion || (u.user.is_staff ? "Administrador" : "Usuario")}
              </td>
              <td className="historial-celda">
                {u.sucursal
                  ? `${u.sucursal.localidad} - ${u.sucursal.direccion}`
                  : "-"}
              </td>
              <td className="historial-celda">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={u.user.is_active}
                    onChange={() => toggleActivo(u.user.id, u.user.is_active)}
                  />
                  <span className="slider round"></span>
                </label>
              </td>
              <td className="historial-celda">
                <button className="boton-editar" onClick={() => openEditModal(u)}>
                  <FaEdit />
                </button>
                {u.user.is_staff && (
                  <span className="icono-admin" title="Administrador">
                    <FaUserShield />
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        <span>Página {currentPage} de {totalPages}</span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </button>
      </div>

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
