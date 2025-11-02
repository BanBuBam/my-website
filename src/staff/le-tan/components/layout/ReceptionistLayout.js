import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './ReceptionistLayout.css';
import StaffAvatarDropdown from '../../../components/StaffAvatarDropdown';

// Đã cập nhật lại danh sách icon import
import {
  FiBarChart2,
  FiUserPlus,
  FiUserCheck,
  FiCalendar,
  FiSearch,
  FiList,
  FiDollarSign
} from 'react-icons/fi';

const ReceptionistLayout = () => {
  return (
    <div className="receptionist-layout">
      <aside className="receptionist-sidebar">
        <div className="sidebar-header">
          <h1>Dashboard</h1>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink to="/staff/le-tan/dashboard">
                <FiBarChart2 />
                <span>Tổng quan</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/staff/le-tan/tim-kiem">
                <FiUserPlus />
                <span>Tìm kiếm / Đăng ký bệnh nhân</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/staff/le-tan/tiep-nhan">
                <FiUserCheck />
                <span>Tiếp nhận bệnh nhân</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/staff/le-tan/lich-hen">
                <FiCalendar />
                <span>Quản lý lịch hẹn</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/staff/le-tan/tra-cuu">
                <FiSearch />
                <span>Tra cứu</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/staff/le-tan/booking">
                <FiList />
                <span>Danh sách Booking</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/staff/le-tan/payment">
                <FiDollarSign />
                <span>Thanh toán</span>
              </NavLink>
            </li>
            {/* ------------------------------------ */}

          </ul>
        </nav>
      </aside>
      <main className="receptionist-content">
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

export default ReceptionistLayout;