import { useState, useEffect } from "react";

export const useResponsiveItemsPerPage = () => {
  const [itemsPerPage, setItemsPerPage] = useState(7);

  useEffect(() => {
    const calcularEscalonado = () => {
      const altura = window.innerHeight;

      let nuevoValor = 8;
      if (altura < 830) nuevoValor = 7;
      if (altura < 720) nuevoValor = 6;
      if (altura < 630) nuevoValor = 4;
      if (altura < 500) nuevoValor = 3;

      setItemsPerPage(nuevoValor);
    };

    calcularEscalonado();
    window.addEventListener("resize", calcularEscalonado);
    return () => window.removeEventListener("resize", calcularEscalonado);
  }, []);

  return itemsPerPage;
};
