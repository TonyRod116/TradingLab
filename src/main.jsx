import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'
import Strategies from './components/Strategies.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
                  <Routes>
            <Route path="/" element={<App />} />
            <Route path="/users/login/" element={<Login />} />
            <Route path="/users/signup/" element={<Signup />} />
            <Route path="/strategies" element={<Strategies />} />
          </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)
