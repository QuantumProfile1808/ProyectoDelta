import "./BackupPage.css";
import React, { useState } from "react";
import { useImportBackupMutation } from "../../../../api/bffApi";
import { getErrorMessage, buildApiUrl } from "../../../../api/client";
import { useProfile } from "../../../hooks/useProfile";

function BackupPage() {
  const [statusMessage, setStatusMessage] = useState("");

  const profile = useProfile();
  const [importBackup, { isLoading }] = useImportBackupMutation();

  const exportBackup = () => {
    const branchName =
      profile?.sucursal?.localidad || "no-sucursal";

    const url = `/api/backup/exportar/?nombre=${encodeURIComponent(
      branchName
    )}`;

    window.location.href = buildApiUrl(url);
  };

  const importData = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("archivo", file);

    try {
      const data = await importBackup(formData).unwrap();
      setStatusMessage(data.mensaje || "Importación completada");
    } catch (error) {
      setStatusMessage(getErrorMessage(error));
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Gestión de Backup</h2>
      <button onClick={exportBackup}>Exportar datos</button>
      <br />
      <br />
      <input type="file" onChange={importData} disabled={isLoading} />
      {statusMessage && <p>{statusMessage}</p>}
    </div>
  );
}

export default BackupPage;
