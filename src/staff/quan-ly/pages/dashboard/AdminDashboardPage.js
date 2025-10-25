import React, { useState, useEffect } from 'react';
import './AdminDashboardPage.css';
import {
    FiUsers, FiActivity, FiClock, FiRefreshCw, FiAlertCircle,
    FiCheckCircle, FiTrendingUp, FiBarChart2
} from 'react-icons/fi';
import { adminDashboardAPI } from '../../../../services/staff/adminAPI';

const AdminDashboardPage = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminDashboardAPI.getDashboard();

            if (response.data) {
                setDashboardData(response.data);
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

    // Get severity color
    const getSeverityColor = (severity) => {
        const severityMap = {
            'HIGH': 'high',
            'CRITICAL': 'high',
            'MEDIUM': 'medium',
            'LOW': 'low',
            'INFO': 'low'
        };
        return severityMap[severity] || 'low';
    };

    // Get department status color
    const getDepartmentStatusColor = (status) => {
        const statusMap = {
            'NORMAL': 'normal',
            'BUSY': 'busy',
            'OVERLOAD': 'overload'
        };
        return statusMap[status] || 'normal';
    };
    // Loading state
    if (loading) {
        return (
            <div className="admin-dashboard">
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
            <div className="admin-dashboard">
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

    const overview = dashboardData?.overview || {};
    const performance = dashboardData?.performance || {};

    return (
        <div className="admin-dashboard">
            <div className="page-header">
                <div>
                    <h2>Dashboard Quản lý</h2>
                    <p>Tổng quan hoạt động và hiệu suất hệ thống</p>
                </div>
                <button className="btn-refresh" onClick={fetchDashboardData}>
                    <FiRefreshCw /> Làm mới
                </button>
            </div>

            {/* Overview Stats */}
            <div className="overview-section">
                <h3 className="section-title">Tổng quan lượt khám</h3>
                <div className="overview-grid">
                    <div className="overview-card">
                        <div className="card-header">
                            <span className="card-label">Đã lên lịch</span>
                            <FiActivity className="card-icon blue" />
                        </div>
                        <div className="card-value">{overview.scheduled || 0}</div>
                    </div>
                    <div className="overview-card">
                        <div className="card-header">
                            <span className="card-label">Đang mở</span>
                            <FiCheckCircle className="card-icon green" />
                        </div>
                        <div className="card-value">{overview.open || 0}</div>
                    </div>
                    <div className="overview-card">
                        <div className="card-header">
                            <span className="card-label">Đang khám</span>
                            <FiUsers className="card-icon orange" />
                        </div>
                        <div className="card-value">{overview.inProgress || 0}</div>
                    </div>
                    <div className="overview-card">
                        <div className="card-header">
                            <span className="card-label">Sẵn sàng xuất viện</span>
                            <FiTrendingUp className="card-icon purple" />
                        </div>
                        <div className="card-value">{overview.readyForDischarge || 0}</div>
                    </div>
                    <div className="overview-card">
                        <div className="card-header">
                            <span className="card-label">Đã đóng</span>
                            <FiCheckCircle className="card-icon success" />
                        </div>
                        <div className="card-value">{overview.closed || 0}</div>
                    </div>
                    <div className="overview-card">
                        <div className="card-header">
                            <span className="card-label">Đã hủy</span>
                            <FiAlertCircle className="card-icon danger" />
                        </div>
                        <div className="card-value">{overview.cancelled || 0}</div>
                    </div>
                    <div className="overview-card total">
                        <div className="card-header">
                            <span className="card-label">Tổng cộng</span>
                            <FiBarChart2 className="card-icon" />
                        </div>
                        <div className="card-value">{overview.total || 0}</div>
                    </div>
                </div>
            </div>


            {/* Performance Stats */}
            <div className="performance-section">
                <h3 className="section-title">Hiệu suất hoạt động</h3>
                <div className="performance-grid">
                    <div className="performance-card">
                        <div className="perf-icon blue">
                            <FiClock />
                        </div>
                        <div className="perf-info">
                            <span className="perf-label">Thời gian chờ TB</span>
                            <span className="perf-value">{performance.averageWaitTime || 0} phút</span>
                        </div>
                    </div>
                    <div className="performance-card">
                        <div className="perf-icon green">
                            <FiActivity />
                        </div>
                        <div className="perf-info">
                            <span className="perf-label">Thời gian khám TB</span>
                            <span className="perf-value">{performance.averageExamTime || 0} phút</span>
                        </div>
                    </div>
                    <div className="performance-card">
                        <div className="perf-icon orange">
                            <FiUsers />
                        </div>
                        <div className="perf-info">
                            <span className="perf-label">Lượng BN hôm nay</span>
                            <span className="perf-value">{performance.totalPatientsToday || 0}</span>
                        </div>
                    </div>
                    <div className="performance-card">
                        <div className="perf-icon purple">
                            <FiTrendingUp />
                        </div>
                        <div className="perf-info">
                            <span className="perf-label">Công suất sử dụng</span>
                            <span className="perf-value">{performance.capacityUtilization || 0}%</span>
                        </div>
                    </div>
                    <div className="performance-card">
                        <div className="perf-icon success">
                            <FiBarChart2 />
                        </div>
                        <div className="perf-info">
                            <span className="perf-label">Thông lượng BN</span>
                            <span className="perf-value">{performance.patientThroughput || 0}/h</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Departments and Alerts */}
            <div className="bottom-section">
                {/* Departments */}
                <div className="card departments-card">
                    <div className="card-header">
                        <h3>
                            <FiActivity className="header-icon" />
                            Tình trạng các khoa ({dashboardData?.departments?.length || 0})
                        </h3>
                    </div>
                    <div className="departments-list">
                        {dashboardData?.departments && dashboardData.departments.length > 0 ? (
                            <div className="dept-table">
                                <div className="dept-header">
                                    <span>Tên khoa</span>
                                    <span>Đang khám</span>
                                    <span>Hoàn thành</span>
                                    <span>Thời gian TB</span>
                                    <span>Trạng thái</span>
                                </div>
                                {dashboardData.departments.map((dept) => (
                                    <div key={dept.departmentId} className="dept-row">
                                        <span className="dept-name">{dept.departmentName}</span>
                                        <span className="dept-active">{dept.activeEncounters}</span>
                                        <span className="dept-completed">{dept.completedToday}</span>
                                        <span className="dept-time">{dept.averageTime} phút</span>
                                        <span>
                                            <span className={`dept-status ${getDepartmentStatusColor(dept.status)}`}>
                                                {dept.status === 'NORMAL' ? 'Bình thường' :
                                                 dept.status === 'BUSY' ? 'Bận' :
                                                 dept.status === 'OVERLOAD' ? 'Quá tải' : dept.status}
                                            </span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>Không có dữ liệu khoa</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Alerts */}
                <div className="card alerts-card">
                    <div className="card-header">
                        <h3>
                            <FiAlertCircle className="header-icon" />
                            Cảnh báo ({dashboardData?.alerts?.length || 0})
                        </h3>
                    </div>
                    <div className="alerts-list">
                        {dashboardData?.alerts && dashboardData.alerts.length > 0 ? (
                            dashboardData.alerts.map((alert, index) => (
                                <div key={index} className={`alert-item severity-${getSeverityColor(alert.severity)}`}>
                                    <div className="alert-header">
                                        <span className={`severity-badge ${getSeverityColor(alert.severity)}`}>
                                            {alert.severity === 'HIGH' || alert.severity === 'CRITICAL' ? 'Cao' :
                                             alert.severity === 'MEDIUM' ? 'Trung bình' : 'Thấp'}
                                        </span>
                                        <span className="alert-type">{alert.alertType}</span>
                                    </div>
                                    <div className="alert-body">
                                        <p className="alert-message">{alert.message}</p>
                                        {alert.patientName && (
                                            <div className="alert-details">
                                                <span>Bệnh nhân: {alert.patientName}</span>
                                                {alert.durationMinutes && (
                                                    <span> • Thời gian: {alert.durationMinutes} phút</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <p>Không có cảnh báo</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;