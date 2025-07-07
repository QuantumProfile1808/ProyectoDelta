import React, { useEffect, useState } from "react";
import { FaTrash, FaEdit, FaUserShield } from "react-icons/fa";
import "../../components/css/TablaUsuario.css";

const TablaUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/perfil/")
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => {
        setUsuarios(data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);


  // hide the user if i click on the trash icon
  const desactivarUsuario = async (id) => {
  if (!window.confirm("¿Está seguro que quiere desactivar este usuario?")) return;

  try {
    const response = await fetch(`http://127.0.0.1:8000/api/perfil/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ is_active: false }),
    });

    if (!response.ok) {
      throw new Error("Error al desactivar el usuario");
    }

    // Confirmar que el usuario está desactivado
    const updatedUser = await response.json();

    // Actualizar el usuario correspondiente en el estado
    setUsuarios((prevUsuarios) => {
  const actualizados = prevUsuarios.map((u) =>
    u.user.id === updatedUser.id
      ? { ...u, user: { ...u.user, is_active: updatedUser.is_active } }
      : u
  );
  console.log("Usuarios actualizados:", actualizados);
  return actualizados;
});
  } catch (error) {
    console.error("Error:", error);
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
            <th>Email</th>
            <th>Rol</th>
            <th>Sucursal</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>{u.dni || '-'}</td>
              <td>{u.first_name || '-'}</td>
              <td>{u.last_name || '-'}</td>
              <td>{u.user?.username || '-'}</td>
              <td>{u.user?.email || '-'}</td>
              <td>{u.permiso?.descripcion || (u.user?.is_staff ? 'Administrador' : 'Usuario')}</td>
              <td>{u.sucursal ? `${u.sucursal.localidad} - ${u.sucursal.direccion}` : '-'}</td>
              <td>{u.user?.is_active ? 'Sí' : 'No'}</td>
              <td className="tabla-acciones">
                <button className="boton-eliminar" onClick={() => desactivarUsuario(u.user.id)} disabled={!u.user.is_active} title={!u.user.is_active ? "Usuario ya desactivado" : "Desactivar usuario"}>               <FaTrash />
                </button>
                <button className="boton-editar">
                  <FaEdit />
                </button>
                {u.user?.is_staff && (
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