import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './LabTechnicianLayout.css';
import {
    FiHome,
    FiClipboard,
    FiFileText,
    FiActivity
} from 'react-icons/fi';
import StaffAvatarDropdown from '../../components/StaffAvatarDropdown';

const LabTechnicianLayout = () => {
    return (
        <div className="lab-technician-layout">
            <aside className="lab-technician-sidebar">
                <div className="sidebar-header">
                    <h1>Kỹ thuật viên</h1>
                </div>
                <nav className="sidebar-nav">
                    {/* Tổng quan */}
                    <div className="nav-category">
                        <div className="category-header">Tổng quan</div>
                        <ul>
                            <li>
                                <NavLink to="/staff/ky-thuat-vien/dashboard">
                                    <FiHome />
                                    <span>Dashboard</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Xét nghiệm */}
                    <div className="nav-category">
                        <div className="category-header">Xét nghiệm</div>
                        <ul>
                            <li>
                                <NavLink to="/staff/ky-thuat-vien/lab-test-order">
                                    <FiClipboard />
                                    <span>Lab Test Order</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/ky-thuat-vien/lab-test-result">
                                    <FiFileText />
                                    <span>Lab Test Result</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Chẩn đoán cấp cứu */}
                    <div className="nav-category">
                        <div className="category-header">Chẩn đoán cấp cứu</div>
                        <ul>
                            <li>
                                <NavLink to="/staff/ky-thuat-vien/diagnostic-orders">
                                    <FiActivity />
                                    <span>Quản lý Diagnostic Orders</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>
                </nav>
            </aside>
            <main className="lab-technician-content">
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

export default LabTechnicianLayout;

