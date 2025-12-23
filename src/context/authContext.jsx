import useGlobalLoading from '@hooks/useGlobalLoading';
import { fetchUsuarioAutenticado, loginUser } from '@services/authService';
import registerUser from '@services/userService';
import { estandarizarRol } from '@utils/formatters';
import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

// 🧪 Activa o desactiva el modo simulado de pruebas
const MODO_SIMULADO = false;

// 🧪 Usuario de prueba usado en modo simulado
const usuarioMock = {
  id: '6811a47aebf66546dbed5910',
  nombre: 'Marina Gold',
  email: 'superadmin@example.com',
  role: 'superadministrador',
  password: 'admin123',
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const { loading, startLoading, stopLoading } = useGlobalLoading();

  const verificarSesion = async () => {
    console.log('[AuthContext] Verificando sesión al montar');

    try {
      startLoading();

      if (MODO_SIMULADO) {
        console.warn(
          '[AuthContext] 🧪 Modo simulado activo: cargando usuarioMock'
        );
        setUsuario(usuarioMock);
      } else {
        const { usuario: usuarioAutenticado } = await fetchUsuarioAutenticado();
        console.log('[AuthContext] Usuario autenticado:', usuarioAutenticado);

        if (usuarioAutenticado) {
          setUsuario(usuarioAutenticado);
        }
      }
    } catch (error) {
      console.error('[AuthContext] Error verificando sesión:', error);
    } finally {
      setCargando(false);
      stopLoading();
    }
  };

  useEffect(() => {
    verificarSesion();
  }, []);

  const login = async (email, password) => {
    try {
      startLoading();

      if (MODO_SIMULADO) {
        console.warn('[AuthContext] 🧪 Login simulado con:', email);
        setUsuario(usuarioMock);
        stopLoading();
        return { success: true };
      }

      const { usuario } = await loginUser(email, password);
      setUsuario(usuario);
      stopLoading();
      return { success: true };
    } catch (error) {
      stopLoading();
      return { error: error.message };
    }
  };

  const register = async (formData) => {
    if (MODO_SIMULADO) {
      console.warn('[AuthContext] 🧪 Registro simulado no implementado');
      return { success: true, mensaje: 'Usuario registrado (simulado)' };
    }
    return await registerUser(formData);
  };

  const logout = async () => {
    if (MODO_SIMULADO) {
      console.warn('[AuthContext] 🧪 Logout simulado');
      setUsuario(null);
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/api/auth/logout',
        {},
        { withCredentials: true }
      );
    } catch (e) {
      console.warn('Error al cerrar sesión en el backend:', e.message);
    }
    setUsuario(null);
  };

  const hasRole = (rolesPermitidos = []) => {
    if (!usuario || !usuario.role) return false;
    const userRole = estandarizarRol(usuario.role);
    const rolesNormalizados = rolesPermitidos.map((rol) =>
      estandarizarRol(rol)
    );
    return rolesNormalizados.includes(userRole);
  };

  const ensureAuth = async ({ autoLogin = false, email, password } = {}) => {
    startLoading();

    try {
      // 1️⃣ ¿Ya hay sesión?
      const { usuario: usuarioAutenticado } = await fetchUsuarioAutenticado();

      if (usuarioAutenticado) {
        console.info('[AUTH] Sesión ya activa');
        setUsuario(usuarioAutenticado);
        return usuarioAutenticado;
      }

      // 2️⃣ Autologin solo si está permitido
      if (!autoLogin) {
        console.warn('[AUTH] No hay sesión y autologin deshabilitado');
        return null;
      }

      console.warn('[AUTH] No hay sesión, intentando autologin...');

      const { usuario: usuarioLogueado } = await loginUser(email, password);

      setUsuario(usuarioLogueado);
      console.info('[AUTH] Autologin exitoso');

      return usuarioLogueado;
    } catch (err) {
      console.error('[AUTH] ensureAuth error:', err);
      return null;
    } finally {
      stopLoading();
      setCargando(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        setUsuario,
        login,
        logout,
        register,
        hasRole,
        cargando,
        loading,
        verificarSesion,
        ensureAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
