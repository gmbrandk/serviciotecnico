import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser } from '../services/authService'; // Asegúrate de que la ruta esté bien

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);

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
    } catch (error) {
      console.error(error);
    }
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
