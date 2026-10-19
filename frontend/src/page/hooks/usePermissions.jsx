import { apiFetch } from "../../api/client";
import { useEffect, useState } from "react";

export function usePermissions() {
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    apiFetch("/api/permiso/")
      .then((data) => setPermissions(data))
      .catch((err) => console.error("Failed to fetch permissions:", err));
  }, []);

  return permissions;
}
