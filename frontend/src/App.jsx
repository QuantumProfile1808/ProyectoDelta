import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./AuthContext";
import { Login } from "./page/views/auth/Login";
import { Dashboard } from "./page/views/admin/Dashboard";
import NoStaff from "./page/views/noadmin/NoStaff";
import Users from "./page/views/admin/Users";
import Sales from "./page/views/admin/Sales";
import Products from "./page/views/admin/Products";
import History from "./page/views/admin/History";
import UserTable from "./page/views/admin/UserTable";
import ProductTable from "./page/views/admin/ProductTable";
import User from "./page/views/noadmin/User";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import MenuDashboard from "./page/views/admin/MenuDashboard";
import PromotionTable from "./page/views/admin/PromotionTable";
import Promotions from "./page/views/admin/Promotions";
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
            <Route path="productos" element={<Products />} />
            <Route path="historial" element={<History />} />
            <Route path="ventas" element={<Sales />} />
            <Route path="usuarios" element={<Users />} />
            <Route path="tablausuario" element={<UserTable />} />
            <Route path="TablaProductos" element={<ProductTable />} />
            <Route index element={<MenuDashboard />} />
            <Route path="tablaPromociones" element={<PromotionTable />} />
            <Route path="promociones" element={<Promotions />} />
            <Route path="promociones/:id" element={<Promotions />} />
            <Route path="backup" element={<BackupPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
