import React from "react";
import PropTypes from "prop-types";
import { FaTimes, FaCheck } from "react-icons/fa";
import "../../components/css/EditUserModal.css";

const EditUserModal = ({ show, onClose, onSubmit, formValues, onChange }) => {
  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content custom-edit-modal">
        <h3>Editar usuario</h3>
        <p>¿Qué deseas editar del usuario?</p>
        <form onSubmit={onSubmit}>
          <label>
            DNI
            <input
              type="text"
              value={formValues.dni}
              onChange={e => onChange({ ...formValues, dni: e.target.value })}
            />
          </label>

          <label>
            Nombre
            <input
              type="text"
              value={formValues.first_name}
              onChange={e =>
                onChange({ ...formValues, first_name: e.target.value })
              }
            />
          </label>

          <label>
            Apellido
            <input
              type="text"
              value={formValues.last_name}
              onChange={e =>
                onChange({ ...formValues, last_name: e.target.value })
              }
            />
          </label>

          <label>
            Usuario
            <input
              type="text"
              value={formValues.username}
              onChange={e =>
                onChange({ ...formValues, username: e.target.value })
              }
            />
          </label>

          <label>
            Rol
            <select
              value={formValues.role}
              onChange={e => onChange({ ...formValues, role: e.target.value })}
            >
              <option value="">Selecciona un rol</option>
              <option value="usuario">Usuario</option>
              <option value="administrador">Administrador</option>
            </select>
          </label>

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
