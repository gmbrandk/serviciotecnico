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
    if (result.success) {
      setTimeout(() => navigate('/login'), 2000);
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
