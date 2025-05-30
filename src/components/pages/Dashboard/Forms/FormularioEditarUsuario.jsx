import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUsuarios } from '@context/UsuariosContext';
import { useAuth } from '@context/AuthContext';
import styles from '@styles/forms.module.css';

const FormularioEditarUsuario = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuarios, editarUsuario } = useUsuarios();
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
      usuarioSolicitante.role !== 'administrador' &&
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
    const actualizado = await editarUsuario(usuario.id, {
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
        <h2 className={styles.fsTitle}>Editar Usuario</h2>
        <h3 className={styles.fsSubtitle}>Modifica los datos del usuario</h3>

        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
        />

        {usuarioSolicitante?.role === 'superadministrador' ? (
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="tecnico">Técnico</option>
            <option value="administrador">Administrador</option>
            <option value="superadministrador">Superadministrador</option>
          </select>
        ) : usuarioSolicitante?.role === 'administrador' ? (
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="tecnico">Técnico</option>
            <option value="administrador">Administrador</option>
          </select>
        ) : (
          <input type="text" name="role" value={formData.role} readOnly />
        )}

        <input
          type="password"
          name="passwordActual"
          placeholder="Contraseña actual"
          value={formData.passwordActual}
          onChange={handleChange}
        />

        <input
          type="password"
          name="nuevaPassword"
          placeholder="Nueva contraseña"
          value={formData.nuevaPassword}
          onChange={handleChange}
        />

        <input
          type="password"
          name="confirmarPassword"
          placeholder="Confirmar nueva contraseña"
          value={formData.confirmarPassword}
          onChange={handleChange}
        />

        {usuarioSolicitante.role === 'superadministrador' &&
          formData.role === 'superadministrador' &&
          usuario.role !== 'superadministrador' && (
            <input
              type="password"
              name="confirmarPasswordSuperadmin"
              placeholder="Contraseña Superadmin Requerida"
              value={formData.confirmarPasswordSuperadmin}
              onChange={handleChange}
              required
            />
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
