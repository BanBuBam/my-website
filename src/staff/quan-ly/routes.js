import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from './layout/AdminLayout';
import UserListPage from './pages/user-management/UserListPage';
import AdminDashboardPage from './pages/dashboard/AdminDashboardPage';
import EmployeeListPage from './pages/employees/EmployeeListPage';
import CreateEmployeePage from './pages/employees/CreateEmployeePage';
import DoctorScheduleListPage from './pages/doctor-schedules/DoctorScheduleListPage';
import CreateDoctorSchedulePage from './pages/doctor-schedules/CreateDoctorSchedulePage';
import RoleListPage from './pages/roles/RoleListPage';
import PermissionListPage from './pages/permissions/PermissionListPage';
import AdmissionRequestPage from './pages/inpatient/AdmissionRequestPage';
import SupplierManagementPage from './pages/nha-cung-cap/SupplierManagementPage';
import CabinetManagementPage from './pages/tu-thuoc/CabinetManagementPage';
import AdmissionRequestDetailPage from "./pages/inpatient/AdmissionRequestDetailPage";
import LockedCabinetsPage from './pages/tu-thuoc/LockedCabinetsPage';
import AccountManagementPage from './pages/employee-accounts/AccountManagementPage';
import SessionManagementPage from './pages/sessions/SessionManagementPage';
import AuditLogsPage from './pages/audit/AuditLogsPage';
import DataImportPage from './pages/import/DataImportPage';

const AdminRoutes = () => {
    return (
        <Routes>
            <Route element={<AdminLayout />}>
                {/* Default route for /staff/admin */}
                <Route index element={<AdminDashboardPage />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />

                {/* Employee Management */}
                <Route path="employees" element={<EmployeeListPage />} />
                <Route path="employees/create" element={<CreateEmployeePage />} />

                {/* Employee Account Management */}
                <Route path="employee-accounts" element={<AccountManagementPage />} />

                {/* Doctor Schedule */}
                <Route path="doctor-schedules" element={<DoctorScheduleListPage />} />
                <Route path="doctor-schedules/create" element={<CreateDoctorSchedulePage />} />

                {/* Admission Requests */}
                <Route path="yeu-cau-nhap-vien" element={<AdmissionRequestPage />} />
                <Route path="yeu-cau-nhap-vien/:id" element={<AdmissionRequestDetailPage />} /> {/* Do trang chi tiết lấy ra tên biến là id */}

                {/* Role & Permission Management */}
                <Route path="roles" element={<RoleListPage />} />
                <Route path="permissions" element={<PermissionListPage />} />

                {/* Session Management */}
                <Route path="sessions" element={<SessionManagementPage />} />

                {/* Audit Logs */}
                <Route path="audit" element={<AuditLogsPage />} />

                {/* Data Import */}
                <Route path="data-import" element={<DataImportPage />} />

                {/* Supplier Management */}
                <Route path="nha-cung-cap" element={<SupplierManagementPage />} />

                {/* Cabinet Management */}
                <Route path="tu-thuoc" element={<CabinetManagementPage />} />
                <Route path="tu-thuoc/locked" element={<LockedCabinetsPage />} />

                {/* Legacy routes */}
                <Route path="users" element={<UserListPage />} />
            </Route>
        </Routes>
    );
};

export default AdminRoutes;