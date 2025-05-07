import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from '@pages/LoginPage';
import ProtectedRoute from '@components/routes/ProtectedRoute';
import PublicRoute from '@components/routes/PublicRoute';
import DashboardPage from '@pages/DashboardPage';
import NotFound from '@pages/NotFound';
import RegisterPage from '@pages/RegisterPage';
import TestingPage from '@pages/TestingPage';
import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <NotFound />
            </ProtectedRoute>
          }
        />
        <Route path="/testing" element={<TestingPage />} />
      </Routes>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
};

export default App;
