import React, { useState } from 'react';
import styles from '@styles/forms.module.css';
import toast from 'react-hot-toast';
import Toast from '../../shared/Toast';
import Spinner from '../../shared/Spinner';

const LoginForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

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
      toast.custom((t) => (
        <Toast
          type="warning"
          title="Advertencia"
          message="Todos los campos son Obligatorios."
          onClose={() => toast.dismiss(t.id)}
        />
      ), { duration: 1000 });
      return;
    }

    setIsLoading(true);

    const result = await onSubmit(formData);

    setIsLoading(false);

    if (result?.success) {
      toast.custom((t) => (
        <Toast
          type="success"
          title="¡Éxito!"
          message="¡Bienvenido! Redirigiendo..."
          onClose={() => toast.dismiss(t.id)}
        />
      ), { duration: 1000 });
    } else if (result?.error) {
      toast.custom((t) => (
        <Toast
          type="error"
          title="Error"
          message={result.error}
          onClose={() => toast.dismiss(t.id)}
        />
      ), { duration: 1000 });
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
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
        />
        <button type="submit" className={styles.actionButton} disabled={isLoading}>
          {isLoading ? <Spinner color="#fff" size={20} /> : 'Iniciar sesión'}
        </button>
      </fieldset>
    </form>
  );
};

export default LoginForm;
