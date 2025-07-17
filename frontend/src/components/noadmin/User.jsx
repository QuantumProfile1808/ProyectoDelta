import React, { useState, useEffect } from "react";
import CarritoModal from "./carritoModal";

export default function User() {
  const [perfil, setPerfil] = useState(null);
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const lineas = prepararLineas();
  

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/perfil/", { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Error al cargar perfil");
        return res.json();
      })
      .then(data => {
        const p = Array.isArray(data) ? data[0] : data;
        setPerfil(p);
        return fetch(
          `http://127.0.0.1:8000/api/producto/?sucursal=${p.sucursal.id}`,
          { credentials: "include" }
        );
      })
      .then(res => {
        if (!res.ok) throw new Error("Error al cargar productos");
        return res.json();
      })
      .then(setProductos)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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
    return (
      p.descripcion.toLowerCase().includes(term) ||
      (p.categoria &&
        p.categoria.descripcion.toLowerCase().includes(term))
    );
  });

  const totalItems = Object.values(carrito).reduce((sum, n) => sum + (n || 0), 0);

  // Prepara las líneas para el modal
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
    console.log("Venta confirmada:", { paymentMethod, amountReceived, change, lineas });
    setCarrito({});       // limpia el carrito
    setShowModal(false);   // cierra el modal
    alert("Venta exitosa. ¡Carrito reiniciado!");
  }
  

  return (
    <div>
      <h1>
        Bienvenido, {perfil.user.first_name} — Sucursal: {perfil.sucursal.localidad}
      </h1>

      <button onClick={() => setShowModal(true)} disabled={grandTotal === 0}>
        🛒 Ver Carrito
      </button>

      <div>
        <input
          type="text"
          placeholder="Buscar…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <table>
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
                <td>{p.categoria?.descripcion || "—"}</td>
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

      {/* Modal de detalles */}
      <CarritoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={({ paymentMethod, amountReceived, change }) => {
          // Aquí recibes la info de la venta
          console.log("Venta realizada:", { paymentMethod, amountReceived, change });
          setCarrito({});          // limpia el carrito
          setShowModal(false);      // cierra el modal
          alert("Venta confirmada!");
        }}
        lineas={lineas}
        />
    </div>
  );
}
