import React from 'react';
import styles from '../../styles/dashboard/Sidebar.module.css';

const Sidebar = () => {
  return (
    <div className={styles.sidebar}>
      <h2>Panel Técnico</h2>
      <ul>
        <li>Inicio</li>
        <li>Órdenes</li>
        <li>Clientes</li>
        <li>Equipos</li>
        <li>Cerrar sesión</li>
      </ul>
    </div>
  );
};

export default Sidebar;
