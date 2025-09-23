// src/staff/le-tan/routes.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ReceptionistLayout from './components/layout/ReceptionistLayout';
import LeTanDashboardPage from './pages/dashboard/DashboardPage';
import TimKiemPage from './pages/timkiem/TimKiemBenhNhan';
import QuanLyLichHenPage from './pages/lichhen/QuanLyLichHenPage';
import TiepNhanPage from './pages/tiepnhan/TiepNhanBenhNhan'; 
import TraCuuBenhNhan from './pages/tracuu/TraCuuBenhNhan'; 

const LeTanRoutes = () => {
  return (
    <Routes>
      <Route element={<ReceptionistLayout />}>
        <Route index element={<LeTanDashboardPage />} />
        <Route path="dashboard" element={<LeTanDashboardPage />} />
        <Route path="tim-kiem" element={<TimKiemPage />} /> {/* <-- ADD THE NEW ROUTE */}
         <Route path="lich-hen" element={<QuanLyLichHenPage />} />
         <Route path="tiep-nhan" element={<TiepNhanPage />} />
          <Route path="tra-cuu" element={<TraCuuBenhNhan />} />
        {/* ... other routes ... */}
      </Route>
    </Routes>
  );
};

export default LeTanRoutes;