// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';

import './index.css'; // Seu CSS
import 'sweetalert2/dist/sweetalert2.min.css'; // <-- ADICIONE ESTA LINHA
import { CartProvider } from './context/CartContext'; // NOVO

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider> {/* ENVOLVA O APP COM O CARTPROVIDER */}
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
