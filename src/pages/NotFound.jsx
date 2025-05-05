// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '@styles/NotFound.module.css';

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <h1>404 - Página no encontrada</h1>
      <p>Lo sentimos, la página que buscas no existe.</p>
      <Link to="/dashboard">Volver al inicio</Link>
    </div>
  );
};

export default NotFound;
