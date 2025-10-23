import React, { useState, useEffect } from 'react';
import './DashboardPage.css';
import {
    FiUsers, FiActivity, FiClock, FiRefreshCw, FiAlertCircle, FiCheckCircle
} from 'react-icons/fi';
import { nurseDashboardAPI } from '../../../../services/staff/nurseAPI';

const NurseDashboardPage = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await nurseDashboardAPI.getDashboard();

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

    // Calculate time difference in minutes
    const getMinutesAgo = (dateString) => {
        if (!dateString) return 0;
        const now = new Date();
        const past = new Date(dateString);
        return Math.floor((now - past) / 60000);
    };

    // Loading state
    if (loading) {
        return (
            <div className="nurse-dashboard">
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
            <div className="nurse-dashboard">
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
        <div className="nurse-dashboard">
            <div className="page-header">
                <div>
                    <h2>Dashboard Điều dưỡng</h2>
                    <p>Tổng quan công việc và bệnh nhân cần chăm sóc</p>
                </div>
                <button className="btn-refresh" onClick={fetchDashboardData}>
                    <FiRefreshCw /> Làm mới
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stats-card">
                    <div className="card-icon blue"><FiActivity /></div>
                    <div className="card-info">
                        <span className="card-title">Sinh hiệu đã ghi</span>
                        <span className="card-value">{dashboardData?.todayStats?.vitalsRecorded || 0}</span>
                        <span className="card-comparison">Hôm nay</span>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="card-icon green"><FiUsers /></div>
                    <div className="card-info">
                        <span className="card-title">BN đã hỗ trợ</span>
                        <span className="card-value">{dashboardData?.todayStats?.patientsAssisted || 0}</span>
                        <span className="card-comparison">Hôm nay</span>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="card-icon orange"><FiAlertCircle /></div>
                    <div className="card-info">
                        <span className="card-title">Chờ đo sinh hiệu</span>
                        <span className="card-value">{dashboardData?.todayStats?.pendingVitals || 0}</span>
                        <span className="card-comparison">Cần xử lý</span>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="card-icon purple"><FiClock /></div>
                    <div className="card-info">
                        <span className="card-title">Thời gian TB</span>
                        <span className="card-value">{dashboardData?.todayStats?.averageVitalsTime || 0} phút</span>
                        <span className="card-comparison">Đo sinh hiệu</span>
                    </div>
                </div>
            </div>

            {/* Patient Lists Section */}
            <div className="patient-lists-section">
                {/* Need Vitals */}
                <div className="card patient-list-card">
                    <div className="card-header">
                        <h3>
                            <FiAlertCircle className="header-icon" />
                            Cần đo sinh hiệu ({dashboardData?.needVitals?.length || 0})
                        </h3>
                    </div>
                    <div className="patient-list">
                        {dashboardData?.needVitals && dashboardData.needVitals.length > 0 ? (
                            <div className="list-table">
                                <div className="list-header">
                                    <span>Mã BN</span>
                                    <span>Tên BN</span>
                                    <span>Khoa</span>
                                    <span>Bác sĩ</span>
                                    <span>Check-in</span>
                                    <span>Chờ</span>
                                    <span>Hành động</span>
                                </div>
                                {dashboardData.needVitals.map((patient) => (
                                    <div key={patient.encounterId} className="list-row">
                                        <span className="patient-code">{patient.patientCode}</span>
                                        <span className="patient-name">{patient.patientName}</span>
                                        <span>{patient.departmentName}</span>
                                        <span>{patient.assignedDoctor}</span>
                                        <span>{formatTime(patient.checkedInAt)}</span>
                                        <span className={`waiting-time ${patient.waitingMinutes > 30 ? 'urgent' : ''}`}>
                                            {patient.waitingMinutes} phút
                                        </span>
                                        <span>
                                            <button className="btn-action primary">Đo sinh hiệu</button>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>Không có bệnh nhân cần đo sinh hiệu</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* In Examination */}
                <div className="card patient-list-card">
                    <div className="card-header">
                        <h3>
                            <FiCheckCircle className="header-icon" />
                            Đang khám ({dashboardData?.inExamination?.length || 0})
                        </h3>
                    </div>
                    <div className="patient-list">
                        {dashboardData?.inExamination && dashboardData.inExamination.length > 0 ? (
                            <div className="list-table">
                                <div className="list-header">
                                    <span>Mã BN</span>
                                    <span>Tên BN</span>
                                    <span>Bác sĩ</span>
                                    <span>Bắt đầu</span>
                                    <span>Thời gian</span>
                                    <span>Sinh hiệu</span>
                                </div>
                                {dashboardData.inExamination.map((patient) => (
                                    <div key={patient.encounterId} className="list-row">
                                        <span className="patient-code">{patient.patientCode}</span>
                                        <span className="patient-name">{patient.patientName}</span>
                                        <span>{patient.doctorName}</span>
                                        <span>{formatTime(patient.startedAt)}</span>
                                        <span>{patient.durationMinutes} phút</span>
                                        <span>
                                            {patient.vitalsCompleted ? (
                                                <span className="status-badge completed">
                                                    <FiCheckCircle /> Đã đo
                                                </span>
                                            ) : (
                                                <span className="status-badge pending">
                                                    <FiAlertCircle /> Chưa đo
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>Không có bệnh nhân đang khám</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NurseDashboardPage;