import React from "react";
import PropTypes from "prop-types";
import { FaTimes, FaCheck } from "react-icons/fa";
import "../../components/css/EditUserModal.css";
import "../css/adminForms.css";

const EditUserModal = ({ show, onClose, onSubmit, formValues, onChange }) => {
  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content custom-edit-modal">
        <h3 className="admin-form-title">Editar usuario</h3>
        <p>¿Qué deseas editar del usuario?</p>
        <form onSubmit={onSubmit} className="admin-form">
          <div className="admin-form-grid">
            <div className="admin-form-field">
              <label>DNI</label>
              <input
                type="text"
                value={formValues.dni}
                onChange={e => onChange({ ...formValues, dni: e.target.value })}
              />
            </div>

            <div className="admin-form-field">
              <label>Nombre</label>
              <input
                type="text"
                value={formValues.first_name}
                onChange={e => onChange({ ...formValues, first_name: e.target.value })}
              />
            </div>

            <div className="admin-form-field">
              <label>Apellido</label>
              <input
                type="text"
                value={formValues.last_name}
                onChange={e => onChange({ ...formValues, last_name: e.target.value })}
              />
            </div>

            <div className="admin-form-field">
              <label>Usuario</label>
              <input
                type="text"
                value={formValues.username}
                onChange={e => onChange({ ...formValues, username: e.target.value })}
              />
            </div>

            <div className="admin-form-field">
              <label>Rol</label>
              <select
                value={formValues.role}
                onChange={e => onChange({ ...formValues, role: e.target.value })}
              >
                <option value="">Selecciona un rol</option>
                <option value="usuario">Usuario</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>
          </div>

          <div className="modal-buttons edit-modal-buttons">
            <button type="button" className="btn-cancel" onClick={onClose}>
              <FaTimes />
            </button>
            <button type="submit" className="btn-save">
              <FaCheck />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

EditUserModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  formValues: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
};

export default EditUserModal;
