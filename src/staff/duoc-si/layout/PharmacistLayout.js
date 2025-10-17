import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './PharmacistLayout.css';
import { FiHome, FiPackage, FiFileText, FiBarChart2 } from 'react-icons/fi';

const PharmacistLayout = () => {
    return (
        <div className="pharmacist-layout">
            <aside className="pharmacist-sidebar">
                <div className="sidebar-header">
                    <h1>Dược sĩ</h1>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li>
                            <NavLink to="/staff/duoc-si/dashboard">
                                <FiHome />
                                <span>Dashboard</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/staff/duoc-si/cap-phat">
                                <FiBarChart2 />
                                <span>Xem danh sách đơn thuốc chờ cấp phát</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/staff/duoc-si/ton-kho">
                                <FiPackage />
                                <span>Xem quản lý tồn kho</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/staff/duoc-si/nhap-kho">
                                <FiBarChart2 />
                                <span>Nhập kho</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/staff/duoc-si/xuat-kho">
                                <FiBarChart2 />
                                <span>Xuất kho</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/staff/duoc-si/han-su-dung">
                                <FiBarChart2 />
                                <span>Quản lý Hạn sử dụng</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/staff/duoc-si/phieu-nhap-kho">
                                <FiBarChart2 />
                                <span>Phiếu nhập kho</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/staff/duoc-si/phieu-thanh-toan">
                                <FiBarChart2 />
                                <span>Thanh toán nhập kho</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/staff/duoc-si/ncc">
                                <FiBarChart2 />
                                <span>Xem nhà cung cấp</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/staff/duoc-si/tao-ncc">
                                <FiBarChart2 />
                                <span>Tạo cung cấp</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/staff/duoc-si/inventory">
                                <FiPackage />
                                <span>Quản lý Kho thuốc</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/staff/duoc-si/prescriptions">
                                <FiFileText />
                                <span>Quản lý Đơn thuốc</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/staff/duoc-si/reports">
                                <FiBarChart2 />
                                <span>Báo cáo</span>
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </aside>
            <main className="pharmacist-content">
                <Outlet />
            </main>
        </div>
    );
};

export default PharmacistLayout;
