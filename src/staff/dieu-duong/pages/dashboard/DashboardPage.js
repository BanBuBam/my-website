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
                        <span className="card-value">{dashboardData?.vitalsRecorded || 0}</span>
                        <span className="card-comparison">Hôm nay</span>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="card-icon green"><FiUsers /></div>
                    <div className="card-info">
                        <span className="card-title">BN đã hỗ trợ</span>
                        <span className="card-value">{dashboardData?.patientsAssisted || 0}</span>
                        <span className="card-comparison">Hôm nay</span>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="card-icon orange"><FiAlertCircle /></div>
                    <div className="card-info">
                        <span className="card-title">Chờ đo sinh hiệu</span>
                        <span className="card-value">{dashboardData?.pendingVitals || 0}</span>
                        <span className="card-comparison">Cần xử lý</span>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="card-icon purple"><FiClock /></div>
                    <div className="card-info">
                        <span className="card-title">Thời gian TB</span>
                        <span className="card-value">{dashboardData?.averageVitalsTime?.toFixed(1) || 0} phút</span>
                        <span className="card-comparison">Đo sinh hiệu</span>
                    </div>
                </div>
            </div>

            {/* Additional Stats */}
            <div className="stats-grid">
                <div className="stats-card">
                    <div className="card-icon blue"><FiUsers /></div>
                    <div className="card-info">
                        <span className="card-title">BN cần đo sinh hiệu</span>
                        <span className="card-value">{dashboardData?.patientsNeedingVitals || 0}</span>
                        <span className="card-comparison">Bệnh nhân</span>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="card-icon green"><FiActivity /></div>
                    <div className="card-info">
                        <span className="card-title">BN đang khám</span>
                        <span className="card-value">{dashboardData?.patientsInExamination || 0}</span>
                        <span className="card-comparison">Bệnh nhân</span>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default NurseDashboardPage;