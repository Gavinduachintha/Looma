import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { CountProvider } from './context/CountContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <CountProvider>
        <App />
      </CountProvider>
    </ThemeProvider>
  </StrictMode>,
)
