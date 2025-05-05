import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import Spinner from '@components/shared/Spinner';
import styles from '@styles/LoadingPage.module.css';

const RutaPublica = () => {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div className={styles.spinnerContainer}>
        <div className={styles.spinnerContent}>
          <Spinner fill="none"
            stroke="#000"
            strokeWidth="5"/>
          <p className={styles.spinnerText}>Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return usuario ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default RutaPublica;
