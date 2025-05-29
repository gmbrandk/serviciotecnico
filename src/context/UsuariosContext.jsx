// @context/UsuariosContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { normalizedId } from '@utils/formatters'; // 👈 importa tu helper
import {
  getUsuarioService,
  inicializarUsuarioService,
  estaInicializadoUsuarioService,
} from '@services/usuarioService';
import { localStorageProvider } from '@services/usuarios/providers/localStorageProvider';

const UsuariosContext = createContext();

export const UsuariosProvider = ({ children }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const setup = async () => {
      try {
        // 🛡 Fallback en desarrollo (solo si no se ha inicializado)
        if (!estaInicializadoUsuarioService()) {
          if (import.meta.env.DEV) {
            console.warn(
              '[UsuariosContext] Inicializando provider mock por fallback'
            );
            inicializarUsuarioService(
              localStorageProvider,
              'LocalStorageMock',
              'mock'
            );
          } else {
            throw new Error(
              '[UsuariosContext] usuarioService no inicializado y no se puede usar fallback en producción.'
            );
          }
        }

        const service = getUsuarioService();
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

  return (
    <UsuariosContext.Provider
      value={{ usuarios, setUsuarios, cargando, resetUsuarios }}
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
