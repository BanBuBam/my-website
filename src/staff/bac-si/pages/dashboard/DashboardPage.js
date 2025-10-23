import React, { useState, useEffect } from 'react';
import './DashboardPage.css';
import {
    FiUsers, FiFileText, FiClock, FiRefreshCw, FiAlertCircle,
    FiCheckCircle, FiEdit, FiActivity
} from 'react-icons/fi';
import { doctorDashboardAPI } from '../../../../services/staff/doctorAPI';

const DoctorDashboardPage = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await doctorDashboardAPI.getDashboard();

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

    // Format time
    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    // Get urgency color
    const getUrgencyColor = (level) => {
        if (level >= 3) return 'high';
        if (level === 2) return 'medium';
        return 'low';
    };

    // Get status label
    const getStatusLabel = (status) => {
        const statusMap = {
            'WAITING': 'Chờ khám',
            'IN_PROGRESS': 'Đang khám',
            'COMPLETED': 'Hoàn thành',
            'PENDING': 'Chờ xử lý'
        };
        return statusMap[status] || status;
    };
    // Loading state
    if (loading) {
        return (
            <div className="doctor-dashboard">
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
            <div className="doctor-dashboard">
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
        <div className="doctor-dashboard">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h2>Dashboard Bác sĩ</h2>
                    <p>Tổng quan công việc trong ngày</p>
                </div>
                <button className="btn-refresh" onClick={fetchDashboardData}>
                    <FiRefreshCw /> Làm mới
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stats-card">
                    <div className="card-icon blue"><FiUsers /></div>
                    <div className="card-info">
                        <span className="card-title">BN đã khám</span>
                        <span className="card-value">{dashboardData?.todayStats?.patientsExamined || 0}</span>
                        <span className="card-comparison">Hôm nay</span>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="card-icon orange"><FiFileText /></div>
                    <div className="card-info">
                        <span className="card-title">Chờ ghi chú</span>
                        <span className="card-value">{dashboardData?.todayStats?.pendingNotes || 0}</span>
                        <span className="card-comparison">Cần hoàn thành</span>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="card-icon green"><FiEdit /></div>
                    <div className="card-info">
                        <span className="card-title">Chờ kê đơn</span>
                        <span className="card-value">{dashboardData?.todayStats?.pendingPrescriptions || 0}</span>
                        <span className="card-comparison">Cần xử lý</span>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="card-icon purple"><FiClock /></div>
                    <div className="card-info">
                        <span className="card-title">Thời gian TB</span>
                        <span className="card-value">{dashboardData?.todayStats?.averageExamTime || 0} phút</span>
                        <span className="card-comparison">Mỗi lượt khám</span>
                    </div>
                </div>
            </div>

            {/* Working Time Summary */}
            <div className="working-time-card">
                <div className="time-info">
                    <FiActivity className="time-icon" />
                    <div>
                        <span className="time-label">Tổng thời gian làm việc hôm nay</span>
                        <span className="time-value">
                            {Math.floor((dashboardData?.todayStats?.totalWorkingMinutes || 0) / 60)}h {(dashboardData?.todayStats?.totalWorkingMinutes || 0) % 60}m
                        </span>
                    </div>
                </div>
            </div>

            {/* Patient Lists Section */}
            <div className="patient-lists-section">
                {/* My Patients */}
                <div className="card patient-list-card">
                    <div className="card-header">
                        <h3>
                            <FiUsers className="header-icon" />
                            Bệnh nhân của tôi ({dashboardData?.myPatients?.length || 0})
                        </h3>
                    </div>
                    <div className="patient-list">
                        {dashboardData?.myPatients && dashboardData.myPatients.length > 0 ? (
                            <div className="list-table">
                                <div className="list-header">
                                    <span>Mã BN</span>
                                    <span>Tên BN</span>
                                    <span>Trạng thái</span>
                                    <span>Bắt đầu</span>
                                    <span>Thời gian</span>
                                    <span>Tiến độ</span>
                                    <span>Hành động</span>
                                </div>
                                {dashboardData.myPatients.map((patient) => (
                                    <div key={patient.encounterId} className="list-row">
                                        <span className="patient-code">{patient.patientCode}</span>
                                        <span className="patient-name">{patient.patientName}</span>
                                        <span>
                                            <span className={`status-badge ${patient.status.toLowerCase()}`}>
                                                {getStatusLabel(patient.status)}
                                            </span>
                                        </span>
                                        <span>{formatTime(patient.startedAt)}</span>
                                        <span>{patient.durationMinutes} phút</span>
                                        <span className="progress-indicators">
                                            <span className={`indicator ${patient.hasVitals ? 'completed' : 'pending'}`} title="Sinh hiệu">
                                                <FiActivity />
                                            </span>
                                            <span className={`indicator ${patient.hasNotes ? 'completed' : 'pending'}`} title="Ghi chú">
                                                <FiFileText />
                                            </span>
                                            <span className={`indicator ${patient.hasPrescription ? 'completed' : 'pending'}`} title="Đơn thuốc">
                                                <FiEdit />
                                            </span>
                                        </span>
                                        <span>
                                            <button className="btn-action primary">Xem</button>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>Không có bệnh nhân nào</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pending Actions */}
                <div className="card patient-list-card">
                    <div className="card-header">
                        <h3>
                            <FiAlertCircle className="header-icon" />
                            Công việc cần xử lý ({dashboardData?.pendingActions?.length || 0})
                        </h3>
                    </div>
                    <div className="patient-list">
                        {dashboardData?.pendingActions && dashboardData.pendingActions.length > 0 ? (
                            <div className="actions-list">
                                {dashboardData.pendingActions.map((action, index) => (
                                    <div key={index} className={`action-item urgency-${getUrgencyColor(action.urgencyLevel)}`}>
                                        <div className="action-header">
                                            <span className="patient-name">{action.patientName}</span>
                                            <span className={`urgency-badge ${getUrgencyColor(action.urgencyLevel)}`}>
                                                {action.urgencyLevel >= 3 ? 'Khẩn' : action.urgencyLevel === 2 ? 'Trung bình' : 'Thấp'}
                                            </span>
                                        </div>
                                        <div className="action-body">
                                            <span className="action-type">{action.actionType}</span>
                                            <span className="action-description">{action.actionDescription}</span>
                                        </div>
                                        <div className="action-footer">
                                            <button className="btn-action small">Xử lý ngay</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>Không có công việc cần xử lý</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboardPage;