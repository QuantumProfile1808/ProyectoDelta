import { useEffect, useState } from "react";

export default function useFinanzas(sucursalID) {
  const [ventasDia, setVentasDia] = useState([]);
  const [ventasSemana, setVentasSemana] = useState([]);
  const [ventasMes, setVentasMes] = useState([]);
  const [ventasAnio, setVentasAnio] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sucursalID) {
      setLoading(false);
      return;
    }

    const get = (url) => fetch(url).then((r) => r.json());

    async function loadData() {
      setLoading(true);

      const hoyObj = new Date();
      const hoy = hoyObj.toISOString().slice(0, 10);

      const day = hoyObj.getDay();
      const diff = day === 0 ? 6 : day - 1;

      const inicioSemana = new Date(hoyObj);
      inicioSemana.setDate(hoyObj.getDate() - diff);

      const fechaSemana = inicioSemana.toISOString().slice(0, 10);

      const fechaInicioMes = `${hoyObj.getFullYear()}-${String(
        hoyObj.getMonth() + 1
      ).padStart(2, "0")}-01`;

      const fechaInicioAnio = `${hoyObj.getFullYear()}-01-01`;

      const dia = await get(
        `http://127.0.0.1:8000/api/movimiento/resumen/?sucursal=${sucursalID}&desde=${hoy}&hasta=${hoy}`
      );
      const semana = await get(
        `http://127.0.0.1:8000/api/movimiento/resumen/?sucursal=${sucursalID}&desde=${fechaSemana}&hasta=${hoy}`
      );
      const mes = await get(
        `http://127.0.0.1:8000/api/movimiento/resumen/?sucursal=${sucursalID}&desde=${fechaInicioMes}&hasta=${hoy}`
      );
      const anio = await get(
        `http://127.0.0.1:8000/api/movimiento/resumen/?sucursal=${sucursalID}&desde=${fechaInicioAnio}&hasta=${hoy}`
      );

      setVentasDia(dia);
      setVentasSemana(semana);
      setVentasMes(mes);
      setVentasAnio(anio);
      setLoading(false);
    }

    loadData();
  }, [sucursalID]);

  const calcular = (lista) => ({
    cantidad: lista.length,
    balance: lista.reduce((acc, m) => acc + (m.subtotal || 0), 0),
  });

  return {
    loading,
    dia: calcular(ventasDia),
    semana: calcular(ventasSemana),
    mes: calcular(ventasMes),
    anio: calcular(ventasAnio),
  };
}
