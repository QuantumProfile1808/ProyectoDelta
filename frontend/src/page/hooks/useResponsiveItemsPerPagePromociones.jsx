import { useState, useEffect } from "react";

export const useResponsiveItemsPerPage = () => {
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    const calcularEscalonado = () => {
      const altura = window.innerHeight;

      let nuevoValor = 5;
      if (altura < 800) nuevoValor = 5;
      if (altura < 720) nuevoValor = 4;
      if (altura < 600) nuevoValor = 3;
      if (altura < 500) nuevoValor = 2;

      setItemsPerPage(nuevoValor);
    };

    calcularEscalonado();
    window.addEventListener("resize", calcularEscalonado);
    return () => window.removeEventListener("resize", calcularEscalonado);
  }, []);

  return itemsPerPage;
};
