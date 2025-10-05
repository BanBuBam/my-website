import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './NurseLayout.css';
import { FiHome, FiGrid, FiLogIn, FiHeart, FiRepeat, FiCheckSquare } from 'react-icons/fi';

const NurseLayout = () => {
    return (
        <div className="nurse-layout">
            <aside className="nurse-sidebar">
                <div className="sidebar-header">
                    <h1>Điều dưỡng</h1>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li><NavLink to="/staff/dieu-duong/dashboard"><FiHome /><span>Dashboard</span></NavLink></li>
                        <li><NavLink to="/staff/dieu-duong/so-do-giuong"><FiGrid /><span>Sơ đồ giường bệnh</span></NavLink></li>
                        <li><NavLink to="/staff/dieu-duong/nhap-xuat-vien"><FiLogIn /><span>Nhập/ xuất viện</span></NavLink></li>
                        <li><NavLink to="/staff/dieu-duong/cham-soc"><FiHeart /><span>Chăm sóc bệnh nhân</span></NavLink></li>
                        <li><NavLink to="/staff/dieu-duong/chuyen-giuong"><FiRepeat /><span>Chuyển giường</span></NavLink></li>
                        <li><NavLink to="/staff/dieu-duong/y-lenh"><FiCheckSquare /><span>Y lệnh cần thực hiện</span></NavLink></li>
                    </ul>
                </nav>
            </aside>
            <main className="nurse-content">
                <Outlet />
            </main>
        </div>
    );
};

export default NurseLayout;