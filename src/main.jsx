import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "./registerSW";

import App from './App.jsx'

import { setupGlobalErrorHandler } from './services/errorLoggingService';

// Initialize professional error logging (no more scary alerts for background errors)
setupGlobalErrorHandler();



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
