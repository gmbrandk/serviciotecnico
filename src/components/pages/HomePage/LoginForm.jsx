import { showToast } from '@services/toast/toastService';
import styles from '@styles/forms.module.css';
import { useState } from 'react';
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
      showToast('warning', 'Advertencia', 'Todos los campos son obligatorios.');
      return;
    }

    setIsLoading(true);
    const result = await onSubmit(formData);
    setIsLoading(false);

    if (result?.success) {
      showToast('success', '¡Éxito!', '¡Bienvenido! Redirigiendo...');
    } else if (result?.error) {
      showToast('error', 'Error', result.error);
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
        <button
          type="submit"
          className={styles.actionButton}
          disabled={isLoading}
        >
          {isLoading ? <Spinner color="#fff" size={20} /> : 'Iniciar sesión'}
        </button>
      </fieldset>
    </form>
  );
};

export default LoginForm;
