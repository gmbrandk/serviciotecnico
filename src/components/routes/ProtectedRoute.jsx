// ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@context/authContext';

const ProtectedRoute = ({ children }) => {
  const { usuario, cargando } = useAuth();

  if (cargando) return null; // o un spinner opcional

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
