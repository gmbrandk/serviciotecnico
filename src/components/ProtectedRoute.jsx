// ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@context/authContext';

const ProtectedRoute = ({ children }) => {
  const { token } =  useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;  // Redirige si no hay token
  }

  return children;
};

export default ProtectedRoute;
