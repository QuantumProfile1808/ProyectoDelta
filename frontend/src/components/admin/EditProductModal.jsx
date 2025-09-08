import React from "react";
import PropTypes from "prop-types";
import { FaTimes, FaCheck } from "react-icons/fa";
import "../../components/css/EditUserModal.css";

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
        <h3>Editar producto</h3>
        <form onSubmit={onSubmit}>
          <div className="form-grid">
            {/* Campo 1 */}
            <label>
              Descripción
              <input
                type="text"
                value={formValues.descripcion}
                onChange={(e) => onChange({ ...formValues, descripcion: e.target.value })}
              />
            </label>

            {/* Campo 2 */}
            <label>
              Precio
              <input
                type="number"
                value={formValues.precio}
                onChange={(e) => onChange({ ...formValues, precio: parseFloat(e.target.value) || 0 })}
              />
            </label>

            {/* Campo 3 */}
            <label>
              Stock
              <input
                type="number"
                value={formValues.stock}
                onChange={(e) => onChange({ ...formValues, stock: parseInt(e.target.value, 10) || 0 })}
              />
            </label>

            {/* Campo 4 */}
            <label>
              Medida
              <select
                value={formValues.medida ? "true" : "false"}
                onChange={(e) => onChange({ ...formValues, medida: e.target.value === "true" })}
              >
                <option value="false">Unidad</option>
                <option value="true">Stock (peso o volumen)</option>
              </select>
            </label>

            {/* Campo 5 */}
            <label>
              Sucursal
              <select
                value={String(formValues.sucursal)}
                onChange={(e) => onChange({ ...formValues, sucursal: e.target.value })}
              >
                <option value="">Seleccionar sucursal</option>
                {sucursal.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.localidad} - {s.direccion}
                  </option>
                ))}
              </select>
            </label>

            {/* Campo 6 */}
            <label>
              Categoría
              <select
                value={String(formValues.categoria)}
                onChange={(e) => onChange({ ...formValues, categoria: e.target.value })}
              >
                <option value="">Seleccionar categoría</option>
                {categoria.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.descripcion}
                  </option>
                ))}
              </select>
            </label>
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
