import { useAuth } from '@context/authContext';
import styles from '@styles/dashboard/Sidebar.module.css';
import { useEffect, useState } from 'react';
import {
  FaBars,
  FaClipboardList,
  FaHome,
  FaSignOutAlt,
  FaTimes,
  FaTools,
  FaUsers,
} from 'react-icons/fa';
import { NavLink, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const { logout, hasRole } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();

  const handleLogout = () => logout();
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeMobileSidebar = () => {
    if (isMobile) setIsCollapsed(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div className={styles.toggleBtn} onClick={toggleSidebar}>
        <FaBars />
      </div>

      <div
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${
          isMobile ? styles.mobile : ''
        } ${isCollapsed ? styles.open : ''}`}
      >
        {isMobile && (
          <div className={styles.closeBtn} onClick={toggleSidebar}>
            <FaTimes />
          </div>
        )}

        <ul className={styles.menu}>
          <li
            className={isActive('/dashboard') ? styles.activeLink : ''}
            onClick={closeMobileSidebar}
          >
            <NavLink to="/dashboard" end>
              <FaHome /> <span>Inicio</span>
            </NavLink>
          </li>

          <li
            className={isActive('/dashboard/clientes') ? styles.activeLink : ''}
            onClick={closeMobileSidebar}
          >
            <NavLink to="/dashboard/clientes">
              <FaUsers /> <span>Clientes</span>
            </NavLink>
          </li>

          <li
            className={
              isActive('/dashboard/orden-servicio') ? styles.activeLink : ''
            }
            onClick={closeMobileSidebar}
          >
            <NavLink to="/dashboard/orden-servicio">
              <FaClipboardList /> <span>Orden de Servicio</span>
            </NavLink>
          </li>

          <li
            className={isActive('/dashboard/equipos') ? styles.activeLink : ''}
            onClick={closeMobileSidebar}
          >
            <NavLink to="/dashboard/equipos">
              <FaTools /> <span>Equipos</span>
            </NavLink>
          </li>

          {hasRole(['superadministrador', 'administrador']) && (
            <>
              <li
                className={
                  isActive('/dashboard/codigoacceso') ? styles.activeLink : ''
                }
                onClick={closeMobileSidebar}
              >
                <NavLink to="/dashboard/codigoacceso">
                  <FaTools /> <span>Crear código de Acceso</span>
                </NavLink>
              </li>

              <li
                className={
                  isActive('/dashboard/usuarios') ? styles.activeLink : ''
                }
                onClick={closeMobileSidebar}
              >
                <NavLink to="/dashboard/usuarios">
                  <FaUsers /> <span>Administrar Usuarios</span>
                </NavLink>
              </li>
            </>
          )}

          <li
            className={
              isActive('/dashboard/historial') ? styles.activeLink : ''
            }
            onClick={closeMobileSidebar}
          >
            <NavLink to="/dashboard/historial">
              <FaTools /> <span>Historial</span>
            </NavLink>
          </li>

          <li onClick={handleLogout}>
            <NavLink to="/login">
              <FaSignOutAlt /> <span>Cerrar sesión</span>
            </NavLink>
          </li>
        </ul>
      </div>

      {isCollapsed && isMobile && (
        <div className={styles.overlay} onClick={toggleSidebar}></div>
      )}
    </>
  );
};

export default Sidebar;
