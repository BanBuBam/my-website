import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Component Bố cục
import MainLayout from '../components/layout/MainLayout'; // ✨ NHẬP LAYOUT MỚI

// Các trang public
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/login/LoginPage';
import RegisterPage from '../pages/register/RegisterPage';
import ResetPasswordPage from '../pages/reset-password/ResetPasswordPage';
import ForgotPasswordPage from '../pages/forgot-password/ForgotPasswordPage';
import ChangePasswordPage from '../pages/change-password/ChangePasswordPage';
import RefreshTokenPage from '../pages/refresh-token/RefreshTokenPage';
import MedicalInfoPage from '../pages/medical-info/MedicalInfoPage';
import DatLichKham from '../pages/dat-lich-kham/DatLichKham';
import CapNhatThongTin from '../pages/CapNhatThongTin/CapNhatThongTin';
import PatientInvoices from '../pages/PatientInvoices/PatientInvoices';
import MedicalHistory from '../pages/MedicalHistory/MedicalHistory';
import TrangThaiDatLich from '../pages/dat-lich-kham/trang-thai/TrangThaiDatLich';
import DatLichKhamPage from '../pages/dat-lich-kham/dat-lich/DatLichKhamPage';
import BookAppointment from '../pages/BookAppointment/BookAppointment';

// Bộ định tuyến của nhân viên
import StaffRoutes from '../staff/routes';

const AppRoutes = () => {
  return (
    <Routes>
      {/* --- CÁC ROUTE SỬ DỤNG BỐ CỤC CHÍNH (CÓ HEADER/FOOTER) --- */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/refresh-token" element={<RefreshTokenPage />} />
        <Route path="/medical-info" element={<MedicalInfoPage />} />
        <Route path="/dat-lich-kham-old" element={<DatLichKham />} />
        <Route path="/cap-nhat-thong-tin" element={<CapNhatThongTin />} />
        <Route path="/hoa-don-benh-nhan" element={<PatientInvoices />} />
        <Route path="/lich-su-kham" element={<MedicalHistory />} />
        <Route path="/trang-thai-dat-lich" element={<TrangThaiDatLich />} />
        <Route path="/dat-lich-kham-page" element={<DatLichKhamPage />} />
        <Route path="/dat-lich-kham" element={<BookAppointment />} />
      </Route>

      {/* --- CÁC ROUTE TÁCH BIỆT (KHÔNG CÓ HEADER/FOOTER) --- */}
      {/* Route này không nằm trong MainLayout, nên sẽ không bị ảnh hưởng */}
      <Route path="/staff/*" element={<StaffRoutes />} />

    </Routes>
  );
};

export default AppRoutes;