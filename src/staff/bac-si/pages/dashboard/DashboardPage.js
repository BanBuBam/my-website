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
                        <span className="card-title">Tổng BN của tôi</span>
                        <span className="card-value">{dashboardData?.totalMyPatients || 0}</span>
                        <span className="card-comparison">Bệnh nhân</span>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="card-icon green"><FiActivity /></div>
                    <div className="card-info">
                        <span className="card-title">Đang khám</span>
                        <span className="card-value">{dashboardData?.inExamination || 0}</span>
                        <span className="card-comparison">Bệnh nhân</span>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="card-icon orange"><FiClock /></div>
                    <div className="card-info">
                        <span className="card-title">Chờ khám</span>
                        <span className="card-value">{dashboardData?.waitingPatients || 0}</span>
                        <span className="card-comparison">Bệnh nhân</span>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="card-icon purple"><FiFileText /></div>
                    <div className="card-info">
                        <span className="card-title">Chờ ghi chú</span>
                        <span className="card-value">{dashboardData?.pendingNotes || 0}</span>
                        <span className="card-comparison">Cần hoàn thành</span>
                    </div>
                </div>
            </div>

            {/* Additional Stats */}
            <div className="stats-grid">
                <div className="stats-card">
                    <div className="card-icon blue"><FiUsers /></div>
                    <div className="card-info">
                        <span className="card-title">Nội trú</span>
                        <span className="card-value">{dashboardData?.inpatientCount || 0}</span>
                        <span className="card-comparison">Bệnh nhân</span>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="card-icon green"><FiCheckCircle /></div>
                    <div className="card-info">
                        <span className="card-title">Lịch hẹn hôm nay</span>
                        <span className="card-value">{dashboardData?.todayAppointments || 0}</span>
                        <span className="card-comparison">Lịch hẹn</span>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="card-icon orange"><FiAlertCircle /></div>
                    <div className="card-info">
                        <span className="card-title">Chờ kết quả XN</span>
                        <span className="card-value">{dashboardData?.pendingLabResults || 0}</span>
                        <span className="card-comparison">Xét nghiệm</span>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="card-icon purple"><FiClock /></div>
                    <div className="card-info">
                        <span className="card-title">Thời gian TB</span>
                        <span className="card-value">{dashboardData?.averageExamTime?.toFixed(1) || 0} phút</span>
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
                            {Math.floor((dashboardData?.totalWorkingMinutes || 0) / 60)}h {(dashboardData?.totalWorkingMinutes || 0) % 60}m
                        </span>
                    </div>
                </div>
                <div className="time-info">
                    <FiCheckCircle className="time-icon" />
                    <div>
                        <span className="time-label">Bệnh nhân đã khám hôm nay</span>
                        <span className="time-value">{dashboardData?.patientsSeenToday || 0} bệnh nhân</span>
                    </div>
                </div>
            </div>

            {/* Summary Info */}
            <div className="summary-info-card">
                <p><strong>Cập nhật lần cuối:</strong> {dashboardData?.lastUpdated ? new Date(dashboardData.lastUpdated).toLocaleString('vi-VN') : 'N/A'}</p>
            </div>
        </div>
    );
};

export default DoctorDashboardPage;