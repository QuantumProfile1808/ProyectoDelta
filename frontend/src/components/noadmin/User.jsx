import React, { useState, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { useCreateMovementMutation, useImportBackupMutation } from "../../api/bffApi";
import { buildApiUrl, getErrorMessage } from "../../api/client";
import CarritoModal from "./carritoModal";
import "../css/Empleado.css";
import "../css/Tabla.css";
import { useDescuentosAplicados } from "../hooks/useDescuentosAplicados";
import Header from "../../components/admin/Header";
import useBranchProducts from "../hooks/useProductosSucursal";
import { usePerfil } from "../hooks/usePerfil";



export default function User() {
  const user = useSelector((state) => state.auth.user);
  const perfil = usePerfil();

  const { products: productos, categories: categorias, loading, error, refetch } = useBranchProducts(perfil?.sucursal?.id);
  const [createMovement] = useCreateMovementMutation();
  const [importBackup] = useImportBackupMutation();
  const [savingSale, setSavingSale] = useState(false);
  const salePending = useRef(false);

  const [carrito, setCarrito] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [mensajeBackup, setMensajeBackup] = useState("");
  const fileInputRef = useRef(null);

  function exportar() {
    // descarga directa del backup
    window.location.href = buildApiUrl("/api/backup/exportar/");
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("archivo", file);

    try {
      const data = await importBackup(formData).unwrap();
      setMensajeBackup(data.mensaje || "Importacion completada");
    } catch (err) {
      console.error(err);
      setMensajeBackup("Error al importar datos");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleQtyChange(id, e) {
    const raw = e.target.value;
    const producto = productos.find((p) => p.id === id);
    if (!producto) return;

    // Si borra el input o pone 0 → QUITAR DEL CARRITO
    if (raw.trim() === "" || raw === "0") {
      setCarrito((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }

    // --- PRODUCTO POR UNIDAD ---
    if (!producto.medida) {
      const enteros = raw.replace(/\D+/g, "");

      if (enteros === "" || parseInt(enteros) <= 0) {
        // borrar si queda vacío o inválido
        setCarrito((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        return;
      }

      // NO PERMITIR MÁS QUE EL STOCK:
      const val = Math.min(parseInt(enteros, 10), producto.stock);

      setCarrito((prev) => ({
        ...prev,
        [id]: val,
      }));

      return;
    }

    // --- PRODUCTO POR KG ---
    let val = raw.replace(",", ".");

    if (!/^\d*\.?\d{0,3}$/.test(val)) return;

    const num = parseFloat(val);

    if (isNaN(num) || num <= 0) {
      setCarrito((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }

    // NO PERMITIR SUPERAR STOCK
    const limitado = Math.min(num, producto.stock);

    setCarrito((prev) => ({
      ...prev,
      [id]: limitado,
    }));
  }

  const productosSeleccionados = useMemo(() => {
    return Object.entries(carrito)
      .filter(([, qty]) => typeof qty === "number" && qty > 0)
      .map(([id, qty]) => {
        const producto = productos.find((p) => p.id === parseInt(id));
        if (!producto) return null;
        return {
          id: producto.id,
          descripcion: producto.descripcion,
          precio: Number(producto.precio),
          cantidad: qty,
        };
      })
      .filter(Boolean);
  }, [carrito, productos]);

  // Hook de descuentos en el nivel superior, sin useMemo
  const { lineas, loading: pricing, error: pricingError, refetch: retryPricing } = useDescuentosAplicados(productosSeleccionados);

  const grandTotal = useMemo(() => {
    return lineas.reduce((sum, l) => sum + l.line_total, 0);
  }, [lineas]);

  const totalItems = useMemo(() => {
    return lineas.reduce((sum, l) => sum + l.cantidad, 0);
  }, [lineas]);

  const hayProductosEnCarrito = useMemo(() => {
    return Object.values(carrito).some((qty) => typeof qty === "number" && qty > 0);
  }, [carrito]);

  if (loading) return <p>Cargando…</p>;

  if (error) return <div role="alert">{error} <button onClick={refetch}>Reintentar</button></div>;

  const productosFiltrados = productos.filter((p) => {
    const term = searchTerm.toLowerCase();
    const desc = p.descripcion?.toLowerCase() || "";
    const catDesc =
      categorias.find((c) => c.id === p.categoria)?.descripcion.toLowerCase() ||
      "";
    const coincideTexto = desc.includes(term) || catDesc.includes(term);
    const coincideCategoria =
      !categoriaSeleccionada || p.categoria === parseInt(categoriaSeleccionada);
    return coincideTexto && coincideCategoria;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const productosPaginados = productosFiltrados.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);

  async function handleConfirmSale({ paymentMethod }) {
    if (salePending.current || pricing || pricingError || !lineas.length) return;
    salePending.current = true;
    setSavingSale(true);
    const ahora = new Date();
    const fecha = ahora.toISOString().slice(0, 10);
    const hora = ahora.toTimeString().slice(0, 8);

    const movimientos = lineas.map((l) => {
      const descuentoTotal = (l.descuento_unitario || 0) * (l.cantidad || 0);
      const promoTxt = l.promocion
        ? ` con un tipo de descuento ${l.promocion.tipo} (-$${descuentoTotal.toFixed(2)})`
        : "";

      return {
      producto: l.producto_id ?? l.id, // 👈 asegurate que exista
      usuario: user.id,
      cantidad: l.cantidad,
      tipo_de_movimiento: "salida",
      metodo_de_pago: paymentMethod.toLowerCase(),
      descripcion: `Venta de ${l.cantidad} unidad/es a $${l.precio_unitario} c/u${promoTxt}`,
      total: l.line_total,
      fecha,
      hora,
      };
    });

    try {
      const results = await Promise.allSettled(
        movimientos.map((movimiento) => createMovement(movimiento).unwrap())
      );
      const errors = results.filter((result) => result.status === "rejected");
      // Remove confirmed quantities so a partial failure cannot resubmit them.
      setCarrito((previous) => {
        const remaining = { ...previous };
        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            const { producto, cantidad } = movimientos[index];
            const next = Number(remaining[producto] || 0) - cantidad;
            if (next > 0) remaining[producto] = next;
            else delete remaining[producto];
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
        {mensajeBackup && <p role="status">{mensajeBackup}</p>}
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
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.descripcion}
              </option>
            ))}
          </select>
        </div>

        <table className="historial-tabla">
          <thead className="historial-tabla-encabezado">
            <tr className="historial-fila-encabezado">
              <th className="historial-columna">Descripción</th>
              <th className="historial-columna">Precio</th>
              <th className="historial-columna">Stock</th>
              <th className="historial-columna">Categoría</th>
              <th className="historial-columna">Cantidad</th>
            </tr>
          </thead>
          <tbody className="historial-tabla-cuerpo">
            {productosPaginados.map((p) => {
              const catObj = categorias.find((c) => c.id === p.categoria);

              const handleIncrement = () => {
                setCarrito((prev) => {
                  const current =
                    typeof prev[p.id] === "number" ? prev[p.id] : 0;

                  // Si ya está al límite → no sumar más
                  if (current >= p.stock) return prev;

                  const next = current + 1;

                  return { ...prev, [p.id]: next };
                });
              };

              const handleDecrement = () => {
                setCarrito((prev) => {
                  const actual = Number(prev[p.id] ?? 0);

                  // Si estaba vacío o no definido → no hacer nada
                  if (!actual || actual <= 1) {
                    const next = { ...prev };
                    delete next[p.id];
                    return next;
                  }

                  return { ...prev, [p.id]: actual - 1 };
                });
              };

              return (
                <tr
                  key={p.id}
                  className={carrito[p.id] ? "historial-fila" : ""}
                >
                  <td className="historial-celda">{p.descripcion}</td>
                  <td className="historial-celda">${p.precio}</td>
                  <td className="historial-celda">{Number(p.stock)}</td>
                  <td className="historial-celda">
                    {catObj ? catObj.descripcion : "—"}
                  </td>
                  <td className="historial-celda">
                    <div className="qty-controls">
                      <button
                        className="decrement-btn"
                        onClick={handleDecrement}
                        disabled={p.stock <= 0 || !carrito[p.id]}
                      >
                        -
                      </button>

                      <input
                        type="number"
                        min={p.medida ? "0.001" : "1"}
                        max={p.stock}
                        step={p.medida ? "0.001" : "1"}
                        disabled={p.stock <= 0}
                        value={carrito[p.id] ?? ""}
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

        <CarritoModal
          isOpen={showModal}
          busy={savingSale || pricing || Boolean(pricingError)}
          onClose={() => setShowModal(false)}
          onConfirm={({ paymentMethod, amountReceived, change }) =>
            handleConfirmSale({ paymentMethod, amountReceived, change })
          }
          lineas={lineas}
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
              <button className="export-btn" onClick={exportar}>
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
              disabled={!hayProductosEnCarrito || pricing || savingSale || Boolean(pricingError)}
              title={!hayProductosEnCarrito ? "Carrito vacío" : "Abrir carrito"}
            >
              🛒 Ver Carrito {totalItems > 0 ? `(${totalItems})` : ""}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
