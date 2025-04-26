import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '@components/LoginForm';
import styles from '@styles/LoginPage.module.css';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();

  const handleLogin = async ({ email, password }) => {
    return await login(email, password); // ← ahora correctamente delega al contexto
  };

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
