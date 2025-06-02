// src/components/layouts/UsuariosLayout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

const UsuariosLayout = () => {
  const location = useLocation();

  const esVistaEdicion = location.pathname.includes('/editar/');
  const titulo = esVistaEdicion ? 'Editar Usuario' : 'Gestión de Usuarios';

  return <Outlet />;
};

export default UsuariosLayout;
