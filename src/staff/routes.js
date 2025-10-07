import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StaffLoginPage from './pages/login/StaffLoginPage';
import LeTanRoutes from './le-tan/routes';
import AdminRoutes from './quan-ly/routes';
import PharmacistRoutes from './duoc-si/routes';
import FinanceRoutes from "./ke-toan/routes";
// Tạm thời không cần ProtectedRoute cho việc test này

const StaffRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<StaffLoginPage />} />
      
      {/* Route trực tiếp đến LeTanRoutes, không qua bảo vệ */}
      <Route path="le-tan/*" element={<LeTanRoutes />} />
      <Route path="admin/*" element={<AdminRoutes />} />
      <Route path="duoc-si/*" element={<PharmacistRoutes />} />
        <Route path="tai-chinh/*" element={<FinanceRoutes/>}/>
    </Routes>
  );
};

export default StaffRoutes;