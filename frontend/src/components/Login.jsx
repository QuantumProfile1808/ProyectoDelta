import React, { useState, useContext } from 'react';
import AuthContext from '../AuthContext';
import { useNavigate } from 'react-router-dom';

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
        <div>
            <h2>Login</h2>

            <form onSubmit={handleLogin}>
                <input
                type="text"
                value={username}
                placeholder='Username'
                onChange={(e) => setUsername(e.target.value)}
                />
                <input
                type="password"
                value={password}
                placeholder='Password'
                onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit">Login</button>
            </form>
        </div>
    );
};