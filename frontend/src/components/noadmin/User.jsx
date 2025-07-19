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
  const desc = p.descripcion?.toLowerCase() || "";
  const catDesc = p.categoria?.descripcion?.toLowerCase() || "";
  return desc.includes(term) || catDesc.includes(term);
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
  const ahora = new Date();
  const fecha = ahora.toISOString().slice(0, 10); // YYYY-MM-DD
  const hora = ahora.toTimeString().slice(0, 8);  // HH:MM:SS

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
  movimientos.map(m => {
    console.log("Enviando movimiento:", JSON.stringify(m));
    return fetch("http://127.0.0.1:8000/api/movimiento/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(m)
      })
  })
  )
    .then(responses => {
      if (responses.some(r => !r.ok)) throw new Error("Error al guardar movimiento");
      return Promise.all(responses.map(r => r.json()));
    })
    .then(data => {
      console.log("Movimientos guardados:", data);
      setCarrito({});
      setShowModal(false);
      alert("Venta registrada con éxito.");
    })
    .catch(err => {
      console.error(err);
      alert("Ocurrió un error al guardar la venta.");
    });
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
          handleConfirmSale({ paymentMethod, amountReceived, change });
            // Aquí podrías hacer un POST a tu API para registrar la venta
            console.log("Detalles de la venta:", {
              paymentMethod,
              amountReceived,
              change
            });
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
