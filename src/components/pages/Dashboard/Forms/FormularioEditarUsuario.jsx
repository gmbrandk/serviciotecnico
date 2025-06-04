import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUsuarios } from '@context/UsuariosContext';
import { useAuth } from '@context/AuthContext';
import styles from '@styles/forms.module.css';

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

  useEffect(() => {
    const usuarioObjetivo = usuarios.find((u) => u.id === id);

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
      navigate('/dashboard/usuarios');
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

    const cambioPassword =
      formData.nuevaPassword ||
      formData.confirmarPassword ||
      formData.passwordActual;

    return algunoEditado || cambioPassword;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    try {
      if (formData.nuevaPassword) {
        const resPass = await cambiarPasswordUsuario(usuario.id, {
          passwordActual: formData.passwordActual,
          nuevaPassword: formData.nuevaPassword,
          confirmarPassword: formData.confirmarPassword,
        });

        if (!resPass.success) {
          alert('Error al cambiar contraseña: ' + resPass.mensaje);
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
        alert('Error al actualizar datos: ' + respuesta1.error);
        return;
      }

      if (formData.role !== usuario.role) {
        const respuesta2 = await cambiarRolUsuario(
          usuario.id,
          formData.role,
          formData.confirmarPasswordSuperadmin
        );

        if (!respuesta2.success) {
          alert(
            'Error al cambiar rol: ' +
              (respuesta2.error?.mensaje || 'Error desconocido')
          );
          return;
        }
      }

      alert('Usuario actualizado correctamente');
      navigate('/dashboard/usuarios');
    } catch (error) {
      console.error('Error al editar usuario:', error);
      alert('Error inesperado');
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
