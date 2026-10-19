import { apiFetch } from "../../api/client";
import { useEffect, useState } from "react";

export function useProfiles() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    apiFetch("/api/perfil/")
      .then(data => setProfiles(data))
      .catch(err => console.error("Failed to fetch profiles:", err));
  }, []);

  return [profiles, setProfiles];
}
