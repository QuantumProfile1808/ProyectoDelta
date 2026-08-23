import { useEffect, useState } from "react";

export function useDashboardData(sucursalID, isAdmin=false) {
  const [ultimos, setUltimos] = useState([]);
  const [ventasHoy, setVentasHoy] = useState([]);
  const [ventasSemana, setVentasSemana] = useState([]);
  const [ventasMes, setVentasMes] = useState([]);
  const [gananciaMes, setGananciaMes] = useState(0);
  const [alertasStock, setAlertasStock] = useState({
    items_sin_stock: [],
    items_bajo_stock: [],
  });

  useEffect(() => {
    if (!sucursalID && !isAdmin) return;

    const get = (url) => {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `JWT ${token}`;
      return fetch(url, { headers })
        .then((r) => r.json())
        .catch(() => null);
    };

    // Fechas
    const hoy = new Date().toISOString().slice(0, 10);

    // Semana desde lunes
    const hoyObj = new Date();
    const day = hoyObj.getDay();
    const diff = day === 0 ? 6 : day - 1;

    const inicioSemana = new Date(hoyObj);
    inicioSemana.setDate(hoyObj.getDate() - diff);

    const fechaSemana = inicioSemana.toISOString().slice(0, 10);

    // Mes desde el día 1
    const fechaInicioMes = `${hoyObj.getFullYear()}-${String(
      hoyObj.getMonth() + 1
    ).padStart(2, "0")}-01`;

    // Últimos movimientos (si es admin y no hay sucursal, traer global)
    const sucParam = sucursalID ? `?sucursal=${sucursalID}` : "";
    const ultimosUrl = isAdmin && !sucursalID
      ? `http://127.0.0.1:8000/api/movimiento/ultimos/`
      : `http://127.0.0.1:8000/api/movimiento/ultimos/${sucursalID ? `?sucursal=${sucursalID}` : ''}`;

    // normalize ultimosUrl: if sucursalID present it's handled, else empty param removed
    const ultimosFinal = isAdmin && !sucursalID ? `http://127.0.0.1:8000/api/movimiento/ultimos/` : `http://127.0.0.1:8000/api/movimiento/ultimos/${sucursalID ? `?sucursal=${sucursalID}` : ''}`;
    // but simpler: build properly
    const buildUrl = (base, params) => (params ? `${base}?${params}` : base);
    const ultimosBuilt = isAdmin && !sucursalID ? buildUrl('http://127.0.0.1:8000/api/movimiento/ultimos/', '') : buildUrl('http://127.0.0.1:8000/api/movimiento/ultimos/', sucursalID ? `sucursal=${sucursalID}` : '');

    get(ultimosBuilt).then((data) => setUltimos(Array.isArray(data) ? data : []));

    // Ventas hoy
    const resumenBase = 'http://127.0.0.1:8000/api/movimiento/resumen/';
    const build = (params) => (params ? `${resumenBase}?${params}` : resumenBase);

    const ventasHoyParams = isAdmin && !sucursalID ? `desde=${hoy}&hasta=${hoy}` : `sucursal=${sucursalID}&desde=${hoy}&hasta=${hoy}`;
    get(build(ventasHoyParams)).then((data) => setVentasHoy(Array.isArray(data) ? data : []));

    // Ventas semana
    const ventasSemanaParams = isAdmin && !sucursalID ? `desde=${fechaSemana}&hasta=${hoy}` : `sucursal=${sucursalID}&desde=${fechaSemana}&hasta=${hoy}`;
    get(build(ventasSemanaParams)).then((data) => setVentasSemana(Array.isArray(data) ? data : []));

    // Ventas mes + ganancia
    const ventasMesParams = isAdmin && !sucursalID ? `desde=${fechaInicioMes}&hasta=${hoy}` : `sucursal=${sucursalID}&desde=${fechaInicioMes}&hasta=${hoy}`;
    get(build(ventasMesParams)).then((data) => {
      const arr = Array.isArray(data) ? data : [];
      setVentasMes(arr);
      setGananciaMes(arr.reduce((acc, m) => acc + (m.subtotal || 0), 0));
    });

    get(
      `http://127.0.0.1:8000/api/producto/stock/alertas/${sucursalID ? `?sucursal=${sucursalID}` : ''}`
    ).then((data) => {
      if (data && typeof data === "object") {
        setAlertasStock({
          items_sin_stock: data.items_sin_stock || [],
          items_bajo_stock: data.items_bajo_stock || [],
        });
      } else {
        setAlertasStock({ items_sin_stock: [], items_bajo_stock: [] });
      }
    });
  }, [sucursalID, isAdmin]);

  return {
    ultimos,
    ventasHoy,
    ventasSemana,
    ventasMes,
    gananciaMes,
    alertasStock,
  };
}
