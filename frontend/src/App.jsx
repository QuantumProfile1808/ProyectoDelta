import { useState } from 'react'
import './App.css'
import { AuthProvider } from './AuthContext'
import { Login } from './components/Login'
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom'
import { Dashboard } from './components/admin/Dashboard'
import NoStaff from './components/noadmin/no-staff'
import Usuarios from "./components/admin/Usuarios";
import Finanzas from "./components/admin/Finanzas";
import Productos from "./components/admin/Productos";
import Historial from "./components/admin/Historial";;
import TablaUsuario from './components/admin/tablausuario'


function App() {
  const [count, setCount] = useState(0)

return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/no-staff" element={<NoStaff />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route path="productos" element={<Productos />} />
            <Route path="historial" element={<Historial />} />
            <Route path="finanzas" element={<Finanzas />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="tablausuario" element={<TablaUsuario />} />
            {}
            {}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App