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
            <span className="card-value">{dashboardData?.todayTotalBookings || 0}</span>
            <span className="card-comparison">
              {dashboardData?.pendingBookings || 0} đang chờ
            </span>
          </div>
        </div>
        <div className="stats-card">
          <div className="card-icon green"><FiLogIn /></div>
          <div className="card-info">
            <span className="card-title">Check-in hôm nay</span>
            <span className="card-value">{dashboardData?.todayCheckIns || 0}</span>
            <span className="card-comparison">
              {dashboardData?.checkedInBookings || 0} đã check-in
            </span>
          </div>
        </div>
        <div className="stats-card">
          <div className="card-icon purple"><FiUsers /></div>
          <div className="card-info">
            <span className="card-title">Chờ khám</span>
            <span className="card-value">{dashboardData?.waitingPatients || 0}</span>
            <span className="card-comparison">Bệnh nhân</span>
          </div>
        </div>
        <div className="stats-card">
          <div className="card-icon orange"><FiClock /></div>
          <div className="card-info">
            <span className="card-title">Thời gian chờ TB</span>
            <span className="card-value">
              {dashboardData?.averageWaitTime?.toFixed(1) || 0} phút
            </span>
            <span className="card-comparison">Trung bình</span>
          </div>
        </div>
      </div>

      {/* --- Additional Stats --- */}
      <div className="stats-grid">
        <div className="stats-card">
          <div className="card-icon blue"><FiUsers /></div>
          <div className="card-info">
            <span className="card-title">Đang khám</span>
            <span className="card-value">{dashboardData?.inExamination || 0}</span>
            <span className="card-comparison">Bệnh nhân</span>
          </div>
        </div>
        <div className="stats-card">
          <div className="card-icon green"><FiUsers /></div>
          <div className="card-info">
            <span className="card-title">Sẵn sàng xuất viện</span>
            <span className="card-value">{dashboardData?.readyForDischarge || 0}</span>
            <span className="card-comparison">Bệnh nhân</span>
          </div>
        </div>
        <div className="stats-card">
          <div className="card-icon orange"><FiAlertCircle /></div>
          <div className="card-info">
            <span className="card-title">Hàng đợi hiện tại</span>
            <span className="card-value">{dashboardData?.currentQueueLength || 0}</span>
            <span className="card-comparison">Bệnh nhân</span>
          </div>
        </div>
        <div className="stats-card">
          <div className="card-icon purple"><FiClock /></div>
          <div className="card-info">
            <span className="card-title">Chờ lâu nhất</span>
            <span className="card-value">{dashboardData?.longestWaitMinutes || 0} phút</span>
            <span className="card-comparison">Thời gian</span>
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
          <h4>Thống kê lịch hẹn hôm nay</h4>
          <div className="stats-detail-grid">
            <div className="stat-item">
              <span className="stat-label">Tổng lịch hẹn</span>
              <span className="stat-value">{dashboardData?.todayTotalBookings || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Đã xác nhận</span>
              <span className="stat-value green">{dashboardData?.confirmedBookings || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Hoàn thành</span>
              <span className="stat-value blue">{dashboardData?.completedBookings || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Đã hủy</span>
              <span className="stat-value red">{dashboardData?.cancelledBookings || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Không đến</span>
              <span className="stat-value orange">{dashboardData?.noShowBookings || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Khẩn cấp</span>
              <span className="stat-value red">{dashboardData?.urgentBookings || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Quá hạn</span>
              <span className="stat-value orange">{dashboardData?.overdueAppointments || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Chờ thanh toán</span>
              <span className="stat-value purple">{dashboardData?.pendingPayments || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeTanDashboardPage;