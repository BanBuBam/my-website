import React, { useState, useEffect } from 'react';
import './DashboardPage.css';
import {
  FiUsers, FiCalendar, FiLogIn, FiSearch,
  FiUserPlus, FiClock, FiRefreshCw, FiChevronRight, FiBell, FiAlertCircle
} from 'react-icons/fi';
import { receptionistDashboardAPI } from '../../../../services/staff/receptionistAPI';

// Main Dashboard Component
const LeTanDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await receptionistDashboardAPI.getDashboard();

      if (response.data) {
        setDashboardData(response.data);
        setLastUpdated(new Date(response.data.lastUpdated));
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(date).toLocaleDateString('vi-VN', options);
  };

  const currentDate = formatDate(new Date());

  // Loading state
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <FiRefreshCw className="spin" />
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          <FiAlertCircle />
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="btn-retry">
            <FiRefreshCw /> Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* --- Dashboard Header --- */}
      <header className="dashboard-header">
        <div>
          <h2>Dashboard Lễ tân</h2>
          <p>Tổng quan hoạt động hệ thống lễ tân</p>
        </div>
        <div className="header-actions">
          <div className="notification-icon">
            <FiBell />
            {dashboardData?.alerts?.length > 0 && (
              <span className="notification-dot">{dashboardData.alerts.length}</span>
            )}
          </div>
        </div>
      </header>

      {/* --- Welcome Message --- */}
      <div className="welcome-message">
        <h3>Chào mừng đến với Hệ thống Lễ tân</h3>
        <p>{currentDate}</p>
        {lastUpdated && (
          <p className="last-updated">Cập nhật lần cuối: {formatDate(lastUpdated)}</p>
        )}
      </div>

      {/* --- Stats Cards Grid --- */}
      <div className="stats-grid">
        <div className="stats-card">
          <div className="card-icon blue"><FiCalendar /></div>
          <div className="card-info">
            <span className="card-title">Lịch hẹn hôm nay</span>
            <span className="card-value">{dashboardData?.todayBookings || 0}</span>
            <span className="card-comparison">
              {dashboardData?.pendingBookings || 0} đang chờ xử lý
            </span>
          </div>
        </div>
        <div className="stats-card">
          <div className="card-icon green"><FiLogIn /></div>
          <div className="card-info">
            <span className="card-title">Check-in hôm nay</span>
            <span className="card-value">{dashboardData?.todayCheckIns || 0}</span>
            <span className="card-comparison">
              {dashboardData?.todayStats?.checkedIn || 0} đã check-in
            </span>
          </div>
        </div>
        <div className="stats-card">
          <div className="card-icon purple"><FiUsers /></div>
          <div className="card-info">
            <span className="card-title">Sẵn sàng xuất viện</span>
            <span className="card-value">{dashboardData?.readyForDischarge || 0}</span>
            <span className="card-comparison">Bệnh nhân</span>
          </div>
        </div>
        <div className="stats-card">
          <div className="card-icon orange"><FiClock /></div>
          <div className="card-info">
            <span className="card-title">Thời gian chờ TB</span>
            <span className="card-value">
              {dashboardData?.todayStats?.averageWaitTime || 0} phút
            </span>
            <span className="card-comparison">Trung bình</span>
          </div>
        </div>
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

      {/* --- Today Stats Section --- */}
      <div className="stats-detail-section">
        <div className="stats-detail-card">
          <h4>Thống kê hôm nay</h4>
          <div className="stats-detail-grid">
            <div className="stat-item">
              <span className="stat-label">Tổng lịch hẹn</span>
              <span className="stat-value">{dashboardData?.todayStats?.totalScheduled || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Đã check-in</span>
              <span className="stat-value green">{dashboardData?.todayStats?.checkedIn || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Đã xuất viện</span>
              <span className="stat-value blue">{dashboardData?.todayStats?.discharged || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Đã hủy</span>
              <span className="stat-value red">{dashboardData?.todayStats?.cancelled || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Activity Section --- */}
      <div className="activity-section">
        {/* Pending Actions */}
        <div className="activity-list-container">
          <div className="list-header">
            <h4>Công việc cần xử lý</h4>
            <button className="btn-refresh" onClick={fetchDashboardData}>
              <FiRefreshCw /> Làm mới
            </button>
          </div>
          <ul className="activity-list">
            {dashboardData?.pendingActions && dashboardData.pendingActions.length > 0 ? (
              dashboardData.pendingActions.map((action, index) => (
                <li key={index} className="activity-item">
                  <div className="item-icon"><FiAlertCircle /></div>
                  <div className="item-details">
                    <span className="item-action">{action}</span>
                  </div>
                  <div className="item-meta">
                    <span className="status status-cho-xu-ly">Chờ xử lý</span>
                  </div>
                </li>
              ))
            ) : (
              <li className="empty-state">
                <p>Không có công việc cần xử lý</p>
              </li>
            )}
          </ul>
        </div>

        {/* Alerts */}
        <div className="activity-list-container">
          <div className="list-header">
            <h4>Thông báo & Cảnh báo</h4>
            <button className="btn-view-all">Xem tất cả <FiChevronRight /></button>
          </div>
          <ul className="activity-list">
            {dashboardData?.alerts && dashboardData.alerts.length > 0 ? (
              dashboardData.alerts.map((alert, index) => (
                <li key={index} className="activity-item alert-item">
                  <div className="item-icon warning"><FiBell /></div>
                  <div className="item-details">
                    <span className="item-action">{alert}</span>
                  </div>
                </li>
              ))
            ) : (
              <li className="empty-state">
                <p>Không có thông báo mới</p>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LeTanDashboardPage;