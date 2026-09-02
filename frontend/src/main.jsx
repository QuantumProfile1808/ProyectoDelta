import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import App from './App'
import './index.css'
import { store } from './store/store'

const Router = window.location.protocol === 'file:' ? HashRouter : BrowserRouter

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>
  </React.StrictMode>
)
