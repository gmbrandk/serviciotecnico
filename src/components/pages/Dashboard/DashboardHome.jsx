import React from 'react';
import styles from '@styles/dashboard/MainContent.module.css';

const DashboardHome = () => {
  return (
    <div className={styles.mainContent}>
      <h2>Resumen General</h2>
      <p>Aquí irá el contenido dinámico de tus órdenes, clientes, etc.</p>
    </div>
  );
};

export default DashboardHome;
