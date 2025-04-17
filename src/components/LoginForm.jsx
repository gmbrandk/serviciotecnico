import React, { useState } from 'react';
import styles from '../styles/Login.module.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AlertMessage from './shared/AlertMessage';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setMensaje('Todos los campos son obligatorios.');
      setTipoMensaje('warning');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      if (res.status === 200 || res.data.success) {
        const { token } = res.data;

        localStorage.setItem('token', token);

        setMensaje('¡Bienvenido! Redirigiendo...');
        setTipoMensaje('success');

        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setTipoMensaje('error');
      setMensaje('Error al iniciar sesión. Intenta de nuevo.');
    }
  };

  return (
    <form id="msform" className={styles.msform} onSubmit={handleSubmit}>
      <fieldset>
        <h2 className={styles.fsTitle}>Iniciar Sesión</h2>
        <h3 className={styles.fsSubtitle}>Ingresa tus credenciales</h3>
        <input
          type="email"
          name="email"
          placeholder="Correo"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit" className={styles.actionButton}>
          Iniciar sesión
        </button>
        {mensaje && <AlertMessage type={tipoMensaje} message={mensaje} />}
      </fieldset>
    </form>
  );
};

export default LoginForm;
