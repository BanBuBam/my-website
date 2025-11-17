import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './AdminLayout.css';
import {
    FiUsers, FiShield, FiGrid, FiHome, FiUserCheck, FiCalendar,
    FiClock, FiCheckSquare, FiUmbrella, FiChevronDown, FiChevronRight,
    FiClipboard, FiPackage, FiArchive
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
                        <li className="menu-group">
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
                                    <li><NavLink to="/staff/admin/employees/search">Tìm kiếm Nhân viên</NavLink></li>
                                </ul>
                            )}
                        </li>

                        {/* Quản lý Tài khoản Nhân viên */}
                        <li className="menu-group">
                            <div className="menu-header" onClick={() => toggleMenu('accounts')}>
                                <div className="menu-title">
                                    <FiUserCheck />
                                    <span>Quản lý Tài khoản NV</span>
                                </div>
                                {openMenus.accounts ? <FiChevronDown /> : <FiChevronRight />}
                            </div>
                            {openMenus.accounts && (
                                <ul className="submenu">
                                    <li><NavLink to="/staff/admin/employee-accounts">Danh sách Tài khoản</NavLink></li>
                                    <li><NavLink to="/staff/admin/employee-accounts/create">Tạo Tài khoản</NavLink></li>
                                    <li><NavLink to="/staff/admin/employee-accounts/roles">Quản lý Role</NavLink></li>
                                </ul>
                            )}
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
                                    <li><NavLink to="/staff/admin/doctor-schedules/time-slots">Khung giờ khả dụng</NavLink></li>
                                </ul>
                            )}
                        </li>

                        {/* Quản lý Lịch làm việc Nhân viên */}
                        <li className="menu-group">
                            <div className="menu-header" onClick={() => toggleMenu('employeeSchedule')}>
                                <div className="menu-title">
                                    <FiClock />
                                    <span>Lịch làm việc NV</span>
                                </div>
                                {openMenus.employeeSchedule ? <FiChevronDown /> : <FiChevronRight />}
                            </div>
                            {openMenus.employeeSchedule && (
                                <ul className="submenu">
                                    <li><NavLink to="/staff/admin/employee-schedules">Danh sách Lịch NV</NavLink></li>
                                    <li><NavLink to="/staff/admin/employee-schedules/create">Tạo Lịch NV</NavLink></li>
                                    <li><NavLink to="/staff/admin/employee-schedules/attendance">Check-in/out</NavLink></li>
                                    <li><NavLink to="/staff/admin/employee-schedules/overtime">Tính giờ OT</NavLink></li>
                                </ul>
                            )}
                        </li>

                        {/* Quản lý Ca làm việc */}
                        <li className="menu-group">
                            <div className="menu-header" onClick={() => toggleMenu('shifts')}>
                                <div className="menu-title">
                                    <FiCheckSquare />
                                    <span>Quản lý Ca làm việc</span>
                                </div>
                                {openMenus.shifts ? <FiChevronDown /> : <FiChevronRight />}
                            </div>
                            {openMenus.shifts && (
                                <ul className="submenu">
                                    <li><NavLink to="/staff/admin/shifts">Danh sách Ca</NavLink></li>
                                    <li><NavLink to="/staff/admin/shifts/create">Tạo Ca làm việc</NavLink></li>
                                </ul>
                            )}
                        </li>

                        {/* Quản lý Tình trạng Sẵn sàng */}
                        <li>
                            <NavLink to="/staff/admin/availability">
                                <FiGrid />
                                <span>Tình trạng Sẵn sàng</span>
                            </NavLink>
                        </li>

                        {/* Quản lý Yêu cầu Nhập viện */}
                        <li>
                            <NavLink to="/staff/admin/yeu-cau-nhap-vien">
                                <FiClipboard />
                                <span>Yêu cầu Nhập viện</span>
                            </NavLink>
                        </li>

                        {/* Quản lý Nghỉ phép */}
                        <li className="menu-group">
                            <div className="menu-header" onClick={() => toggleMenu('leaves')}>
                                <div className="menu-title">
                                    <FiUmbrella />
                                    <span>Quản lý Nghỉ phép</span>
                                </div>
                                {openMenus.leaves ? <FiChevronDown /> : <FiChevronRight />}
                            </div>
                            {openMenus.leaves && (
                                <ul className="submenu">
                                    <li><NavLink to="/staff/admin/leaves">Danh sách Nghỉ phép</NavLink></li>
                                    <li><NavLink to="/staff/admin/leaves/create">Tạo Đơn nghỉ phép</NavLink></li>
                                    <li><NavLink to="/staff/admin/leaves/approval">Phê duyệt</NavLink></li>
                                </ul>
                            )}
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
                                    <li><NavLink to="/staff/admin/roles/permissions">Quyền theo Role</NavLink></li>
                                    <li><NavLink to="/staff/admin/roles/create">Tạo Role mới</NavLink></li>
                                    <li><NavLink to="/staff/admin/permissions/grant">Cấp quyền cho NV</NavLink></li>
                                    <li><NavLink to="/staff/admin/permissions/revoke">Loại bỏ quyền NV</NavLink></li>
                                </ul>
                            )}
                        </li>

                        {/* Quản lý Nhà cung cấp */}
                        <li>
                            <NavLink to="/staff/admin/nha-cung-cap">
                                <FiPackage />
                                <span>Quản lý Nhà cung cấp</span>
                            </NavLink>
                        </li>

                        {/* Quản lý Tủ thuốc/Vật tư */}
                        <li>
                            <NavLink to="/staff/admin/tu-thuoc">
                                <FiArchive />
                                <span>Quản lý Tủ thuốc/Vật tư</span>
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