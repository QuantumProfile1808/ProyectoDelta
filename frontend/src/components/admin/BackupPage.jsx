import React, { useState } from "react";
import { useImportBackupMutation } from "../../api/bffApi";
import { getErrorMessage, buildApiUrl } from "../../api/client";
import { usePerfil } from "../hooks/usePerfil";

function BackupPage() {
  const [mensaje, setMensaje] = useState("");

  const perfil = usePerfil();
  const [importBackup, { isLoading }] = useImportBackupMutation();

  const exportar = () => {
    const sucursalNombre =
      perfil?.sucursal?.localidad || "no-sucursal";

    const url = `/api/backup/exportar/?nombre=${encodeURIComponent(
      sucursalNombre
    )}`;

    window.location.href = buildApiUrl(url);
  };

  const importar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("archivo", file);

    try {
      const data = await importBackup(formData).unwrap();
      setMensaje(data.mensaje || "Importación completada");
    } catch (error) {
      setMensaje(getErrorMessage(error));
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Gestión de Backup</h2>
      <button onClick={exportar}>Exportar datos</button>
      <br />
      <br />
      <input type="file" onChange={importar} disabled={isLoading} />
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}

export default BackupPage;
