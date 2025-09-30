import React from 'react';
import './PharmacistDashboardPage.css';
import { FiTrendingUp, FiTrendingDown, FiClock, FiCheckCircle } from 'react-icons/fi';

const PharmacistDashboardPage = () => {
    // Mock data for statistics
    const stats = [
        {
            title: 'Thuốc được nhập',
            value: '1,245',
            unit: 'lô hàng',
            icon: <FiTrendingUp />,
            color: 'green',
            change: '+12%',
            changeType: 'increase'
        },
        {
            title: 'Thuốc được xuất',
            value: '987',
            unit: 'đơn thuốc',
            icon: <FiTrendingDown />,
            color: 'blue',
            change: '+8%',
            changeType: 'increase'
        },
        {
            title: 'Hóa đơn chờ yêu cầu',
            value: '23',
            unit: 'hóa đơn',
            icon: <FiClock />,
            color: 'orange',
            change: '-5%',
            changeType: 'decrease'
        },
        {
            title: 'Hóa đơn chờ nhận',
            value: '15',
            unit: 'hóa đơn',
            icon: <FiCheckCircle />,
            color: 'purple',
            change: '+3%',
            changeType: 'increase'
        }
    ];

    return (
        <div className="pharmacist-dashboard">
            <div className="page-header">
                <div>
                    <h2>Dashboard Dược sĩ</h2>
                    <p>Thống kê và tổng quan hoạt động dược phẩm</p>
                </div>
            </div>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className={`stat-card ${stat.color}`}>
                        <div className="stat-icon">
                            {stat.icon}
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">
                                <span className="value">{stat.value}</span>
                                <span className="unit">{stat.unit}</span>
                            </div>
                            <div className="stat-title">{stat.title}</div>
                            <div className={`stat-change ${stat.changeType}`}>
                                <span>{stat.change}</span>
                                <span className="change-text">so với tháng trước</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-content">
                <div className="content-card">
                    <h3>Hoạt động gần đây</h3>
                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-icon green">
                                <FiTrendingUp />
                            </div>
                            <div className="activity-content">
                                <div className="activity-title">Nhập kho thuốc mới</div>
                                <div className="activity-desc">Đã nhập 50 hộp Paracetamol 500mg</div>
                                <div className="activity-time">2 giờ trước</div>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon blue">
                                <FiTrendingDown />
                            </div>
                            <div className="activity-content">
                                <div className="activity-title">Xuất thuốc theo đơn</div>
                                <div className="activity-desc">Đã xuất đơn thuốc #DT001234</div>
                                <div className="activity-time">4 giờ trước</div>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon orange">
                                <FiClock />
                            </div>
                            <div className="activity-content">
                                <div className="activity-title">Hóa đơn chờ xử lý</div>
                                <div className="activity-desc">Hóa đơn #HD001567 cần được xác nhận</div>
                                <div className="activity-time">6 giờ trước</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="content-card">
                    <h3>Thuốc sắp hết hạn</h3>
                    <div className="expiry-list">
                        <div className="expiry-item">
                            <div className="drug-info">
                                <div className="drug-name">Amoxicillin 500mg</div>
                                <div className="drug-batch">Lô: AMX2024001</div>
                            </div>
                            <div className="expiry-date warning">
                                Hết hạn: 15/01/2025
                            </div>
                        </div>
                        <div className="expiry-item">
                            <div className="drug-info">
                                <div className="drug-name">Vitamin C 1000mg</div>
                                <div className="drug-batch">Lô: VTC2024002</div>
                            </div>
                            <div className="expiry-date danger">
                                Hết hạn: 05/01/2025
                            </div>
                        </div>
                        <div className="expiry-item">
                            <div className="drug-info">
                                <div className="drug-name">Ibuprofen 400mg</div>
                                <div className="drug-batch">Lô: IBU2024003</div>
                            </div>
                            <div className="expiry-date warning">
                                Hết hạn: 20/01/2025
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PharmacistDashboardPage;
