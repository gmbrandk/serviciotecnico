import LoginForm from '@components/pages/HomePage/LoginForm';
import { useAuth } from '@context/AuthContext';
import styles from '@styles/LoginPage.module.css';
import { Toaster } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const { login, usuario, verificarSesion } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async ({ email, password }) => {
    const result = await login(email, password);
    if (result?.success) {
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
    return result;
  };

  // Solo si no está verificando y no hay usuario, mostramos el login
  return (
    <div className={styles.loginContainer}>
      <LoginForm onSubmit={handleLogin} />
      <Toaster position="top-right" />
      <p>No tienes una cuenta?</p>
      <Link to="/register" className={styles.linkButton}>
        Crear una cuenta
      </Link>
    </div>
  );
};

export default LoginPage;
