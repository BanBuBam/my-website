import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pharmacistIndividualOrdersAPI } from '../../../../services/staff/pharmacistAPI';
import {
    FiArrowLeft, FiAlertCircle, FiClock, FiCheckCircle,
    FiPackage, FiInfo, FiActivity, FiXCircle, FiUser, FiList, FiCalendar, FiEye
} from 'react-icons/fi';
import './IndividualOrdersPage.css';

const IndividualOrdersPage = () => {
    const [activeTab, setActiveTab] = useState('pending-verification');
    const [pendingVerification, setPendingVerification] = useState([]);
    const [readyForAdministration, setReadyForAdministration] = useState([]);
    const [readyForPreparation, setReadyForPreparation] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const navigate = useNavigate();

    // Hàm tải dữ liệu chờ xác nhận
    const fetchPendingVerification = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await pharmacistIndividualOrdersAPI.getPendingVerification();
            if (response && response.data) {
                setPendingVerification(response.data);
            } else {
                setPendingVerification([]);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách y lệnh chờ xác nhận');
        } finally {
            setLoading(false);
        }
    };

    // Hàm tải dữ liệu chờ cấp phát
    const fetchReadyForAdministration = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await pharmacistIndividualOrdersAPI.getReadyForAdministration();
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

    // Hàm tải dữ liệu chờ chuẩn bị
    const fetchReadyForPreparation = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await pharmacistIndividualOrdersAPI.getReadyForPreparation();
            if (response && response.data) {
                setReadyForPreparation(response.data);
            } else {
                setReadyForPreparation([]);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách y lệnh chờ chuẩn bị');
        } finally {
            setLoading(false);
        }
    };

    // Tải dữ liệu khi component mount hoặc tab thay đổi
    useEffect(() => {
        if (activeTab === 'pending-verification') {
            fetchPendingVerification();
        } else if (activeTab === 'ready-for-administration') {
            fetchReadyForAdministration();
        } else if (activeTab === 'ready-for-preparation') {
            fetchReadyForPreparation();
        }
    }, [activeTab]);

    // Xử lý xác nhận y lệnh
    const handleVerifyOrder = async (order) => {
        const notes = prompt(`Ghi chú xác nhận y lệnh "${order.medicineName}":`);
        if (notes === null) return; // User cancelled

        setActionLoading(order.medicationOrderId);
        try {
            const response = await pharmacistIndividualOrdersAPI.verifyOrder(
                order.medicationOrderId,
                notes
            );

            if (response && (response.code === 200 || response.code === 201)) {
                alert('Xác nhận y lệnh thành công!');
                await fetchPendingVerification();
            } else {
                alert(response?.message || 'Không thể xác nhận y lệnh');
            }
        } catch (err) {
            console.error('Error verifying order:', err);
            alert(err.message || 'Không thể xác nhận y lệnh');
        } finally {
            setActionLoading(null);
        }
    };

    // Xử lý cấp phát y lệnh
    const handleDispenseOrder = async (order) => {
        const notes = prompt(`Ghi chú cấp phát y lệnh "${order.medicineName}":`);
        if (notes === null) return; // User cancelled

        setActionLoading(order.medicationOrderId);
        try {
            const response = await pharmacistIndividualOrdersAPI.dispenseOrder(
                order.medicationOrderId,
                notes
            );

            if (response && (response.code === 200 || response.code === 201)) {
                alert('Cấp phát y lệnh thành công!');
                await fetchReadyForAdministration();
            } else {
                alert(response?.message || 'Không thể cấp phát y lệnh');
            }
        } catch (err) {
            console.error('Error dispensing order:', err);
            alert(err.message || 'Không thể cấp phát y lệnh');
        } finally {
            setActionLoading(null);
        }
    };

    // Xử lý chuẩn bị thuốc
    const handlePrepareOrder = async (order) => {
        const notes = prompt(`Ghi chú chuẩn bị thuốc "${order.medicineName}":`);
        if (notes === null) return; // User cancelled

        setActionLoading(order.medicationOrderId);
        try {
            const response = await pharmacistIndividualOrdersAPI.prepareOrder(
                order.medicationOrderId,
                notes
            );

            if (response && (response.code === 200 || response.code === 201)) {
                alert('Chuẩn bị thuốc thành công!');
                await fetchReadyForPreparation();
            } else {
                alert(response?.message || 'Không thể chuẩn bị thuốc');
            }
        } catch (err) {
            console.error('Error preparing order:', err);
            alert(err.message || 'Không thể chuẩn bị thuốc');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="individual-orders-loading">
                <FiActivity className="spinner" />
                <p>Đang tải danh sách y lệnh...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="individual-orders-error">
                <FiAlertCircle />
                <p>{error}</p>
                <button onClick={() => navigate(-1)} className="btn-back-error">
                    Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="individual-orders-page">
            {/* Header */}
            <div className="individual-orders-header">
                <button className="btn-back" onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-content">
                    <h1>Danh sách Y lệnh Lẻ</h1>
                    <p>Quản lý y lệnh thuốc theo từng đơn lẻ</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                <button
                    className={`tab-button ${activeTab === 'pending-verification' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending-verification')}
                >
                    <FiClock /> Chờ xác nhận ({pendingVerification.length})
                </button>
                <button
                    className={`tab-button ${activeTab === 'ready-for-administration' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ready-for-administration')}
                >
                    <FiPackage /> Chờ cấp phát ({readyForAdministration.length})
                </button>
                <button
                    className={`tab-button ${activeTab === 'ready-for-preparation' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ready-for-preparation')}
                >
                    <FiActivity /> Chờ chuẩn bị ({readyForPreparation.length})
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'pending-verification' && (
                    <div className="orders-container">
                        {pendingVerification.length === 0 ? (
                            <div className="no-data">
                                <FiClock />
                                <p>Không có y lệnh nào chờ xác nhận.</p>
                            </div>
                        ) : (
                            <div className="orders-list">
                                {pendingVerification.map(order => (
                                    <IndividualOrderCard
                                        key={order.medicationOrderId}
                                        order={order}
                                        onVerify={handleVerifyOrder}
                                        actionLoading={actionLoading}
                                        actionType="verify"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'ready-for-administration' && (
                    <div className="orders-container">
                        {readyForAdministration.length === 0 ? (
                            <div className="no-data">
                                <FiPackage />
                                <p>Không có y lệnh nào chờ cấp phát.</p>
                            </div>
                        ) : (
                            <div className="orders-list">
                                {readyForAdministration.map(order => (
                                    <IndividualOrderCard
                                        key={order.medicationOrderId}
                                        order={order}
                                        onDispense={handleDispenseOrder}
                                        actionLoading={actionLoading}
                                        actionType="dispense"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'ready-for-preparation' && (
                    <div className="orders-container">
                        {readyForPreparation.length === 0 ? (
                            <div className="no-data">
                                <FiActivity />
                                <p>Không có y lệnh nào chờ chuẩn bị.</p>
                            </div>
                        ) : (
                            <div className="orders-list">
                                {readyForPreparation.map(order => (
                                    <IndividualOrderCard
                                        key={order.medicationOrderId}
                                        order={order}
                                        onPrepare={handlePrepareOrder}
                                        actionLoading={actionLoading}
                                        actionType="prepare"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Component thẻ y lệnh lẻ
const IndividualOrderCard = ({ order, onVerify, onDispense, onPrepare, actionLoading, actionType }) => {
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
            'DRAFT': 'status-draft',
            'ORDERED': 'status-ordered',
            'VERIFIED': 'status-verified',
            'PREPARED': 'status-prepared',
            'DISPENSED': 'status-dispensed',
            'ADMINISTERED': 'status-administered',
            'COMPLETED': 'status-completed',
            'CANCELLED': 'status-cancelled',
            'DISCONTINUED': 'status-discontinued',
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
        <div className="individual-order-card-compact">
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
                    {actionType === 'verify' && (
                        <button
                            className="btn-action btn-verify"
                            onClick={() => onVerify(order)}
                            disabled={actionLoading === order.medicationOrderId}
                        >
                            <FiCheckCircle />
                            {actionLoading === order.medicationOrderId ? 'Đang xử lý...' : 'Xác nhận'}
                        </button>
                    )}
                    {actionType === 'dispense' && (
                        <button
                            className="btn-action btn-ready"
                            onClick={() => onDispense(order)}
                            disabled={actionLoading === order.medicationOrderId}
                        >
                            <FiCheckCircle />
                            {actionLoading === order.medicationOrderId ? 'Đang xử lý...' : 'Ready'}
                        </button>
                    )}
                    {actionType === 'prepare' && (
                        <button
                            className="btn-action btn-prepare"
                            onClick={() => onPrepare(order)}
                            disabled={actionLoading === order.medicationOrderId}
                        >
                            <FiActivity />
                            {actionLoading === order.medicationOrderId ? 'Đang xử lý...' : 'Chuẩn bị thuốc'}
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

export default IndividualOrdersPage;