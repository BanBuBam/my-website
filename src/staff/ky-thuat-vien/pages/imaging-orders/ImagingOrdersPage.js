import React, { useState, useEffect } from 'react';
import { labTechnicianImagingAPI } from '../../../../services/staff/labTechnicianAPI';
import {
    FiImage, FiClock, FiCalendar, FiFileText, FiAlertCircle,
    FiRefreshCw, FiUser, FiActivity, FiCheckCircle, FiEdit,
    FiMapPin, FiInfo, FiDollarSign
} from 'react-icons/fi';
import './ImagingOrdersPage.css';

const ImagingOrdersPage = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [pendingOrders, setPendingOrders] = useState([]);
    const [scheduledOrders, setScheduledOrders] = useState([]);
    const [waitingForReport, setWaitingForReport] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    // Fetch pending orders
    const fetchPendingOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await labTechnicianImagingAPI.getPendingImagingOrders();
            if (response && response.data) {
                setPendingOrders(response.data);
            } else {
                setPendingOrders([]);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách chỉ định chờ xử lý');
            setPendingOrders([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch scheduled orders
    const fetchScheduledOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await labTechnicianImagingAPI.getScheduledImagingOrders();
            if (response && response.data) {
                setScheduledOrders(response.data);
            } else {
                setScheduledOrders([]);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách chỉ định đã lên lịch');
            setScheduledOrders([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch waiting for report orders
    const fetchWaitingForReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await labTechnicianImagingAPI.getWaitingForReportOrders();
            if (response && response.data) {
                setWaitingForReport(response.data);
            } else {
                setWaitingForReport([]);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách chỉ định chờ báo cáo');
            setWaitingForReport([]);
        } finally {
            setLoading(false);
        }
    };

    // Load data when tab changes
    useEffect(() => {
        if (activeTab === 'pending') {
            fetchPendingOrders();
        } else if (activeTab === 'scheduled') {
            fetchScheduledOrders();
        } else if (activeTab === 'waiting-report') {
            fetchWaitingForReport();
        }
    }, [activeTab]);

    // Handle confirm order
    const handleConfirmOrder = async (order) => {
        const notes = prompt(`Ghi chú xác nhận chỉ định ${order.imagingTypeDisplay || order.imagingType}:`);
        if (notes === null) return;

        setActionLoading(order.imagingOrderId);
        try {
            const confirmationData = {
                notes: notes || '',
                confirmedAt: new Date().toISOString(),
            };

            const response = await labTechnicianImagingAPI.confirmImagingOrder(
                order.imagingOrderId,
                confirmationData
            );

            if (response && (response.code === 200 || response.code === 201)) {
                alert('Xác nhận chỉ định thành công!');
                await fetchPendingOrders();
            } else {
                alert(response?.message || 'Không thể xác nhận chỉ định');
            }
        } catch (err) {
            console.error('Error confirming order:', err);
            alert(err.message || 'Không thể xác nhận chỉ định');
        } finally {
            setActionLoading(null);
        }
    };

    // Handle enter results
    const handleEnterResults = async (order) => {
        const findings = prompt(`Nhập kết quả chẩn đoán cho ${order.imagingTypeDisplay || order.imagingType}:`);
        if (findings === null) return;

        const impression = prompt('Nhập kết luận:');
        if (impression === null) return;

        const recommendations = prompt('Nhập khuyến nghị (tùy chọn):') || '';

        setActionLoading(order.imagingOrderId);
        try {
            const resultsData = {
                findings: findings,
                impression: impression,
                recommendations: recommendations,
                reportedAt: new Date().toISOString(),
            };

            const response = await labTechnicianImagingAPI.enterImagingResults(
                order.imagingOrderId,
                resultsData
            );

            if (response && (response.code === 200 || response.code === 201)) {
                alert('Nhập kết quả thành công!');
                await fetchWaitingForReport();
            } else {
                alert(response?.message || 'Không thể nhập kết quả');
            }
        } catch (err) {
            console.error('Error entering results:', err);
            alert(err.message || 'Không thể nhập kết quả');
        } finally {
            setActionLoading(null);
        }
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '-';
        const date = new Date(dateTimeString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'ORDERED': { label: 'Đã chỉ định', className: 'status-ordered' },
            'CONFIRMED': { label: 'Đã xác nhận', className: 'status-confirmed' },
            'SCHEDULED': { label: 'Đã lên lịch', className: 'status-scheduled' },
            'IN_PROGRESS': { label: 'Đang thực hiện', className: 'status-in-progress' },
            'COMPLETED': { label: 'Hoàn thành', className: 'status-completed' },
            'REPORTED': { label: 'Đã báo cáo', className: 'status-reported' },
            'CANCELLED': { label: 'Đã hủy', className: 'status-cancelled' }
        };

        const config = statusConfig[status] || { label: status, className: 'status-default' };
        return <span className={`status-badge ${config.className}`}>{config.label}</span>;
    };

    const getUrgencyBadge = (urgencyLevel) => {
        const urgencyConfig = {
            'ROUTINE': { label: 'Thường quy', className: 'urgency-routine' },
            'URGENT': { label: 'Khẩn cấp', className: 'urgency-urgent' },
            'STAT': { label: 'Cấp cứu', className: 'urgency-stat' },
        };

        const config = urgencyConfig[urgencyLevel] || { label: urgencyLevel, className: 'urgency-default' };
        return <span className={`urgency-badge ${config.className}`}>{config.label}</span>;
    };

    return (
        <div className="imaging-orders-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-content">
                    <FiImage className="header-icon" />
                    <div>
                        <h1>Quản lý Chẩn đoán Hình ảnh</h1>
                        <p>Quản lý các chỉ định chẩn đoán hình ảnh</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs-section">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        <FiClock /> Chờ xử lý ({pendingOrders.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'scheduled' ? 'active' : ''}`}
                        onClick={() => setActiveTab('scheduled')}
                    >
                        <FiCalendar /> Đã lên lịch ({scheduledOrders.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'waiting-report' ? 'active' : ''}`}
                        onClick={() => setActiveTab('waiting-report')}
                    >
                        <FiFileText /> Chờ báo cáo ({waitingForReport.length})
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="loading-state">
                    <FiRefreshCw className="spinner" />
                    <p>Đang tải danh sách chỉ định...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <FiAlertCircle />
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="btn-retry">
                        Thử lại
                    </button>
                </div>
            ) : (
                <div className="tab-content">
                    {/* Tab 1: Pending Orders */}
                    {activeTab === 'pending' && (
                        <div className="orders-container">
                            {pendingOrders.length === 0 ? (
                                <div className="no-data">
                                    <FiClock />
                                    <p>Không có chỉ định nào chờ xử lý</p>
                                </div>
                            ) : (
                                <div className="orders-grid">
                                    {pendingOrders.map(order => (
                                        <ImagingOrderCard
                                            key={order.imagingOrderId}
                                            order={order}
                                            onConfirm={handleConfirmOrder}
                                            actionLoading={actionLoading}
                                            actionType="confirm"
                                            formatDateTime={formatDateTime}
                                            getStatusBadge={getStatusBadge}
                                            getUrgencyBadge={getUrgencyBadge}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 2: Scheduled Orders */}
                    {activeTab === 'scheduled' && (
                        <div className="orders-container">
                            {scheduledOrders.length === 0 ? (
                                <div className="no-data">
                                    <FiCalendar />
                                    <p>Không có chỉ định nào đã lên lịch</p>
                                </div>
                            ) : (
                                <div className="orders-grid">
                                    {scheduledOrders.map(order => (
                                        <ImagingOrderCard
                                            key={order.imagingOrderId}
                                            order={order}
                                            actionLoading={actionLoading}
                                            actionType="view"
                                            formatDateTime={formatDateTime}
                                            getStatusBadge={getStatusBadge}
                                            getUrgencyBadge={getUrgencyBadge}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 3: Waiting for Report */}
                    {activeTab === 'waiting-report' && (
                        <div className="orders-container">
                            {waitingForReport.length === 0 ? (
                                <div className="no-data">
                                    <FiFileText />
                                    <p>Không có chỉ định nào chờ báo cáo</p>
                                </div>
                            ) : (
                                <div className="orders-grid">
                                    {waitingForReport.map(order => (
                                        <ImagingOrderCard
                                            key={order.imagingOrderId}
                                            order={order}
                                            onEnterResults={handleEnterResults}
                                            actionLoading={actionLoading}
                                            actionType="results"
                                            formatDateTime={formatDateTime}
                                            getStatusBadge={getStatusBadge}
                                            getUrgencyBadge={getUrgencyBadge}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Imaging Order Card Component
const ImagingOrderCard = ({ 
    order, 
    onConfirm, 
    onEnterResults, 
    actionLoading, 
    actionType, 
    formatDateTime, 
    getStatusBadge, 
    getUrgencyBadge 
}) => {
    return (
        <div className="imaging-order-card">
            <div className="card-header">
                <div className="card-title">
                    <h3>
                        <FiImage /> {order.imagingTypeDisplay || order.imagingType}
                    </h3>
                    <div className="badges">
                        {getStatusBadge(order.status)}
                        {order.urgencyLevel && getUrgencyBadge(order.urgencyLevel)}
                        {order.isCriticalResult && (
                            <span className="critical-badge">Kết quả quan trọng</span>
                        )}
                    </div>
                </div>
                <div className="order-id">#{order.imagingOrderId}</div>
            </div>

            <div className="card-body">
                <div className="patient-info">
                    <div className="info-item">
                        <FiUser className="info-icon" />
                        <div>
                            <label>Bệnh nhân:</label>
                            <span>{order.patientName}</span>
                        </div>
                    </div>
                    <div className="info-item">
                        <FiActivity className="info-icon" />
                        <div>
                            <label>Encounter:</label>
                            <span>#{order.encounterId}</span>
                        </div>
                    </div>
                </div>

                <div className="imaging-details">
                    <div className="detail-row">
                        <div className="detail-item">
                            <label>Vùng chụp:</label>
                            <span>{order.bodyPart || '-'}</span>
                        </div>
                        <div className="detail-item">
                            <label>Bên:</label>
                            <span>{order.laterality || '-'}</span>
                        </div>
                    </div>
                    
                    {order.clinicalIndication && (
                        <div className="detail-item full-width">
                            <label>Chỉ định lâm sàng:</label>
                            <span>{order.clinicalIndication}</span>
                        </div>
                    )}

                    {order.clinicalQuestion && (
                        <div className="detail-item full-width">
                            <label>Câu hỏi lâm sàng:</label>
                            <span>{order.clinicalQuestion}</span>
                        </div>
                    )}
                </div>

                <div className="doctor-info">
                    <div className="info-item">
                        <FiUser className="info-icon" />
                        <div>
                            <label>Bác sĩ chỉ định:</label>
                            <span>{order.orderedByDoctorName || `ID: ${order.orderedByDoctorId}`}</span>
                        </div>
                    </div>
                    <div className="info-item">
                        <FiClock className="info-icon" />
                        <div>
                            <label>Thời gian chỉ định:</label>
                            <span>{formatDateTime(order.orderedAt)}</span>
                        </div>
                    </div>
                </div>

                {order.scheduledDatetime && (
                    <div className="schedule-info">
                        <div className="info-item">
                            <FiCalendar className="info-icon" />
                            <div>
                                <label>Lịch hẹn:</label>
                                <span>{formatDateTime(order.scheduledDatetime)}</span>
                            </div>
                        </div>
                        {order.scheduledRoom && (
                            <div className="info-item">
                                <FiMapPin className="info-icon" />
                                <div>
                                    <label>Phòng:</label>
                                    <span>{order.scheduledRoom}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {order.contrastUsed && (
                    <div className="contrast-info">
                        <div className="info-item">
                            <FiInfo className="info-icon" />
                            <div>
                                <label>Thuốc cản quang:</label>
                                <span>{order.contrastType} - {order.contrastVolumeMl}ml ({order.contrastRoute})</span>
                            </div>
                        </div>
                    </div>
                )}

                {order.totalCost > 0 && (
                    <div className="cost-info">
                        <div className="info-item">
                            <FiDollarSign className="info-icon" />
                            <div>
                                <label>Chi phí:</label>
                                <span>{order.totalCost.toLocaleString('vi-VN')} VND</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="card-footer">
                {actionType === 'confirm' && (
                    <button
                        className="btn-action btn-confirm"
                        onClick={() => onConfirm(order)}
                        disabled={actionLoading === order.imagingOrderId}
                    >
                        <FiCheckCircle />
                        {actionLoading === order.imagingOrderId ? 'Đang xử lý...' : 'Xác nhận'}
                    </button>
                )}
                {actionType === 'results' && (
                    <button
                        className="btn-action btn-results"
                        onClick={() => onEnterResults(order)}
                        disabled={actionLoading === order.imagingOrderId}
                    >
                        <FiEdit />
                        {actionLoading === order.imagingOrderId ? 'Đang xử lý...' : 'Nhập kết quả'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ImagingOrdersPage;