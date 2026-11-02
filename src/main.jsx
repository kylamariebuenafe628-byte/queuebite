import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './CartContext'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <Toaster 
          position="bottom-right" 
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
              fontWeight: 'bold',
              borderRadius: '12px',
            },
          }} 
        />
        <App />
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>,
)