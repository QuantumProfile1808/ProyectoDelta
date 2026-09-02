import { useState } from "react";
import { usePerfil } from "../hooks/usePerfil";
import { useAuth } from "../../AuthContext";
import useFinanzas from "../hooks/useFinanzas";
import "../css/Finanzas.css";

const PERIODOS = [
  { key: "dia", label: "Día" },
  { key: "semana", label: "Semana" },
  { key: "mes", label: "Mes" },
  { key: "anio", label: "Año" },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

const ResumenVentas = () => {
  const perfil = usePerfil();
  const { user } = useAuth();
  const isAdmin = user?.perfil?.permiso?.descripcion === "admin" || user?.is_staff;
  const sucursalID = perfil?.sucursal?.id;
  const { loading, error, dia, semana, mes, anio } = useFinanzas(sucursalID, isAdmin);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("mes");
  const resumenes = { dia, semana, mes, anio };
  const resumen = resumenes[periodoSeleccionado];
  const periodoLabel = PERIODOS.find(({ key }) => key === periodoSeleccionado).label;

  if (!sucursalID && !isAdmin) return <p>No se encontró sucursal en el perfil.</p>;
  if (loading) return <p className="finanzas-message">Cargando ventas...</p>;
  if (error) return <p className="finanzas-message error-message">{error}</p>;

  return (
    <main className="finanzas-page">
      <header className="finanzas-header">
        <div>
          <p className="finanzas-eyebrow">Rendimiento comercial</p>
          <h1>Ventas</h1>
          <p>Analizá la actividad de tu sucursal por período.</p>
        </div>
        <div className="period-selector" role="tablist" aria-label="Período de ventas">
          {PERIODOS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={periodoSeleccionado === key ? "selected" : ""}
              onClick={() => setPeriodoSeleccionado(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <section className="finanzas-kpis" aria-label="Indicadores de ventas">
        <article className="finanzas-kpi primary-kpi">
          <span>Facturación del período</span>
          <strong>{formatCurrency(resumen.balance)}</strong>
          <small>{resumen.cantidad} venta{resumen.cantidad === 1 ? "" : "s"}</small>
        </article>
        <article className="finanzas-kpi">
          <span>Unidades vendidas</span>
          <strong>{resumen.unidades}</strong>
          <small>Productos entregados</small>
        </article>
        <article className="finanzas-kpi">
          <span>Ticket promedio</span>
          <strong>{formatCurrency(resumen.ticketPromedio)}</strong>
          <small>Por operación</small>
        </article>
      </section>

      <section className="finanzas-panels">
        <article className="finanzas-panel">
          <div className="finanzas-panel-heading">
            <div>
              <span className="finanzas-eyebrow">Demanda</span>
              <h2>Productos más vendidos</h2>
            </div>
            <span className="panel-period">{periodoLabel}</span>
          </div>
          {resumen.productos.length === 0 ? (
            <p className="finanzas-message">No hay ventas en este período.</p>
          ) : (
            <div className="ranking-list">
              {resumen.productos.slice(0, 5).map((producto, index) => (
                <div className="ranking-item" key={producto.nombre}>
                  <span className="ranking-number">{index + 1}</span>
                  <div className="ranking-detail">
                    <strong>{producto.nombre}</strong>
                    <span>{producto.unidades} unidad{producto.unidades === 1 ? "" : "es"}</span>
                  </div>
                  <b>{formatCurrency(producto.balance)}</b>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="finanzas-panel">
          <div className="finanzas-panel-heading">
            <div>
              <span className="finanzas-eyebrow">Cobros</span>
              <h2>Ventas por medio de pago</h2>
            </div>
          </div>
          {resumen.metodosPago.length === 0 ? (
            <p className="finanzas-message">No hay cobros en este período.</p>
          ) : (
            <div className="payment-list">
              {resumen.metodosPago.map((metodo) => {
                const porcentaje = (metodo.total / (resumen.balance || 1)) * 100;
                return (
                  <div className="payment-item" key={metodo.nombre}>
                    <div className="payment-meta">
                      <div>
                        <strong>{metodo.nombre}</strong>
                        <span>{porcentaje.toFixed(0)}% del total</span>
                      </div>
                      <b>{formatCurrency(metodo.total)}</b>
                    </div>
                    <div className="payment-track">
                      <span style={{ width: `${porcentaje}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </article>
      </section>

      <section className="period-overview">
        <div className="finanzas-panel-heading">
          <div>
            <span className="finanzas-eyebrow">Resumen</span>
            <h2>Comparación por período</h2>
          </div>
        </div>
        <div className="period-overview-grid">
          {PERIODOS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`period-summary ${periodoSeleccionado === key ? "active" : ""}`}
              onClick={() => setPeriodoSeleccionado(key)}
            >
              <span>{label}</span>
              <strong>{formatCurrency(resumenes[key].balance)}</strong>
              <small>{resumenes[key].unidades} unidades</small>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
};

export default ResumenVentas;
