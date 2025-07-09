import { useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate, Link } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './AuthContext';
import { Login } from './components/Login';
import { Dashboard } from './components/admin/Dashboard';
import NoStaff from './components/noadmin/no-staff';
import Usuarios from "./components/admin/Usuarios";
import Finanzas from "./components/admin/Finanzas";
import Productos from "./components/admin/Productos";
import Historial from "./components/admin/Historial";
import TablaUsuario from './components/admin/tablausuario';
import TablaProductos from './components/admin/TablaProductos';


function App() {
  return (
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="login" element={<Login />} />
            <Route path="no-staff" element={<NoStaff />} />
            <Route path="/dashboard" element={<Dashboard />} >
              <Route path="productos" element={<Productos />} />
              <Route path="historial" element={<Historial />} />
              <Route path="finanzas" element={<Finanzas />} />
              <Route path="usuarios" element={<Usuarios />} />
              <Route path="tablausuario" element={<TablaUsuario />} />
              <Route path="TablaProductos" element={<TablaProductos />} />
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    )
  }

export default App