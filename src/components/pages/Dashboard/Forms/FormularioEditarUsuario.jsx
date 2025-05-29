import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUsuarios } from '@context/UsuariosContext';
import { useAuth } from '@context/AuthContext';
import styles from '@styles/forms.module.css';

const FormularioEditarUsuario = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuarios, actualizarUsuario } = useUsuarios();
  const { usuario: usuarioSolicitante } = useAuth();

  const [usuario, setUsuario] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    role: '',
    passwordActual: '',
    nuevaPassword: '',
    confirmarPassword: '',
    confirmarPasswordSuperadmin: '',
  });

  useEffect(() => {
    const usuarioObjetivo = usuarios.find((u) => u.id === id);
    console.log('Usuarios Solicitante:', usuarioSolicitante);
    console.log('Usuarios Objetivo:', usuarioObjetivo);

    if (usuarioObjetivo) {
      setUsuario(usuarioObjetivo);
      setFormData({
        nombre: usuarioObjetivo.nombre,
        email: usuarioObjetivo.email,
        role: usuarioObjetivo.role,
        passwordActual: '',
        nuevaPassword: '',
        confirmarPassword: '',
        confirmarPasswordSuperadmin: '',
      });
    } else {
      alert('Usuario no encontrado');
      navigate('/testing');
    }
  }, [id, usuarios, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.nombre.trim() || !formData.email.trim()) {
      alert('Nombre y email son obligatorios');
      return;
    }

    if (
      formData.nuevaPassword &&
      formData.nuevaPassword !== formData.confirmarPassword
    ) {
      alert('Las nuevas contraseñas no coinciden');
      return;
    }

    if (
      usuarioSolicitante.role !== 'superadministrador' &&
      formData.role !== usuario.role
    ) {
      alert(
        'No tienes permiso para cambiar el rol. Contacta con un superadministrador.'
      );
      return;
    }

    if (
      usuarioSolicitante.role === 'superadministrador' &&
      formData.role === 'superadministrador' &&
      usuario.role !== 'superadministrador' &&
      !formData.confirmarPasswordSuperadmin
    ) {
      alert(
        'Debes ingresar tu contraseña para confirmar el cambio a superadministrador.'
      );
      return;
    }

    if (
      usuarioSolicitante.role === 'superadministrador' &&
      formData.role === 'superadministrador' &&
      usuario.role !== 'superadministrador' &&
      formData.confirmarPasswordSuperadmin !== usuarioSolicitante.password
    ) {
      alert('Contraseña del superadministrador incorrecta.');
      return;
    }

    // Aquí enviarías a actualizar usuario en backend o context
    const actualizado = await actualizarUsuario(usuario.id, {
      nombre: formData.nombre,
      email: formData.email,
      role: formData.role,
      password: formData.nuevaPassword ? formData.nuevaPassword : undefined,
    });

    if (actualizado.success) {
      alert('Usuario actualizado correctamente');
      navigate('/testing');
    } else {
      alert('Error al actualizar usuario: ' + actualizado.error);
    }
  };

  if (!usuario) return null;

  return (
    <form className={styles.msform} onSubmit={handleSubmit}>
      <fieldset>
        <h3 className={styles.fsTitle}>Editar usuario: {usuario.nombre}</h3>

        <label>
          Nombre:
          <input
            className={styles.input}
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Email:
          <input
            className={styles.input}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Rol:
          {usuarioSolicitante.role === 'superadministrador' ? (
            <select
              className={styles.select}
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="usuario">Usuario</option>
              <option value="administrador">Administrador</option>
              <option value="tecnico">Técnico</option>
              <option value="superadministrador">Superadministrador</option>
            </select>
          ) : (
            <input
              className={styles.input}
              type="text"
              name="role"
              value={formData.role}
              readOnly
              disabled
            />
          )}
        </label>

        <label>
          Contraseña actual:
          <input
            className={styles.input}
            type="password"
            name="passwordActual"
            value={formData.passwordActual}
            onChange={handleChange}
          />
        </label>

        <label>
          Nueva contraseña:
          <input
            className={styles.input}
            type="password"
            name="nuevaPassword"
            value={formData.nuevaPassword}
            onChange={handleChange}
          />
        </label>

        <label>
          Confirmar nueva contraseña:
          <input
            className={styles.input}
            type="password"
            name="confirmarPassword"
            value={formData.confirmarPassword}
            onChange={handleChange}
          />
        </label>

        {usuarioSolicitante.role === 'superadministrador' &&
          formData.role === 'superadministrador' &&
          usuario.role !== 'superadministrador' && (
            <label>
              Confirma tu contraseña superadministrador para este cambio:
              <input
                className={styles.input}
                type="password"
                name="confirmarPasswordSuperadmin"
                value={formData.confirmarPasswordSuperadmin}
                onChange={handleChange}
                required
              />
            </label>
          )}

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
