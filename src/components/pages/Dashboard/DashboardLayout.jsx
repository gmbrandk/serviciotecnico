import styles from '@styles/dashboard/DashboardLayout.module.css';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const location = useLocation();

  // ✅ Detectar si estás en la ruta de orden de servicio
  const esRutaOrdenServicio = location.pathname.startsWith(
    '/dashboard/orden-servicio'
  );

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.mainContent}>
        {/* ✅ Ocultar completamente el header */}
        {!esRutaOrdenServicio && <Header />}

        <main
          className={`${styles.content} ${
            esRutaOrdenServicio ? styles.fullscreenContent : ''
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
