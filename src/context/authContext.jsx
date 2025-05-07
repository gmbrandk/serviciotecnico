import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, fetchUsuarioAutenticado } from '@services/authService';
import registerUser from '@services/userService';
import { estandarizarRol } from '@utils/formatters';
import axios from 'axios';
import useLoading from '@hooks/useLoading'; // Importa el hook

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const { loading, startLoading, stopLoading } = useLoading(); // Usa el hook de carga

  const verificarSesion = async () => {
    console.log('[AuthContext] Verificando sesión al montar');

    try {
      startLoading(); // Inicia la carga

      if (import.meta.env.MODE === 'development') {
<<<<<<< HEAD
        await new Promise((resolve) => setTimeout(resolve, 500));
=======
        await new Promise((resolve) => setTimeout(resolve, 1000));
>>>>>>> 7049b2b23d136eabaf138ebf1f7281f6650dd448
      }
      
      const usuarioAutenticado = await fetchUsuarioAutenticado();
      console.log('[AuthContext] Usuario autenticado:', usuarioAutenticado);

      if (usuarioAutenticado) {
        setUsuario(usuarioAutenticado);
      }
    } catch (error) {
      console.error('[AuthContext] No hay sesión activa o error:', error);
    } finally {
      setCargando(false);
      stopLoading(); // Detiene la carga
    }
  };

  useEffect(() => {
    verificarSesion();
  }, []);  

  const login = async (email, password) => {
    try {
      startLoading(); // Inicia la carga durante el login
      const { usuario } = await loginUser(email, password);
      setUsuario(usuario);
      stopLoading(); // Detiene la carga
      return { success: true };
    } catch (error) {
      stopLoading(); // Detiene la carga si hay un error
      return { error: error.message };
    }
  };

  const register = async (formData) => {
    const result = await registerUser(formData);
    return result;
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout', {}, { withCredentials: true });
    } catch (e) {
      console.warn('Error al cerrar sesión en el backend:', e.message);
    }
    setUsuario(null);
  };

  const hasRole = (rolesPermitidos = []) => {
    if (!usuario || !usuario.role) return false;
    const userRole = estandarizarRol(usuario.role);
    const rolesNormalizados = rolesPermitidos.map(rol => estandarizarRol(rol));
    return rolesNormalizados.includes(userRole);
  };

  return (
    <AuthContext.Provider value={{
      usuario,
      setUsuario,
      login,
      logout,
      register,
      hasRole,
      cargando,
      loading, // Agrega el estado de loading aquí
      verificarSesion
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
