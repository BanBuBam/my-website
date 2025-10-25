import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './AdminLayout.css';
import { FiUsers, FiShield, FiGrid, FiHome } from 'react-icons/fi';
import StaffAvatarDropdown from '../../components/StaffAvatarDropdown';

const AdminLayout = () => {
    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h1>Dashboard</h1>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li>
            {/* ADD THIS NAVLINK FOR THE DASHBOARD */}
            <NavLink to="/staff/admin/dashboard">
                <FiHome />
                <span>Dashboard</span>
            </NavLink>
        </li>
                        <li>
                            <NavLink to="/staff/admin/users">
                                <FiUsers />
                                <span>Quản lý Người dùng</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/staff/admin/roles">
                                <FiShield />
                                <span>Quản lý Phân quyền</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/staff/admin/catalogs">
                                <FiGrid />
                                <span>Quản lý Danh mục</span>
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </aside>
            <main className="admin-content">
                <div className="content-header">
                    <StaffAvatarDropdown />
                </div>
                <div className="content-body">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;