import React from 'react';
import styles from '@styles/dashboard/Header.module.css';
import { useAuth } from '@context/authContext'; 

const Header = () => {
  const { usuario } = useAuth();
  const nombre = usuario?.nombre || 'Tecnico';

  return (
    <header className={styles.header}>
      <h1 className={styles.titulo}>Bienvenido, {nombre}</h1>
    </header>
  );
};

export default Header;
