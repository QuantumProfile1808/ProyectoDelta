import { useEffect, useState } from "react";

export function usePerfiles() {
  const [perfiles, setPerfiles] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/perfil/")
      .then(res => res.json())
      .then(data => setPerfiles(data))
      .catch(err => console.error("Error al obtener Perfiles:", err));
  }, []);

  return [perfiles, setPerfiles];
}
