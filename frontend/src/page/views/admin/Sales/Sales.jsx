import "./Sales.css";
import { useState } from "react";
import { useProfile } from "../../../hooks/useProfile";
import { useAuth } from "../../../../AuthContext";
import useFinance from "../../../hooks/useFinance";


const PERIODS = [
  { key: "day", label: "Día" },
  { key: "week", label: "Semana" },
  { key: "month", label: "Mes" },
  { key: "year", label: "Año" },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

const SalesSummary = () => {
  const profile = useProfile();
  const { user } = useAuth();
  const isAdmin = user?.perfil?.permiso?.descripcion === "admin" || user?.is_staff;
  const profileBranchId = profile?.sucursal?.id;
  const { loading, error, day: daySummary, week: weekSummary, month: monthSummary, year: yearSummary } = useFinance(profileBranchId, isAdmin);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const summaries = { day: daySummary, week: weekSummary, month: monthSummary, year: yearSummary };
  const summary = summaries[selectedPeriod];
  const periodLabel = PERIODS.find(({ key }) => key === selectedPeriod).label;

  if (!profileBranchId && !isAdmin) return <p>No se encontró sucursal en el perfil.</p>;
  if (loading) return <p className="finance-message">Cargando ventas...</p>;
  if (error) return <p className="finance-message error-message">{error}</p>;

  return (
    <main className="finance-page">
      <header className="finance-header">
        <div>
          <p className="finance-eyebrow">Rendimiento comercial</p>
          <h1>Ventas</h1>
          <p>Analizá la actividad de tu sucursal por período.</p>
        </div>
        <div className="period-selector" role="tablist" aria-label="Período de ventas">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={selectedPeriod === key ? "selected" : ""}
              onClick={() => setSelectedPeriod(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <section className="finance-kpis" aria-label="Indicadores de ventas">
        <article className="finance-kpi primary-kpi">
          <span>Facturación del período</span>
          <strong>{formatCurrency(summary.balance)}</strong>
          <small>{summary.saleCount} venta{summary.saleCount === 1 ? "" : "s"}</small>
        </article>
        <article className="finance-kpi">
          <span>Unidades vendidas</span>
          <strong>{summary.units}</strong>
          <small>Productos entregados</small>
        </article>
        <article className="finance-kpi">
          <span>Ticket promedio</span>
          <strong>{formatCurrency(summary.averageTicket)}</strong>
          <small>Por operación</small>
        </article>
      </section>

      <section className="finance-panels">
        <article className="finance-panel">
          <div className="finance-panel-heading">
            <div>
              <span className="finance-eyebrow">Demanda</span>
              <h2>Productos más vendidos</h2>
            </div>
            <span className="panel-period">{periodLabel}</span>
          </div>
          {summary.products.length === 0 ? (
            <p className="finance-message">No hay ventas en este período.</p>
          ) : (
            <div className="ranking-list">
              {summary.products.slice(0, 5).map((product, index) => (
                <div className="ranking-item" key={product.name}>
                  <span className="ranking-number">{index + 1}</span>
                  <div className="ranking-detail">
                    <strong>{product.name}</strong>
                    <span>{product.units} unidad{product.units === 1 ? "" : "es"}</span>
                  </div>
                  <b>{formatCurrency(product.balance)}</b>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="finance-panel">
          <div className="finance-panel-heading">
            <div>
              <span className="finance-eyebrow">Cobros</span>
              <h2>Ventas por medio de pago</h2>
            </div>
          </div>
          {summary.paymentMethods.length === 0 ? (
            <p className="finance-message">No hay cobros en este período.</p>
          ) : (
            <div className="payment-list">
              {summary.paymentMethods.map((payment) => {
                const percentage = (payment.total / (summary.balance || 1)) * 100;
                return (
                  <div className="payment-item" key={payment.name}>
                    <div className="payment-meta">
                      <div>
                        <strong>{payment.name}</strong>
                        <span>{percentage.toFixed(0)}% del total</span>
                      </div>
                      <b>{formatCurrency(payment.total)}</b>
                    </div>
                    <div className="payment-track">
                      <span style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </article>
      </section>

      <section className="period-overview">
        <div className="finance-panel-heading">
          <div>
            <span className="finance-eyebrow">Resumen</span>
            <h2>Comparación por período</h2>
          </div>
        </div>
        <div className="period-overview-grid">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`period-summary ${selectedPeriod === key ? "active" : ""}`}
              onClick={() => setSelectedPeriod(key)}
            >
              <span>{label}</span>
              <strong>{formatCurrency(summaries[key].balance)}</strong>
              <small>{summaries[key].units} unidades</small>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
};

export default SalesSummary;
