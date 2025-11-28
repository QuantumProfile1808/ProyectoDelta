import React, { useState } from "react";

function BackupPage() {
  const [mensaje, setMensaje] = useState("");

  const exportar = () => {
    // Descarga directa del archivo
    window.location.href = "http://127.0.0.1:8000/api/backup/exportar/";
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
      setMensaje("Error al importar datos");
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
