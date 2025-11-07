import React, { useState, useEffect } from 'react';
import './HRDashboardPage.css';
import { hrDashboardAPI } from '../../../../services/staff/hrAPI';
import {
  FiUsers,
  FiUserCheck,
  FiCalendar,
  FiFileText,
  FiAlertCircle,
  FiClock,
  FiTrendingUp,
  FiActivity,
  FiUserX,
  FiUserPlus,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';

const HRDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await hrDashboardAPI.getDashboard();

      console.log('Dashboard API response:', response);

      if (response && response.data) {
        setDashboardData(response.data);
      } else {
        setError('Không có dữ liệu từ server');
      }
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu dashboard');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get severity badge color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return '#dc3545';
      case 'HIGH': return '#fd7e14';
      case 'MEDIUM': return '#ffc107';
      case 'LOW': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  // Helper function to format leave type
  const formatLeaveType = (type) => {
    const types = {
      'ANNUAL_LEAVE': 'Nghỉ phép năm',
      'SICK_LEAVE': 'Nghỉ ốm',
      'PERSONAL_LEAVE': 'Nghỉ cá nhân',
      'MATERNITY': 'Nghỉ thai sản',
      'PATERNITY': 'Nghỉ chăm con',
      'STUDY_LEAVE': 'Nghỉ học tập',
      'UNPAID_LEAVE': 'Nghỉ không lương',
    };
    return types[type] || type;
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
          <FiAlertCircle size={48} color="#dc3545" />
          <p>Lỗi: {error}</p>
          <button onClick={fetchDashboardData} className="btn-retry">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="hr-dashboard-page">
        <div className="error-container">
          <p>Không có dữ liệu</p>
        </div>
      </div>
    );
  }

  const { employeeOverview, attendanceMetrics, leaveManagement, workloadMetrics, alerts } = dashboardData;

  return (
    <div className="hr-dashboard-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Dashboard Quản lý Nhân sự</h1>
          <p className="page-subtitle">
            Cập nhật lần cuối: {new Date(dashboardData.lastUpdated).toLocaleString('vi-VN')}
          </p>
        </div>
        <button onClick={fetchDashboardData} className="btn-refresh">
          <FiActivity /> Làm mới
        </button>
      </div>

      {/* Critical Alerts */}
      {alerts && alerts.length > 0 && (
        <div className="alerts-section">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className="alert-card"
              style={{ borderLeftColor: getSeverityColor(alert.severity) }}
            >
              <FiAlertTriangle
                size={24}
                color={getSeverityColor(alert.severity)}
              />
              <div className="alert-content">
                <div className="alert-header">
                  <span className="alert-type">{alert.alertType}</span>
                  <span
                    className="alert-severity"
                    style={{ backgroundColor: getSeverityColor(alert.severity) }}
                  >
                    {alert.severity}
                  </span>
                </div>
                <p className="alert-message">{alert.message}</p>
                <span className="alert-time">
                  {new Date(alert.timestamp).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Stats Cards */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e3f2fd' }}>
            <FiUsers style={{ color: '#1976d2' }} />
          </div>
          <div className="stat-content">
            <h3>{employeeOverview?.totalEmployees || 0}</h3>
            <p>Tổng số Nhân viên</p>
            <div className="stat-details">
              <span className="stat-detail-item">
                <FiUserCheck size={14} /> {employeeOverview?.activeEmployees || 0} đang làm
              </span>
              <span className="stat-detail-item">
                <FiUserX size={14} /> {employeeOverview?.inactiveEmployees || 0} không hoạt động
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e8f5e9' }}>
            <FiActivity style={{ color: '#388e3c' }} />
          </div>
          <div className="stat-content">
            <h3>{attendanceMetrics?.todayAttendance?.attendanceRate?.toFixed(1) || 0}%</h3>
            <p>Tỷ lệ Chuyên cần Hôm nay</p>
            <div className="stat-details">
              <span className="stat-detail-item">
                <FiCheckCircle size={14} /> {attendanceMetrics?.todayAttendance?.checkedIn || 0} đã check-in
              </span>
              <span className="stat-detail-item">
                <FiXCircle size={14} /> {attendanceMetrics?.todayAttendance?.absent || 0} vắng mặt
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fff3e0' }}>
            <FiFileText style={{ color: '#f57c00' }} />
          </div>
          <div className="stat-content">
            <h3>{leaveManagement?.pendingRequests || 0}</h3>
            <p>Đơn nghỉ phép chờ duyệt</p>
            <div className="stat-details">
              <span className="stat-detail-item">
                <FiCheckCircle size={14} /> {leaveManagement?.approvedThisMonth || 0} đã duyệt
              </span>
              <span className="stat-detail-item">
                <FiXCircle size={14} /> {leaveManagement?.rejectedThisMonth || 0} từ chối
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f3e5f5' }}>
            <FiClock style={{ color: '#7b1fa2' }} />
          </div>
          <div className="stat-content">
            <h3>{workloadMetrics?.averageWorkHoursPerEmployee?.toFixed(1) || 0}h</h3>
            <p>Giờ làm TB/Nhân viên</p>
            <div className="stat-details">
              <span className="stat-detail-item">
                <FiTrendingUp size={14} /> {workloadMetrics?.totalOvertimeHours?.toFixed(1) || 0}h tăng ca
              </span>
              <span className="stat-detail-item">
                <FiUsers size={14} /> {workloadMetrics?.employeesWithOvertime || 0} NV tăng ca
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content Grid */}
      <div className="dashboard-content">
        {/* Left Column */}
        <div className="dashboard-left">
          {/* Employee by Department */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>
                <FiUsers /> Nhân viên theo Khoa/Phòng ban
              </h2>
              <span className="card-badge">
                {employeeOverview?.employeesByDepartment?.length || 0} khoa
              </span>
            </div>
            <div className="department-list">
              {employeeOverview?.employeesByDepartment && employeeOverview.employeesByDepartment.length > 0 ? (
                employeeOverview.employeesByDepartment
                  .sort((a, b) => b.totalEmployees - a.totalEmployees)
                  .map((dept) => (
                    <div key={dept.departmentId} className="department-item">
                      <div className="dept-info">
                        <span className="dept-name">{dept.departmentName}</span>
                        <span className="dept-total">{dept.totalEmployees} nhân viên</span>
                      </div>
                      <div className="dept-breakdown">
                        {dept.doctorCount > 0 && (
                          <span className="dept-role doctor">
                            {dept.doctorCount} BS
                          </span>
                        )}
                        {dept.nurseCount > 0 && (
                          <span className="dept-role nurse">
                            {dept.nurseCount} ĐD
                          </span>
                        )}
                        {dept.otherStaffCount > 0 && (
                          <span className="dept-role other">
                            {dept.otherStaffCount} Khác
                          </span>
                        )}
                      </div>
                      <div className="dept-progress">
                        <div
                          className="dept-progress-bar"
                          style={{
                            width: `${(dept.totalEmployees / employeeOverview.totalEmployees * 100).toFixed(1)}%`
                          }}
                        />
                      </div>
                    </div>
                  ))
              ) : (
                <p className="no-data">Không có dữ liệu</p>
              )}
            </div>
          </div>

          {/* Attendance Metrics */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>
                <FiActivity /> Chuyên cần Hôm nay
              </h2>
            </div>
            <div className="attendance-grid">
              <div className="attendance-item">
                <div className="attendance-label">Tổng lịch</div>
                <div className="attendance-value">{attendanceMetrics?.todayAttendance?.totalScheduled || 0}</div>
              </div>
              <div className="attendance-item">
                <div className="attendance-label">Đã check-in</div>
                <div className="attendance-value success">{attendanceMetrics?.todayAttendance?.checkedIn || 0}</div>
              </div>
              <div className="attendance-item">
                <div className="attendance-label">Đi muộn</div>
                <div className="attendance-value warning">{attendanceMetrics?.todayAttendance?.lateArrivals || 0}</div>
              </div>
              <div className="attendance-item">
                <div className="attendance-label">Vắng mặt</div>
                <div className="attendance-value danger">{attendanceMetrics?.todayAttendance?.absent || 0}</div>
              </div>
              <div className="attendance-item">
                <div className="attendance-label">Nghỉ phép</div>
                <div className="attendance-value info">{attendanceMetrics?.todayAttendance?.onLeave || 0}</div>
              </div>
              <div className="attendance-item">
                <div className="attendance-label">Tỷ lệ</div>
                <div className="attendance-value primary">
                  {attendanceMetrics?.todayAttendance?.attendanceRate?.toFixed(1) || 0}%
                </div>
              </div>
            </div>

            <div className="monthly-stats">
              <h3>Thống kê tháng này</h3>
              <div className="monthly-stats-grid">
                <div className="monthly-stat-item">
                  <span className="monthly-stat-label">Tỷ lệ TB</span>
                  <span className="monthly-stat-value">
                    {attendanceMetrics?.monthlyStats?.averageAttendanceRate?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="monthly-stat-item">
                  <span className="monthly-stat-label">Tổng đi muộn</span>
                  <span className="monthly-stat-value">
                    {attendanceMetrics?.monthlyStats?.totalLateArrivals || 0}
                  </span>
                </div>
                <div className="monthly-stat-item">
                  <span className="monthly-stat-label">Tổng vắng</span>
                  <span className="monthly-stat-value">
                    {attendanceMetrics?.monthlyStats?.totalAbsences || 0}
                  </span>
                </div>
                <div className="monthly-stat-item">
                  <span className="monthly-stat-label">Ngày làm việc</span>
                  <span className="monthly-stat-value">
                    {attendanceMetrics?.monthlyStats?.totalWorkingDays || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Workload Metrics */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>
                <FiTrendingUp /> Khối lượng Công việc
              </h2>
            </div>
            <div className="workload-stats">
              <div className="workload-item">
                <div className="workload-icon" style={{ backgroundColor: '#e3f2fd' }}>
                  <FiClock style={{ color: '#1976d2' }} />
                </div>
                <div className="workload-info">
                  <span className="workload-label">Giờ làm TB/NV</span>
                  <span className="workload-value">
                    {workloadMetrics?.averageWorkHoursPerEmployee?.toFixed(1) || 0}h
                  </span>
                </div>
              </div>
              <div className="workload-item">
                <div className="workload-icon" style={{ backgroundColor: '#fff3e0' }}>
                  <FiTrendingUp style={{ color: '#f57c00' }} />
                </div>
                <div className="workload-info">
                  <span className="workload-label">Tổng giờ tăng ca</span>
                  <span className="workload-value">
                    {workloadMetrics?.totalOvertimeHours?.toFixed(1) || 0}h
                  </span>
                </div>
              </div>
              <div className="workload-item">
                <div className="workload-icon" style={{ backgroundColor: '#e8f5e9' }}>
                  <FiUsers style={{ color: '#388e3c' }} />
                </div>
                <div className="workload-info">
                  <span className="workload-label">NV có tăng ca</span>
                  <span className="workload-value">
                    {workloadMetrics?.employeesWithOvertime || 0}
                  </span>
                </div>
              </div>
              <div className="workload-item">
                <div className="workload-icon" style={{ backgroundColor: '#ffebee' }}>
                  <FiAlertCircle style={{ color: '#c62828' }} />
                </div>
                <div className="workload-info">
                  <span className="workload-label">Ca thiếu người</span>
                  <span className="workload-value danger">
                    {workloadMetrics?.shiftsUnderstaffed || 0}
                  </span>
                </div>
              </div>
              <div className="workload-item">
                <div className="workload-icon" style={{ backgroundColor: '#e8f5e9' }}>
                  <FiCheckCircle style={{ color: '#2e7d32' }} />
                </div>
                <div className="workload-info">
                  <span className="workload-label">Ca đủ người</span>
                  <span className="workload-value success">
                    {workloadMetrics?.shiftsFullyStaffed || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Right Column */}
        <div className="dashboard-right">
          {/* Leave Management */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>
                <FiFileText /> Quản lý Nghỉ phép
              </h2>
            </div>

            <div className="leave-summary">
              <div className="leave-summary-item">
                <span className="leave-summary-label">Chờ duyệt</span>
                <span className="leave-summary-value pending">
                  {leaveManagement?.pendingRequests || 0}
                </span>
              </div>
              <div className="leave-summary-item">
                <span className="leave-summary-label">Đã duyệt tháng này</span>
                <span className="leave-summary-value approved">
                  {leaveManagement?.approvedThisMonth || 0}
                </span>
              </div>
              <div className="leave-summary-item">
                <span className="leave-summary-label">Từ chối tháng này</span>
                <span className="leave-summary-value rejected">
                  {leaveManagement?.rejectedThisMonth || 0}
                </span>
              </div>
              <div className="leave-summary-item">
                <span className="leave-summary-label">Đang nghỉ hôm nay</span>
                <span className="leave-summary-value onleave">
                  {leaveManagement?.employeesOnLeaveToday || 0}
                </span>
              </div>
            </div>

            {/* Leave by Type */}
            {leaveManagement?.leaveByType && Object.keys(leaveManagement.leaveByType).length > 0 && (
              <div className="leave-by-type">
                <h3>Phân loại nghỉ phép</h3>
                <div className="leave-type-list">
                  {Object.entries(leaveManagement.leaveByType).map(([type, count]) => (
                    <div key={type} className="leave-type-item">
                      <span className="leave-type-name">{formatLeaveType(type)}</span>
                      <span className="leave-type-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Pending Requests */}
            <div className="pending-requests">
              <h3>Đơn chờ duyệt gần đây</h3>
              {leaveManagement?.topPendingRequests && leaveManagement.topPendingRequests.length > 0 ? (
                <div className="pending-requests-list">
                  {leaveManagement.topPendingRequests.slice(0, 5).map((request) => (
                    <div key={request.requestId} className="pending-request-item">
                      <div className="request-header">
                        <span className="request-employee">{request.employeeName}</span>
                        <span className="request-days">{request.totalDays} ngày</span>
                      </div>
                      <div className="request-details">
                        <span className="request-code">{request.employeeCode}</span>
                        <span className="request-dept">{request.departmentName}</span>
                      </div>
                      <div className="request-info">
                        <span className="request-type">{formatLeaveType(request.requestType)}</span>
                        <span className="request-date">
                          {new Date(request.startDate).toLocaleDateString('vi-VN')} - {new Date(request.endDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="request-footer">
                        <span className="request-waiting">
                          <FiClock size={12} /> Chờ {request.daysWaiting} ngày
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">Không có đơn chờ duyệt</p>
              )}
            </div>
          </div>

          {/* Employee by Role */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>
                <FiUserCheck /> Nhân viên theo Vai trò
              </h2>
            </div>
            <div className="role-list">
              {employeeOverview?.employeesByRole && Object.keys(employeeOverview.employeesByRole).length > 0 ? (
                Object.entries(employeeOverview.employeesByRole)
                  .sort(([, a], [, b]) => b - a)
                  .map(([role, count]) => {
                    const roleNames = {
                      'DOCTOR': 'Bác sĩ',
                      'NURSE': 'Điều dưỡng',
                      'RECEPTIONIST': 'Lễ tân',
                      'PHARMACIST': 'Dược sĩ',
                      'LAB_TECH': 'Kỹ thuật viên',
                      'CASHIER': 'Thu ngân',
                      'ADMIN': 'Quản trị viên',
                      'HR_MANAGER': 'Quản lý HR',
                      'SYSTEM': 'Hệ thống',
                    };

                    const roleColors = {
                      'DOCTOR': '#1976d2',
                      'NURSE': '#388e3c',
                      'RECEPTIONIST': '#7b1fa2',
                      'PHARMACIST': '#f57c00',
                      'LAB_TECH': '#0097a7',
                      'CASHIER': '#c2185b',
                      'ADMIN': '#d32f2f',
                      'HR_MANAGER': '#5d4037',
                      'SYSTEM': '#616161',
                    };

                    return (
                      <div key={role} className="role-item">
                        <div className="role-info">
                          <div
                            className="role-color"
                            style={{ backgroundColor: roleColors[role] || '#6c757d' }}
                          />
                          <span className="role-name">{roleNames[role] || role}</span>
                        </div>
                        <span className="role-count">{count}</span>
                        <div className="role-progress">
                          <div
                            className="role-progress-bar"
                            style={{
                              width: `${(count / employeeOverview.totalEmployees * 100).toFixed(1)}%`,
                              backgroundColor: roleColors[role] || '#6c757d'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
              ) : (
                <p className="no-data">Không có dữ liệu</p>
              )}
            </div>
          </div>

          {/* New Hires & Terminations */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>
                <FiUserPlus /> Biến động Nhân sự Tháng này
              </h2>
            </div>
            <div className="employee-changes">
              <div className="change-item new-hires">
                <FiUserPlus size={32} />
                <div className="change-info">
                  <span className="change-value">{employeeOverview?.newHiresThisMonth || 0}</span>
                  <span className="change-label">Nhân viên mới</span>
                </div>
              </div>
              <div className="change-item terminations">
                <FiUserX size={32} />
                <div className="change-info">
                  <span className="change-value">{employeeOverview?.terminationsThisMonth || 0}</span>
                  <span className="change-label">Nghỉ việc</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboardPage;
