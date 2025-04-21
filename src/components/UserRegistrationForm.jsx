import React, { useState } from 'react';
import styles from '../styles/forms.module.css';
import toast from 'react-hot-toast';
import Toast from './shared/Toast';

const UserRegistrationForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    role: 'tecnico', // predeterminado
    codigoAcceso: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre || !formData.email || !formData.password) {
      toast.custom((t) => (
        <Toast
          type="warning"
          title="Advertencia"
          message="Todos los campos son obligatorios."
          onClose={() => toast.dismiss(t.id)}
        />
      ));
      return;
    }

    if (!formData.codigoAcceso) {
      toast.custom((t) => (
        <Toast
          type="warning"
          title="Advertencia"
          message="Debes ingresar un código de acceso válido."
          onClose={() => toast.dismiss(t.id)}
        />
      ));
      return;
    }

    const result = await onSubmit(formData);

    if (result?.success) {
      toast.custom((t) => (
        <Toast
          type="success"
          title="¡Éxito!"
          message="¡Registro exitoso! Redirigiendo..."
          onClose={() => toast.dismiss(t.id)}
        />
      ));
    } else if (result?.error) {
      toast.custom((t) => (
        <Toast
          type="error"
          title="Error"
          message={result.error}
          onClose={() => toast.dismiss(t.id)}
        />
      ));
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
        <input
          type="text"
          name="codigoAcceso"
          placeholder="Código de acceso"
          value={formData.codigoAcceso}
          onChange={handleChange}
        />
        <button type="submit" className={styles.actionButton}>
          Registrarse
        </button>
      </fieldset>
    </form>
  );
};

export default UserRegistrationForm;
