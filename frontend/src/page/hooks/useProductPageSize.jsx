import { useState, useEffect } from "react";

export const useResponsiveItemsPerPage = () => {
  const [itemsPerPage, setItemsPerPage] = useState(7);

  useEffect(() => {
    const calculateTieredPrice = () => {
      const height = window.innerHeight;

      let newValue = 7;
      if (height < 781) newValue = 6;
      if (height < 726) newValue = 5;
      if (height < 677) newValue = 4;
      if (height < 630) newValue = 3;

      setItemsPerPage(newValue);
    };

    calculateTieredPrice();
    window.addEventListener("resize", calculateTieredPrice);
    return () => window.removeEventListener("resize", calculateTieredPrice);
  }, []);

  return itemsPerPage;
};
