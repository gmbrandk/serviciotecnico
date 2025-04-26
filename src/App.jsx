import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import NotFound from './pages/NotFound';
import RegisterPage from './pages/RegisterPage';
import TestingPage from './pages/TestingPage';
import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        {/* Ruta 404 */}
        <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
        <Route path='/testing' element={<TestingPage/>}></Route>
      </Routes>
          <Toaster position='top-right' reverseOrder={false} />
    </>
  );
};

export default App;
