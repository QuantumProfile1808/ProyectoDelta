import React, { useState, useMemo, useRef } from "react";
import useCategoriasNoadmin from "../hooks/useCategoriasNoadmin";
import CarritoModal from "./carritoModal";
import "../css/Empleado.css";
import { useDescuentosAplicados } from "../hooks/useDescuentosAplicados";
import Header from "../../components/admin/Header";
import useProductosSucursal from "../hooks/useProductosSucursal";
import { usePerfil } from "../hooks/usePerfil";

export default function User() {
  const perfil = usePerfil();

  const { productos, loading } = useProductosSucursal(perfil?.sucursal?.id);
  const { categorias } = useCategoriasNoadmin();

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
    window.location.href = "http://127.0.0.1:8000/api/backup/exportar/";
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("archivo", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/backup/importar/", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      setMensajeBackup(
        data.mensaje ||
          (res.ok ? "Importación completada" : "Error al importar datos")
      );
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
      .filter(([_, qty]) => typeof qty === "number" && qty > 0)
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
  const lineas = useDescuentosAplicados(productosSeleccionados) || [];

  const grandTotal = useMemo(() => {
    return lineas.reduce((sum, l) => sum + l.line_total, 0);
  }, [lineas]);

  const totalItems = useMemo(() => {
    return lineas.reduce((sum, l) => sum + l.cantidad, 0);
  }, [lineas]);

  if (loading) return <p>Cargando…</p>;

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

  function handleConfirmSale({ paymentMethod }) {
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
      usuario: perfil.user.id,
      cantidad: l.cantidad,
      tipo_de_movimiento: "salida",
      metodo_de_pago: paymentMethod.toLowerCase(),
      descripcion: `Venta de ${l.cantidad} unidad/es a $${l.precio_unitario} c/u${promoTxt}`,
      total: l.line_total,
      fecha,
      hora,
      };
    });

    Promise.all(
      movimientos.map((m) =>
        fetch("http://127.0.0.1:8000/api/movimiento/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(m),
        })
      )
    )
      .then(async (responses) => {
        const results = await Promise.all(
          responses.map(async (r) => {
            const body = await r.json().catch(() => ({}));
            return { ok: r.ok, body };
          })
        );

        const errores = results.filter((r) => !r.ok);
        if (errores.length > 0) {
          const mensaje = errores
            .map(
              (e) =>
                e.body?.non_field_errors?.[0] ||
                Object.values(e.body || {})[0]?.[0] ||
                "Error desconocido"
            )
            .join("\n");
          throw new Error(mensaje);
        }

        setCarrito({});
        setShowModal(false);
        alert("Venta registrada con éxito.");
        window.location.reload();
      })
      .catch((err) => {
        console.error(err);
        alert(`Error: ${err.message}`);
      });
  }

  return (
    <div className="user-container">
      <Header />
      <div className="user-card">
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
              onClick={() => window.location.reload()}
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
              disabled={lineas.length === 0}
              title={lineas.length === 0 ? "Carrito vacío" : "Abrir carrito"}
            >
              🛒 Ver Carrito {totalItems > 0 ? `(${totalItems})` : ""}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
