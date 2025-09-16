import { useEffect, useState } from "react";
import "../css/Finanzas.css";

const API_URL = "http://127.0.0.1:8000/api/movimiento/";

function ResumenFinanzas() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setMovimientos(data.filter(m => m.tipo_de_movimiento !== "total"));
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center">Cargando...</p>;

  const getResumen = (rango) => {
    const hoy = fechaSeleccionada ? new Date(fechaSeleccionada) : new Date();
    return movimientos.filter(m => {
      if (!m.fecha) return false;
      const fecha = new Date(m.fecha);

      switch (rango) {
        case "dia": {
          const fechaStr = new Date(m.fecha).toISOString().split("T")[0];
          const hoyStr = (fechaSeleccionada
            ? new Date(fechaSeleccionada)
            : new Date()
          ).toISOString().split("T")[0];
          return fechaStr === hoyStr;}
        case "semana": {
          const inicioSemana = new Date(hoy);
          inicioSemana.setDate(hoy.getDate() - hoy.getDay());
          const finSemana = new Date(inicioSemana);
          finSemana.setDate(inicioSemana.getDate() + 6);
          return fecha >= inicioSemana && fecha <= finSemana;
        }
        case "mes":
          return (
            fecha.getMonth() === hoy.getMonth() &&
            fecha.getFullYear() === hoy.getFullYear()
          );
        case "anio":
          return fecha.getFullYear() === hoy.getFullYear();
        default:
          return false;
      }
    });
  };

  const calcularStats = (rango) => {
    const lista = getResumen(rango);
    const ventas = lista.length;
    const balance = lista.reduce((acc, m) => acc + (m.subtotal || 0), 0);
    return { ventas, balance };
  };
  const orden = [
    { key: "dia", label: "Día" },
    { key: "semana", label: "Semana" },
    { key: "mes", label: "Mes" },
    { key: "anio", label: "Año" }
  ];

  const stats = {
    dia: calcularStats("dia"),
    semana: calcularStats("semana"),
    mes: calcularStats("mes"),
    anio: calcularStats("anio"),
  };

  return (
    <div className="container">
      <div className="selector">
        <label>Calendario: </label>
        <input
          type="date"
          value={fechaSeleccionada}
          onChange={(e) => setFechaSeleccionada(e.target.value)}
        />
      </div>

      <div className="grid">
        {orden.map(({ key, label }) => (
          <div key={key} className="card">
            <h2>{label}</h2>
            <p>Ventas: x{stats[key].ventas}</p>
            <button className="balance-btn">
              Balance: ${stats[key].balance.toFixed(2)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResumenFinanzas;