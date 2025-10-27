import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DoctorLayout from './layout/DoctorLayout';
import DoctorDashboardPage from './pages/dashboard/DashboardPage';
import ExaminationPage from './pages/examination/ExaminationPage';
import LabResultsPage from './pages/labresult/LabResultsPage';
import InpatientPage from './pages/inpatient/InpatientPage';
import BookingListPage from './pages/booking/BookingListPage';
import EmergencyEncounterPage from './pages/emergency/EmergencyEncounterPage';

const DoctorRoutes = () => {
    return (
        <Routes>
            <Route element={<DoctorLayout />}>
                <Route index element={<DoctorDashboardPage />} />
                <Route path="dashboard" element={<DoctorDashboardPage />} />
                <Route path="lich-hen" element={<BookingListPage />} />
                <Route path="kham-benh" element={<ExaminationPage />} />
                <Route path="ket-qua-cls" element={<LabResultsPage />} />
                <Route path="benh-nhan-noi-tru" element={<InpatientPage />} />
                <Route path="cap-cuu" element={<EmergencyEncounterPage />} />
            </Route>
        </Routes>
    );
};

export default DoctorRoutes;