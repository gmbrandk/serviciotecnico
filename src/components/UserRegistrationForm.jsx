import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AlertMessage from './shared/AlertMessage';
import styles from '../styles/forms.module.css'; // seguimos importando tu CSS module si deseas extenderlo

const UserRegistrationForm = () => {
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '' });
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('success');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre || !formData.email || !formData.password) {
      setMensaje('Todos los campos son obligatorios.');
      setTipoMensaje('warning');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);

      if (res.status === 201 || res.data.success) {
        const { token } = res.data;
        localStorage.setItem('token', token);

        setMensaje('¡Registro exitoso! Redirigiendo...');
        setTipoMensaje('success');

        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      setTipoMensaje('error');
      if (error.response?.status === 409) {
        setMensaje('El correo ya está registrado.');
      } else {
        setMensaje('Ocurrió un error al registrar. Intenta de nuevo.');
      }
    }
  };

  return (
    <div className={styles.msform}>
      <fieldset>
        <h2 className={styles.fsTitle}>Registro de Técnico</h2>
        <h3 className={styles.fsSubtitle}>Completa los campos para crear tu cuenta</h3>

        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
        />

        <button type="submit" className={styles.actionButton} onClick={handleSubmit}>
          Registrarse
        </button>

        {mensaje && <AlertMessage type={tipoMensaje} message={mensaje} />}
      </fieldset>
    </div>
  );
};

export default UserRegistrationForm;
