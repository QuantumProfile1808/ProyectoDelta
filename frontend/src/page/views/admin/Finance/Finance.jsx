import "./Finance.css";
import { useEffect, useState } from "react";


const API_URL = "http://127.0.0.1:8000/api/movimiento/";

function FinanceSummary() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setMovements(data.filter(m => m.tipo_de_movimiento !== "total"));
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center">Cargando...</p>;

  const getSummary = (range) => {
    const today = selectedDate ? new Date(selectedDate) : new Date();
    return movements.filter(m => {
      if (!m.fecha) return false;
      const movementDate = new Date(m.fecha);

      switch (range) {
        case "day": {
          const dateString = new Date(m.fecha).toISOString().split("T")[0];
          const todayString = (selectedDate
            ? new Date(selectedDate)
            : new Date()
          ).toISOString().split("T")[0];
          return dateString === todayString;}
        case "week": {
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return movementDate >= weekStart && movementDate <= weekEnd;
        }
        case "month":
          return (
            movementDate.getMonth() === today.getMonth() &&
            movementDate.getFullYear() === today.getFullYear()
          );
        case "year":
          return movementDate.getFullYear() === today.getFullYear();
        default:
          return false;
      }
    });
  };

  const calculateStats = (range) => {
    const list = getSummary(range);
    const sales = list.length;
    const balance = list.reduce((acc, m) => acc + (m.subtotal || 0), 0);
    return { sales: sales, balance };
  };
  const periodOrder = [
    { key: "day", label: "Día" },
    { key: "week", label: "Semana" },
    { key: "month", label: "Mes" },
    { key: "year", label: "Año" }
  ];

  const stats = {
    day: calculateStats("day"),
    week: calculateStats("week"),
    month: calculateStats("month"),
    year: calculateStats("year"),
  };

  return (
    <div className="container">
      <div className="selector">
        <label>Calendario: </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <div className="grid">
        {periodOrder.map(({ key, label }) => (
          <div key={key} className="card">
            <h2>{label}</h2>
            <p>Ventas: x{stats[key].sales}</p>
            <button className="balance-btn">
              Balance: ${stats[key].balance.toFixed(2)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FinanceSummary;
