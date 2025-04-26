import React, { createContext, useContext, useState, useEffect } from 'react';
import loginUser from '@services/authService';
import registerUser from '@services/userService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUsuario = localStorage.getItem('usuario');

    if (storedToken && storedUsuario) {
      setToken(storedToken);
      setUsuario(JSON.parse(storedUsuario));
    }
  }, []);

  const login = async (email, password) => {
    try {
      const { token, usuario } = await loginUser(email, password);
      setToken(token);
      setUsuario(usuario);
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000); 
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  };

  const register = async (formData) => {
    const result = await registerUser(formData);
    if (result.success) {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      }
    }
    return result;
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  };

  return (
    <AuthContext.Provider value={{ usuario, setUsuario, token, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
