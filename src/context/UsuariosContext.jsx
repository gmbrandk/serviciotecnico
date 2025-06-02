// @context/UsuariosContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { normalizedId } from '@utils/formatters'; // 👈 importa tu helper
import { getUsuarioService } from '@services/usuarioService';

const UsuariosContext = createContext();

export const UsuariosProvider = ({ children }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const setup = async () => {
      try {
        const service = getUsuarioService();

        console.info(
          `❔ Usuarios del sistema (proveedor): ${service.obtenerNombreProveedor()} [${service.obtenerTipoProveedor()}]`
        );

        const usuariosObtenidos = await service.obtenerUsuarios();

        // ✅ Normaliza los IDs una sola vez aquí
        const usuariosConId = usuariosObtenidos.map((u) => ({
          ...u,
          id: normalizedId(u),
        }));

        setUsuarios(usuariosConId);
      } catch (error) {
        console.error('[UsuariosContext] Error al cargar usuarios:', error);
      } finally {
        setCargando(false);
      }
    };

    setup();
  }, []);

  const editarUsuario = async (id, nuevosDatos) => {
    try {
      // Llamada al servicio que actualiza el backend (o mock)
      const service = getUsuarioService();

      await service.editarUsuario(id, nuevosDatos);

      // Actualización local del estado en contexto
      setUsuarios((usuariosActuales) =>
        usuariosActuales.map((usuario) =>
          usuario.id === id ? { ...usuario, ...nuevosDatos } : usuario
        )
      );

      return { success: true };
    } catch (error) {
      console.error('Error al editar usuario:', error);
      return { success: false, error };
    }
  };

  const cambiarRolUsuario = async (
    id,
    nuevoRol,
    contrasenaConfirmacion = ''
  ) => {
    try {
      const service = getUsuarioService();
      await service.cambiarRolUsuario(id, nuevoRol, contrasenaConfirmacion);

      // Actualizar el usuario en el estado local
      setUsuarios((usuariosActuales) =>
        usuariosActuales.map((usuario) =>
          usuario.id === id ? { ...usuario, role: nuevoRol } : usuario
        )
      );

      return { success: true };
    } catch (error) {
      console.error('Error al cambiar rol del usuario:', error);
      return { success: false, error };
    }
  };

  const resetUsuarios = async () => {
    try {
      const service = getUsuarioService();
      if (service.reset) {
        service.reset();
        const nuevos = await service.obtenerUsuarios();

        const usuariosConId = nuevos.map((u) => ({
          ...u,
          id: normalizedId(u),
        }));

        setUsuarios(usuariosConId);
        return { success: true };
      } else {
        console.warn('El provider actual no soporta reset.');
        return { success: false, mensaje: 'Reset no soportado' };
      }
    } catch (error) {
      console.error('Error reseteando usuarios:', error);
      return { success: false, mensaje: error.message };
    }
  };
  const cambiarPasswordUsuario = async (id, passwordActual, nuevaPassword) => {
    try {
      const service = getUsuarioService();
      const respuesta = await service.cambiarPasswordUsuario(
        id,
        passwordActual,
        nuevaPassword
      );
      return { success: true, data: respuesta };
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      return { success: false, error };
    }
  };

  return (
    <UsuariosContext.Provider
      value={{
        usuarios,
        setUsuarios,
        cargando,
        resetUsuarios,
        editarUsuario,
        cambiarRolUsuario,
        cambiarPasswordUsuario,
      }}
    >
      {children}
    </UsuariosContext.Provider>
  );
};

// ✅ Hook para consumir el contexto
export const useUsuarios = () => {
  const context = useContext(UsuariosContext);
  if (!context) {
    throw new Error('useUsuarios debe usarse dentro de un UsuariosProvider');
  }
  return context;
};
