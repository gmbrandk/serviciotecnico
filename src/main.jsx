import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from '@context/authContext'; // Asegúrate de que la ruta sea correcta
import { BrowserRouter as Router } from 'react-router-dom';

import { UsuariosProvider } from '@context/UsuariosContext';
import { inicializarUsuarioService } from '@services/usuarioService';
import { localStorageProvider } from '@services/usuarios/providers/localStorageProvider';
import { apiProvider } from '@services/usuarios/providers/apiProvider';

//inicializarUsuarioService(localStorageProvider, 'Mock Local', 'mock');
inicializarUsuarioService(apiProvider, 'API REST', 'mock');

ReactDOM.createRoot(document.getElementById('root')).render(
  <Router>
    <AuthProvider>
      <UsuariosProvider>
        <App />
      </UsuariosProvider>
    </AuthProvider>
  </Router>
);
