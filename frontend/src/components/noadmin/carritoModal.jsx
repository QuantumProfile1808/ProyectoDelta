import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "../css/carritoModal.css";

export default function CarritoModal({ isOpen, onClose, onConfirm, lineas }) {
  const [metodoPago, setMetodoPago] = useState("transferencia");
  const [montoRecibido, setMontoRecibido] = useState("");
  const [vuelto, setVuelto] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setMetodoPago("transferencia");
      setMontoRecibido("");
      setVuelto(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalVenta = lineas.reduce((acc, item) => acc + item.lineTotal, 0);
  const totalDescuento = lineas.reduce(
    (acc, item) => acc + (item.descuentoAplicado || 0) * item.qty,
    0
  );

  const esEfectivo = metodoPago === "Efectivo";
  const recibido = parseFloat(montoRecibido) || 0;

  const montoInsuficiente =
    esEfectivo && montoRecibido !== "" && recibido < totalVenta;
  const puedeConfirmar = esEfectivo ? recibido >= totalVenta : true;

  function confirmarVenta() {
    const cambio = esEfectivo ? recibido - totalVenta : null;

    if (esEfectivo && vuelto === null) {
      setVuelto(cambio);
      return;
    }

    onConfirm({
      paymentMethod: metodoPago,
      amountReceived: esEfectivo ? recibido : null,
      change: cambio,
    });
  }

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal">
        <button onClick={onClose} className="modal-close">
          ✖
        </button>
        <h2>Detalles del Pedido</h2>

        <div className="table-wrapper">
          <table className="table-modal">
            <thead>
              <tr>
                <th>Desc.</th>
                <th>Cant.</th>
                <th>Precio</th>
                <th>Descuento</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {lineas.map((item) => (
                <tr key={item.id}>
                  <td className="desc-cell" title={item.descripcion}>
                    {item.descripcion}
                    {item.nombreDescuento && (
                      <span className="badge-descuento">
                        {item.nombreDescuento}
                      </span>
                    )}
                  </td>
                  <td>{item.qty}</td>
                  <td>
                    ${item.unitPrice.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td>
                    {item.descuentoAplicado
                      ? `-$${item.descuentoAplicado.toFixed(2)}`
                      : "—"}
                  </td>
                  <td>
                    ${item.lineTotal.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="modal-total">
          Total: <strong>${totalVenta.toFixed(2)}</strong>
        </div>

        {totalDescuento > 0 && (
          <div className="modal-discount">
            Descuentos aplicados: <strong>${totalDescuento.toFixed(2)}</strong>
          </div>
        )}

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
            <option>Transferencia</option>
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
              <p className="modal-error">
                Monto insuficiente (${totalVenta.toFixed(2)})
              </p>
            )}
          </div>
        )}

        <div className="modal-buttons">
          <button className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-confirm"
            onClick={confirmarVenta}
            disabled={!puedeConfirmar}
          >
            {esEfectivo && vuelto !== null ? "Aceptar" : "Confirmar"}
          </button>
        </div>

        {vuelto !== null && (
          <div className="modal-change">Vuelto: ${vuelto.toFixed(2)}</div>
        )}
      </div>
    </div>,
    document.body
  );
}
