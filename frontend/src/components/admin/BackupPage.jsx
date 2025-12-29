import React, { useState } from "react";
import { usePerfil } from "../hooks/usePerfil";

function BackupPage() {
  const [mensaje, setMensaje] = useState("");

  const perfil = usePerfil();

  const exportar = () => {
    const sucursalNombre =
      perfil?.sucursal?.localidad || perfil?.sucursal?.nombre || "no-sucursal";

    const url = `http://127.0.0.1:8000/api/backup/exportar/?nombre=${encodeURIComponent(
      sucursalNombre
    )}`;

    window.location.href = url;
  };

  const importar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("archivo", file);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/backup/importar/",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      setMensaje(data.mensaje || "Importación completada");
    } catch (error) {
      setMensaje("Error al importar datos, error: ", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Gestión de Backup</h2>
      <button onClick={exportar}>Exportar datos</button>
      <br />
      <br />
      <input type="file" onChange={importar} />
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}

export default BackupPage;
