// DashboardPage.jsx
import React from 'react';
import DashboardLayout from '@components/pages/Dashboard/DashboardLayout';
import { Outlet } from 'react-router-dom';

const DashboardPage = () => {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

export default DashboardPage;
