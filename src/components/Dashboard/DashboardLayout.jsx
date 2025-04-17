import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardHome from './DashboardHome';
import styles from '../../styles/dashboard/DashboardLayout.module.css';

const DashboardLayout = () => {
  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Header />
        <DashboardHome />
      </div>
    </div>
  );
};

export default DashboardLayout;
