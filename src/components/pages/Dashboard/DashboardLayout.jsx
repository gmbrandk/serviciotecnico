import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from '@styles/dashboard/DashboardLayout.module.css';
import { Outlet } from 'react-router-dom';
const DashboardLayout = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Header />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

