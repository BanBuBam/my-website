// src/staff/le-tan/routes.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ReceptionistLayout from './components/layout/ReceptionistLayout';
import LeTanDashboardPage from './pages/dashboard/DashboardPage';
import TimKiemPage from './pages/timkiem/TimKiemBenhNhan';
import QuanLyLichHenPage from './pages/lichhen/QuanLyLichHenPage';
import TiepNhanPage from './pages/tiepnhan/TiepNhanBenhNhan';
import TraCuuBenhNhan from './pages/tracuu/TraCuuBenhNhan';
import BookingListPage from './pages/booking/BookingListPage';
import BookingDetailPage from './pages/booking/BookingDetailPage';
import PaymentPage from './pages/payment/PaymentPage';
import EmergencyListPage from './pages/emergency/EmergencyListPage';
import EmergencyDetailPage from './pages/emergency/EmergencyDetailPage';
import EncounterDetailPage from './pages/emergency/EncounterDetailPage';
import CreateEmergencyPage from './pages/emergency/CreateEmergencyPage';

const LeTanRoutes = () => {
  return (
    <Routes>
      <Route element={<ReceptionistLayout />}>
        <Route index element={<LeTanDashboardPage />} />
        <Route path="dashboard" element={<LeTanDashboardPage />} />
        <Route path="tim-kiem" element={<TimKiemPage />} />
        <Route path="lich-hen" element={<QuanLyLichHenPage />} />
        <Route path="tiep-nhan" element={<TiepNhanPage />} />
        <Route path="tra-cuu" element={<TraCuuBenhNhan />} />
        <Route path="booking/:bookingId" element={<BookingDetailPage />} />
        <Route path="booking" element={<BookingListPage />} />
        <Route path="payment" element={<PaymentPage />} />
        <Route path="cap-cuu" element={<EmergencyListPage />} />
        <Route path="cap-cuu/tao-moi" element={<CreateEmergencyPage />} />
        <Route path="cap-cuu/emergency/:emergencyEncounterId" element={<EmergencyDetailPage />} />
        <Route path="cap-cuu/encounter/:encounterId" element={<EncounterDetailPage />} />
      </Route>
    </Routes>
  );
};

export default LeTanRoutes;