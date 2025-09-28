import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from './layout/AdminLayout';
import UserListPage from './pages/user-management/UserListPage';
import AdminDashboardPage from './pages/dashboard/AdminDashboardPage';

const AdminRoutes = () => {
    return (
        <Routes>
            <Route element={<AdminLayout />}>
                {/* Default route for /staff/admin */}
                <Route index element={<UserListPage />} />
                <Route path="dashboard" element={<AdminDashboardPage />} /> 
                <Route path="users" element={<UserListPage />} />
                <Route path="roles" element={<div>Trang Quản lý Phân quyền</div>} />
                <Route path="catalogs" element={<div>Trang Quản lý Danh mục</div>} />
            </Route>
        </Routes>
    );
};

export default AdminRoutes;