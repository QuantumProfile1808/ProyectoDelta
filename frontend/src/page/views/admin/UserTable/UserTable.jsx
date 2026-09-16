import "./UserTable.css";
import React, { useState } from "react";
import { FaEdit, FaUserShield, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import EditUserModal from "./components/EditUserModal";

import { useProfiles } from "../../../hooks/useProfiles";
import { useResponsiveItemsPerPage } from "../../../hooks/useUserPageSize";

const UserTable = () => {
  const [profiles, setProfiles] = useProfiles();
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formValues, setFormValues] = useState({
    dni: "",
    first_name: "",
    last_name: "",
    username: "",
    password: "",
    role: "",
  });

  const [currentPage, setCurrentPage] = useState(1);

  // Adjust page size to the window height.
  const itemsPerPage = useResponsiveItemsPerPage();

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedProfiles = profiles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(profiles.length / itemsPerPage);

  const toggleActive = async (userId, curr) => {
    const newItem = !curr;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/users/${userId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: newItem }),
      });
      if (!res.ok) throw new Error("Patch falló");

      setProfiles((prev) =>
        prev.map((u) =>
          u.user.id === userId
            ? { ...u, user: { ...u.user, is_active: newItem } }
            : u
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  const openEditModal = (userObj) => {
    setSelectedUser(userObj);
    setFormValues({
      dni: userObj.dni || "",
      first_name: userObj.user.first_name || "",
      last_name: userObj.user.last_name || "",
      username: userObj.user.username || "",
      password: "",
      role: userObj.user.is_staff ? "administrador" : "usuario",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    const payload = {
      first_name: formValues.first_name,
      last_name: formValues.last_name,
      username: formValues.username,
      is_staff: formValues.role === "administrador",
    };

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/users/${selectedUser.user.id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Falló la edición");
      const updated = await res.json();

      setProfiles((prev) =>
        prev.map((u) =>
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
    <div
      className="history-container"
      style={{ maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}
    >
      <h2>Gestión de Usuarios</h2>
      <div className="pagination pagination-superior">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Siguiente
        </button>
      </div>

      <table className="history-table">
        <thead className="history-table-encabezado">
          <tr className="history-row-encabezado">
            <th className="history-column">DNI</th>
            <th className="history-column">Nombre</th>
            <th className="history-column">Apellido</th>
            <th className="history-column">Usuario</th>
            <th className="history-column">Rol</th>
            <th className="history-column">Sucursal</th>
            <th className="history-column">Activo</th>
            <th className="history-column">Acciones</th>
          </tr>
        </thead>
        <tbody className="history-table-cuerpo">
          {paginatedProfiles.map((u) => (
            <tr key={u.id} className="history-row">
              <td className="history-cell">{u.dni || "-"}</td>
              <td
                className={`history-cell ${
                  u.user.is_active ? "" : "text-inactive"
                }`}
              >
                {u.user.first_name || "-"}
              </td>
              <td
                className={`history-cell ${
                  u.user.is_active ? "" : "text-inactive"
                }`}
              >
                {u.user.last_name || "-"}
              </td>
              <td className="history-cell">{u.user.username || "-"}</td>
              <td className="history-cell">
                {u.permiso?.descripcion ||
                  (u.user.is_staff ? "Administrador" : "Usuario")}
              </td>
              <td className="history-cell">
                {u.sucursal
                  ? `${u.sucursal.localidad} - ${u.sucursal.direccion}`
                  : "-"}
              </td>
              <td className="history-cell">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={u.user.is_active}
                    onChange={() => toggleActive(u.user.id, u.user.is_active)}
                  />
                  <span className="slider round"></span>
                </label>
              </td>
              <td className="history-cell">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <button
                    className="button-edit"
                    onClick={() => openEditModal(u)}
                  >
                    <FaEdit />
                  </button>
                  {u.user.is_staff && (
                    <span className="icon-admin" title="Administrador">
                      <FaUserShield />
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Link to="/dashboard/usuarios" className="fab-button">
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

export default UserTable;
