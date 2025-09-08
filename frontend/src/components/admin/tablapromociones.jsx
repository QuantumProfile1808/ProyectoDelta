import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import "../../components/css/promociones.css";

export const ListaPromociones = () => {
  const [todas, setTodas] = useState([]); // todas las promociones desde el backend
  const [selected, setSelected] = useState(null);
  const [mostrarInactivas, setMostrarInactivas] = useState(false);
  const navigate = useNavigate();

  const cargarPromociones = useCallback(async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/descuento/");
      const data = await res.json();
      const lista = Array.isArray(data) ? data : data.results || [];
      setTodas(lista);
    } catch (err) {
      console.error("Error cargando promociones:", err);
    }
  }, []);

  useEffect(() => {
    cargarPromociones();
  }, [cargarPromociones]);

  // Filtrado en memoria según el toggle
  const descuentos = todas.filter(d =>
    mostrarInactivas ? d.activo === false : d.activo === true
  );

  const toggleActivo = async (id, curr) => {
    const nuevo = !curr;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/descuento/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: nuevo }),
      });
      if (!res.ok) throw new Error("Error al actualizar estado");
      await cargarPromociones(); // refrescamos todas para mantener coherencia
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="historial-container">
        <div className="historial-header">
            <button
            onClick={() => setMostrarInactivas(prev => !prev)}
            className="btn-toggle"
            >
            {mostrarInactivas ? "Mostrar activas" : "Mostrar inactivas"}
            </button>
            <h2>Promociones</h2>
    </div>


      <table className="historial-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Etiqueta</th>
          </tr>
        </thead>
      <tbody>
        {descuentos.map((d) => (
            <tr key={d.id} className={selected?.id === d.id ? "selected-row" : ""}>
            <td onClick={() => setSelected(d)} title="Ver detalles">
                {d.nombre}
            </td>
            <td onClick={() => setSelected(d)}>{d.tipo}</td>
            <td>
                <label className="switch" onClick={(e) => e.stopPropagation()}>
                <input
                    type="checkbox"
                    checked={d.activo}
                    onChange={(e) => {
                    e.stopPropagation();
                    toggleActivo(d.id, d.activo);
                    }}
                />
                <span className="slider round"></span>
                </label>
            </td>
            <td>
                <span
                style={{ color: d.activo ? "green" : "red", cursor: "pointer" }}
                onClick={() => setSelected(d)}
                >
                {d.activo ? "Activa" : "Inactiva"}
                </span>
            </td>
            </tr>
        ))}
        </tbody>
      </table>

      {selected && (
        <div className="historial-overlay" onClick={() => setSelected(null)}>
          <div className="historial-popup" onClick={(e) => e.stopPropagation()}>
            <div className="historial-popup-header">
              <strong>Detalles de la promoción</strong>
              <button
                className="historial-popup-close"
                onClick={() => setSelected(null)}
                title="Cerrar"
              >
                &#10006;
              </button>
            </div>
            <div className="historial-popup-details">
              <div>ID: <b>{selected.id}</b></div>
              <div>Nombre: <b>{selected.nombre}</b></div>
              <div>Tipo: <b>{selected.tipo}</b></div>
              {selected.tipo === "PORCENTAJE" && (
                <div>Porcentaje: <b>{selected.porcentaje ?? "-"}</b></div>
              )}
              {selected.tipo === "PRECIO_FIJO" && (
                <div>Precio fijo: <b>{selected.precio_fijo ?? "-"}</b></div>
              )}
              {selected.tipo === "CANTIDAD" && (
                <>
                  <div>Cantidad requerida: <b>{selected.cantidad_requerida ?? "-"}</b></div>
                  <div>Cantidad pagada: <b>{selected.cantidad_pagada ?? "-"}</b></div>
                </>
              )}
              <div>Estado: <b style={{ color: selected.activo ? "green" : "red" }}>
                {selected.activo ? "Activa" : "Inactiva"}
              </b></div>
              <div>Productos aplicables: <b>
                {Array.isArray(selected.productos) && selected.productos.length > 0
                  ? selected.productos.join(", ")
                  : "No asignados"}
              </b></div>
            </div>
          </div>
        </div>
      )}

      <button
        className="boton-flotante"
        onClick={() => navigate("/dashboard/promociones")}
        title="Agregar nueva promoción"
      >
        <FaPlus size={20} />
      </button>
    </div>
  );
};

export default ListaPromociones;
