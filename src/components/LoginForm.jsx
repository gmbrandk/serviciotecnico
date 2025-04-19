import React, { useState } from 'react';
import styles from '../styles/forms.module.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AlertMessage from './shared/AlertMessage';

const LoginForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');

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

    const result = await onSubmit(formData); // delega al padre

    if (result?.success) {
      setMensaje('¡Bienvenido! Redirigiendo...');
      setTipoMensaje('success');
    } else if (result?.error) {
      setMensaje(result.error);
      setTipoMensaje('error');
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
