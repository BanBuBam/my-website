import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './AdminLayout.css';
import {
    FiUsers, FiShield, FiHome, FiUserCheck, FiCalendar,
    FiChevronDown, FiChevronRight, FiClipboard, FiPackage, FiArchive, FiMonitor, FiFileText, FiUpload
} from 'react-icons/fi';
import StaffAvatarDropdown from '../../components/StaffAvatarDropdown';

const AdminLayout = () => {
    const [openMenus, setOpenMenus] = useState({});

    const toggleMenu = (menuKey) => {
        setOpenMenus(prev => ({
            ...prev,
            [menuKey]: !prev[menuKey],
        }));
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h1>Admin</h1>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li>
                            <NavLink to="/staff/admin/dashboard">
                                <FiHome />
                                <span>Dashboard Admin</span>
                            </NavLink>
                        </li>

                        {/* Quản lý Nhân viên */}
                        {/* <li className="menu-group">
                            <div className="menu-header" onClick={() => toggleMenu('employees')}>
                                <div className="menu-title">
                                    <FiUsers />
                                    <span>Quản lý Nhân viên</span>
                                </div>
                                {openMenus.employees ? <FiChevronDown /> : <FiChevronRight />}
                            </div>
                            {openMenus.employees && (
                                <ul className="submenu">
                                    <li><NavLink to="/staff/admin/employees">Danh sách Nhân viên</NavLink></li>
                                    <li><NavLink to="/staff/admin/employees/create">Tạo Nhân viên</NavLink></li>
                                </ul>
                            )}
                        </li> */}

                        {/* Quản lý Tài khoản Nhân viên */}
                        <li>
                            <NavLink to="/staff/admin/employee-accounts">
                                <FiUserCheck />
                                <span>Quản lý Tài khoản NV</span>
                            </NavLink>
                        </li>

                        {/* Quản lý Lịch làm việc Bác sĩ */}
                        <li className="menu-group">
                            <div className="menu-header" onClick={() => toggleMenu('doctorSchedule')}>
                                <div className="menu-title">
                                    <FiCalendar />
                                    <span>Lịch làm việc Bác sĩ</span>
                                </div>
                                {openMenus.doctorSchedule ? <FiChevronDown /> : <FiChevronRight />}
                            </div>
                            {openMenus.doctorSchedule && (
                                <ul className="submenu">
                                    <li><NavLink to="/staff/admin/doctor-schedules">Danh sách Lịch BS</NavLink></li>
                                    <li><NavLink to="/staff/admin/doctor-schedules/create">Tạo Lịch BS</NavLink></li>
                                </ul>
                            )}
                        </li>

                        {/* Quản lý Yêu cầu Nhập viện */}
                        <li>
                            <NavLink to="/staff/admin/yeu-cau-nhap-vien">
                                <FiClipboard />
                                <span>Yêu cầu Nhập viện</span>
                            </NavLink>
                        </li>

                        {/* Quản lý Quyền truy cập */}
                        <li className="menu-group">
                            <div className="menu-header" onClick={() => toggleMenu('permissions')}>
                                <div className="menu-title">
                                    <FiShield />
                                    <span>Quản lý Quyền truy cập</span>
                                </div>
                                {openMenus.permissions ? <FiChevronDown /> : <FiChevronRight />}
                            </div>
                            {openMenus.permissions && (
                                <ul className="submenu">
                                    <li><NavLink to="/staff/admin/roles">Danh sách Role</NavLink></li>
                                    <li><NavLink to="/staff/admin/permissions">Danh sách Permission</NavLink></li>
                                </ul>
                            )}
                        </li>

                        {/* Quản lý Sessions */}
                        <li>
                            <NavLink to="/staff/admin/sessions">
                                <FiMonitor />
                                <span>Quản lý Phiên đăng nhập</span>
                            </NavLink>
                        </li>

                        {/* Audit Logs */}
                        <li>
                            <NavLink to="/staff/admin/audit">
                                <FiFileText />
                                <span>Nhật ký Kiểm toán</span>
                            </NavLink>
                        </li>

                        {/* Data Import */}
                        <li>
                            <NavLink to="/staff/admin/data-import">
                                <FiUpload />
                                <span>Nhập dữ liệu</span>
                            </NavLink>
                        </li>

                        {/* Quản lý Nhà cung cấp */}
                        <li>
                            <NavLink to="/staff/admin/nha-cung-cap">
                                <FiPackage />
                                <span>Quản lý Nhà cung cấp</span>
                            </NavLink>
                        </li>

                        {/* Quản lý Tủ thuốc/Vật tư
                        <li>
                            <NavLink to="/staff/admin/tu-thuoc">
                                <FiArchive />
                                <span>Quản lý Tủ thuốc/Vật tư</span>
                            </NavLink>
                        </li> */}
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