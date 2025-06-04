import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUsuarios } from '@context/UsuariosContext';
import { useAuth } from '@context/AuthContext';
import styles from '@styles/forms.module.css';
import { mostrarConfirmacion } from '../../../../services/alerta/alertaService';
import { showToast } from '../../../../services/toast/toastService';

const FormularioEditarUsuario = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuarios, editarUsuario, cambiarRolUsuario, cambiarPasswordUsuario } =
    useUsuarios();
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

  const formInicializado = useRef(false);

  useEffect(() => {
    const usuarioObjetivo = usuarios.find((u) => u.id === id);

    if (!usuarioObjetivo) {
      showToast('Usuario no encontrado', 'error');
      navigate('/dashboard/usuarios');
      return;
    }

    setUsuario(usuarioObjetivo);

    if (!formInicializado.current) {
      setFormData({
        nombre: usuarioObjetivo.nombre,
        email: usuarioObjetivo.email,
        role: usuarioObjetivo.role,
        passwordActual: '',
        nuevaPassword: '',
        confirmarPassword: '',
        confirmarPasswordSuperadmin: '',
      });
      formInicializado.current = true;
    }
  }, [id, usuarios, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formularioEditado = () => {
    if (!usuario) return false;

    const camposPrincipales = ['nombre', 'email', 'role'];
    const algunoEditado = camposPrincipales.some(
      (campo) => formData[campo] !== usuario[campo]
    );

    const quiereCambiarPassword =
      formData.passwordActual.trim() !== '' ||
      formData.nuevaPassword.trim() !== '' ||
      formData.confirmarPassword.trim() !== '';

    return algunoEditado || quiereCambiarPassword;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim() || !formData.email.trim()) {
      showToast('Nombre y email son obligatorios', 'error');
      return;
    }

    const quiereCambiarPassword =
      formData.passwordActual.trim() !== '' ||
      formData.nuevaPassword.trim() !== '' ||
      formData.confirmarPassword.trim() !== '';

    const esCambioSobreSiMismo = usuarioSolicitante.id === usuario.id;

    if (quiereCambiarPassword) {
      if (esCambioSobreSiMismo && !formData.passwordActual.trim()) {
        showToast(
          'Debes ingresar tu contraseña actual para cambiarla.',
          'error'
        );
        return;
      }

      if (!formData.nuevaPassword.trim()) {
        showToast('Debes ingresar una nueva contraseña.', 'error');
        return;
      }

      if (!formData.confirmarPassword.trim()) {
        showToast('Debes confirmar la nueva contraseña.', 'error');
        return;
      }

      if (formData.nuevaPassword !== formData.confirmarPassword) {
        showToast('Las nuevas contraseñas no coinciden', 'error');
        return;
      }
    }

    // ... (resto del código permanece igual)

    if (
      usuarioSolicitante.role !== 'superadministrador' &&
      usuarioSolicitante.role !== 'administrador' &&
      formData.role !== usuario.role
    ) {
      showToast(
        'No tienes permiso para cambiar el rol. Contacta con un superadministrador.',
        'error'
      );
      return;
    }

    if (
      usuarioSolicitante.role === 'superadministrador' &&
      formData.role === 'superadministrador' &&
      usuario.role !== 'superadministrador' &&
      !formData.confirmarPasswordSuperadmin
    ) {
      showToast(
        'Debes ingresar tu contraseña para confirmar el cambio a superadministrador.',
        'error'
      );
      return;
    }

    const confirmado = await mostrarConfirmacion({
      titulo: '¿Guardar cambios?',
      texto: 'Se actualizará la información del usuario.',
      icono: 'question',
      confirmButtonText: 'Sí, guardar',
    });

    if (!confirmado) return;

    try {
      if (quiereCambiarPassword) {
        const resPass = await cambiarPasswordUsuario(usuario.id, {
          passwordActual: formData.passwordActual,
          nuevaPassword: formData.nuevaPassword,
          confirmarPassword: formData.confirmarPassword,
        });

        if (!resPass.success) {
          showToast('Error al cambiar contraseña: ' + resPass.mensaje, 'error');
          return;
        }
      }

      const {
        role,
        passwordActual,
        nuevaPassword,
        confirmarPassword,
        confirmarPasswordSuperadmin,
        ...datosActualizados
      } = formData;

      const respuesta1 = await editarUsuario(usuario.id, datosActualizados);

      if (!respuesta1.success) {
        showToast('Error al actualizar datos: ' + respuesta1.error, 'error');
        return;
      }

      if (formData.role !== usuario.role) {
        const respuesta2 = await cambiarRolUsuario(
          usuario.id,
          formData.role,
          formData.confirmarPasswordSuperadmin
        );

        if (!respuesta2.success) {
          showToast(
            'Error al cambiar rol: ' +
              (respuesta2.error?.mensaje || 'Error desconocido'),
            'error'
          );
          return;
        }
      }

      showToast('Usuario actualizado correctamente', 'success');
      navigate('/dashboard/usuarios');
    } catch (error) {
      console.error('Error al editar usuario:', error);
      showToast('Error inesperado', 'error');
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

        <button
          type="submit"
          className={styles.actionButton}
          disabled={!formularioEditado()}
        >
          Guardar
        </button>
        <button
          type="button"
          className={styles.actionButton}
          onClick={() => navigate('/dashboard/usuarios')}
        >
          Cancelar
        </button>
      </fieldset>
    </form>
  );
};

export default FormularioEditarUsuario;
