import React, { useState } from 'react';
import styles from '@styles/forms.module.css';
import toast from 'react-hot-toast';
import Toast from './shared/Toast';

const UserRegistrationForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'tecnico',
    codigoAcceso: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { nombre, email, password, confirmPassword, codigoAcceso } = formData;

    // Validación de campos obligatorios
    if (!nombre || !email || !password || !confirmPassword || !codigoAcceso) {
      toast.custom((t) => (
        <Toast
          type="warning"
          title="Advertencia"
          message="Todos los campos son obligatorios."
          onClose={() => toast.dismiss(t.id)}
        />
      ), { duration: 1000 });
      return;
    }

    // Validación de contraseña coincidente
    if (password !== confirmPassword) {
      toast.custom((t) => (
        <Toast
          type="warning"
          title="Advertencia"
          message="Las contraseñas no coinciden."
          onClose={() => toast.dismiss(t.id)}
        />
      ), { duration: 1000 });
      return;
    }

    // Enviar sin confirmPassword
    const { confirmPassword: _, ...dataToSend } = formData;
    const result = await onSubmit(dataToSend);

    if (result?.success) {
      toast.custom((t) => (
        <Toast
          type="success"
          title="¡Éxito!"
          message="¡Registro exitoso! Redirigiendo..."
          onClose={() => toast.dismiss(t.id)}
        />
      ), { duration: 1000 });
    } else if (!result?.success && result?.mensaje && result?.detalles) {
      // Si hay un error con mensaje y detalles
      toast.custom((t) => (
        <Toast
          type="error"
          title="Error"
          message={result.mensaje || "Algo salió mal."}
          details={result.detalles || "Detalles no disponibles."}
          onClose={() => toast.dismiss(t.id)}
        />
      ), { duration: 3000 }); // Muestra el toaster más tiempo
    } else {
      // Si el error no tiene un mensaje y detalles claros
      toast.custom((t) => (
        <Toast
          type="error"
          title="Error"
          message="Hubo un problema al procesar tu solicitud."
          onClose={() => toast.dismiss(t.id)}
        />
      ), { duration: 1000 });
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
          type="password"
          name="confirmPassword"
          placeholder="Confirmar contraseña"
          value={formData.confirmPassword}
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
