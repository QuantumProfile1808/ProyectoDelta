import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
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

          <Route path="/dashboard" element={
            <ProtectedRoute onlyAdmin={true}>
              <Dashboard />
            </ProtectedRoute>
          }>
            <Route path="productos" element={<Productos />} />
            <Route path="historial" element={<Historial />} />
            <Route path="finanzas" element={<Finanzas />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="tablausuario" element={<TablaUsuario />} />
            <Route path="TablaProductos" element={<TablaProductos />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;