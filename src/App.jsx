// @App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import LoginPage from '@pages/LoginPage';
import RegisterPage from '@pages/RegisterPage';
import NotFound from '@pages/NotFound';
import DashboardPage from '@pages/DashboardPage';
import ProtectedRoute from '@components/routes/ProtectedRoute';
import PublicRoute from '@components/routes/PublicRoute';
import { UsuariosProvider } from '@context/UsuariosContext';
import dashboardRoutes from '@routes/dashboardRoutes';

import TestingPage from '@pages/TestingPage';
import FormularioEditarUsuario from '@components/pages/Dashboard/Forms/FormularioEditarUsuario';

import { Toaster } from 'react-hot-toast';

// Función recursiva para renderizar rutas anidadas
const renderRoutes = (routes) =>
  routes.map(({ path, element, children, index }, i) => (
    <Route key={i} path={path} element={element} index={index}>
      {children && renderRoutes(children)}
    </Route>
  ));

const App = () => {
  return (
    <>
      <Routes>
        {/* Rutas públicas */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Rutas protegidas y anidadas */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <UsuariosProvider>
                {' '}
                {/* ✅ Se monta solo cuando hay sesión */}
                <DashboardPage />
              </UsuariosProvider>
            </ProtectedRoute>
          }
        >
          {renderRoutes(dashboardRoutes)}
        </Route>

        {/* Ruta independiente de testing */}
        <Route path="/testing" element={<TestingPage />} />
        <Route
          path="/testing/editar/:id"
          element={<FormularioEditarUsuario />}
        />

        {/* Catch-all protegida */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <NotFound />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
};

export default App;
