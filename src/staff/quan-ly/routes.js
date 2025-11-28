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
import AdmissionRequestPage from './pages/inpatient/AdmissionRequestPage';
import SupplierManagementPage from './pages/nha-cung-cap/SupplierManagementPage';
import CabinetManagementPage from './pages/tu-thuoc/CabinetManagementPage';
import AdmissionRequestDetailPage from "./pages/inpatient/AdmissionRequestDetailPage";
import LockedCabinetsPage from './pages/tu-thuoc/LockedCabinetsPage';

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
                <Route path="employees/search" element={<div>Trang Tìm kiếm Nhân viên</div>} />

                {/* Employee Account Management */}
                <Route path="employee-accounts" element={<div>Trang Danh sách Tài khoản NV</div>} />
                <Route path="employee-accounts/create" element={<div>Trang Tạo Tài khoản NV</div>} />
                <Route path="employee-accounts/roles" element={<div>Trang Quản lý Role</div>} />

                {/* Doctor Schedule */}
                <Route path="doctor-schedules" element={<DoctorScheduleListPage />} />
                <Route path="doctor-schedules/create" element={<CreateDoctorSchedulePage />} />
                <Route path="doctor-schedules/time-slots" element={<div>Trang Khung giờ khả dụng</div>} />

                {/* Employee Schedule */}
                <Route path="employee-schedules" element={<div>Trang Danh sách Lịch NV</div>} />
                <Route path="employee-schedules/create" element={<div>Trang Tạo Lịch NV</div>} />
                <Route path="employee-schedules/attendance" element={<div>Trang Check-in/out</div>} />
                <Route path="employee-schedules/overtime" element={<div>Trang Tính giờ OT</div>} />

                {/* Shifts */}
                <Route path="shifts" element={<div>Trang Danh sách Ca</div>} />
                <Route path="shifts/create" element={<div>Trang Tạo Ca làm việc</div>} />

                {/* Availability */}
                <Route path="availability" element={<div>Trang Tình trạng Sẵn sàng</div>} />

                {/* Admission Requests */}
                <Route path="yeu-cau-nhap-vien" element={<AdmissionRequestPage />} />
                <Route path="yeu-cau-nhap-vien/:id" element={<AdmissionRequestDetailPage />} /> {/* Do trang chi tiết lấy ra tên biến là id */}

                {/* Leaves */}
                <Route path="leaves" element={<div>Trang Danh sách Nghỉ phép</div>} />
                <Route path="leaves/create" element={<div>Trang Tạo Đơn nghỉ phép</div>} />
                <Route path="leaves/approval" element={<div>Trang Phê duyệt</div>} />

                {/* Role & Permission Management */}
                <Route path="roles" element={<RoleListPage />} />
                <Route path="roles/permissions" element={<div>Trang Quyền theo Role</div>} />
                <Route path="roles/create" element={<div>Trang Tạo Role mới</div>} />
                <Route path="permissions/grant" element={<div>Trang Cấp quyền cho NV</div>} />
                <Route path="permissions/revoke" element={<div>Trang Loại bỏ quyền NV</div>} />

                {/* Supplier Management */}
                <Route path="nha-cung-cap" element={<SupplierManagementPage />} />

                {/* Cabinet Management */}
                <Route path="tu-thuoc" element={<CabinetManagementPage />} />
                <Route path="tu-thuoc/locked" element={<LockedCabinetsPage />} />

                {/* Legacy routes */}
                <Route path="users" element={<UserListPage />} />
                <Route path="catalogs" element={<div>Trang Quản lý Danh mục</div>} />
            </Route>
        </Routes>
    );
};

export default AdminRoutes;