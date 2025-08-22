import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StaffLoginPage from '../staff/pages/login/StaffLoginPage';
import StaffDashboardPage from '../staff/pages/dashboard/StaffDashboardPage';

const StaffRoutes = () => {
  return (
    <Routes>
      {/* Đường dẫn gốc của khu vực staff sẽ là trang đăng nhập */}
      <Route path="/login" element={<StaffLoginPage />} />

      {/* Trang dashboard sau khi đăng nhập */}
      <Route path="/dashboard" element={<StaffDashboardPage />} />

      {/* Thêm các trang khác của nhân viên ở đây */}
    </Routes>
  );
};

export default StaffRoutes;