import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserRegistrationForm from '../components/UserRegistrationForm';
import { Toaster } from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();

  const handleRegister = async (formData) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);

      if (res.status === 201 || res.data.success) {
        const { token } = res.data;
        localStorage.setItem('token', token);

        setTimeout(() => {
          navigate('/');
        }, 2000);

        return { success: true };
      }
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      if (error.response?.status === 409) {
        return { error: 'El correo ya está registrado.' };
      }
      return { error: 'Ocurrió un error al registrar. Intenta de nuevo.' };
    }
  };

  return (
      <>
        <UserRegistrationForm onSubmit={handleRegister} />;
        <Toaster position='top-right'/>
      </>)
};

export default RegisterPage;
