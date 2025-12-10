import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LabTechnicianLayout from './layout/LabTechnicianLayout';
import LabTechnicianDashboardPage from './pages/dashboard/DashboardPage';
import LabTestOrderPage from './pages/lab-test-order/LabTestOrderPage';
import LabTestResultPage from './pages/lab-test-result/LabTestResultPage';
import DiagnosticOrdersPage from './pages/diagnostic-orders/DiagnosticOrdersPage';
import DiagnosticOrderDetailPage from './pages/diagnostic-orders/DiagnosticOrderDetailPage';

const LabTechnicianRoutes = () => {
    return (
        <Routes>
            <Route element={<LabTechnicianLayout />}>
                <Route index element={<LabTechnicianDashboardPage />} />
                <Route path="dashboard" element={<LabTechnicianDashboardPage />} />
                <Route path="lab-test-order" element={<LabTestOrderPage />} />
                <Route path="lab-test-result" element={<LabTestResultPage />} />
                <Route path="diagnostic-orders" element={<DiagnosticOrdersPage />} />
                <Route path="diagnostic-orders/:orderId" element={<DiagnosticOrderDetailPage />} />
            </Route>
        </Routes>
    );
};

export default LabTechnicianRoutes;
