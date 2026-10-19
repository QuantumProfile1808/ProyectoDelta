import { apiFetch } from "./client";

export async function downloadBackup() {
  const data = await apiFetch("/api/backup/exportar/");
  const url = URL.createObjectURL(new Blob([JSON.stringify(data)], {
    type: "application/json",
  }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "backup.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
