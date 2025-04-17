import { Link } from 'react-router-dom';
import React from 'react';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  const handleLogin = async ({ correo, contraseña }) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contraseña }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        alert('Login exitoso');
        // Redireccionar o actualizar estado global aquí
      } else {
        alert(data.mensaje || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error en login:', error);
    }
  };

  return (
    <div>
      <LoginForm onSubmit={handleLogin} />
      <p>No tienes una cuenta?</p>
      <Link to="/register" className={StyleSheet.linkButton}>
        Crear una cuenta
      </Link>
    </div>
  );
};

export default LoginPage;
