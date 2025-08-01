import React, { useState } from "react";
import usePerfilyProductos from "../hooks/usePerfilyProductos";
import useCategoriasNoadmin from "../hooks/useCategoriasNoadmin";
import CarritoModal from "./carritoModal";
import "../css/Empleado.css";

export default function User() {
  const { perfil, productos, loading, error } = usePerfilyProductos();
  const { categorias } = useCategoriasNoadmin();

  const [carrito, setCarrito] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");

  const lineas = prepararLineas();

  function toggleSelect(id) {
    setCarrito(prev => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = 1;
      return next;
    });
  }

  function handleQtyChange(id, e) {
    const qty = parseInt(e.target.value, 10) || 0;
    setCarrito(prev => ({
      ...prev,
      [id]: qty > 0 ? qty : undefined
    }));
  }

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

  const totalItems = Object.values(carrito).reduce((sum, n) => sum + (n || 0), 0);

  function prepararLineas() {
    return Object.entries(carrito).map(([id, qty]) => {
      const producto = productos.find(p => p.id === parseInt(id));
      const precioUnitario = Number(producto.precio);
      return {
        id,
        descripcion: producto.descripcion,
        qty,
        unitPrice: precioUnitario,
        lineTotal: precioUnitario * qty
      };
    });
  }

  const grandTotal = lineas.reduce((sum, l) => sum + l.lineTotal, 0);

  function handleConfirmSale({ paymentMethod, amountReceived, change }) {
    const ahora = new Date();
    const fecha = ahora.toISOString().slice(0, 10);
    const hora = ahora.toTimeString().slice(0, 8);

    const movimientos = lineas.map(l => ({
      producto: parseInt(l.id),
      usuario: perfil.user.id,
      cantidad: l.qty,
      tipo_de_movimiento: "salida",
      metodo_de_pago: paymentMethod.toLowerCase(),
      descripcion: `Venta de ${l.qty} unidad/es a $${l.unitPrice} c/u`,
      fecha,
      hora
    }));

    Promise.all(
      movimientos.map(m =>
        fetch("http://127.0.0.1:8000/api/movimiento/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify(m)
        })
      )
    )
      .then(async responses => {
        const results = await Promise.all(
          responses.map(async r => {
            const body = await r.json();
            return { ok: r.ok, body };
          })
        );

        const errores = results.filter(r => !r.ok);
        if (errores.length > 0) {
          const mensaje = errores
            .map(e =>
              e.body?.non_field_errors?.[0] ||
              Object.values(e.body)[0]?.[0] ||
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
      <h1>
        Bienvenido, {perfil.user.first_name} — Sucursal: {perfil.sucursal.localidad}
      </h1>
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
          onChange={e => setCategoriaSeleccionada(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.map(c => (
            <option key={c.id} value={c.id}>
              {c.descripcion}
            </option>
          ))}
        </select>
      </div>

      <table className="product-table">
        <thead>
          <tr>
            <th>Sel</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Categoría</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {productosFiltrados.map(p => {
            const qty = carrito[p.id] || "";
            const catObj = categorias.find(c => c.id === p.categoria);
            return (
              <tr key={p.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={!!carrito[p.id]}
                    onChange={() => toggleSelect(p.id)}
                    disabled={p.stock === 0}
                  />
                </td>
                <td>{p.descripcion}</td>
                <td>${p.precio}</td>
                <td>{p.stock}</td>
                <td>{catObj ? catObj.descripcion : "—"}</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    max={p.stock}
                    value={qty}
                    onChange={e => handleQtyChange(p.id, e)}
                    disabled={!carrito[p.id]}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button
        className="cart-btn-container"
        onClick={() => setShowModal(true)}
        disabled={grandTotal === 0}
      >
        🛒 Ver Carrito
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
    </div>
  );
}
