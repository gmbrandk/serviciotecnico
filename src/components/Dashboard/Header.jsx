import React from 'react';
import styles from '@styles/dashboard/Header.module.css';
import { useAuth } from '@context/authContext'; 

const Header = () => {
  const { usuario, hasRole } = useAuth();
  const nombre = usuario?.nombre || 'Tecnico';

   // 🚀 Test temporal
   console.log('¿Es Admin o SuperAdmin?', hasRole(['superadministrador', 'administrador']));
   console.log(usuario.role);

  return (
    <header className={styles.header}>
      <h1 className={styles.titulo}>Bienvenido, {nombre}</h1>
    </header>
  );
};

export default Header;
