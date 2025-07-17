import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "../css/carritoModal.css";

export default function CarritoModal({ isOpen, onClose, onConfirm, lineas }) {
  const [metodoPago, setMetodoPago] = useState("Mercado Pago");
  const [montoRecibido, setMontoRecibido] = useState("");
  const [vuelto, setVuelto] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setMetodoPago("Mercado Pago");
      setMontoRecibido("");
      setVuelto(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calcula total de la venta
  const totalVenta = lineas.reduce((acc, item) => acc + item.lineTotal, 0);
  const esEfectivo = metodoPago === "Efectivo";
  const recibido = parseFloat(montoRecibido) || 0;

  const montoInsuficiente = esEfectivo && montoRecibido !== "" && recibido < totalVenta;
  const puedeConfirmar = esEfectivo ? recibido >= totalVenta : true;

  function confirmarVenta() {
    const cambio = esEfectivo ? recibido - totalVenta : null;

    // Primer clic en efectivo: solo mostrar el vuelto
    if (esEfectivo && vuelto === null) {
      setVuelto(cambio);
      return;
    }

    // Segundo clic (o pago no efectivo): confirmar y cerrar modal
    onConfirm({
      paymentMethod: metodoPago,
      amountReceived: esEfectivo ? recibido : null,
      change: cambio
    });
  }

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal">
        <button onClick={onClose} className="modal-close">✖</button>
        <h2>Detalles del Pedido</h2>

        <table className="table-modal">
          <thead><tr><th>Desc.</th><th>Cant.</th><th>Precio</th><th>Total</th></tr></thead>
          <tbody>
            {lineas.map(item => (
              <tr key={item.id}>
                <td>{item.descripcion}</td>
                <td>{item.qty}</td>
                <td>${item.unitPrice.toFixed(2)}</td>
                <td>${item.lineTotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="modal-total">Total: <strong>${totalVenta.toFixed(2)}</strong></div>

        <label>
          Forma de pago:
          <select
            value={metodoPago}
            onChange={(e) => {
              setMetodoPago(e.target.value);
              setMontoRecibido("");
              setVuelto(null);
            }}
          >
            <option>Mercado Pago</option>
            <option>Efectivo</option>
          </select>
        </label>

        {esEfectivo && (
          <div className="cash-input">
            <label>
              Monto recibido:
              <input
                type="number"
                min="0"
                step="0.01"
                value={montoRecibido}
                onChange={(e) => setMontoRecibido(e.target.value)}
              />
            </label>
            {montoInsuficiente && (
              <p className="modal-error">Monto insuficiente (${totalVenta.toFixed(2)})</p>
            )}
          </div>
        )}

        <div className="modal-buttons">
          <button onClick={onClose}>Cancelar</button>
          <button
            onClick={confirmarVenta}
            disabled={!puedeConfirmar}
          >
            {esEfectivo && vuelto !== null ? 'Aceptar' : 'Confirmar'}
          </button>
        </div>

        {vuelto !== null && <div className="modal-change">Vuelto: ${vuelto.toFixed(2)}</div>}
      </div>
    </div>,
    document.body
  );
}
