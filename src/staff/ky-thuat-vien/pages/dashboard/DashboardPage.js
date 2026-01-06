import React, { useState, useEffect } from 'react';
import './DashboardPage.css';
import {
    FiClipboard, FiCheckCircle, FiClock, FiRefreshCw, FiAlertCircle,
    FiActivity, FiFileText, FiUsers
} from 'react-icons/fi';
import { labTechnicianDashboardAPI } from '../../../../services/staff/labTechnicianAPI';

const LabTechnicianDashboardPage = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const response = await labTechnicianDashboardAPI.getDashboard();
            if (response.data) {
                setDashboardData(response.data);
            }
        } catch (err) {
            console.error('Lỗi khi tải dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Format datetime
    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '';
        const date = new Date(dateTimeString);
        return date.toLocaleString('vi-VN', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    // Get status color
    const getStatusColor = (status) => {
        const colors = {
            'PENDING': '#f59e0b',
            'COLLECTED': '#3b82f6',
            'RECEIVED': '#8b5cf6',
            'IN_PROGRESS': '#06b6d4',
            'COMPLETED': '#10b981',
            'CANCELLED': '#ef4444'
        };
        return colors[status] || '#6b7280';
    };

    // Get status label
    const getStatusLabel = (status) => {
        const labels = {
            'PENDING': 'Chờ lấy mẫu',
            'COLLECTED': 'Đã lấy mẫu',
            'RECEIVED': 'Đã nhận mẫu',
            'IN_PROGRESS': 'Đang xử lý',
            'COMPLETED': 'Hoàn thành',
            'CANCELLED': 'Đã hủy'
        };
        return labels[status] || status;
    };

    // Get urgency color
    const getUrgencyColor = (level) => {
        const colors = {
            'ROUTINE': '#6b7280',
            'URGENT': '#f59e0b',
            'STAT': '#ef4444'
        };
        return colors[level] || '#6b7280';
    };

    return (
        <div className="lab-technician-dashboard">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h2>Dashboard Kỹ thuật viên</h2>
                    <p>Tổng quan công việc xét nghiệm</p>
                </div>
                <button className="btn-refresh" onClick={fetchDashboardData}>
                    <FiRefreshCw /> Làm mới
                </button>
            </div>

            {loading ? (
                <div className="loading-state">Đang tải...</div>
            ) : !dashboardData ? (
                <div className="empty-state">Không có dữ liệu</div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="stats-grid">
                        <div className="stats-card">
                            <div className="card-icon orange">
                                <FiClipboard />
                            </div>
                            <div className="card-info">
                                <span className="card-title">Chờ lấy mẫu</span>
                                <span className="card-value">{dashboardData.waitingForCollection || 0}</span>
                                <span className="card-comparison">Mẫu</span>
                            </div>
                        </div>

                        <div className="stats-card">
                            <div className="card-icon blue">
                                <FiActivity />
                            </div>
                            <div className="card-info">
                                <span className="card-title">Đang xử lý</span>
                                <span className="card-value">{dashboardData.inProgress || 0}</span>
                                <span className="card-comparison">Mẫu</span>
                            </div>
                        </div>

                        <div className="stats-card">
                            <div className="card-icon purple">
                                <FiUsers />
                            </div>
                            <div className="card-info">
                                <span className="card-title">Chờ xác nhận</span>
                                <span className="card-value">{dashboardData.pendingVerification || 0}</span>
                                <span className="card-comparison">Kết quả</span>
                            </div>
                        </div>

                        <div className="stats-card">
                            <div className="card-icon green">
                                <FiCheckCircle />
                            </div>
                            <div className="card-info">
                                <span className="card-title">Hoàn thành hôm nay</span>
                                <span className="card-value">{dashboardData.completedToday || 0}</span>
                                <span className="card-comparison">Xét nghiệm</span>
                            </div>
                        </div>
                    </div>

                    {/* Additional Stats */}
                    <div className="stats-grid">
                        <div className="stats-card">
                            <div className="card-icon red">
                                <FiAlertCircle />
                            </div>
                            <div className="card-info">
                                <span className="card-title">STAT Orders</span>
                                <span className="card-value">{dashboardData.statOrders || 0}</span>
                                <span className="card-comparison">Khẩn cấp</span>
                            </div>
                        </div>

                        <div className="stats-card">
                            <div className="card-icon orange">
                                <FiAlertCircle />
                            </div>
                            <div className="card-info">
                                <span className="card-title">Kết quả nguy kịch</span>
                                <span className="card-value">{dashboardData.criticalResults || 0}</span>
                                <span className="card-comparison">Cần xử lý</span>
                            </div>
                        </div>

                        <div className="stats-card">
                            <div className="card-icon purple">
                                <FiClock />
                            </div>
                            <div className="card-info">
                                <span className="card-title">Thời gian TB</span>
                                <span className="card-value">{dashboardData.averageTurnaroundTime?.toFixed(1) || 0} phút</span>
                                <span className="card-comparison">Xử lý mẫu</span>
                            </div>
                        </div>

                        <div className="stats-card">
                            <div className="card-icon blue">
                                <FiFileText />
                            </div>
                            <div className="card-info">
                                <span className="card-title">Nhận hôm nay</span>
                                <span className="card-value">{dashboardData.receivedToday || 0}</span>
                                <span className="card-comparison">Mẫu</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LabTechnicianDashboardPage;

