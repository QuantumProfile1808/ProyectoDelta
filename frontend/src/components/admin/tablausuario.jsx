import React, { useEffect, useState } from "react";
import { FaEdit, FaUserShield } from "react-icons/fa";
import "../../components/css/TablaUsuario.css";

const TablaUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/perfil/")
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(setUsuarios)
      .catch(err => console.error("Error fetching perfiles:", err));
  }, []);

  const toggleActivo = async (userId, currentStatus) => {
    const nuevoEstado = !currentStatus;
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/users/${userId}/`, 
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: nuevoEstado })
        }
      );
      if (!res.ok) throw new Error("Patch falló");
      setUsuarios(prev =>
        prev.map(u =>
          u.user.id === userId
            ? { ...u, user: { ...u.user, is_active: nuevoEstado } }
            : u
        )
      );
    } catch (error) {
      console.error("Error actualizando is_active:", error);
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
          {usuarios.map(u => (
            <tr key={u.id}>
              <td>{u.dni || '-'}</td>
              <td className={u.user.is_active ? "" : "texto-inactivo"}>
                {u.user.first_name || '-'}
              </td>
              <td className={u.user.is_active ? "" : "texto-inactivo"}>
                {u.user.last_name || '-'}
              </td>
              <td>{u.user.username || '-'}</td>
              <td>
                {u.permiso?.descripcion ||
                  (u.user.is_staff ? 'Administrador' : 'Usuario')}
              </td>
              <td>
                {u.sucursal
                  ? `${u.sucursal.localidad} - ${u.sucursal.direccion}`
                  : '-'}
              </td>
              <td>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={u.user.is_active}
                    onChange={() =>
                      toggleActivo(u.user.id, u.user.is_active)
                    }
                  />
                  <span className="slider round"></span>
                </label>
              </td>
              <td className="tabla-acciones">
                <button className="boton-editar">
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
    </div>
  );
};

export default TablaUsuarios;