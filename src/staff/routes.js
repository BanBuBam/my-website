import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StaffLoginPage from '../staff/pages/login/StaffLoginPage';


const StaffRoutes = () => {
  return (
    <Routes>
      {/* Đường dẫn gốc của khu vực staff sẽ là trang đăng nhập */}
      <Route path="/login" element={<StaffLoginPage />} />


      {/* Thêm các trang khác của nhân viên ở đây */}
    </Routes>
  );
};

export default StaffRoutes;