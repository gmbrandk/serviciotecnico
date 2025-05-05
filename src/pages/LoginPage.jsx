import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginForm from '@components/LoginForm';
import styles from '@styles/LoginPage.module.css';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@context/AuthContext';

const LoginPage = () => {
  const { login, usuario, verificarSesion } = useAuth();
  const navigate = useNavigate();
  
  const handleLogin = async ({ email, password }) => {
    const result = await login(email, password);
    if (result?.success) {
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    }
    return result;
  };

  // Solo si no está verificando y no hay usuario, mostramos el login
  return (
    <div className={styles.loginContainer}>
      <LoginForm onSubmit={handleLogin} />
      <Toaster position="top-right" />
      <p>No tienes una cuenta?</p>
      <Link to="/register" className={styles.linkButton}>
        Crear una cuenta
      </Link>
    </div>
  );
};

export default LoginPage;
