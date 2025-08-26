import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Component Bố cục
import MainLayout from '../components/layout/MainLayout'; // ✨ NHẬP LAYOUT MỚI

// Các trang public
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/login/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import TrangThaiDatLich from '../pages/dat-lich-kham/trang-thai/TrangThaiDatLich';

// Bộ định tuyến của nhân viên
import StaffRoutes from '../staff/routes';

const AppRoutes = () => {
  return (
    <Routes>
      {/* --- CÁC ROUTE SỬ DỤNG BỐ CỤC CHÍNH (CÓ HEADER/FOOTER) --- */}
      <Route element={<MainLayout />}> 
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/trang-thai-dat-lich" element={<TrangThaiDatLich />} />
      </Route>

      {/* --- CÁC ROUTE TÁCH BIỆT (KHÔNG CÓ HEADER/FOOTER) --- */}
      {/* Route này không nằm trong MainLayout, nên sẽ không bị ảnh hưởng */}
      <Route path="/staff/*" element={<StaffRoutes />} />

    </Routes>
  );
};

export default AppRoutes;