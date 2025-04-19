import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/dashboard/Sidebar.module.css';
import { FaHome, FaUsers, FaTools, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeMobileSidebar = () => {
    if (isMobile) setIsCollapsed(false);
  };

  return (
    <>
      <div className={styles.toggleBtn} onClick={toggleSidebar}>
        <FaBars />
      </div>

      <div
        className={`${styles.sidebar} ${
          isCollapsed ? styles.collapsed : ''
        } ${isMobile ? styles.mobile : ''} ${isCollapsed ? styles.open : ''}`}
      >

        {isMobile && (
          <div className={styles.closeBtn} onClick={toggleSidebar}>
            <FaTimes />
          </div>
        )}

        <ul className={styles.menu}>
          <li onClick={closeMobileSidebar}>
            <Link to="/dashboard">
              <FaHome /> <span>Inicio</span>
            </Link>
          </li>
          <li onClick={closeMobileSidebar}>
            <Link to="/dashboard/clientes">
              <FaUsers /> <span>Clientes</span>
            </Link>
          </li>
          <li onClick={closeMobileSidebar}>
            <Link to="/dashboard/equipos">
              <FaTools /> <span>Equipos</span>
            </Link>
          </li>
          <li onClick={handleLogout}>
          <Link to="/">
              <FaSignOutAlt /> <span>Cerrar sesión</span>
          </Link>
          </li>
        </ul>
      </div>

      {isCollapsed && isMobile && <div className={styles.overlay} onClick={toggleSidebar}></div>}
    </>
  );
};

export default Sidebar;
