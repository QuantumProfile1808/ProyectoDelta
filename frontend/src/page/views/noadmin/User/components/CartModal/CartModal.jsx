import "./CartModal.css";
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";


export default function CartModal({ isOpen, onClose, onConfirm, lines, busy = false }) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("transferencia");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [changeDue, setChangeDue] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedPaymentMethod("transferencia");
      setReceivedAmount("");
      setChangeDue(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const saleTotal = lines.reduce((acc, item) => acc + item.line_total, 0);

  const totalDiscount = lines.reduce(
    (acc, item) => acc + (item.descuento_unitario || 0) * item.cantidad,
    0
  );

  const isCash = selectedPaymentMethod === "Efectivo";
  const received = parseFloat(receivedAmount) || 0;

  const insufficientAmount =
    isCash && receivedAmount !== "" && received < saleTotal;
  const canConfirm = isCash ? received >= saleTotal : true;

  function confirmSale() {
    if (busy) return;
    const cashChange = isCash ? received - saleTotal : null;

    if (isCash && changeDue === null) {
      setChangeDue(cashChange);
      return;
    }

    onConfirm({
      paymentMethod: selectedPaymentMethod,
      amountReceived: isCash ? received : null,
      change: cashChange,
    });
  }

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal">
        <button onClick={onClose} className="modal-close" disabled={busy}>
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
                <th>Descuento/Item</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((item) => (
                <tr key={item.id}>
                  <td className="desc-cell">
                    {item.producto_nombre}
                    {item.promocion?.nombre && (
                      <span className="badge-discount">
                        {item.promocion.nombre}
                      </span>
                    )}
                  </td>
                  <td>{item.cantidad}</td>
                  <td>${item.precio_unitario.toFixed(2)}</td>
                  <td>
                    {item.descuento_unitario
                      ? `-$${item.descuento_unitario.toFixed(2)}`
                      : "—"}
                  </td>
                  <td>${item.line_total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="modal-total">
          Total: <strong>${saleTotal.toFixed(2)}</strong>
        </div>

        {totalDiscount > 0 && (
          <div className="modal-discount">
            Descuentos aplicados: <strong>${totalDiscount.toFixed(2)}</strong>
          </div>
        )}

        <label>
          Forma de pago:
          <select
            value={selectedPaymentMethod}
            onChange={(e) => {
              setSelectedPaymentMethod(e.target.value);
              setReceivedAmount("");
              setChangeDue(null);
            }}
          >
            <option>Transferencia</option>
            <option>Efectivo</option>
          </select>
        </label>

        {isCash && (
          <div className="cash-input">
            <label>
              Monto recibido:
              <input
                type="number"
                min="0"
                step="0.01"
                value={receivedAmount}
                onChange={(e) => setReceivedAmount(e.target.value)}
              />
            </label>
            {insufficientAmount && (
              <p className="modal-error">
                Monto insuficiente (${saleTotal.toFixed(2)})
              </p>
            )}
          </div>
        )}

        <div className="modal-buttons">
          <button className="btn-cancel" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button
            className="btn-confirm"
            onClick={confirmSale}
            disabled={!canConfirm || busy || !lines.length}
          >
            {isCash && changeDue !== null ? "Aceptar" : "Confirmar"}
          </button>
        </div>

        {changeDue !== null && (
          <div className="modal-change">Vuelto: ${changeDue.toFixed(2)}</div>
        )}
      </div>
    </div>,
    document.body
  );
}
