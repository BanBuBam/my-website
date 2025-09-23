import React from 'react';
import './DashboardPage.css';

// Đã xóa FiDollarSign khỏi danh sách import
import { 
  FiUsers, FiCalendar, FiLogIn, FiSearch, 
  FiUserPlus, FiClock, FiRefreshCw, FiChevronRight, FiBell
} from 'react-icons/fi';

// Mock data
const recentActivities = [
  { id: 1, name: 'Nguyễn Văn An', time: '08:30', action: 'Check-in khám tim mạch', status: 'Hoàn thành' },
  { id: 2, name: 'Trần Thị Bình', time: '08:45', action: 'Đăng ký khám tổng quát', status: 'Hoàn thành' },
  { id: 3, name: 'Lê Minh Cường', time: '09:15', action: 'Đăng ký bệnh nhân mới', status: 'Hoàn thành' },
];

const upcomingAppointments = [
  { id: 1, name: 'Nguyễn Thị Giang', time: '10:30', doctor: 'BS. Trần Minh Hoàng - Tim mạch', status: 'Đã xác nhận' },
  { id:2, name: 'Lê Văn Hoàng', time: '11:00', doctor: 'BS. Nguyễn Thị An - Nội tổng quát', status: 'Chờ xử lý' },
  { id: 3, name: 'Phan Thị Kim', time: '11:30', doctor: 'BS. Lê Văn C - Răng hàm mặt', status: 'Đã xác nhận' },
];

// Main Dashboard Component
const LeTanDashboardPage = () => {
  const currentDate = "Hôm nay, Thứ Năm, 18 tháng 9, 2025 - 10:21";

  return (
    <div className="dashboard-container">
      {/* --- Dashboard Header --- */}
      <header className="dashboard-header">
        <div>
          <h2>Dashboard</h2>
          <p>Tổng quan hoạt động hệ thống lễ tân</p>
        </div>
        <div className="header-actions">
          <div className="notification-icon">
            <FiBell />
            <span className="notification-dot"></span>
          </div>
          <div className="user-profile">
            <img src="https://i.pravatar.cc/40" alt="User Avatar" />
            <span>Nguyễn Thị Lan</span>
          </div>
        </div>
      </header>

      {/* --- Welcome Message --- */}
      <div className="welcome-message">
        <h3>Chào mừng đến với Hệ thống Lễ tân</h3>
        <p>{currentDate}</p>
      </div>

      {/* --- Stats Cards Grid --- */}
      <div className="stats-grid">
        <div className="stats-card">
          <div className="card-icon blue"><FiUsers /></div>
          <div className="card-info">
            <span className="card-title">Bệnh nhân hôm nay</span>
            <span className="card-value">127</span>
            <span className="card-comparison increase">+12% so với hôm qua</span>
          </div>
        </div>
        <div className="stats-card">
          <div className="card-icon green"><FiCalendar /></div>
          <div className="card-info">
            <span className="card-title">Lịch hẹn hôm nay</span>
            <span className="card-value">45</span>
            <span className="card-comparison">38 đã xác nhận</span>
          </div>
        </div>
        <div className="stats-card">
          <div className="card-icon purple"><FiLogIn /></div>
          <div className="card-info">
            <span className="card-title">Check-in hôm nay</span>
            <span className="card-value">89</span>
            <span className="card-comparison">23 đang chờ</span>
          </div>
        </div>
        
        {/* --- KHỐI DOANH THU HÔM NAY ĐÃ BỊ XÓA --- */}

      </div>

      {/* --- Quick Actions --- */}
      <div className="actions-grid">
        <button className="action-btn primary">
          <FiSearch />
          <span>Tìm kiếm BN</span>
        </button>
        <button className="action-btn">
          <FiUserPlus />
          <span>Check-in</span>
        </button>
        <button className="action-btn">
          <FiCalendar />
          <span>Đặt lịch hẹn</span>
        </button>
        <button className="action-btn">
          <FiSearch />
          <span>Tra cứu</span>
        </button>
      </div>

      {/* --- Activity Section --- */}
      <div className="activity-section">
        {/* Recent Activities */}
        <div className="activity-list-container">
          <div className="list-header">
            <h4>Hoạt động gần đây</h4>
            <button className="btn-refresh"><FiRefreshCw /> Làm mới</button>
          </div>
          <ul className="activity-list">
            {recentActivities.map(item => (
              <li key={item.id} className="activity-item">
                <div className="item-icon"><FiUserPlus /></div>
                <div className="item-details">
                  <span className="item-name">{item.name}</span>
                  <span className="item-action">{item.action}</span>
                </div>
                <div className="item-meta">
                  <span className="item-time">{item.time}</span>
                  <span className="status status-hoan-thanh">{item.status}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Upcoming Appointments */}
        <div className="activity-list-container">
          <div className="list-header">
            <h4>Lịch hẹn sắp tới</h4>
            <button className="btn-view-all">Xem tất cả <FiChevronRight /></button>
          </div>
          <ul className="activity-list">
            {upcomingAppointments.map(item => (
              <li key={item.id} className="activity-item">
                <div className="item-icon"><FiClock /></div>
                <div className="item-details">
                  <span className="item-name">{item.name}</span>
                  <span className="item-action">{item.doctor}</span>
                </div>
                <div className="item-meta">
                  <span className="item-time">{item.time}</span>
                  <span className={`status ${
                    item.status === 'Đã xác nhận' ? 'status-da-xac-nhan' : 
                    item.status === 'Chờ xử lý' ? 'status-cho-xu-ly' : ''
                  }`}>{item.status}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LeTanDashboardPage;