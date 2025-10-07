import React from 'react';
import './FinanceDashboardPage.css';
import {FiTrendingUp, FiTrendingDown, FiDollarSign, FiFileText, FiAlertCircle} from 'react-icons/fi';

const FinanceDashboardPage = () => {
    // Mock data cho thống kê
    const stats = [
        {
            title: 'Doanh thu tháng',
            value: '1,250,000,000',
            unit: 'VNĐ',
            icon: <FiTrendingUp />,
            color: 'green',
            change: '+12%',
            changeType: 'increase'
        },
        {
            title: 'Chi phí tháng',
            value: '820,000,000',
            unit: 'VNĐ',
            icon: <FiTrendingDown />,
            color: 'orange',
            change: '+5%',
            changeType: 'increase'
        },
        {
            title: 'Công nợ chưa thu',
            value: '350,000,000',
            unit: 'VNĐ',
            icon: <FiFileText />,
            color: 'blue',
            change: '-8%',
            changeType: 'decrease'
        },
        {
            title: 'Tổng hóa đơn đã xuất',
            value: '1,024',
            unit: 'hóa đơn',
            icon: <FiDollarSign />,
            color: 'purple',
            change: '+4%',
            changeType: 'increase'
        },
        {
            title: 'Tổng số hóa đơn chưa thanh toán',
            value: '35',
            unit: 'hóa đơn',
            icon: <FiAlertCircle />,
            color: 'red',
            change: '+3%',
            changeType: 'increase'
        }
    ];

    return (
        <div className="finance-dashboard">
            {/* Tiêu đề trang */}
            <div className="page-header">
                <div>
                    <h2>Dashboard Tài chính</h2>
                    <p>Tổng quan thu – chi – hóa đơn của bệnh viện</p>
                </div>
            </div>

            {/* Thống kê */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className={`stat-card ${stat.color}`}>
                        <div className="stat-icon">{stat.icon}</div>
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

            {/* Nội dung phụ */}
            <div className="dashboard-content">
                <div className="content-card">
                    <h3>Giao dịch gần đây</h3>
                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-icon green">
                                <FiTrendingUp />
                            </div>
                            <div className="activity-content">
                                <div className="activity-title">Thu viện phí</div>
                                <div className="activity-desc">Bệnh nhân Nguyễn Văn A – 3,200,000 VNĐ</div>
                                <div className="activity-time">2 giờ trước</div>
                            </div>
                        </div>

                        <div className="activity-item">
                            <div className="activity-icon orange">
                                <FiTrendingDown />
                            </div>
                            <div className="activity-content">
                                <div className="activity-title">Chi trả vật tư y tế</div>
                                <div className="activity-desc">Thanh toán hóa đơn #HD00123 – 1,200,000 VNĐ</div>
                                <div className="activity-time">5 giờ trước</div>
                            </div>
                        </div>

                        <div className="activity-item">
                            <div className="activity-icon blue">
                                <FiFileText />
                            </div>
                            <div className="activity-content">
                                <div className="activity-title">Công nợ phát sinh</div>
                                <div className="activity-desc">Phát sinh công nợ #CN00045 – 8,500,000 VNĐ</div>
                                <div className="activity-time">Hôm qua</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="content-card">
                    <h3>Báo cáo nhanh</h3>
                    <ul className="report-list">
                        <li>Tổng doanh thu tuần này: 380,000,000 VNĐ</li>
                        <li>Tổng chi phí tuần này: 245,000,000 VNĐ</li>
                        <li>Số hóa đơn chưa thanh toán: 15</li>
                        <li>Tổng công nợ khách hàng: 320,000,000 VNĐ</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default FinanceDashboardPage;
