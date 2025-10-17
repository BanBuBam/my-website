import React, { useState } from 'react';
import './FinancialReportPage.css';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { FiDownload, FiPrinter, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const FinancialReportPage = () => {
    const [filterPeriod, setFilterPeriod] = useState('month');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    // Mock data - Doanh thu theo tháng
    const revenueData = {
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
        datasets: [
            {
                label: 'Doanh thu',
                data: [1200, 1500, 1300, 1800, 2000, 1900, 2200, 2100, 2300, 2500, 2400, 2600],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4
            },
            {
                label: 'Chi phí',
                data: [800, 900, 850, 1000, 1100, 1050, 1200, 1150, 1250, 1300, 1280, 1350],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4
            }
        ]
    };

    // Mock data - Thu chi theo loại
    const categoryData = {
        labels: ['Viện phí', 'Thuốc', 'Xét nghiệm', 'Phẫu thuật', 'Khác'],
        datasets: [
            {
                label: 'Doanh thu theo loại',
                data: [4500, 3200, 2800, 5000, 1500],
                backgroundColor: [
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b',
                    '#8b5cf6',
                    '#6b7280'
                ]
            }
        ]
    };

    // Mock data - So sánh thu chi
    const comparisonData = {
        labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
        datasets: [
            {
                label: 'Thu',
                data: [5000, 6000, 5500, 7000],
                backgroundColor: '#10b981'
            },
            {
                label: 'Chi',
                data: [3000, 3500, 3200, 4000],
                backgroundColor: '#ef4444'
            }
        ]
    };

    // Thống kê tổng quan
    const summaryStats = [
        {
            title: 'Tổng doanh thu',
            value: '24,800,000,000',
            unit: 'VNĐ',
            change: '+12.5%',
            trend: 'up',
            icon: <FiTrendingUp />
        },
        {
            title: 'Tổng chi phí',
            value: '13,280,000,000',
            unit: 'VNĐ',
            change: '+8.3%',
            trend: 'up',
            icon: <FiTrendingUp />
        },
        {
            title: 'Lợi nhuận',
            value: '11,520,000,000',
            unit: 'VNĐ',
            change: '+18.2%',
            trend: 'up',
            icon: <FiTrendingUp />
        },
        {
            title: 'Tỷ suất lợi nhuận',
            value: '46.5',
            unit: '%',
            change: '+3.2%',
            trend: 'up',
            icon: <FiTrendingUp />
        }
    ];

    const formatCurrency = (value) => {
        return value.toLocaleString('vi-VN') + ' VNĐ';
    };

    const handleExport = () => {
        alert('Xuất báo cáo Excel (Chức năng đang phát triển)');
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="financial-report-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h2>Báo cáo Tài chính</h2>
                    <p>Tổng hợp và phân tích tình hình tài chính</p>
                </div>
                <div className="header-actions">
                    <button className="btn-export" onClick={handleExport}>
                        <FiDownload /> Xuất Excel
                    </button>
                    <button className="btn-print" onClick={handlePrint}>
                        <FiPrinter /> In báo cáo
                    </button>
                </div>
            </div>

            {/* Filter */}
            <div className="filter-section">
                <div className="filter-group">
                    <label>Kỳ báo cáo:</label>
                    <select value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)}>
                        <option value="week">Tuần</option>
                        <option value="month">Tháng</option>
                        <option value="quarter">Quý</option>
                        <option value="year">Năm</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Chọn tháng:</label>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    />
                </div>
            </div>

            {/* Summary Stats */}
            <div className="summary-stats">
                {summaryStats.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="stat-content">
                            <p className="stat-title">{stat.title}</p>
                            <h3 className="stat-value">
                                {stat.value} <span className="stat-unit">{stat.unit}</span>
                            </h3>
                            <p className={`stat-change ${stat.trend}`}>
                                {stat.change} so với kỳ trước
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="charts-section">
                {/* Revenue Chart */}
                <div className="chart-card full-width">
                    <h3>Biểu đồ Doanh thu & Chi phí theo tháng</h3>
                    <div className="chart-container">
                        <Line
                            data={revenueData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'top'
                                    },
                                    title: {
                                        display: false
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            callback: function(value) {
                                                return value + ' tr';
                                            }
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Category Chart */}
                <div className="chart-card">
                    <h3>Doanh thu theo loại dịch vụ</h3>
                    <div className="chart-container small">
                        <Doughnut
                            data={categoryData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'bottom'
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Comparison Chart */}
                <div className="chart-card">
                    <h3>So sánh Thu - Chi theo tuần</h3>
                    <div className="chart-container small">
                        <Bar
                            data={comparisonData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'top'
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            callback: function(value) {
                                                return value + ' tr';
                                            }
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Detail Table */}
            <div className="detail-table-section">
                <h3>Chi tiết Doanh thu & Chi phí</h3>
                <table className="detail-table">
                    <thead>
                        <tr>
                            <th>Tháng</th>
                            <th>Doanh thu</th>
                            <th>Chi phí</th>
                            <th>Lợi nhuận</th>
                            <th>Tỷ suất LN</th>
                        </tr>
                    </thead>
                    <tbody>
                        {revenueData.labels.map((month, index) => {
                            const revenue = revenueData.datasets[0].data[index] * 1000000;
                            const expense = revenueData.datasets[1].data[index] * 1000000;
                            const profit = revenue - expense;
                            const margin = ((profit / revenue) * 100).toFixed(1);
                            
                            return (
                                <tr key={index}>
                                    <td>{month}</td>
                                    <td className="amount revenue">{formatCurrency(revenue)}</td>
                                    <td className="amount expense">{formatCurrency(expense)}</td>
                                    <td className="amount profit">{formatCurrency(profit)}</td>
                                    <td className="margin">{margin}%</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td><strong>Tổng cộng</strong></td>
                            <td className="amount revenue"><strong>24,800,000,000 VNĐ</strong></td>
                            <td className="amount expense"><strong>13,280,000,000 VNĐ</strong></td>
                            <td className="amount profit"><strong>11,520,000,000 VNĐ</strong></td>
                            <td className="margin"><strong>46.5%</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default FinancialReportPage;

