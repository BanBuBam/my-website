import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NurseLayout from './layout/NurseLayout';
import NurseDashboardPage from './pages/dashboard/DashboardPage';
import BedMapPage from './pages/bed/BedMapPage';
import AdmissionPage from './pages/inout/AdmissionPage';
import PatientCarePage from './pages/patientcare/PatientCarePage';
import BedTransferPage from './pages/bedtransfer/BedTransferPage';
import OrdersPage from './pages/prescription/OrdersPage';
import AdmissionRequestPage from './pages/inpatient/AdmissionRequestPage';
import RequestDetailPage from "./pages/inpatient/RequestDetailPage";
import InpatientTreatmentPage from './pages/inpatient-treatment/InpatientTreatmentPage';
import InpatientStayDetailPage from './pages/inpatient-treatment/InpatientStayDetailPage';
import WorkflowPage from './pages/inpatient-treatment/WorkflowPage';
import NursingNotesPage from './pages/inpatient-treatment/NursingNotesPage';
import MedicationManagementPage from './pages/medication/MedicationManagementPage';
import MedicationInpatientPage from "./pages/medication/MedicationInpatientPage";
import SafetyAssessmentInpatientPage from "./pages/safety-assessment/SafetyAssessmentInpatientPage";

const NurseRoutes = () => {
    return (
        <Routes>
            <Route element={<NurseLayout />}>
                <Route index element={<NurseDashboardPage />} />
                <Route path="dashboard" element={<NurseDashboardPage />} />
                <Route path="so-do-giuong" element={<BedMapPage />} />
                <Route path="yeu-cau-nhap-vien" element={<AdmissionRequestPage />} />
                <Route path="yeu-cau-nhap-vien/:requestId" element={<RequestDetailPage />} />
                <Route path="dieu-tri-noi-tru" element={<InpatientTreatmentPage />} />
                <Route path="dieu-tri-noi-tru/:stayId" element={<InpatientStayDetailPage />} />
                <Route path="dieu-tri-noi-tru/:stayId/workflow" element={<WorkflowPage />} />
                <Route path="dieu-tri-noi-tru/:stayId/nursing-notes" element={<NursingNotesPage />} />
                <Route path="dieu-tri-noi-tru/:stayId/medications" element={<MedicationInpatientPage />} />
                <Route path="dieu-tri-noi-tru/:stayId/safety-assessments" element={<SafetyAssessmentInpatientPage />} />
                <Route path="dieu-tri-noi-tru/:stayId/discharge" element={<SafetyAssessmentInpatientPage />} />
                <Route path="quan-ly-medication" element={<MedicationManagementPage />} />
                <Route path="nhap-xuat-vien" element={<AdmissionPage />} />
                <Route path="cham-soc" element={<PatientCarePage />} />
                <Route path="chuyen-giuong" element={<BedTransferPage />} />
                <Route path="y-lenh" element={<OrdersPage />} />
            </Route>
        </Routes>
    );
};

export default NurseRoutes;