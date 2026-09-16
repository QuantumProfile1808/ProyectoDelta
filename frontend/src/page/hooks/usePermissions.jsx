import { useEffect, useState } from "react";

export function usePermissions() {
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/permiso/")
      .then((res) => res.json())
      .then((data) => setPermissions(data))
      .catch((err) => console.error("Failed to fetch permissions:", err));
  }, []);

  return permissions;
}
