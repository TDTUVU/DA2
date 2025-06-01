import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'

console.log('Starting React application...');

try {
  const rootElement = document.getElementById('root');
  console.log('Root element:', rootElement);
  
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
        <ToastContainer />
      </React.StrictMode>,
    )
    console.log('React application rendered successfully');
  } else {
    console.error('Failed to find root element!');
  }
} catch (error) {
  console.error('Error rendering React application:', error);
} 