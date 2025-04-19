import React from 'react';
import styles from '../../styles/dashboard/Header.module.css';

const Header = () => {
  const tecnico = JSON.parse(localStorage.getItem('usuario'));
  const nombre = tecnico?.nombre || 'Técnico';
  console.log(tecnico?.nombre);

  return (
    <header className={styles.header}>
      <h1 className={styles.titulo}>Bienvenido, {nombre}</h1>
    </header>
  );
};

export default Header;
