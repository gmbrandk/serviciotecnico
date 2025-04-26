import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from '@context/authContext'; // Asegúrate de que la ruta sea correcta
import { BrowserRouter as Router } from 'react-router-dom';
ReactDOM.createRoot(document.getElementById('root')).render(
  <Router>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Router>
  
);

