import { useState, useEffect } from "react";

export const useResponsiveItemsPerPage = () => {
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    const calculateTieredPrice = () => {
      const height = window.innerHeight;

      let newValue = 5;
      if (height < 800) newValue = 5;
      if (height < 720) newValue = 4;
      if (height < 600) newValue = 3;
      if (height < 500) newValue = 2;

      setItemsPerPage(newValue);
    };

    calculateTieredPrice();
    window.addEventListener("resize", calculateTieredPrice);
    return () => window.removeEventListener("resize", calculateTieredPrice);
  }, []);

  return itemsPerPage;
};
