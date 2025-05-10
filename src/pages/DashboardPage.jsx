import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '@components/pages/Dashboard/DashboardLayout';
import DashboardHome from '@components/pages/Dashboard/DashboardHome';
import CrearCodigo from '@components/CrearCodigo'; 
import { CodigosAccesoProvider } from '@context/codigoAccesoContext';
import CrearUsuario from '@components/CrearUsuario'; 
import NotFound from './NotFound';
import ProtectedRoute from '@components/routes/ProtectedRoute'; // Asegúrate de importar tu componente ProtectedRoute
import { useAuth } from '@context/AuthContext';  

const DashboardPage = () => {
  const { hasRole } = useAuth();

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        
        {/* Usa ProtectedRoute para proteger las rutas */}
        <Route 
          path="/codigoacceso" 
          element={
            <ProtectedRoute>
              {hasRole(['superadministrador', 'administrador']) 
                &&
                <CodigosAccesoProvider>
                  <CrearCodigo />
                </CodigosAccesoProvider> 
              }
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/usuarios" 
          element={
            <ProtectedRoute>
              {hasRole(['superadministrador', 'administrador']) && <CrearUsuario />}
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </DashboardLayout>
  );
};

export default DashboardPage;
