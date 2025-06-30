import { useState } from 'react'
import './App.css'
import { AuthProvider } from './AuthContext'
import { Login } from './components/Login'
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom'
import { Dashboard } from './components/Dashboard'
import NoStaff from './components/no-staff';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <nav>
            <Link to="/login">Login</Link>
            <Link to="/dashboard">Dashboard</Link>
          </nav>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/no-staff" element={<NoStaff />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  )
}

export default App