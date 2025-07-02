import { useState } from 'react'
import './App.css'
import { AuthProvider } from './AuthContext'
import { Login } from './components/Login'
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom'
import { Dashboard } from './components/admin/Dashboard'
import NoStaff from './components/noadmin/no-staff';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <nav>
            {/*<Link to="/login">Login</Link> */}
            {/*<Link to="/dashboard">Dashboard</Link> */}
          </nav>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/no-staff" element={<NoStaff />} />
            {/*</* Route path="/productos" element={<Productos />} />*/}
            {/*</* Route path="/historial" element={<Historial />} />*/}
           {/*< Route path="/finanzas" element={<Finanzas />} />*/}
            {/*</* Route path="/usuarios" element={<Usuarios />} />*/}
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  )
}

export default App