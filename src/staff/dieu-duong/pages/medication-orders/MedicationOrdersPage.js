import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { nurseMedicationOrderAPI } from '../../../../services/staff/nurseAPI';
import {
    FiArrowLeft, FiAlertCircle, FiClock, FiCheckCircle,
    FiPackage, FiInfo, FiActivity, FiXCircle, FiUser, FiList, FiCalendar, FiEye
} from 'react-icons/fi';
import './MedicationOrdersPage.css';

const MedicationOrdersPage = () => {
    const [activeTab, setActiveTab] = useState('ready-for-administration');
    const [readyForAdministration, setReadyForAdministration] = useState([]);
    const [ordersByStatus, setOrdersByStatus] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('ORDERED');
    const [pagination, setPagination] = useState({
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const navigate = useNavigate();

    const statusOptions = [
        { value: 'ORDERED', label: 'Đã ra lệnh', color: '#3b82f6' },
        { value: 'VERIFIED', label: 'Đã xác minh', color: '#f59e0b' },
        { value: 'READY', label: 'Sẵn sàng', color: '#8b5cf6' },
        { value: 'PENDING', label: 'Chờ xử lý', color: '#6b7280' },
        { value: 'GIVEN', label: 'Đã cấp phát', color: '#10b981' },
        { value: 'REFUSED', label: 'Từ chối', color: '#ef4444' },
        { value: 'MISSED', label: 'Bỏ lỡ', color: '#f97316' },
        { value: 'HELD', label: 'Tạm dừng', color: '#84cc16' }
    ];

    // Hàm tải dữ liệu chờ cấp phát
    const fetchReadyForAdministration = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await nurseMedicationOrderAPI.getReadyForAdministration();
            if (response && response.data) {
                setReadyForAdministration(response.data);
            } else {
                setReadyForAdministration([]);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách y lệnh chờ cấp phát');
        } finally {
            setLoading(false);
        }
    };

    // Hàm tải dữ liệu theo status
    const fetchOrdersByStatus = async (status = selectedStatus, page = 0) => {
        setLoading(true);
        setError(null);
        try {
            const response = await nurseMedicationOrderAPI.getOrdersByStatus(status, page, pagination.size);
            if (response && response.data) {
                setOrdersByStatus(response.data.content || []);
                setPagination({
                    page: response.data.number || 0,
                    size: response.data.size || 20,
                    totalElements: response.data.totalElements || 0,
                    totalPages: response.data.totalPages || 0
                });
            } else {
                setOrdersByStatus([]);
                setPagination(prev => ({ ...prev, totalElements: 0, totalPages: 0 }));
            }
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách y lệnh theo trạng thái');
        } finally {
            setLoading(false);
        }
    };

    // Tải dữ liệu khi component mount hoặc tab thay đổi
    useEffect(() => {
        if (activeTab === 'ready-for-administration') {
            fetchReadyForAdministration();
        } else if (activeTab === 'by-status') {
            fetchOrdersByStatus();
        }
    }, [activeTab]);

    // Tải dữ liệu khi status thay đổi
    useEffect(() => {
        if (activeTab === 'by-status') {
            fetchOrdersByStatus(selectedStatus, 0);
        }
    }, [selectedStatus]);

    // Xử lý cấp phát y lệnh
    const handleAdministerOrder = async (order) => {
        const patientResponse = prompt(`Phản ứng của bệnh nhân với thuốc "${order.medicineName}" (tùy chọn):`);
        if (patientResponse === null) return; // User cancelled

        const adverseReaction = prompt(`Phản ứng bất lợi (tùy chọn):`);
        if (adverseReaction === null) return; // User cancelled

        const notes = prompt(`Ghi chú (tùy chọn):`);
        if (notes === null) return; // User cancelled

        setActionLoading(order.medicationOrderId);
        try {
            const response = await nurseMedicationOrderAPI.administerOrder(
                order.medicationOrderId,
                patientResponse || '',
                adverseReaction || '',
                notes || ''
            );

            if (response && (response.code === 200 || response.code === 201)) {
                alert('Cấp phát y lệnh thành công!');
                if (activeTab === 'ready-for-administration') {
                    await fetchReadyForAdministration();
                } else {
                    await fetchOrdersByStatus();
                }
            } else {
                alert(response?.message || 'Không thể cấp phát y lệnh');
            }
        } catch (err) {
            console.error('Error administering order:', err);
            alert(err.message || 'Không thể cấp phát y lệnh');
        } finally {
            setActionLoading(null);
        }
    };

    // Xử lý xem chi tiết
    const handleViewDetail = (orderId) => {
        navigate(`/staff/dieu-duong/quan-ly-y-lenh/${orderId}`);
    };

    // Xử lý thay đổi trang
    const handlePageChange = (newPage) => {
        if (activeTab === 'by-status') {
            fetchOrdersByStatus(selectedStatus, newPage);
        }
    };

    if (loading) {
        return (
            <div className="medication-orders-loading">
                <FiActivity className="spinner" />
                <p>Đang tải danh sách y lệnh...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="medication-orders-error">
                <FiAlertCircle />
                <p>{error}</p>
                <button onClick={() => navigate(-1)} className="btn-back-error">
                    Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="medication-orders-page">
            {/* Header */}
            <div className="medication-orders-header">
                <button className="btn-back" onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-content">
                    <h1>Quản lý Y lệnh</h1>
                    <p>Quản lý và cấp phát y lệnh thuốc</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                <button
                    className={`tab-button ${activeTab === 'ready-for-administration' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ready-for-administration')}
                >
                    <FiPackage /> Y lệnh cần cấp phát ({readyForAdministration.length})
                </button>
                <button
                    className={`tab-button ${activeTab === 'by-status' ? 'active' : ''}`}
                    onClick={() => setActiveTab('by-status')}
                >
                    <FiList /> Danh sách theo trạng thái ({pagination.totalElements})
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'ready-for-administration' && (
                    <div className="orders-container">
                        {readyForAdministration.length === 0 ? (
                            <div className="no-data">
                                <FiPackage />
                                <p>Không có y lệnh nào cần cấp phát.</p>
                            </div>
                        ) : (
                            <div className="orders-list">
                                {readyForAdministration.map(order => (
                                    <MedicationOrderCard
                                        key={order.medicationOrderId}
                                        order={order}
                                        onAdminister={handleAdministerOrder}
                                        onViewDetail={handleViewDetail}
                                        actionLoading={actionLoading}
                                        showAdministerButton={true}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'by-status' && (
                    <div className="orders-container">
                        {/* Status Filter */}
                        <div className="status-filter">
                            <label>Lọc theo trạng thái:</label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="status-select"
                            >
                                {statusOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {ordersByStatus.length === 0 ? (
                            <div className="no-data">
                                <FiList />
                                <p>Không có y lệnh nào với trạng thái này.</p>
                            </div>
                        ) : (
                            <>
                                <div className="orders-list">
                                    {ordersByStatus.map(order => (
                                        <MedicationOrderCard
                                            key={order.medicationOrderId}
                                            order={order}
                                            onViewDetail={handleViewDetail}
                                            actionLoading={actionLoading}
                                            showAdministerButton={false}
                                        />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="pagination">
                                        <button
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={pagination.page === 0}
                                            className="pagination-btn"
                                        >
                                            Trước
                                        </button>
                                        <span className="pagination-info">
                                            Trang {pagination.page + 1} / {pagination.totalPages}
                                        </span>
                                        <button
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={pagination.page >= pagination.totalPages - 1}
                                            className="pagination-btn"
                                        >
                                            Sau
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Component thẻ y lệnh
const MedicationOrderCard = ({ order, onAdminister, onViewDetail, actionLoading, showAdministerButton }) => {
    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'ORDERED': 'status-ordered',
            'VERIFIED': 'status-verified',
            'READY': 'status-ready',
            'PENDING': 'status-pending',
            'GIVEN': 'status-given',
            'REFUSED': 'status-refused',
            'MISSED': 'status-missed',
            'HELD': 'status-held',
        };
        return statusMap[status] || 'status-default';
    };

    const getPriorityBadgeClass = (priority) => {
        const priorityMap = {
            'ROUTINE': 'priority-routine',
            'URGENT': 'priority-urgent',
            'STAT': 'priority-stat',
        };
        return priorityMap[priority] || 'priority-default';
    };

    return (
        <div className="medication-order-card-compact">
            <div className="order-info-row">
                <div className="order-main-info">
                    <h4>Y lệnh #{order.medicationOrderId}</h4>
                    <div className="order-meta">
                        <span className="patient-info">{order.patientName} ({order.patientCode})</span>
                        <span className="encounter-id">Encounter: {order.encounterId}</span>
                    </div>
                </div>
                
                <div className="medication-info">
                    <h5>{order.medicineName || `Medicine ID: ${order.medicineId}`}</h5>
                    <div className="med-details">
                        <span className="dosage">{order.dosage}</span>
                        <span className="route">({order.routeDisplay || order.route})</span>
                        <span className="frequency">{order.frequency}</span>
                        <span className="duration">{order.durationDays} ngày</span>
                    </div>
                </div>

                <div className="order-status-info">
                    <div className="status-badges">
                        <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                            {order.statusDisplay || order.status}
                        </span>
                        {order.priority && (
                            <span className={`priority-badge ${getPriorityBadgeClass(order.priority)}`}>
                                {order.priorityDisplay || order.priority}
                                {order.isStat && ' (STAT)'}
                                {order.isPrn && ' (PRN)'}
                            </span>
                        )}
                    </div>
                    <div className="order-dates">
                        <div className="date-item">
                            <label>Bác sĩ:</label>
                            <span>{order.orderedByDoctorName || `ID: ${order.orderedByDoctorId}`}</span>
                        </div>
                        <div className="date-item">
                            <label>Thời gian:</label>
                            <span>{formatDateTime(order.orderedAt)}</span>
                        </div>
                    </div>
                </div>

                <div className="order-actions">
                    <button
                        className="btn-action btn-view"
                        onClick={() => onViewDetail(order.medicationOrderId)}
                    >
                        <FiEye />
                        Chi tiết
                    </button>
                    {showAdministerButton && (
                        <button
                            className="btn-action btn-administer"
                            onClick={() => onAdminister(order)}
                            disabled={actionLoading === order.medicationOrderId}
                        >
                            <FiCheckCircle />
                            {actionLoading === order.medicationOrderId ? 'Đang xử lý...' : 'Cấp phát'}
                        </button>
                    )}
                </div>
            </div>

            {/* Thông tin bổ sung */}
            {order.specialInstructions && (
                <div className="special-instructions">
                    <label>Hướng dẫn đặc biệt:</label>
                    <p>{order.specialInstructions}</p>
                </div>
            )}

            {/* Cảnh báo quá hạn */}
            {order.overdue && (
                <div className="overdue-warning">
                    <FiAlertCircle />
                    <span>Y lệnh này đã quá hạn thực hiện</span>
                </div>
            )}
        </div>
    );
};

export default MedicationOrdersPage;