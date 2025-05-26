import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usuariosMock } from '@__mock__/usuariosMock';
import { normalizedId } from '@utils/formatters';
import styles from '@styles/forms.module.css';

const FormularioEditarUsuario = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    passwordActual: '',
    nuevaPassword: '',
    confirmarPassword: '',
  });

  useEffect(() => {
    const encontrado = usuariosMock.find((u) => normalizedId(u) === id);
    if (encontrado) {
      setUsuario(encontrado);
      setFormData((prev) => ({
        ...prev,
        nombre: encontrado.nombre,
        email: encontrado.email,
      }));
    } else {
      alert('Usuario no encontrado');
      navigate('/testing');
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.nuevaPassword !== formData.confirmarPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // Lógica de envío futura
    console.log('Datos enviados:', formData);
    alert('Cambios simulados correctamente');
    navigate('/testing');
  };

  if (!usuario) return null;

  return (
    <form className={styles.msform} onSubmit={handleSubmit}>
      <fieldset>
        <h2 className={styles.fsTitle}>Editar Usuario</h2>
        <h3 className={styles.fsSubtitle}>Modifica los datos del usuario</h3>

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
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="text"
          name="role"
          placeholder="Rol"
          value={usuario.role}
          readOnly
        />

        <input
          type="password"
          name="passwordActual"
          placeholder="Contraseña Actual"
          value={formData.passwordActual}
          onChange={handleChange}
        />

        <input
          type="password"
          name="nuevaPassword"
          placeholder="Nueva Contraseña"
          value={formData.nuevaPassword}
          onChange={handleChange}
        />

        <input
          type="password"
          name="confirmarPassword"
          placeholder="Confirmar Nueva Contraseña"
          value={formData.confirmarPassword}
          onChange={handleChange}
        />

        <button type="submit" className={styles.actionButton}>
          Guardar
        </button>
        <button
          type="button"
          className={styles.actionButton}
          onClick={() => navigate('/testing')}
        >
          Cancelar
        </button>
      </fieldset>
    </form>
  );
};

export default FormularioEditarUsuario;
