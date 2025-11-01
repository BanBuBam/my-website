import React, { useState, useEffect } from 'react';
import './DashboardPage.css';
import {
    FiClipboard, FiCheckCircle, FiClock, FiRefreshCw, FiAlertCircle,
    FiActivity, FiFileText
} from 'react-icons/fi';

const LabTechnicianDashboardPage = () => {
    const [dashboardData, setDashboardData] = useState({
        todayStats: {
            pendingOrders: 12,
            collectedSpecimens: 8,
            completedTests: 15,
            averageProcessingTime: 45
        },
        recentOrders: [
            {
                labTestOrderId: 1,
                encounterId: 101,
                patientName: 'Nguyễn Văn A',
                testName: 'Xét nghiệm máu',
                status: 'PENDING',
                requestedDatetime: '2025-10-31T08:30:00Z',
                urgencyLevel: 'ROUTINE'
            },
            {
                labTestOrderId: 2,
                encounterId: 102,
                patientName: 'Trần Thị B',
                testName: 'Xét nghiệm nước tiểu',
                status: 'COLLECTED',
                requestedDatetime: '2025-10-31T09:00:00Z',
                urgencyLevel: 'URGENT'
            }
        ]
    });
    const [loading, setLoading] = useState(false);

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
                <button className="btn-refresh" onClick={() => setLoading(!loading)}>
                    <FiRefreshCw /> Làm mới
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stats-card">
                    <div className="card-icon orange">
                        <FiClipboard />
                    </div>
                    <div className="card-info">
                        <span className="card-title">Chờ lấy mẫu</span>
                        <span className="card-value">{dashboardData.todayStats.pendingOrders}</span>
                        <span className="card-comparison">Cần xử lý</span>
                    </div>
                </div>

                <div className="stats-card">
                    <div className="card-icon blue">
                        <FiActivity />
                    </div>
                    <div className="card-info">
                        <span className="card-title">Đã lấy mẫu</span>
                        <span className="card-value">{dashboardData.todayStats.collectedSpecimens}</span>
                        <span className="card-comparison">Hôm nay</span>
                    </div>
                </div>

                <div className="stats-card">
                    <div className="card-icon green">
                        <FiCheckCircle />
                    </div>
                    <div className="card-info">
                        <span className="card-title">Hoàn thành</span>
                        <span className="card-value">{dashboardData.todayStats.completedTests}</span>
                        <span className="card-comparison">Hôm nay</span>
                    </div>
                </div>

                <div className="stats-card">
                    <div className="card-icon purple">
                        <FiClock />
                    </div>
                    <div className="card-info">
                        <span className="card-title">Thời gian TB</span>
                        <span className="card-value">{dashboardData.todayStats.averageProcessingTime} phút</span>
                        <span className="card-comparison">Mỗi xét nghiệm</span>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="card recent-orders-card">
                <div className="card-header">
                    <h3>
                        <FiFileText className="header-icon" />
                        Yêu cầu xét nghiệm gần đây ({dashboardData.recentOrders.length})
                    </h3>
                </div>
                <div className="orders-list">
                    {dashboardData.recentOrders && dashboardData.recentOrders.length > 0 ? (
                        <div className="list-table">
                            <div className="list-header">
                                <span>Order ID</span>
                                <span>Encounter ID</span>
                                <span>Bệnh nhân</span>
                                <span>Xét nghiệm</span>
                                <span>Trạng thái</span>
                                <span>Độ ưu tiên</span>
                                <span>Thời gian yêu cầu</span>
                                <span>Hành động</span>
                            </div>
                            {dashboardData.recentOrders.map((order) => (
                                <div key={order.labTestOrderId} className="list-row">
                                    <span className="order-id">#{order.labTestOrderId}</span>
                                    <span className="encounter-id">#{order.encounterId}</span>
                                    <span className="patient-name">{order.patientName}</span>
                                    <span className="test-name">{order.testName}</span>
                                    <span>
                                        <span 
                                            className="status-badge"
                                            style={{ backgroundColor: getStatusColor(order.status), color: '#fff' }}
                                        >
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </span>
                                    <span>
                                        <span 
                                            className="urgency-badge"
                                            style={{ backgroundColor: getUrgencyColor(order.urgencyLevel), color: '#fff' }}
                                        >
                                            {order.urgencyLevel}
                                        </span>
                                    </span>
                                    <span className="datetime">{formatDateTime(order.requestedDatetime)}</span>
                                    <span>
                                        <button className="btn-action primary">Xem</button>
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <FiAlertCircle />
                            <p>Không có yêu cầu xét nghiệm nào</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LabTechnicianDashboardPage;

