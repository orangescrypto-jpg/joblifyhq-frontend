import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DashboardProvider } from './context/DashboardContext'
import ErrorBoundary from './components/common/ErrorBoundary'
import AppRoutes from './app/router'
import './styles/index.css'

// Firebase is initialized in config.js, no provider needed at root

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <DashboardProvider>
            <AppRoutes />
          </DashboardProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
