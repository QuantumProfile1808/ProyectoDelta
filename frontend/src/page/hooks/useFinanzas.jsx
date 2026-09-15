import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000/api/movimiento/resumen/";

export default function useFinanzas(sucursalID, isAdmin = false) {
  const [periodos, setPeriodos] = useState({ dia: [], semana: [], mes: [], anio: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    if (!sucursalID && !isAdmin) {
      setLoading(false);
      return;
    }

    const get = async (desde, hasta) => {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `JWT ${token}` } : {};
      const params = new URLSearchParams({ desde, hasta });
      if (sucursalID) params.set("sucursal", sucursalID);
      const response = await fetch(`${API_URL}?${params}`, { headers });

      if (!response.ok) throw new Error("No se pudieron cargar las ventas.");

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("La respuesta de ventas no es válida.");
      return data;
    };

    async function loadData() {
      setLoading(true);

      const hoyObj = new Date();
      const toDateKey = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      const hoy = toDateKey(hoyObj);

      const day = hoyObj.getDay();
      const diff = day === 0 ? 6 : day - 1;

      const inicioSemana = new Date(hoyObj);
      inicioSemana.setDate(hoyObj.getDate() - diff);

      const fechaSemana = toDateKey(inicioSemana);

      const fechaInicioMes = `${hoyObj.getFullYear()}-${String(
        hoyObj.getMonth() + 1
      ).padStart(2, "0")}-01`;

      const fechaInicioAnio = `${hoyObj.getFullYear()}-01-01`;

      try {
        const [dia, semana, mes, anio] = await Promise.all([
          get(hoy, hoy),
          get(fechaSemana, hoy),
          get(fechaInicioMes, hoy),
          get(fechaInicioAnio, hoy),
        ]);

        if (activo) setPeriodos({ dia, semana, mes, anio });
      } catch (requestError) {
        if (activo) setError(requestError.message);
      } finally {
        if (activo) setLoading(false);
      }
    }

    loadData();

    return () => {
      activo = false;
    };
  }, [sucursalID, isAdmin]);

  const calcular = (lista) => {
    const productos = lista.reduce((acumulado, movimiento) => {
      const nombre = movimiento.producto_nombre || "Producto sin nombre";
      const actual = acumulado[nombre] || { nombre, unidades: 0, balance: 0 };
      actual.unidades += Number(movimiento.cantidad || 0);
      actual.balance += Number(movimiento.subtotal || movimiento.total || 0);
      acumulado[nombre] = actual;
      return acumulado;
    }, {});

    const metodosPago = lista.reduce((acumulado, movimiento) => {
      const metodo = movimiento.metodo_de_pago || "Sin especificar";
      acumulado[metodo] = (acumulado[metodo] || 0) + Number(movimiento.subtotal || 0);
      return acumulado;
    }, {});

    const balance = lista.reduce(
      (total, movimiento) => total + Number(movimiento.subtotal || movimiento.total || 0),
      0
    );

    return {
      cantidad: lista.length,
      unidades: lista.reduce((total, movimiento) => total + Number(movimiento.cantidad || 0), 0),
      balance,
      ticketPromedio: lista.length ? balance / lista.length : 0,
      productos: Object.values(productos).sort((a, b) => b.unidades - a.unidades),
      metodosPago: Object.entries(metodosPago)
        .map(([nombre, total]) => ({ nombre, total }))
        .sort((a, b) => b.total - a.total),
    };
  };

  return {
    loading,
    error,
    dia: calcular(periodos.dia),
    semana: calcular(periodos.semana),
    mes: calcular(periodos.mes),
    anio: calcular(periodos.anio),
  };
}
