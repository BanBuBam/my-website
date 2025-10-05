import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StaffLoginPage from './pages/login/StaffLoginPage';
import LeTanRoutes from './le-tan/routes';
import AdminRoutes from './quan-ly/routes';
import DoctorRoutes from './bac-si/routes';
import NurseRoutes from './dieu-duong/routes';
// Tạm thời không cần ProtectedRoute cho việc test này

const StaffRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<StaffLoginPage />} />
      
      {/* Route trực tiếp đến LeTanRoutes, không qua bảo vệ */}
      <Route path="le-tan/*" element={<LeTanRoutes />} />
      <Route path="admin/*" element={<AdminRoutes />} />
      <Route path="bac-si/*" element={<DoctorRoutes />} />
      <Route path="dieu-duong/*" element={<NurseRoutes />} />

    </Routes>
  );
};

export default StaffRoutes;