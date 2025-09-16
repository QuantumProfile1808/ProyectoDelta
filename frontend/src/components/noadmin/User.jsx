import React, { useState, useMemo } from "react";
import usePerfilyProductos from "../hooks/usePerfilyProductos";
import useCategoriasNoadmin from "../hooks/useCategoriasNoadmin";
import CarritoModal from "./carritoModal";
import "../css/Empleado.css";
import { useDescuentosAplicados } from "../hooks/useDescuentosAplicados";
import Header from "../../components/admin/Header";

export default function User() {
  const { perfil, productos, loading, error } = usePerfilyProductos();
  const { categorias } = useCategoriasNoadmin();

  const [carrito, setCarrito] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  function handleQtyChange(id, e) {
    const value = e.target.value;
    const qty = parseInt(value, 10);

    setCarrito(prev => {
      const next = { ...prev };
      if (value === "") {
        // permitir limpiar el input mientras escribe
        next[id] = "";
      } else if (!isNaN(qty) && qty > 0) {
        next[id] = qty;
      } else {
        delete next[id];
      }
      return next;
    });
  }

  const productosSeleccionados = useMemo(() => {
    return Object.entries(carrito)
      .filter(([_, qty]) => typeof qty === "number" && qty > 0)
      .map(([id, qty]) => {
        const producto = productos.find(p => p.id === parseInt(id));
        if (!producto) return null;
        return {
          id: producto.id,
          descripcion: producto.descripcion,
          precio: Number(producto.precio),
          cantidad: qty
        };
      })
      .filter(Boolean);
  }, [carrito, productos]);

  // Hook de descuentos en el nivel superior, sin useMemo
  const lineas = useDescuentosAplicados(productosSeleccionados) || [];

  const grandTotal = useMemo(() => {
    return lineas.reduce((sum, l) => sum + (l.lineTotal || 0), 0);
  }, [lineas]);

  const totalItems = useMemo(() => {
  return lineas.reduce((sum, item) => {
    const qty = typeof item.cantidad === "number" ? item.cantidad : 0;
    return sum + qty;
  }, 0);
}, [lineas]);

  if (loading) return <p>Cargando…</p>;
  if (error) return <p>Error: {error}</p>;



  const productosFiltrados = productos.filter(p => {
    const term = searchTerm.toLowerCase();
    const desc = p.descripcion?.toLowerCase() || "";
    const catDesc = categorias.find(c => c.id === p.categoria)?.descripcion.toLowerCase() || "";
    const coincideTexto = desc.includes(term) || catDesc.includes(term);
    const coincideCategoria = !categoriaSeleccionada || p.categoria === parseInt(categoriaSeleccionada);
    return coincideTexto && coincideCategoria;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const productosPaginados = productosFiltrados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);

  function handleConfirmSale({ paymentMethod, amountReceived, change }) {
    const ahora = new Date();
    const fecha = ahora.toISOString().slice(0, 10);
    const hora = ahora.toTimeString().slice(0, 8);

    const movimientos = lineas.map(l => ({
      producto: parseInt(l.id),
      usuario: perfil.user.id,
      cantidad: l.cantidad ?? l.qty, // usa cantidad si existe, sino usa qty
      tipo_de_movimiento: "salida",
      metodo_de_pago: paymentMethod.toLowerCase(),
      descripcion: `Venta de ${l.cantidad ?? l.qty} unidad/es a $${l.unitPrice ?? l.precio} c/u` +
        (l.descuentoAplicado ? ` con descuento de $${Number(l.descuentoAplicado).toFixed(2)} por unidad` : ""),
      fecha,
      hora
    }));

    Promise.all(
      movimientos.map(m =>
        fetch("http://127.0.0.1:8000/api/movimiento/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(m)
        })
      )
    )
      .then(async responses => {
        const results = await Promise.all(
          responses.map(async r => {
            const body = await r.json().catch(() => ({}));
            return { ok: r.ok, body };
          })
        );

        const errores = results.filter(r => !r.ok);
        if (errores.length > 0) {
          const mensaje = errores
            .map(e =>
              e.body?.non_field_errors?.[0] ||
              (Object.values(e.body || {})[0]?.[0]) ||
              "Error desconocido"
            )
            .join("\n");
          throw new Error(mensaje);
        }

        setCarrito({});
        setShowModal(false);
        alert("Venta registrada con éxito.");
      })
      .catch(err => {
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
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select
            className="search-select"
            value={categoriaSeleccionada}
            onChange={e => setCategoriaSeleccionada(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categorias.map(c => (
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
            {productosPaginados.map(p => {
              const catObj = categorias.find(c => c.id === p.categoria);

              const handleIncrement = () => {
                setCarrito(prev => ({
                  ...prev,
                  [p.id]: prev[p.id]
                    ? Math.min(
                        typeof prev[p.id] === "number" ? prev[p.id] + 1 : 1,
                        p.stock
                      )
                    : 1
                }));
              };

              const handleDecrement = () => {
                setCarrito(prev => {
                  const current = typeof prev[p.id] === "number" ? prev[p.id] : 0;
                  if (current <= 1) {
                    const next = { ...prev };
                    delete next[p.id];
                    return next;
                  }
                  return { ...prev, [p.id]: current - 1 };
                });
              };

              return (
                <tr key={p.id} className={carrito[p.id] ? "historial-fila" : ""}>
                  <td className="historial-celda">{p.descripcion}</td>
                  <td className="historial-celda">${p.precio}</td>
                  <td className="historial-celda">{p.stock}</td>
                  <td className="historial-celda">{catObj ? catObj.descripcion : "—"}</td>
                  <td className="historial-celda">
                    <div className="qty-controls">
                      <button className="decrement-btn"
                        onClick={handleDecrement}
                        disabled={p.stock === 0 || carrito[p.id] === undefined || carrito[p.id] === ""}
                        aria-label="Restar uno"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={p.stock}
                        value={carrito[p.id] !== undefined ? carrito[p.id] : ""}
                        onChange={e => handleQtyChange(p.id, e)}
                        disabled={p.stock === 0}
                      />
                      <button className="increment-btn"
                        onClick={handleIncrement}
                        disabled={p.stock === 0}
                        aria-label="Sumar uno"
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
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
            <button className="refresh-btn" onClick={() => window.location.reload()}>
              ⟳
            </button>
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
