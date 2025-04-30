// pages/DashboardPage.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '@components/Dashboard/DashboardLayout';
import DashboardHome from '@components/Dashboard/DashboardHome';
import CrearCodigo from '@components/CrearCodigo'; // Asegúrate de crearlo
import CrearUsuario from '@components/CrearUsuario'; // Asegúrate de crearlo
import NotFound from './NotFound';

const DashboardPage = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/codigoacceso" element={<CrearCodigo />} />
        <Route path="/usuarios" element={<CrearUsuario />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </DashboardLayout>
  );
};

export default DashboardPage;
