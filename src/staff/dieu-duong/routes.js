import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NurseLayout from './layout/NurseLayout';
import NurseDashboardPage from './pages/dashboard/DashboardPage';
import BedMapPage from './pages/bed/BedMapPage';
import AdmissionPage from './pages/inout/AdmissionPage';
import PatientCarePage from './pages/patientcare/PatientCarePage';
import BedTransferPage from './pages/bedtransfer/BedTransferPage';
import OrdersPage from './pages/prescription/OrdersPage';

const NurseRoutes = () => {
    return (
        <Routes>
            <Route element={<NurseLayout />}>
                <Route index element={<NurseDashboardPage />} />
                <Route path="dashboard" element={<NurseDashboardPage />} />
                <Route path="so-do-giuong" element={<BedMapPage />} />
                <Route path="nhap-xuat-vien" element={<AdmissionPage />} />
                <Route path="cham-soc" element={<PatientCarePage />} />
                <Route path="chuyen-giuong" element={<BedTransferPage />} />
                <Route path="y-lenh" element={<OrdersPage />} />
            </Route>
        </Routes>
    );
};

export default NurseRoutes;