import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "./registerSW";

import App from './App.jsx'

// Temporary error handler to alert user of crash
window.onerror = function (msg, url, line) {
  alert("Application Error: " + msg + "\nLine: " + line);
};

console.log('Mounting App verified...');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
