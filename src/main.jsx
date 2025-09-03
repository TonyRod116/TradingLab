import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './styles/toastify.css'
import App from './App.jsx'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'
import Profile from './components/Profile.jsx'
import EditProfile from './components/EditProfile.jsx'
import Features from './components/Features.jsx'
import About from './components/About.jsx'
import Pricing from './components/Pricing.jsx'
import Strategies from './components/Strategies.jsx'
import BacktestDetails from './components/BacktestDetails.jsx'

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
          <Route path="/users/profile/:user_id" element={<Profile />} />
          <Route path="/users/profile" element={<EditProfile />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/strategies" element={<Strategies />} />

          <Route path="/backtest/:strategyId" element={<BacktestDetails />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          limit={3}
          toastStyle={{
            background: '#1a1a1a',
            border: '1px solid var(--color-green)',
            color: 'var(--color-white)'
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)
