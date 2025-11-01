import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DoctorLayout from './layout/DoctorLayout';
import DoctorDashboardPage from './pages/dashboard/DashboardPage';
import ExaminationPage from './pages/examination/ExaminationPage';
import LabResultsPage from './pages/labresult/LabResultsPage';
import InpatientPage from './pages/inpatient/InpatientPage';
import BookingListPage from './pages/booking/BookingListPage';
import EmergencyEncounterPage from './pages/emergency/EmergencyEncounterPage';
import EncounterVitalPage from './pages/examination/EncounterVitalPage';
import EncounterManagementPage from './pages/encounter/EncounterManagementPage';
import LabTestOrderPage from './pages/lab/LabTestOrderPage';
import ImagingOrderPage from './pages/imaging/ImagingOrderPage';
import PrescriptionPage from './pages/prescription/PrescriptionPage';
import ClinicalNotesPage from './pages/clinicalnotes/ClinicalNotesPage';

const DoctorRoutes = () => {
    return (
        <Routes>
            <Route element={<DoctorLayout />}>
                <Route index element={<DoctorDashboardPage />} />
                <Route path="dashboard" element={<DoctorDashboardPage />} />
                <Route path="lich-hen" element={<BookingListPage />} />
                <Route path="kham-benh" element={<ExaminationPage />} />
                <Route path="encounters" element={<EncounterManagementPage />} />
                <Route path="encounter-vital" element={<EncounterVitalPage />} />
                <Route path="lab-test-order" element={<LabTestOrderPage />} />
                <Route path="imaging-order" element={<ImagingOrderPage />} />
                <Route path="prescription" element={<PrescriptionPage />} />
                <Route path="clinical-notes" element={<ClinicalNotesPage />} />
                <Route path="ket-qua-cls" element={<LabResultsPage />} />
                <Route path="benh-nhan-noi-tru" element={<InpatientPage />} />
                <Route path="cap-cuu" element={<EmergencyEncounterPage />} />
            </Route>
        </Routes>
    );
};

export default DoctorRoutes;