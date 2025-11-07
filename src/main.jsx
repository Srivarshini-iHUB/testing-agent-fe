import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext'
import { UserProvider } from './contexts/UserContext'
import { DialogProvider } from './contexts/DialogContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <UserProvider>
        <DialogProvider>
          <App />
        </DialogProvider>
      </UserProvider>
    </ThemeProvider>
  </StrictMode>,
)
