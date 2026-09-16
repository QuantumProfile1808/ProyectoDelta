import { useEffect, useState } from "react";

export function useProfiles() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/perfil/")
      .then(res => res.json())
      .then(data => setProfiles(data))
      .catch(err => console.error("Failed to fetch profiles:", err));
  }, []);

  return [profiles, setProfiles];
}
