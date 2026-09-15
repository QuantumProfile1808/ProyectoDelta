import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./AuthContext";
import { Login } from "./page/views/auth/Login";
import { Dashboard } from "./page/views/admin/Dashboard";
import NoStaff from "./page/views/noadmin/no-staff";
import Usuarios from "./page/views/admin/Usuarios";
import Ventas from "./page/views/admin/Ventas";
import Productos from "./page/views/admin/Productos";
import Historial from "./page/views/admin/Historial";
import TablaUsuario from "./page/views/admin/tablausuario";
import TablaProductos from "./page/views/admin/TablaProductos";
import User from "./page/views/noadmin/User";
import ProtectedRoute from "./page/ProtectedRoute";
import Header from "./page/views/admin/Header";
import MenuDashboard from "./page/views/admin/menudashboard";
import TablaPromociones from "./page/views/admin/tablapromociones";
import Promociones from "./page/views/admin/promociones";
import BackupPage from "./page/views/admin/BackupPage";
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
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/no-staff" element={<NoStaff />} />

        <Route
          path="/User"
          element={
            <ProtectedRoute>
              <User />
            </ProtectedRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute onlyAdmin={true}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />}>
            <Route path="productos" element={<Productos />} />
            <Route path="historial" element={<Historial />} />
            <Route path="ventas" element={<Ventas />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="tablausuario" element={<TablaUsuario />} />
            <Route path="TablaProductos" element={<TablaProductos />} />
            <Route index element={<MenuDashboard />} />
            <Route path="tablaPromociones" element={<TablaPromociones />} />
            <Route path="promociones" element={<Promociones />} />
            <Route path="promociones/:id" element={<Promociones />} />
            <Route path="backup" element={<BackupPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
