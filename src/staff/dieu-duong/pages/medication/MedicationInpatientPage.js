import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { nurseInpatientStayAPI, nurseMedicationAPI } from '../../../../services/staff/nurseAPI';
import {
    FiArrowLeft, FiAlertCircle, FiClock, FiCheckCircle,
    FiPackage, FiInfo, FiActivity, FiXCircle, FiUser, FiSlash, FiList, FiCalendar
} from 'react-icons/fi';
import './MedicationInpatientPage.css';

const MedicationInpatientPage = () => {
    const [activeTab, setActiveTab] = useState('today');
    const [medications, setMedications] = useState([]);
    const [medicationGroups, setMedicationGroups] = useState([]);
    const [individualOrders, setIndividualOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const { stayId } = useParams();
    const navigate = useNavigate();

    // Hàm tải dữ liệu
    const fetchMedications = async () => {
        if (!stayId) {
            setError('Không tìm thấy ID điều trị');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await nurseInpatientStayAPI.getTodayMedications(stayId);
            if (response && response.data) {
                setMedications(response.data);
            } else {
                setMedications([]);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách thuốc');
        } finally {
            setLoading(false);
        }
    };

    // Hàm tải danh sách nhóm y lệnh
    const fetchMedicationGroups = async () => {
        if (!stayId) {
            setError('Không tìm thấy ID điều trị');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await nurseInpatientStayAPI.getMedicationOrderGroups(stayId);
            if (response && response.data) {
                setMedicationGroups(response.data);
            } else {
                setMedicationGroups([]);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách nhóm y lệnh');
        } finally {
            setLoading(false);
        }
    };

    // Hàm tải danh sách y lệnh lẻ
    const fetchIndividualOrders = async () => {
        if (!stayId) {
            setError('Không tìm thấy ID điều trị');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await nurseInpatientStayAPI.getIndividualMedicationOrders(stayId);
            if (response && response.data) {
                setIndividualOrders(response.data);
            } else {
                setIndividualOrders([]);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách y lệnh lẻ');
        } finally {
            setLoading(false);
        }
    };

    // Tải dữ liệu khi component mount hoặc tab thay đổi
    useEffect(() => {
        if (activeTab === 'today') {
            fetchMedications();
        } else if (activeTab === 'groups') {
            fetchMedicationGroups();
        } else if (activeTab === 'individual') {
            fetchIndividualOrders();
        }
    }, [stayId, activeTab]);

    // Xử lý thực hiện thuốc
    const handleAdminister = async (medication) => {
        if (!window.confirm(`Xác nhận đã thực hiện thuốc "${medication.medicationName}"?`)) {
            return;
        }

        setActionLoading(medication.administrationId);
        try {
            const administrationData = {
                administeredAt: new Date().toISOString(),
                notes: 'Đã thực hiện'
            };

            const response = await nurseMedicationAPI.administerMedication(
                medication.administrationId,
                administrationData
            );

            if (response && (response.code === 200 || response.code === 201)) {
                alert('Đã ghi nhận thực hiện thuốc thành công!');
                await fetchMedications();
            } else {
                alert(response?.message || 'Không thể thực hiện thuốc');
            }
        } catch (err) {
            console.error('Error administering medication:', err);
            alert(err.message || 'Không thể thực hiện thuốc');
        } finally {
            setActionLoading(null);
        }
    };

    // Xử lý bệnh nhân từ chối
    const handleRefuse = async (medication) => {
        const reason = prompt(`Lý do bệnh nhân từ chối thuốc "${medication.medicationName}":`);
        if (!reason || reason.trim() === '') {
            return;
        }

        setActionLoading(medication.administrationId);
        try {
            const response = await nurseMedicationAPI.refuseMedication(
                medication.administrationId,
                reason
            );

            if (response && (response.code === 200 || response.code === 201)) {
                alert('Đã ghi nhận bệnh nhân từ chối thuốc!');
                await fetchMedications();
            } else {
                alert(response?.message || 'Không thể ghi nhận từ chối thuốc');
            }
        } catch (err) {
            console.error('Error refusing medication:', err);
            alert(err.message || 'Không thể ghi nhận từ chối thuốc');
        } finally {
            setActionLoading(null);
        }
    };

    // Xử lý bỏ lỡ thuốc
    const handleMiss = async (medication) => {
        const reason = prompt(`Lý do bỏ lỡ thuốc "${medication.medicationName}":`);
        if (!reason || reason.trim() === '') {
            return;
        }

        setActionLoading(medication.administrationId);
        try {
            const response = await nurseMedicationAPI.missMedication(
                medication.administrationId,
                reason
            );

            if (response && (response.code === 200 || response.code === 201)) {
                alert('Đã ghi nhận bỏ lỡ thuốc!');
                await fetchMedications();
            } else {
                alert(response?.message || 'Không thể ghi nhận bỏ lỡ thuốc');
            }
        } catch (err) {
            console.error('Error missing medication:', err);
            alert(err.message || 'Không thể ghi nhận bỏ lỡ thuốc');
        } finally {
            setActionLoading(null);
        }
    };

    // Xử lý cấp phát medication order
    const handleAdministerOrder = async (order) => {
        const patientResponse = prompt(`Phản ứng của bệnh nhân với thuốc "${order.medicineName || order.medicationDisplay}" (tùy chọn):`);
        const adverseReaction = prompt(`Phản ứng bất lợi (tùy chọn):`);
        const notes = prompt(`Ghi chú (tùy chọn):`);

        setActionLoading(order.medicationOrderId);
        try {
            const response = await nurseMedicationAPI.administerMedicationOrder(
                order.medicationOrderId,
                patientResponse || '',
                adverseReaction || '',
                notes || ''
            );

            if (response && (response.code === 200 || response.code === 201)) {
                alert('Cấp phát thuốc thành công!');
                // Refresh data based on current tab
                if (activeTab === 'groups') {
                    await fetchMedicationGroups();
                } else if (activeTab === 'individual') {
                    await fetchIndividualOrders();
                }
            } else {
                alert(response?.message || 'Không thể cấp phát thuốc');
            }
        } catch (err) {
            console.error('Error administering medication order:', err);
            alert(err.message || 'Không thể cấp phát thuốc');
        } finally {
            setActionLoading(null);
        }
    };
    
    if (loading) {
        return (
            <div className="med-loading">
                <FiActivity className="spinner" />
                <p>Đang tải danh sách thuốc...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="med-error">
                <FiAlertCircle />
                <p>{error}</p>
                <button onClick={() => navigate(-1)} className="btn-back-error">
                    Quay lại
                </button>
            </div>
        );
    }
    
    return (
        <div className="medication-page">
            {/* Header */}
            <div className="med-header">
                <button className="btn-back" onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-content">
                    <h1>Y lệnh Thuốc</h1>
                    <p>Lượt điều trị nội trú #{stayId}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                <button
                    className={`tab-button ${activeTab === 'today' ? 'active' : ''}`}
                    onClick={() => setActiveTab('today')}
                >
                    <FiCalendar /> Hôm nay
                </button>
                <button
                    className={`tab-button ${activeTab === 'groups' ? 'active' : ''}`}
                    onClick={() => setActiveTab('groups')}
                >
                    <FiList /> Nhóm y lệnh
                </button>
                <button
                    className={`tab-button ${activeTab === 'individual' ? 'active' : ''}`}
                    onClick={() => setActiveTab('individual')}
                >
                    <FiPackage /> Y lệnh lẻ
                </button>
            </div>
            
            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'today' && (
                    <div className="med-list-container">
                        {medications.length === 0 ? (
                            <div className="med-no-data">
                                <FiPackage />
                                <p>Không có y lệnh thuốc nào cho hôm nay.</p>
                            </div>
                        ) : (
                            <div className="med-list-grid">
                                {medications.map(med => (
                                    <MedicationCard
                                        key={med.administrationId}
                                        medication={med}
                                        onAdminister={handleAdminister}
                                        onRefuse={handleRefuse}
                                        onMiss={handleMiss}
                                        actionLoading={actionLoading}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'groups' && (
                    <div className="med-groups-container">
                        {medicationGroups.length === 0 ? (
                            <div className="med-no-data">
                                <FiList />
                                <p>Không có nhóm y lệnh nào.</p>
                            </div>
                        ) : (
                            <div className="med-groups-list">
                                {medicationGroups.map(group => (
                                    <MedicationGroupCard
                                        key={group.medicationOrderGroupId}
                                        group={group}
                                        onAdministerOrder={handleAdministerOrder}
                                        actionLoading={actionLoading}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'individual' && (
                    <div className="individual-orders-container">
                        {individualOrders.length === 0 ? (
                            <div className="med-no-data">
                                <FiPackage />
                                <p>Không có y lệnh lẻ nào.</p>
                            </div>
                        ) : (
                            <div className="individual-orders-list">
                                {individualOrders.map(order => (
                                    <IndividualOrderCard
                                        key={order.medicationOrderId}
                                        order={order}
                                        onAdministerOrder={handleAdministerOrder}
                                        actionLoading={actionLoading}
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

// Component thẻ thuốc
const MedicationCard = ({ medication, onAdminister, onRefuse, onMiss, actionLoading }) => {
    
    const formatTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleTimeString('vi-VN', {
            hour: '2-digit', minute: '2-digit'
        });
    };
    
    const getStatusInfo = (med) => {
        switch (med.administrationStatus) {
            case 'PENDING':
                return {
                    class: med.overdue ? 'status-overdue' : 'status-pending',
                    icon: <FiClock />,
                    text: med.overdue ? 'Quá hạn' : 'Chờ thực hiện'
                };
            case 'COMPLETED':
                return {
                    class: 'status-completed',
                    icon: <FiCheckCircle />,
                    text: 'Đã hoàn thành'
                };
            // Thêm các case khác nếu có (VD: SKIPPED)
            default:
                return {
                    class: 'status-default',
                    icon: <FiInfo />,
                    text: med.statusDisplay || med.administrationStatus
                };
        }
    };
    
    const statusInfo = getStatusInfo(medication);
    
    return (
        <div className={`med-card ${statusInfo.class}`}>
            <div className="med-card-header">
                <div className="med-time">
                    <FiClock />
                    <span>{formatTime(medication.scheduledDatetime)}</span>
                </div>
                <div className={`med-status-badge ${statusInfo.class}`}>
                    {statusInfo.icon}
                    <span>{statusInfo.text}</span>
                </div>
            </div>
            
            <div className="med-card-body">
                <h3 className="med-name">{medication.medicationName}</h3>
                <div className="med-details">
                    <div className="med-detail-item">
                        <label>Liều dùng:</label>
                        <span>{medication.dosage}</span>
                    </div>
                    <div className="med-detail-item">
                        <label>Đường dùng:</label>
                        <span>{medication.routeOfAdministration}</span>
                    </div>
                    <div className="med-detail-item">
                        <label>Tần suất:</label>
                        <span>{medication.frequency}</span>
                    </div>
                </div>
            </div>
            
            {/* Hiển thị thông tin hoàn thành hoặc nút hành động */}
            {medication.administrationStatus === 'COMPLETED' ? (
                <div className="med-card-footer completed-info">
                    <div className="info-item">
                        <FiUser />
                        <span>Thực hiện bởi: {medication.administeredByNurseName || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                        <FiCheckCircle />
                        <span>Lúc: {formatTime(medication.actualDatetime)}</span>
                    </div>
                    {medication.administrationNotes && (
                        <div className="info-item notes">
                            <label>Ghi chú:</label>
                            <p>{medication.administrationNotes}</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="med-card-footer actions">
                    <button
                        className="btn-action btn-administer"
                        onClick={() => onAdminister(medication)}
                        disabled={actionLoading === medication.administrationId}
                    >
                        <FiCheckCircle /> Đã thực hiện
                    </button>
                    <button
                        className="btn-action btn-refuse"
                        onClick={() => onRefuse(medication)}
                        disabled={actionLoading === medication.administrationId}
                    >
                        <FiXCircle /> Bệnh nhân từ chối
                    </button>
                    <button
                        className="btn-action btn-miss"
                        onClick={() => onMiss(medication)}
                        disabled={actionLoading === medication.administrationId}
                    >
                        <FiSlash /> Bỏ lỡ
                    </button>
                </div>
            )}
        </div>
    );
};

// Component thẻ nhóm y lệnh
const MedicationGroupCard = ({ group, onAdministerOrder, actionLoading }) => {
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
            'RECEIVED': 'status-received',
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
        <div className="med-group-card">
            <div className="group-header">
                <div className="group-info">
                    <h3>Nhóm y lệnh #{group.medicationOrderGroupId}</h3>
                    <div className="group-meta">
                        <span className="encounter-id">Encounter: {group.encounterId}</span>
                        <span className="order-date">Ngày y lệnh: {formatDateTime(group.orderDate)}</span>
                    </div>
                </div>
                <div className="group-badges">
                    <span className={`status-badge ${getStatusBadgeClass(group.status)}`}>
                        {group.status}
                    </span>
                    <span className={`priority-badge ${getPriorityBadgeClass(group.priority)}`}>
                        {group.priority}
                        {group.isStat && ' (STAT)'}
                    </span>
                </div>
            </div>

            <div className="group-body">
                <div className="group-details">
                    <div className="detail-row">
                        <label>Bác sĩ chỉ định:</label>
                        <span>{group.orderedByDoctorName || `ID: ${group.orderedByDoctorId}`}</span>
                    </div>
                    <div className="detail-row">
                        <label>Số lượng thuốc:</label>
                        <span>{group.medicationCount} loại</span>
                    </div>
                    <div className="detail-row">
                        <label>Ngày tạo:</label>
                        <span>{formatDateTime(group.createdAt)}</span>
                    </div>
                    {group.orderedAt && (
                        <div className="detail-row">
                            <label>Thời gian chỉ định:</label>
                            <span>{formatDateTime(group.orderedAt)}</span>
                        </div>
                    )}
                </div>

                {group.orderNotes && (
                    <div className="group-notes">
                        <label>Ghi chú y lệnh:</label>
                        <p>{group.orderNotes}</p>
                    </div>
                )}

                {/* Danh sách thuốc trong nhóm */}
                <div className="medications-in-group">
                    <h4>Danh sách thuốc ({group.medicationCount})</h4>
                    <div className="medications-list">
                        {group.medications && group.medications.map((med, index) => (
                            <div key={med.medicationOrderId || index} className="medication-item">
                                <div className="med-info">
                                    <span className="med-name">
                                        {med.medicineName || `Medicine ID: ${med.medicineId}`}
                                    </span>
                                    <span className="med-details">
                                        {med.medicationDisplay || `${med.dosage} (${med.routeDisplay || med.route})`}
                                    </span>
                                </div>
                                <div className="med-schedule">
                                    <span className="frequency">{med.frequency}</span>
                                    <span className="duration">{med.durationDays} ngày</span>
                                </div>
                                <div className="med-status">
                                    <span className={`med-status-badge ${getStatusBadgeClass(med.status)}`}>
                                        {med.statusDisplay || med.status}
                                    </span>
                                </div>
                                <div className="med-actions">
                                    {!med.completed && med.status !== 'COMPLETED' && (
                                        <button
                                            className="btn-administer-order"
                                            onClick={() => onAdministerOrder(med)}
                                            disabled={actionLoading === med.medicationOrderId}
                                        >
                                            <FiCheckCircle />
                                            {actionLoading === med.medicationOrderId ? 'Đang xử lý...' : 'Cấp phát'}
                                        </button>
                                    )}
                                    {med.completed && (
                                        <span className="completed-badge">
                                            <FiCheckCircle /> Đã hoàn thành
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Thông tin xử lý */}
                <div className="processing-info">
                    {group.verifiedByPharmacistName && (
                        <div className="process-step">
                            <FiCheckCircle className="step-icon verified" />
                            <span>Dược sĩ xác minh: {group.verifiedByPharmacistName} ({formatDateTime(group.verifiedAt)})</span>
                        </div>
                    )}
                    {group.preparedByPharmacistName && (
                        <div className="process-step">
                            <FiPackage className="step-icon prepared" />
                            <span>Dược sĩ pha chế: {group.preparedByPharmacistName} ({formatDateTime(group.preparedAt)})</span>
                        </div>
                    )}
                    {group.dispensedByPharmacistName && (
                        <div className="process-step">
                            <FiActivity className="step-icon dispensed" />
                            <span>Dược sĩ phát thuốc: {group.dispensedByPharmacistName} ({formatDateTime(group.dispensedAt)})</span>
                        </div>
                    )}
                    {group.receivedByNurseName && (
                        <div className="process-step">
                            <FiUser className="step-icon received" />
                            <span>Điều dưỡng nhận: {group.receivedByNurseName} ({formatDateTime(group.receivedAt)})</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Component thẻ y lệnh lẻ
const IndividualOrderCard = ({ order, onAdministerOrder, actionLoading }) => {
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
        <div className="individual-order-card">
            <div className="order-header">
                <div className="order-info">
                    <h3>Y lệnh #{order.medicationOrderId}</h3>
                    <div className="order-meta">
                        <span className="encounter-id">Encounter: {order.encounterId}</span>
                        <span className="patient-info">{order.patientName} ({order.patientCode})</span>
                    </div>
                </div>
                <div className="order-badges">
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
            </div>

            <div className="order-body">
                <div className="medication-info-row">
                    <div className="med-main-info">
                        <h4>{order.medicineName || `Medicine ID: ${order.medicineId}`}</h4>
                        <span className="med-code">Mã: {order.medicineCode || '-'}</span>
                    </div>
                    <div className="med-dosage-info">
                        <span className="dosage">{order.dosage}</span>
                        <span className="route">({order.routeDisplay || order.route})</span>
                        <span className="frequency">{order.frequency}</span>
                        <span className="duration">{order.durationDays} ngày</span>
                    </div>
                    <div className="med-action-section">
                        {!order.completed && order.status !== 'COMPLETED' && order.status !== 'ADMINISTERED' && (
                            <button
                                className="btn-administer-individual"
                                onClick={() => onAdministerOrder(order)}
                                disabled={actionLoading === order.medicationOrderId}
                            >
                                <FiCheckCircle />
                                {actionLoading === order.medicationOrderId ? 'Đang xử lý...' : 'Cấp phát'}
                            </button>
                        )}
                        {(order.completed || order.status === 'COMPLETED' || order.status === 'ADMINISTERED') && (
                            <span className="completed-badge">
                                <FiCheckCircle /> Đã hoàn thành
                            </span>
                        )}
                    </div>
                </div>

                {order.specialInstructions && (
                    <div className="special-instructions">
                        <label>Hướng dẫn đặc biệt:</label>
                        <p>{order.specialInstructions}</p>
                    </div>
                )}

                <div className="order-details">
                    <div className="detail-grid">
                        <div className="detail-item">
                            <label>Bác sĩ chỉ định:</label>
                            <span>{order.orderedByDoctorName || `ID: ${order.orderedByDoctorId}`}</span>
                        </div>
                        <div className="detail-item">
                            <label>Thời gian chỉ định:</label>
                            <span>{formatDateTime(order.orderedAt)}</span>
                        </div>
                        <div className="detail-item">
                            <label>Thời gian lên lịch:</label>
                            <span>{formatDateTime(order.scheduledDatetime)}</span>
                        </div>
                        <div className="detail-item">
                            <label>Loại y lệnh:</label>
                            <span>{order.orderType || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Thông tin thực hiện */}
                {order.administeredDatetime && (
                    <div className="administration-info">
                        <h5>Thông tin thực hiện</h5>
                        <div className="admin-details">
                            <div className="detail-item">
                                <label>Điều dưỡng thực hiện:</label>
                                <span>{order.administeredByNurseName || `ID: ${order.administeredByNurseId}`}</span>
                            </div>
                            <div className="detail-item">
                                <label>Thời gian thực hiện:</label>
                                <span>{formatDateTime(order.administeredDatetime)}</span>
                            </div>
                            {order.administrationNotes && (
                                <div className="detail-item full-width">
                                    <label>Ghi chú thực hiện:</label>
                                    <p>{order.administrationNotes}</p>
                                </div>
                            )}
                            {order.patientResponse && (
                                <div className="detail-item full-width">
                                    <label>Phản ứng bệnh nhân:</label>
                                    <p>{order.patientResponse}</p>
                                </div>
                            )}
                            {order.adverseReaction && (
                                <div className="detail-item full-width adverse-reaction">
                                    <label>Phản ứng bất lợi:</label>
                                    <p>{order.adverseReaction}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Thông tin dược sĩ */}
                {order.dispensedByPharmacistName && (
                    <div className="pharmacy-info">
                        <h5>Thông tin dược sĩ</h5>
                        <div className="pharmacy-details">
                            <div className="detail-item">
                                <label>Dược sĩ phát thuốc:</label>
                                <span>{order.dispensedByPharmacistName}</span>
                            </div>
                            <div className="detail-item">
                                <label>Thời gian phát thuốc:</label>
                                <span>{formatDateTime(order.dispensedAt)}</span>
                            </div>
                            <div className="detail-item">
                                <label>Số lượng phát:</label>
                                <span>{order.quantityDispensed || '-'}</span>
                            </div>
                            {order.dispensingNotes && (
                                <div className="detail-item full-width">
                                    <label>Ghi chú phát thuốc:</label>
                                    <p>{order.dispensingNotes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Thông tin ngừng thuốc */}
                {order.isDiscontinued && (
                    <div className="discontinuation-info">
                        <h5>Thông tin ngừng thuốc</h5>
                        <div className="discontinuation-details">
                            <div className="detail-item">
                                <label>Bác sĩ ngừng thuốc:</label>
                                <span>{order.discontinuedByDoctorName || `ID: ${order.discontinuedByDoctorId}`}</span>
                            </div>
                            <div className="detail-item">
                                <label>Thời gian ngừng:</label>
                                <span>{formatDateTime(order.discontinuedAt)}</span>
                            </div>
                            {order.discontinuationReason && (
                                <div className="detail-item full-width">
                                    <label>Lý do ngừng thuốc:</label>
                                    <p>{order.discontinuationReason}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Thông tin thanh toán */}
                {(order.unitPrice || order.totalPrice) && (
                    <div className="billing-info">
                        <h5>Thông tin thanh toán</h5>
                        <div className="billing-details">
                            <div className="detail-item">
                                <label>Đơn giá:</label>
                                <span>{order.unitPrice ? `${order.unitPrice.toLocaleString('vi-VN')} VNĐ` : '-'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Số lượng đặt:</label>
                                <span>{order.quantityOrdered || '-'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Tổng tiền:</label>
                                <span>{order.totalPrice ? `${order.totalPrice.toLocaleString('vi-VN')} VNĐ` : '-'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Giảm giá:</label>
                                <span>{order.discountAmount ? `${order.discountAmount.toLocaleString('vi-VN')} VNĐ` : '-'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Thành tiền:</label>
                                <span className="final-price">
                                    {order.finalPrice ? `${order.finalPrice.toLocaleString('vi-VN')} VNĐ` : '-'}
                                </span>
                            </div>
                            <div className="detail-item">
                                <label>Số tiền tính phí:</label>
                                <span>{order.billableAmount ? `${order.billableAmount.toLocaleString('vi-VN')} VNĐ` : '-'}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Thông tin hệ thống */}
                <div className="system-info">
                    <div className="detail-grid">
                        <div className="detail-item">
                            <label>Ngày tạo:</label>
                            <span>{formatDateTime(order.createdAt)}</span>
                        </div>
                        <div className="detail-item">
                            <label>Cập nhật lần cuối:</label>
                            <span>{formatDateTime(order.updatedAt)}</span>
                        </div>
                        <div className="detail-item">
                            <label>Version:</label>
                            <span>{order.version || '-'}</span>
                        </div>
                        <div className="detail-item">
                            <label>Trạng thái hoàn thành:</label>
                            <span className={order.completed ? 'completed-yes' : 'completed-no'}>
                                {order.completed ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Cảnh báo quá hạn */}
                {order.overdue && (
                    <div className="overdue-warning">
                        <FiAlertCircle />
                        <span>Y lệnh này đã quá hạn thực hiện</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MedicationInpatientPage;