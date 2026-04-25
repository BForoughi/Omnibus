import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.jsx'
import '@fontsource/roboto-mono'
import '@fontsource/poppins'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>
)