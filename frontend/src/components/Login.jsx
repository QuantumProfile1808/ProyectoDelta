import React, { useState, useContext } from 'react';
import AuthContext from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import  './css/Login.css'; // Assuming you have a CSS file for styles

export const Login = () => {
    const navigate = useNavigate();
    const { user, login } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        const success = await login(username, password);
        if (success) {
            console.log('Login successful');
            navigate('/dashboard', { replace: true });
        }
        else {
            console.error('Login failed');
        }
    }

    return (
        <div className="login-bg">
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