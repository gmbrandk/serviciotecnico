import { Link, useNavigate } from 'react-router-dom';
import React from 'react';
import axios from 'axios';
import LoginForm from '../components/LoginForm';
import styles from '../styles/LoginPage.module.css'
import { Toaster } from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = async ({ email, password }) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      const { token, usuario } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));

      setTimeout(() => navigate('/dashboard'), 2000);

      return { success: true };
    } catch (error) {
      console.error('Error en login:', error);
      return { error: 'Error al iniciar sesión. Intenta de nuevo.' };
    }
  };

  return (
    <div className={styles.loginContainer}>
      <LoginForm onSubmit={handleLogin} />
      <Toaster position='top-right'/>
      <p>No tienes una cuenta?</p>
      <Link to="/register" className={styles.linkButton}>
        Crear una cuenta
      </Link>
    </div>
  );
};

export default LoginPage;
