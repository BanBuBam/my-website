import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './HRLayout.css';
import {
  FiHome,
  FiUsers,
  FiUserCheck,
  FiCalendar,
  FiClock,
  FiGrid,
  FiActivity,
  FiFileText
} from 'react-icons/fi';
import StaffAvatarDropdown from '../../components/StaffAvatarDropdown';

const HRLayout = () => {
  return (
    <div className="hr-layout">
      <aside className="hr-sidebar">
        <div className="sidebar-header">
          <h1>HR Management</h1>
          <p className="sidebar-subtitle">Quản lý Nhân sự</p>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {/* Dashboard */}
            <li>
              <NavLink to="/staff/hr/dashboard">
                <FiHome />
                <span>Dashboard</span>
              </NavLink>
            </li>

            {/* Quản lý Nhân viên */}
            <li>
              <NavLink to="/staff/hr/employees">
                <FiUsers />
                <span>Quản lý Nhân viên</span>
              </NavLink>
            </li>

            {/* Quản lý Tài khoản Nhân viên */}
            <li>
              <NavLink to="/staff/hr/accounts">
                <FiUserCheck />
                <span>Quản lý Tài khoản</span>
              </NavLink>
            </li>

            {/* Lịch làm việc Bác sĩ */}
            <li>
              <NavLink to="/staff/hr/doctor-schedules">
                <FiCalendar />
                <span>Lịch làm việc Bác sĩ</span>
              </NavLink>
            </li>

            {/* Lịch ca làm việc Nhân viên */}
            <li>
              <NavLink to="/staff/hr/employee-schedules">
                <FiClock />
                <span>Lịch ca làm việc</span>
              </NavLink>
            </li>

            {/* Quản lý Ca làm việc */}
            <li>
              <NavLink to="/staff/hr/work-shifts">
                <FiGrid />
                <span>Quản lý Ca làm việc</span>
              </NavLink>
            </li>

            {/* Tình trạng Sẵn sàng */}
            <li>
              <NavLink to="/staff/hr/employee-status">
                <FiActivity />
                <span>Tình trạng Sẵn sàng</span>
              </NavLink>
            </li>

            {/* Nghỉ phép */}
            <li>
              <NavLink to="/staff/hr/time-off-requests">
                <FiFileText />
                <span>Nghỉ phép</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="hr-content">
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

export default HRLayout;

