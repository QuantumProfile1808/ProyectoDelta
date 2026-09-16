import "./Login.css";
import React, { useState, useContext } from "react";
import AuthContext from "../../../../AuthContext";
import { useNavigate } from "react-router-dom";

import { Modal } from "../../../../components/Modal";
import Button from "../../../../components/Button";

export const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userData = await login(username, password);
      console.log("Login result:", userData);

      if (!userData) {
        setShowModal(true);
        return;
      }

      // Authenticated user
      if (userData.is_staff) {
        navigate("/dashboard");
      } else {
        navigate("/User");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setShowModal(true);
    }
  };

  return (
    <div className="login-bg">
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Usuario o Contraseña incorrecta"
        message={error || "Por favor, vuelva a intentarlo"}
      />
      <div className="login-box">
        <div className="login-title">Iniciar Sesión</div>
        <form onSubmit={handleLogin}>
          <label className="login-label" htmlFor="username">
            Usuario
          </label>
          <input
            id="username"
            className="login-input"
            type="text"
            value={username}
            placeholder="Usuario"
            onChange={(e) => setUsername(e.target.value)}
          />
          <label className="login-label" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            className="login-input"
            type="password"
            value={password}
            placeholder="Contraseña"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button className="login-button" type="submit" disabled={loading}>
            Iniciar Sesión
          </Button>
        </form>
      </div>
    </div>
  );
};
