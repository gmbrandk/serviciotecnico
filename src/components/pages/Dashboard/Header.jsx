import React from 'react';
import styles from '@styles/dashboard/Header.module.css';
import { useAuth } from '@context/authContext'; 

const Header = () => {
  const { usuario, hasRole } = useAuth();
  const nombre = usuario?.nombre || 'Tecnico';

  return (
    <header className={styles.header}>
      <h1 className={styles.titulo}>Bienvenido, {nombre}</h1>
      {/* Solo mostramos estas líneas si el usuario tiene un rol admin o superadmin */}
      {hasRole(['superadministrador', 'administrador']) && (
        <div>Acceso Admin</div>
      )}
    </header>
  );
};

export default Header;
