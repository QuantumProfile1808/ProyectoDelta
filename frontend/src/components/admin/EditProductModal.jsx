import React from "react";
import PropTypes from "prop-types";
import { FaTimes, FaCheck } from "react-icons/fa";
import "../../components/css/EditUserModal.css";
import "../css/adminForms.css";

const EditProductModal = ({
  show,
  onClose,
  onSubmit,
  formValues,
  onChange,
  sucursal,
  categoria,
}) => {
  if (!show) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-content custom-edit-modal">
        <h3 className="admin-form-title">Editar producto</h3>
        <form onSubmit={onSubmit} className="admin-form">
          <div className="admin-form-grid">
            <div className="admin-form-field">
              <label>Descripción</label>
              <input
                type="text"
                value={formValues.descripcion}
                onChange={(e) =>
                  onChange({ ...formValues, descripcion: e.target.value })
                }
              />
            </div>

            <div className="admin-form-field">
              <label>Precio</label>
              <input
                type="number"
                value={formValues.precio}
                onChange={(e) =>
                  onChange({
                    ...formValues,
                    precio: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="admin-form-field">
              <label>Stock</label>
              <input
                type="number"
                step={formValues.medida ? "0.001" : "1"}
                min="0"
                placeholder="Cantidad"
                value={formValues.stock}
                onChange={(e) => {
                  let v = e.target.value;

                  if (!formValues.medida) {
                    v = v.replace(/\D+/g, "");
                    if (v === "") {
                      onChange({ ...formValues, stock: "" });
                      return;
                    }
                    v = parseInt(v).toString();
                  } else {
                    if (!/^\d*\.?\d{0,3}$/.test(v)) return;
                  }

                  onChange({
                    ...formValues,
                    stock: v,
                  });
                }}
              />
            </div>

            <div className="admin-form-field">
              <label>Medida</label>
              <select
                value={formValues.medida ? "true" : "false"}
                onChange={(e) =>
                  onChange({ ...formValues, medida: e.target.value === "true" })
                }
              >
                <option value="false">Unidad</option>
                <option value="true">KG</option>
              </select>
            </div>

            <div className="admin-form-field">
              <label>Sucursal</label>
              <select
                value={String(formValues.sucursal)}
                onChange={(e) =>
                  onChange({ ...formValues, sucursal: e.target.value })
                }
              >
                <option value="">Seleccionar sucursal</option>
                {sucursal.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.localidad} - {s.direccion}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-field">
              <label>Categoría</label>
              <select
                value={String(formValues.categoria)}
                onChange={(e) =>
                  onChange({ ...formValues, categoria: e.target.value })
                }
              >
                <option value="">Seleccionar categoría</option>
                {categoria.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.descripcion}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-buttons edit-modal-buttons">
            <button type="button" className="btn-cancel" onClick={onClose}>
              <FaTimes />
            </button>
            <button type="submit" className="btn-confirm">
              <FaCheck />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

EditProductModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  formValues: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  sucursal: PropTypes.array.isRequired,
  categoria: PropTypes.array.isRequired,
};

export default EditProductModal;
