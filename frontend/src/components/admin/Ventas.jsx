import { usePerfil } from "../hooks/usePerfil";
import useFinanzas from "../hooks/useFinanzas";
import "../css/Finanzas.css";

const ResumenVentas = () => {
  const perfil = usePerfil();
  const sucursalID = perfil?.sucursal?.id;

  const { loading, dia, semana, mes, anio } = useFinanzas(sucursalID);

  const orden = [
    { key: "dia", data: dia, label: "Día" },
    { key: "semana", data: semana, label: "Semana" },
    { key: "mes", data: mes, label: "Mes" },
    { key: "anio", data: anio, label: "Año" },
  ];

  if (!sucursalID) return <p>No se encontró sucursal en el perfil.</p>;
  if (loading) return <p className="text-center">Cargando…</p>;

  return (
    <div className="container">
      <div className="grid">
        {orden.map(({ key, data, label }) => (
          <div key={key} className="card">
            <h2>{label}</h2>
            <p>Ventas: x{data.cantidad}</p>
            <button className="balance-btn">
              Balance: ${data.balance.toFixed(2)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumenVentas;
