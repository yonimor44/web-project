import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.tsx' // <--- הוספה

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider> {/* העטיפה שנותנת לכולם גישה למידע על המשתמש */}
      <App />
    </AuthProvider>
  </React.StrictMode>,
)   