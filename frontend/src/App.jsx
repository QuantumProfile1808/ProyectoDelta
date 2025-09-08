import { BrowserRouter, Route, Routes, Navigate, Outlet } from 'react-router-dom';
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
import User from "./components/noadmin/User";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/admin/Header";
import MenuDashboard from "./components/admin/menudashboard";
import { useContext, useState } from 'react';
import TablaPromociones from './components/admin/tablapromociones';
import Promociones from './components/admin/promociones';

function AdminLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/login" element={<Login />} />
          <Route path="/no-staff" element={<NoStaff />} />

          <Route path="/User" element={
            <ProtectedRoute>
              <User />
            </ProtectedRoute>
          } />

          <Route element={
            <ProtectedRoute onlyAdmin={true}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />}>
              <Route path="productos" element={<Productos />} />
              <Route path="historial" element={<Historial />} />
              <Route path="finanzas" element={<Finanzas />} />
              <Route path="usuarios" element={<Usuarios />} />
              <Route path="tablausuario" element={<TablaUsuario />} />
              <Route path="TablaProductos" element={<TablaProductos />} />
              <Route index element={<MenuDashboard />} />
              <Route path="tablaPromociones" element={<TablaPromociones />} />
              <Route path="promociones" element={<Promociones />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;