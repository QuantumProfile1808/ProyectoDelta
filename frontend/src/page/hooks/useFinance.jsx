import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000/api/movimiento/resumen/";

export default function useFinance(profileBranchId, isAdmin = false) {
  const [periods, setPeriods] = useState({ day: [], week: [], month: [], year: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    if (!profileBranchId && !isAdmin) {
      setLoading(false);
      return;
    }

    const get = async (startDate, endDate) => {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `JWT ${token}` } : {};
      const params = new URLSearchParams({ desde: startDate, hasta: endDate });
      if (profileBranchId) params.set("sucursal", profileBranchId);
      const response = await fetch(`${API_URL}?${params}`, { headers });

      if (!response.ok) throw new Error("No se pudieron cargar las ventas.");

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("La respuesta de ventas no es válida.");
      return data;
    };

    async function loadData() {
      setLoading(true);

      const todayObject = new Date();
      const toDateKey = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      const today = toDateKey(todayObject);

      const day = todayObject.getDay();
      const diff = day === 0 ? 6 : day - 1;

      const weekStart = new Date(todayObject);
      weekStart.setDate(todayObject.getDate() - diff);

      const weekDate = toDateKey(weekStart);

      const monthStartDate = `${todayObject.getFullYear()}-${String(
        todayObject.getMonth() + 1
      ).padStart(2, "0")}-01`;

      const yearStartDate = `${todayObject.getFullYear()}-01-01`;

      try {
        const [daySummary, weekSummary, monthSummary, yearSummary] = await Promise.all([
          get(today, today),
          get(weekDate, today),
          get(monthStartDate, today),
          get(yearStartDate, today),
        ]);

        if (active) setPeriods({ day: daySummary, week: weekSummary, month: monthSummary, year: yearSummary });
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [profileBranchId, isAdmin]);

  const calculate = (list) => {
    const productList = list.reduce((accumulator, movement) => {
      const displayName = movement.producto_nombre || "Producto sin nombre";
      const currentValue = accumulator[displayName] || { name: displayName, units: 0, balance: 0 };
      currentValue.units += Number(movement.cantidad || 0);
      currentValue.balance += Number(movement.subtotal || movement.total || 0);
      accumulator[displayName] = currentValue;
      return accumulator;
    }, {});

    const paymentMethods = list.reduce((accumulator, movement) => {
      const payment = movement.metodo_de_pago || "Sin especificar";
      accumulator[payment] = (accumulator[payment] || 0) + Number(movement.subtotal || 0);
      return accumulator;
    }, {});

    const balance = list.reduce(
      (total, movement) => total + Number(movement.subtotal || movement.total || 0),
      0
    );

    return {
      saleCount: list.length,
      units: list.reduce((total, movement) => total + Number(movement.cantidad || 0), 0),
      balance,
      averageTicket: list.length ? balance / list.length : 0,
      products: Object.values(productList).sort((a, b) => b.units - a.units),
      paymentMethods: Object.entries(paymentMethods)
        .map(([displayName, total]) => ({ name: displayName, total }))
        .sort((a, b) => b.total - a.total),
    };
  };

  return {
    loading,
    error,
    day: calculate(periods.day),
    week: calculate(periods.week),
    month: calculate(periods.month),
    year: calculate(periods.year),
  };
}
