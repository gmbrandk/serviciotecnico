import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginForm from '@components/LoginForm';
import styles from '@styles/LoginPage.module.css';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@context/AuthContext';
import Spinner from '@components/shared/Spinner';

const LoginPage = () => {
  const { login, usuario, verificarSesion } = useAuth();
  const navigate = useNavigate();

  const [verificando, setVerificando] = useState(true);

  const handleLogin = async ({ email, password }) => {
    const result = await login(email, password);
    if (result?.success) {
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    }
    return result;
  };

  useEffect(() => {
    const verificar = async () => {
      await verificarSesion();
      setVerificando(false);
    };
    verificar();
  }, []);

  useEffect(() => {
    if (!verificando && usuario) {
      navigate('/dashboard');
    }
  }, [verificando, usuario]);

  if (verificando) {
    return (
      <div className={styles.spinnerContainer}>
        <div className={styles.spinnerContent}>
          <Spinner />
          <p className={styles.spinnerText}>Verificando sesión...</p>
        </div>
      </div>
    );
  }

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
