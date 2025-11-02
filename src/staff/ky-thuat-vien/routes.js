import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LabTechnicianLayout from './layout/LabTechnicianLayout';
import LabTechnicianDashboardPage from './pages/dashboard/DashboardPage';
import LabTestOrderPage from './pages/lab-test-order/LabTestOrderPage';
import LabTestResultPage from './pages/lab-test-result/LabTestResultPage';

const LabTechnicianRoutes = () => {
    return (
        <Routes>
            <Route element={<LabTechnicianLayout />}>
                <Route index element={<LabTechnicianDashboardPage />} />
                <Route path="dashboard" element={<LabTechnicianDashboardPage />} />
                <Route path="lab-test-order" element={<LabTestOrderPage />} />
                <Route path="lab-test-result" element={<LabTestResultPage />} />
            </Route>
        </Routes>
    );
};

export default LabTechnicianRoutes;
