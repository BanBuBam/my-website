import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './FinanceLayout.css';
import { FiHome, FiFileText, FiBarChart2, FiDollarSign, FiUsers } from 'react-icons/fi';

const FinanceLayout = () => {
    return (
        <div className="finance-layout">
            {/* Sidebar */}
            <aside className="finance-sidebar">
                <div className="sidebar-header">
                    <h1>Tài chính</h1>
                </div>

                <nav className="sidebar-nav">
                    <ul>
                        <li>
                            <NavLink to="/staff/tai-chinh/dashboard">
                                <FiHome />
                                <span>Dashboard</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/staff/tai-chinh/ds-hoa-don">
                                <FiFileText />
                                <span>Danh sách hóa đơn</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/staff/tai-chinh/tam-ung-hoan-vien-phi">
                                <FiDollarSign />
                                <span>Tạm ứng / Hoàn viện phí</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/staff/tai-chinh/chua-tt">
                                <FiDollarSign />
                                <span>Quản lý hóa đơn chưa thanh toán</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/staff/tai-chinh/ds-luot-kham">
                                <FiDollarSign />
                                <span>Danh sách lượt khám chưa tạo hóa đơn</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/staff/tai-chinh/chi-tiet-luot-kham">
                                <FiDollarSign />
                                <span>Chi tiết lượt khám cần tạo hóa đơn</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/staff/tai-chinh/thu-chi">
                                <FiDollarSign />
                                <span>Quản lý Thu / Chi</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/staff/tai-chinh/hoa-don">
                                <FiFileText />
                                <span>Hóa đơn & Biên lai</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/staff/tai-chinh/bang-luong">
                                <FiUsers />
                                <span>Bảng lương nhân viên</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/staff/tai-chinh/bao-cao">
                                <FiBarChart2 />
                                <span>Báo cáo tài chính</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/staff/tai-chinh/thanh-toan-nhap-kho">
                                <FiDollarSign />
                                <span>Thanh toán nhập kho</span>
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* Nội dung chính */}
            <main className="finance-content">
                <Outlet />
            </main>
        </div>
    );
};

export default FinanceLayout;
