import React, { useState } from 'react';
import styles from '../styles/forms.module.css';
import AlertMessage from './shared/AlertMessage';

const UserRegistrationForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
  });

  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre || !formData.email || !formData.password) {
      setMensaje('Todos los campos son obligatorios.');
      setTipoMensaje('warning');
      return;
    }

    const result = await onSubmit(formData);

    if (result?.success) {
      setMensaje('¡Registro exitoso! Redirigiendo...');
      setTipoMensaje('success');
    } else if (result?.error) {
      setMensaje(result.error);
      setTipoMensaje('error');
    }
  };

  return (
    <form className={styles.msform} onSubmit={handleSubmit}>
      <fieldset>
        <h2 className={styles.fsTitle}>Registro de Técnico</h2>
        <h3 className={styles.fsSubtitle}>Crea tu cuenta para comenzar</h3>
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
        <button type="submit" className={styles.actionButton}>
          Registrarse
        </button>
        {mensaje && <AlertMessage type={tipoMensaje} message={mensaje} />}
      </fieldset>
    </form>
  );
};

export default UserRegistrationForm;
