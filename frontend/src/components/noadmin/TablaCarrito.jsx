// User.jsx — Versión con CATEGORÍAS
// -----------------------------------------------------------------------------
// Agregamos:
//   • Descarga de /api/categoria/ al montar (solo 1 vez)
//   • Columna «Categoría» en la tabla
//   • Mapeo id → descripción para mostrar texto legible
// -----------------------------------------------------------------------------

import React, { useState, useEffect, useCallback, useMemo } from "react";

// -----------------------------------------------------------------------------
// 1. fetchJson reutilizable
// -----------------------------------------------------------------------------
async function fetchJson(url) {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return res.json();
}

export default function User() {
  // -------------------------
  // 2.1 Estados
  // -------------------------
  const [perfil, setPerfil] = useState(null);
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState({}); // { idProducto: cantidad }
  const [categorias, setCategorias] = useState({}); // { idCategoria: descripcion }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ------------------------------------------------------------------
  // 2.2 Cargar perfil + categorías en paralelo al montar el componente
  // ------------------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        // Pedimos perfil y categorías a la vez
        const [perfilData, catData] = await Promise.all([
          fetchJson("http://127.0.0.1:8000/api/perfil/"),
          fetchJson("http://127.0.0.1:8000/api/categoria/")
        ]);

        // Perfil: la API puede devolver array
        const p = Array.isArray(perfilData) ? perfilData[0] : perfilData;
        setPerfil(p);

        // Creamos mapa id → descripcion para acceso O(1)
        const mapaCat = {};
        catData.forEach(c => {
          mapaCat[c.id] = c.descripcion;
        });
        setCategorias(mapaCat);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ---------------------------------------------------------------
  // 2.3 Cargar productos cuando haya perfil (dependemos de sucursal)
  // ---------------------------------------------------------------
  useEffect(() => {
    if (!perfil) return;
    setLoading(true);
    (async () => {
      try {
        const url = `http://127.0.0.1:8000/api/producto/?sucursal=${perfil.sucursal.id}`;
        const data = await fetchJson(url);
        setProductos(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [perfil]);

  // ---------------------------------------
  // 2.4 Lógica de carrito (igual que antes)
  // ---------------------------------------
  const actualizarCantidad = useCallback((id, cantidad) => {
    setCarrito(prev => {
      const next = { ...prev };
      if (cantidad > 0) next[id] = cantidad; else delete next[id];
      return next;
    });
  }, []);

  const onCantidadChange = id => e => actualizarCantidad(id, parseInt(e.target.value, 10) || 0);
  const onSelectChange   = id => e => e.target.checked ? !carrito[id] && actualizarCantidad(id, 1) : actualizarCantidad(id, 0);

  const enviarPedido = () => {
    const items = Object.entries(carrito).map(([id, cantidad]) => ({ producto: id, cantidad }));
    console.log("Pedido enviado:", items);
    alert(`Pedido enviado con ${items.length} ítem${items.length !== 1 ? "s" : ""}`);
    setCarrito({});
  };

  const totalItems = useMemo(() => Object.values(carrito).reduce((a, b) => a + b, 0), [carrito]);

  // ---------------------------
  // 2.5 Render condicional UI
  // ---------------------------
  if (loading) return <p className="cargando">Cargando…</p>;
  if (error)   return <p className="error">Error: {error}</p>;

  return (
    <div className="user-container">
      <h1>
        Bienvenido, {perfil.user.first_name} — Sucursal: {perfil.sucursal.localidad}
      </h1>

      <div className="carrito-header">
        <button className="btn-carrito" disabled={!totalItems} onClick={enviarPedido}>
          🛒 {totalItems} ítem{totalItems !== 1 && "s"}
          <span className="enviar-text"> Enviar Pedido</span>
        </button>
      </div>

      <table className="tabla-carrito">
        <thead>
          <tr>
            <th>Sel</th>
            <th>Descripción</th>
            <th>Categoría</th>{/* NUEVA COLUMNA */}
            <th>Precio</th>
            <th>Stock</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(p => {
            const qty       = carrito[p.id] || "";
            const isChecked = !!carrito[p.id];
            const catDesc   = categorias[p.categoria] || p.categoria; // fallback id

            return (
              <tr key={p.id} className={p.stock === 0 ? "sin-stock" : ""}>
                <td>
                  <input type="checkbox" checked={isChecked} onChange={onSelectChange(p.id)} disabled={p.stock === 0} />
                </td>
                <td>{p.descripcion}</td>
                <td>{catDesc}</td>{/* Muestra el texto legible */}
                <td>${p.precio}</td>
                <td>{p.stock}</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    max={p.stock}
                    value={qty}
                    onChange={onCantidadChange(p.id)}
                    disabled={p.stock === 0}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
