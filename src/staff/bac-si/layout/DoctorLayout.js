import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './DoctorLayout.css';
import { FiHome, FiClipboard, FiFileText, FiUsers } from 'react-icons/fi';

const DoctorLayout = () => {
    return (
        <div className="doctor-layout">
            <aside className="doctor-sidebar">
                <div className="sidebar-header">
                    <h1>Bác sĩ</h1>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li>
                            <NavLink to="/staff/bac-si/dashboard">
                                <FiHome />
                                <span>Dashboard</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/staff/bac-si/kham-benh">
                                <FiClipboard />
                                <span>Khám bệnh</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/staff/bac-si/ket-qua-cls">
                                <FiFileText />
                                <span>Kết quả cận lâm sàng</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/staff/bac-si/benh-nhan-noi-tru">
                                <FiUsers />
                                <span>Bệnh nhân nội trú</span>
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </aside>
            <main className="doctor-content">
                <Outlet />
            </main>
        </div>
    );
};

export default DoctorLayout;