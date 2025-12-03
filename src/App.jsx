// @App.jsx
import { Route, Routes } from 'react-router-dom';

import ProtectedRoute from '@components/routes/ProtectedRoute';
import PublicRoute from '@components/routes/PublicRoute';
import { UsuariosProvider } from '@context/UsuariosContext';
import DashboardPage from '@pages/DashboardPage';
import LoginPage from '@pages/LoginPage';
import NotFound from '@pages/NotFound';
import RegisterPage from '@pages/RegisterPage';
import dashboardRoutes from '@routes/dashboardRoutes';

import { OrdenServicioProviders } from '@context/ordenServicio/ordenServicioProviders';
import PayloadPage from './pages/form-ingreso/PayloadPage';
import PreviewPage from './pages/form-ingreso/PreviewPage';

import TestingPage from '@pages/TestingPage';

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
        <Route
          path="/testing"
          element={
            <OrdenServicioProviders>
              <TestingPage />
            </OrdenServicioProviders>
          }
        />

        <Route
          path="/payload"
          element={
            <OrdenServicioProviders>
              <PayloadPage />
            </OrdenServicioProviders>
          }
        />

        <Route
          path="/preview"
          element={
            <ProtectedRoute>
              <OrdenServicioProviders>
                <PreviewPage />
              </OrdenServicioProviders>
            </ProtectedRoute>
          }
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
