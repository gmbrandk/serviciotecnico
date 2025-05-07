import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@context/authContext';
import UserRegistrationForm from '@components/UserRegistrationForm';
import { Toaster } from 'react-hot-toast';
import styles from '@styles/LoginPage.module.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (formData) => {
    const result = await register(formData);
    
    // Agregar logs para inspeccionar el tipo de respuesta
    console.log('Respuesta del backend:', result);
    
    // Revisar la estructura de la respuesta
    if (result?.success) {
      console.log('Registro exitoso');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      console.log('Error en el registro:', result?.mensaje, result?.detalles);
    }    

    return result;
  };

  return (
    <div className={styles.loginContainer}>
      <UserRegistrationForm onSubmit={handleSubmit} />
      <Toaster position="top-right" />
      <p>Ya estas registrado?</p>
      <Link to="/login" className={styles.linkButton}>
        Ingresa tus credenciales
      </Link>
    </div>
  );
};

export default RegisterPage;
