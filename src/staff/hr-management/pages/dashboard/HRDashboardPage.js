import React, { useState, useEffect } from 'react';
import './HRDashboardPage.css';
import { hrDashboardAPI } from '../../../../services/staff/hrAPI';
import { FiUsers, FiUserCheck, FiCalendar, FiFileText } from 'react-icons/fi';

const HRDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingTimeOff: 0,
    upcomingSchedules: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await hrDashboardAPI.getDashboard();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="hr-dashboard-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hr-dashboard-page">
        <div className="error-container">
          <p>Lỗi: {error}</p>
          <button onClick={fetchDashboardData} className="btn-retry">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hr-dashboard-page">
      <div className="page-header">
        <h1>Dashboard Quản lý Nhân sự</h1>
        <p className="page-subtitle">Tổng quan về nhân sự và hoạt động</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e3f2fd' }}>
            <FiUsers style={{ color: '#1976d2' }} />
          </div>
          <div className="stat-content">
            <h3>{dashboardData.totalEmployees || 0}</h3>
            <p>Tổng số Nhân viên</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e8f5e9' }}>
            <FiUserCheck style={{ color: '#388e3c' }} />
          </div>
          <div className="stat-content">
            <h3>{dashboardData.activeEmployees || 0}</h3>
            <p>Nhân viên Đang làm việc</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fff3e0' }}>
            <FiFileText style={{ color: '#f57c00' }} />
          </div>
          <div className="stat-content">
            <h3>{dashboardData.pendingTimeOff || 0}</h3>
            <p>Đơn nghỉ phép chờ duyệt</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f3e5f5' }}>
            <FiCalendar style={{ color: '#7b1fa2' }} />
          </div>
          <div className="stat-content">
            <h3>{dashboardData.upcomingSchedules || 0}</h3>
            <p>Lịch làm việc sắp tới</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>Hoạt động gần đây</h2>
          <div className="activity-list">
            <p className="no-data">Chưa có hoạt động nào</p>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Thông báo</h2>
          <div className="notification-list">
            <p className="no-data">Không có thông báo mới</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboardPage;

