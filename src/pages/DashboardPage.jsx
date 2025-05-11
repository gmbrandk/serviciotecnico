// @pages/DashboardPage.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '@components/pages/Dashboard/DashboardLayout';
import dashboardRoutes from '@routes/dashboardRoutes';  // Importamos las rutas del dashboard

const DashboardPage = () => {
  return (
    <DashboardLayout>
      <Routes>
        {dashboardRoutes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={route.element}
          />
        ))}
      </Routes>
    </DashboardLayout>
  );
};

export default DashboardPage;
