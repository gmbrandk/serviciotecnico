import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoginForm from '@components/LoginForm';
import styles from '@styles/LoginPage.module.css';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async ({ email, password }) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      const { token, usuario } = res.data;

      login(token, usuario); // ← ahora usamos el contexto

      setTimeout(() => navigate('/dashboard'), 2000);

      return { success: true };
    } catch (error) {
      console.error('Error en login:', error);

      if (error.response) {
        return {
          error: error.response.data.mensaje || 'Error al iniciar sesión. Intenta de nuevo.',
        };
      } else {
        return { error: 'Error al conectar con el servidor' };
      }
    }
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
