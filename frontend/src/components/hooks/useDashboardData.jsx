import { useEffect, useState } from "react";

export function useDashboardData(sucursalID) {
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
    if (!sucursalID) return;

    const get = (url) => fetch(url).then((r) => r.json());

    // Fechas
    const hoy = new Date().toISOString().slice(0, 10);

    const inicioSemana = new Date();
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
    const fechaSemana = inicioSemana.toISOString().slice(0, 10);

    const hoyObj = new Date();
    const fechaInicioMes = `${hoyObj.getFullYear()}-${String(
      hoyObj.getMonth() + 1
    ).padStart(2, "0")}-01`;

    // Últimos movimientos
    get(
      `http://127.0.0.1:8000/api/movimiento/ultimos/?sucursal=${sucursalID}`
    ).then(setUltimos);

    // Ventas hoy
    get(
      `http://127.0.0.1:8000/api/movimiento/resumen/?sucursal=${sucursalID}&desde=${hoy}&hasta=${hoy}`
    ).then(setVentasHoy);

    // Ventas semana
    get(
      `http://127.0.0.1:8000/api/movimiento/resumen/?sucursal=${sucursalID}&desde=${fechaSemana}&hasta=${hoy}`
    ).then(setVentasSemana);

    // Ventas mes + ganancia
    get(
      `http://127.0.0.1:8000/api/movimiento/resumen/?sucursal=${sucursalID}&desde=${fechaInicioMes}&hasta=${hoy}`
    ).then((data) => {
      setVentasMes(data);
      setGananciaMes(data.reduce((acc, m) => acc + (m.subtotal || 0), 0));
    });
    get(
      `http://127.0.0.1:8000/api/producto/stock/alertas/?sucursal=${sucursalID}`
    ).then(setAlertasStock);
  }, [sucursalID]);
    
  return {
    ultimos,
    ventasHoy,
    ventasSemana,
    ventasMes,
    gananciaMes,
    alertasStock,
  };
}
