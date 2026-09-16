import "./User.css";
import React, { useState, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { useCreateMovementMutation, useImportBackupMutation } from "../../../../api/bffApi";
import { buildApiUrl, getErrorMessage } from "../../../../api/client";
import CartModal from "./components/CartModal";


import { useAppliedDiscounts } from "../../../hooks/useAppliedDiscounts";
import Header from "../../../../components/Header";
import useBranchProducts from "../../../hooks/useBranchProducts";
import { useProfile } from "../../../hooks/useProfile";



export default function User() {
  const user = useSelector((state) => state.auth.user);
  const profile = useProfile();

  const { products: productList, categories: categories, loading, error, refetch } = useBranchProducts(profile?.sucursal?.id);
  const [createMovement] = useCreateMovementMutation();
  const [importBackup] = useImportBackupMutation();
  const [savingSale, setSavingSale] = useState(false);
  const salePending = useRef(false);

  const [cart, setCart] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [backupMessage, setBackupMessage] = useState("");
  const fileInputRef = useRef(null);

  function exportBackup() {
    // Download the backup directly.
    window.location.href = buildApiUrl("/api/backup/exportar/");
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("archivo", file);

    try {
      const data = await importBackup(formData).unwrap();
      setBackupMessage(data.mensaje || "Importacion completada");
    } catch (err) {
      console.error(err);
      setBackupMessage("Error al importar datos");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleQtyChange(id, e) {
    const raw = e.target.value;
    const product = productList.find((p) => p.id === id);
    if (!product) return;

    // Remove empty or zero quantities from the cart.
    if (raw.trim() === "" || raw === "0") {
      setCart((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }

    // Products sold by unit
    if (!product.medida) {
      const integers = raw.replace(/\D+/g, "");

      if (integers === "" || parseInt(integers) <= 0) {
        // Remove empty or invalid quantities.
        setCart((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        return;
      }

      // Limit the quantity to available stock.
      const val = Math.min(parseInt(integers, 10), product.stock);

      setCart((prev) => ({
        ...prev,
        [id]: val,
      }));

      return;
    }

    // Products sold by kilogram
    let val = raw.replace(",", ".");

    if (!/^\d*\.?\d{0,3}$/.test(val)) return;

    const num = parseFloat(val);

    if (isNaN(num) || num <= 0) {
      setCart((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }

    // Limit the quantity to available stock.
    const limited = Math.min(num, product.stock);

    setCart((prev) => ({
      ...prev,
      [id]: limited,
    }));
  }

  const selectedProducts = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => typeof qty === "number" && qty > 0)
      .map(([id, qty]) => {
        const product = productList.find((p) => p.id === parseInt(id));
        if (!product) return null;
        return {
          id: product.id,
          descripcion: product.descripcion,
          precio: Number(product.precio),
          cantidad: qty,
        };
      })
      .filter(Boolean);
  }, [cart, productList]);

  // Keep the discount hook at the component top level.
  const { lines, loading: pricing, error: pricingError, refetch: retryPricing } = useAppliedDiscounts(selectedProducts);

  const grandTotal = useMemo(() => {
    return lines.reduce((sum, l) => sum + l.line_total, 0);
  }, [lines]);

  const totalItems = useMemo(() => {
    return lines.reduce((sum, l) => sum + l.cantidad, 0);
  }, [lines]);

  const hasCartProducts = useMemo(() => {
    return Object.values(cart).some((qty) => typeof qty === "number" && qty > 0);
  }, [cart]);

  if (loading) return <p>Cargando…</p>;

  if (error) return <div role="alert">{error} <button onClick={refetch}>Reintentar</button></div>;

  const filteredProducts = productList.filter((p) => {
    const term = searchTerm.toLowerCase();
    const desc = p.descripcion?.toLowerCase() || "";
    const categoryDescription =
      categories.find((c) => c.id === p.categoria)?.descripcion.toLowerCase() ||
      "";
    const matchesText = desc.includes(term) || categoryDescription.includes(term);
    const matchesCategory =
      !selectedCategory || p.categoria === parseInt(selectedCategory);
    return matchesText && matchesCategory;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  async function handleConfirmSale({ paymentMethod }) {
    if (salePending.current || pricing || pricingError || !lines.length) return;
    salePending.current = true;
    setSavingSale(true);
    const now = new Date();
    const movementDate = now.toISOString().slice(0, 10);
    const hour = now.toTimeString().slice(0, 8);

    const movements = lines.map((l) => {
      const discountTotal = (l.descuento_unitario || 0) * (l.cantidad || 0);
      const promotionText = l.promocion
        ? ` con un tipo de descuento ${l.promocion.tipo} (-$${discountTotal.toFixed(2)})`
        : "";

      return {
      producto: l.producto_id ?? l.id, // Require a valid product ID.
      usuario: user.id,
      cantidad: l.cantidad,
      tipo_de_movimiento: "salida",
      metodo_de_pago: paymentMethod.toLowerCase(),
      descripcion: `Venta de ${l.cantidad} unidad/es a $${l.precio_unitario} c/u${promotionText}`,
      total: l.line_total,
      fecha: movementDate,
      hora: hour,
      };
    });

    try {
      const results = await Promise.allSettled(
        movements.map((movement) => createMovement(movement).unwrap())
      );
      const errors = results.filter((result) => result.status === "rejected");
      // Remove confirmed quantities so a partial failure cannot resubmit them.
      setCart((previous) => {
        const remaining = { ...previous };
        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            const { producto: product, cantidad: quantity } = movements[index];
            const next = Number(remaining[product] || 0) - quantity;
            if (next > 0) remaining[product] = next;
            else delete remaining[product];
          }
        });
        return remaining;
      });
      setShowModal(false);
      if (errors.length) {
        alert(errors.map((result) => getErrorMessage(result.reason)).join("\n"));
      } else {
        alert("Venta registrada con exito.");
      }
    } finally {
      salePending.current = false;
      setSavingSale(false);
    }
  }

  return (
    <div className="user-container">
      <Header />
      <div className="user-card">
        {backupMessage && <p role="status">{backupMessage}</p>}
        {pricing && <p role="status">Calculando descuentos...</p>}
        {pricingError && <p role="alert">{pricingError} <button onClick={retryPricing}>Reintentar</button></p>}
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="search-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.descripcion}
              </option>
            ))}
          </select>
        </div>

        <table className="history-table">
          <thead className="history-table-encabezado">
            <tr className="history-row-encabezado">
              <th className="history-column">Descripción</th>
              <th className="history-column">Precio</th>
              <th className="history-column">Stock</th>
              <th className="history-column">Categoría</th>
              <th className="history-column">Cantidad</th>
            </tr>
          </thead>
          <tbody className="history-table-cuerpo">
            {paginatedProducts.map((p) => {
              const categoryObject = categories.find((c) => c.id === p.categoria);

              const handleIncrement = () => {
                setCart((prev) => {
                  const current =
                    typeof prev[p.id] === "number" ? prev[p.id] : 0;

                  // Do not increment beyond available stock.
                  if (current >= p.stock) return prev;

                  const next = current + 1;

                  return { ...prev, [p.id]: next };
                });
              };

              const handleDecrement = () => {
                setCart((prev) => {
                  const currentValue = Number(prev[p.id] ?? 0);

                  // Ignore empty or undefined quantities.
                  if (!currentValue || currentValue <= 1) {
                    const next = { ...prev };
                    delete next[p.id];
                    return next;
                  }

                  return { ...prev, [p.id]: currentValue - 1 };
                });
              };

              return (
                <tr
                  key={p.id}
                  className={cart[p.id] ? "history-row" : ""}
                >
                  <td className="history-cell">{p.descripcion}</td>
                  <td className="history-cell">${p.precio}</td>
                  <td className="history-cell">{Number(p.stock)}</td>
                  <td className="history-cell">
                    {categoryObject ? categoryObject.descripcion : "—"}
                  </td>
                  <td className="history-cell">
                    <div className="qty-controls">
                      <button
                        className="decrement-btn"
                        onClick={handleDecrement}
                        disabled={p.stock <= 0 || !cart[p.id]}
                      >
                        -
                      </button>

                      <input
                        type="number"
                        min={p.medida ? "0.001" : "1"}
                        max={p.stock}
                        step={p.medida ? "0.001" : "1"}
                        disabled={p.stock <= 0}
                        value={cart[p.id] ?? ""}
                        onChange={(e) => handleQtyChange(p.id, e)}
                        style={{ width: "70px" }}
                      />

                      <button
                        className="increment-btn"
                        onClick={handleIncrement}
                        disabled={p.stock <= 0}
                      >
                        +
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>

        <CartModal
          isOpen={showModal}
          busy={savingSale || pricing || Boolean(pricingError)}
          onClose={() => setShowModal(false)}
          onConfirm={({ paymentMethod, amountReceived, change }) =>
            handleConfirmSale({ paymentMethod, amountReceived, change })
          }
          lines={lines}
        />

        <footer className="user-footer">
          <div className="footer-summary">
            <span>Total: ${grandTotal.toFixed(2)}</span>
          </div>
          <div className="footer-buttons">
            <button
              className="refresh-btn"
              onClick={refetch}
            >
              ⟳
            </button>
            <div className="backup-buttons">
              <button className="export-btn" onClick={exportBackup}>
                Exportar
              </button>
              <button
                className="import-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                Importar
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImport}
              />
            </div>
            <button
              className="cart-btn-footer"
              onClick={() => setShowModal(true)}
              disabled={!hasCartProducts || pricing || savingSale || Boolean(pricingError)}
              title={!hasCartProducts ? "Carrito vacío" : "Abrir carrito"}
            >
              🛒 Ver Carrito {totalItems > 0 ? `(${totalItems})` : ""}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
