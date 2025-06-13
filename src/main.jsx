import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import '@config/init/usuarioServiceInit'; // ⬅️ Asegúrate de que esté arriba

import { AuthProvider } from '@context/authContext';
import { BrowserRouter as Router } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Router>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Router>
);
