import React, { useState, useContext } from 'react';
import AuthContext from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import  './css/Login.css';
import { Modal } from './Modal';


export const Login = () => {
    const navigate = useNavigate();
    const { user, login } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showModal, setShowModal] = useState(false);

    const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const userData = await login(username, password);
    console.log(' Resultado login:', userData);

    if (!userData) {
      navigate('/no-staff', { replace: true });
      return;
    }

    // Usuario válido
    if (userData.is_staff) {
      navigate('/dashboard');
    } else {
      navigate('/User');
    }

  } catch (err) {
    console.error('Error inesperado:', err);
    setShowModal(true);
  }
};


    return (
        <div className="login-bg">
        <Modal show={showModal} onClose={() => setShowModal(false)}
        title="Usuario o Contraseña incorrecta"
        message="Por favor, vuelva a intentarlo"/>
            <div className="login-box">
                <div className="login-title">Iniciar Sesión</div>
                <form onSubmit={handleLogin}>
                    <label className="login-label" htmlFor="username">Usuario</label>
                    <input
                        id="username"
                        className="login-input"
                        type="text"
                        value={username}
                        placeholder='Usuario'
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <label className="login-label" htmlFor="password">Contraseña</label>
                    <input
                        id="password"
                        className="login-input"
                        type="password"
                        value={password}
                        placeholder='Contraseña'
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="login-button" type="submit">Iniciar Sesión</button>
                </form>
            </div>
        </div>
    );
};