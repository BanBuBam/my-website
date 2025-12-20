import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { nurseMedicationOrderGroupAPI, nurseMedicationOrderAPI } from '../../../../services/staff/nurseAPI';
import {
    FiArrowLeft, FiAlertCircle, FiClock, FiCheckCircle,
    FiPackage, FiInfo, FiActivity, FiXCircle, FiUser, FiList, FiCalendar, FiEye
} from 'react-icons/fi';
import './MedicationOrderGroupsPage.css';

const MedicationOrderGroupsPage = () => {
    const [activeTab, setActiveTab] = useState('ready-for-administration');
    const [readyForAdministration, setReadyForAdministration] = useState([]);
    const [filteredGroups, setFilteredGroups] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('PENDING');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const navigate = useNavigate();

    const statusOptions = [
        { value: 'PENDING', label: 'Chờ xử lý', color: '#6b7280' },
        { value: 'ORDERED', label: 'Đã ra lệnh', color: '#3b82f6' },
        { value: 'VERIFIED', label: 'Đã xác minh', color: '#f59e0b' },
        { value: 'READY', label: 'Sẵn sàng', color: '#8b5cf6' },
        { value: 'GIVEN', label: 'Đã cấp phát', color: '#10b981' },
        { value: 'RECEIVED', label: 'Đã nhận', color: '#059669' },
        { value: 'CANCELLED', label: 'Đã hủy', color: '#ef4444' },
        { value: 'DISCONTINUED', label: 'Ngừng thuốc', color: '#f97316' }
    ];

    // Hàm tải dữ liệu chờ cấp phát
    const fetchReadyForAdministration = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await nurseMedicationOrderGroupAPI.getReadyForAdministrationGroups();
            if (response && response.data) {
                setReadyForAdministration(response.data);
            } else {
                setReadyForAdministration([]);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách nhóm y lệnh chờ cấp phát');
        } finally {
            setLoading(false);
        }
    };

    // Hàm tải dữ liệu theo status (mock data vì chưa có API)
    const fetchGroupsByStatus = async (status) => {
        setLoading(true);
        setError(null);
        try {
            // Mock data - sẽ thay thế bằng API thật khi có
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
            
            // Filter from ready for administration data based on status
            const filtered = readyForAdministration.filter(group => 
                group.status === status || 
                (status === 'READY' && group.status === 'DISPENSED') ||
                (status === 'GIVEN' && group.status === 'RECEIVED')
            );
            
            setFilteredGroups(filtered);
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách nhóm y lệnh theo trạng thái');
        } finally {
            setLoading(false);
        }
    };

    // Tải dữ liệu khi component mount hoặc tab thay đổi
    useEffect(() => {
        if (activeTab === 'ready-for-administration') {
            fetchReadyForAdministration();
        } else if (activeTab === 'by-status') {
            fetchGroupsByStatus(selectedStatus);
        }
    }, [activeTab]);

    // Tải dữ liệu khi status thay đổi
    useEffect(() => {
        if (activeTab === 'by-status') {
            fetchGroupsByStatus(selectedStatus);
        }
    }, [selectedStatus]);

    // Xử lý nhận nhóm y lệnh
    const handleReceiveGroup = async (group) => {
        const notes = prompt(`Ghi chú nhận nhóm y lệnh #${group.medicationOrderGroupId} (tùy chọn):`);
        if (notes === null) return; // User cancelled

        setActionLoading(group.medicationOrderGroupId);
        try {
            const response = await nurseMedicationOrderGroupAPI.receiveGroup(
                group.medicationOrderGroupId,
                notes || ''
            );

            if (response && (response.code === 200 || response.code === 201)) {
                alert('Nhận nhóm y lệnh thành công!');
                if (activeTab === 'ready-for-administration') {
                    await fetchReadyForAdministration();
                } else {
                    await fetchGroupsByStatus(selectedStatus);
                }
            } else {
                alert(response?.message || 'Không thể nhận nhóm y lệnh');
            }
        } catch (err) {
            console.error('Error receiving group:', err);
            alert(err.message || 'Không thể nhận nhóm y lệnh');
        } finally {
            setActionLoading(null);
        }
    };

    // Xử lý cấp phát y lệnh lẻ
    const handleAdministerIndividualOrder = async (order) => {
        const patientResponse = prompt(`Phản ứng của bệnh nhân với thuốc "${order.medicineName}" (tùy chọn):`);
        if (patientResponse === null) return; // User cancelled

        const adverseReaction = prompt(`Phản ứng bất lợi (tùy chọn):`);
        if (adverseReaction === null) return; // User cancelled

        const notes = prompt(`Ghi chú (tùy chọn):`);
        if (notes === null) return; // User cancelled

        setActionLoading(`order-${order.medicationOrderId}`);
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
                    await fetchGroupsByStatus(selectedStatus);
                }
            } else {
                alert(response?.message || 'Không thể cấp phát y lệnh');
            }
        } catch (err) {
            console.error('Error administering individual order:', err);
            alert(err.message || 'Không thể cấp phát y lệnh');
        } finally {
            setActionLoading(null);
        }
    };

    // Xử lý xem chi tiết
    const handleViewDetail = (groupId) => {
        navigate(`/staff/dieu-duong/quan-ly-y-lenh-theo-nhom/${groupId}`);
    };

    if (loading) {
        return (
            <div className="medication-order-groups-loading">
                <FiActivity className="spinner" />
                <p>Đang tải danh sách nhóm y lệnh...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="medication-order-groups-error">
                <FiAlertCircle />
                <p>{error}</p>
                <button onClick={() => navigate(-1)} className="btn-back-error">
                    Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="medication-order-groups-page">
            {/* Header */}
            <div className="medication-order-groups-header">
                <button className="btn-back" onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-content">
                    <h1>Quản lý Y lệnh theo Nhóm</h1>
                    <p>Quản lý và nhận các nhóm y lệnh thuốc</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                <button
                    className={`tab-button ${activeTab === 'ready-for-administration' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ready-for-administration')}
                >
                    <FiPackage /> Chờ cấp phát ({readyForAdministration.length})
                </button>
                <button
                    className={`tab-button ${activeTab === 'by-status' ? 'active' : ''}`}
                    onClick={() => setActiveTab('by-status')}
                >
                    <FiList /> Lọc theo trạng thái ({filteredGroups.length})
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'ready-for-administration' && (
                    <div className="groups-container">
                        {readyForAdministration.length === 0 ? (
                            <div className="no-data">
                                <FiPackage />
                                <p>Không có nhóm y lệnh nào chờ cấp phát.</p>
                            </div>
                        ) : (
                            <div className="groups-list">
                                {readyForAdministration.map(group => (
                                    <MedicationOrderGroupCard
                                        key={group.medicationOrderGroupId}
                                        group={group}
                                        onReceive={handleReceiveGroup}
                                        onViewDetail={handleViewDetail}
                                        onAdministerIndividualOrder={handleAdministerIndividualOrder}
                                        actionLoading={actionLoading}
                                        showReceiveButton={true}
                                        showIndividualOrderButtons={true}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'by-status' && (
                    <div className="groups-container">
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

                        {filteredGroups.length === 0 ? (
                            <div className="no-data">
                                <FiList />
                                <p>Không có nhóm y lệnh nào với trạng thái này.</p>
                            </div>
                        ) : (
                            <div className="groups-list">
                                {filteredGroups.map(group => (
                                    <MedicationOrderGroupCard
                                        key={group.medicationOrderGroupId}
                                        group={group}
                                        onViewDetail={handleViewDetail}
                                        onAdministerIndividualOrder={handleAdministerIndividualOrder}
                                        actionLoading={actionLoading}
                                        showReceiveButton={false}
                                        showIndividualOrderButtons={false}
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

// Component thẻ nhóm y lệnh
const MedicationOrderGroupCard = ({ group, onReceive, onViewDetail, onAdministerIndividualOrder, actionLoading, showReceiveButton, showIndividualOrderButtons }) => {
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
            'PENDING': 'status-pending',
            'ORDERED': 'status-ordered',
            'VERIFIED': 'status-verified',
            'READY': 'status-ready',
            'GIVEN': 'status-given',
            'RECEIVED': 'status-received',
            'CANCELLED': 'status-cancelled',
            'DISCONTINUED': 'status-discontinued',
            'DISPENSED': 'status-dispensed',
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
        <div className="medication-group-card-compact">
            <div className="group-info-row">
                <div className="group-main-info">
                    <h4>Nhóm y lệnh #{group.medicationOrderGroupId}</h4>
                    <div className="group-meta">
                        <span className="patient-info">{group.patientName}</span>
                        <span className="encounter-id">Encounter: {group.encounterId}</span>
                    </div>
                </div>
                
                <div className="group-details">
                    <div className="detail-item">
                        <label>Bác sĩ:</label>
                        <span>{group.orderedByDoctorName || `ID: ${group.orderedByDoctorId}`}</span>
                    </div>
                    <div className="detail-item">
                        <label>Số thuốc:</label>
                        <span>{group.medicationCount} loại</span>
                    </div>
                    <div className="detail-item">
                        <label>Ngày y lệnh:</label>
                        <span>{formatDateTime(group.orderDate)}</span>
                    </div>
                    {group.dispensedByPharmacistName && (
                        <div className="detail-item">
                            <label>Dược sĩ:</label>
                            <span>{group.dispensedByPharmacistName}</span>
                        </div>
                    )}
                </div>

                <div className="group-status-info">
                    <div className="status-badges">
                        <span className={`status-badge ${getStatusBadgeClass(group.status)}`}>
                            {group.status}
                        </span>
                        {group.priority && (
                            <span className={`priority-badge ${getPriorityBadgeClass(group.priority)}`}>
                                {group.priority}
                                {group.isStat && ' (STAT)'}
                            </span>
                        )}
                    </div>
                    {group.dispensedAt && (
                        <div className="dispensed-info">
                            <label>Thời gian dispensing:</label>
                            <span>{formatDateTime(group.dispensedAt)}</span>
                        </div>
                    )}
                </div>

                <div className="group-actions">
                    <button
                        className="btn-action btn-view"
                        onClick={() => onViewDetail(group.medicationOrderGroupId)}
                    >
                        <FiEye />
                        Xem chi tiết
                    </button>
                    {showReceiveButton && (
                        <button
                            className="btn-action btn-receive"
                            onClick={() => onReceive(group)}
                            disabled={actionLoading === group.medicationOrderGroupId}
                        >
                            <FiCheckCircle />
                            {actionLoading === group.medicationOrderGroupId ? 'Đang xử lý...' : 'Cấp phát'}
                        </button>
                    )}
                </div>
            </div>

            {/* Thông tin bổ sung */}
            {group.orderNotes && (
                <div className="group-notes">
                    <label>Ghi chú y lệnh:</label>
                    <p>{group.orderNotes}</p>
                </div>
            )}

            {group.dispensedNotes && (
                <div className="dispensed-notes">
                    <label>Ghi chú dispensing:</label>
                    <p>{group.dispensedNotes}</p>
                </div>
            )}

            {/* Danh sách y lệnh lẻ */}
            {group.medications && group.medications.length > 0 && (
                <div className="individual-medications">
                    <div className="medications-header">
                        <h5>Danh sách y lệnh lẻ ({group.medications.length})</h5>
                    </div>
                    <div className="medications-list">
                        {group.medications.map((medication, index) => (
                            <IndividualMedicationCard
                                key={medication.medicationOrderId || index}
                                medication={medication}
                                onAdminister={onAdministerIndividualOrder}
                                actionLoading={actionLoading}
                                showAdministerButton={showIndividualOrderButtons}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Component thẻ y lệnh lẻ
const IndividualMedicationCard = ({ medication, onAdminister, actionLoading, showAdministerButton }) => {
    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit'
        });
    };

    const getStatusBadgeClass = (status) => {
        const statusMap = {
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

    return (
        <div className="individual-medication-card">
            <div className="medication-info-row">
                <div className="medication-main">
                    <h6>{medication.medicineName || `Medicine ID: ${medication.medicineId}`}</h6>
                    <span className="medication-code">Mã: {medication.medicineCode || '-'}</span>
                </div>
                
                <div className="medication-details">
                    <span className="dosage">{medication.dosage}</span>
                    <span className="route">({medication.routeDisplay || medication.route})</span>
                    <span className="frequency">{medication.frequency}</span>
                    <span className="duration">{medication.durationDays} ngày</span>
                </div>

                <div className="medication-status">
                    <span className={`med-status-badge ${getStatusBadgeClass(medication.status)}`}>
                        {medication.statusDisplay || medication.status}
                    </span>
                    {medication.scheduledDatetime && (
                        <span className="scheduled-time">
                            Lịch: {formatDateTime(medication.scheduledDatetime)}
                        </span>
                    )}
                </div>

                <div className="medication-actions">
                    {showAdministerButton && !medication.completed && medication.status !== 'COMPLETED' && medication.status !== 'ADMINISTERED' && (
                        <button
                            className="btn-administer-individual"
                            onClick={() => onAdminister(medication)}
                            disabled={actionLoading === `order-${medication.medicationOrderId}`}
                        >
                            <FiCheckCircle />
                            {actionLoading === `order-${medication.medicationOrderId}` ? 'Đang xử lý...' : 'Cấp phát'}
                        </button>
                    )}
                    {(medication.completed || medication.status === 'COMPLETED' || medication.status === 'ADMINISTERED') && (
                        <span className="completed-badge">
                            <FiCheckCircle /> Đã hoàn thành
                        </span>
                    )}
                </div>
            </div>

            {/* Thông tin bổ sung */}
            {medication.specialInstructions && (
                <div className="special-instructions">
                    <label>Hướng dẫn đặc biệt:</label>
                    <p>{medication.specialInstructions}</p>
                </div>
            )}

            {/* Cảnh báo quá hạn */}
            {medication.overdue && (
                <div className="overdue-warning">
                    <FiAlertCircle />
                    <span>Y lệnh này đã quá hạn thực hiện</span>
                </div>
            )}
        </div>
    );
};

export default MedicationOrderGroupsPage;