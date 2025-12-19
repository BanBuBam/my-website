import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicationOrderGroupAPI } from '../../../../services/staff/pharmacistAPI';
import {
    FiPackage,
    FiAlertCircle,
    FiEye,
    FiUser,
    FiCalendar,
    FiClock,
    FiFileText,
    FiCheckCircle,
    FiActivity,
    FiArrowLeft,
    FiList
} from 'react-icons/fi';
import DispensingModal from './DispensingModal';
import './MedicationOrderGroupsListPage.css';

const MedicationOrderGroupsListPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('pending-verification');
    const [pendingVerification, setPendingVerification] = useState([]);
    const [pendingPreparation, setPendingPreparation] = useState([]);
    const [readyForDispensing, setReadyForDispensing] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [showDispensingModal, setShowDispensingModal] = useState(false);
    const [selectedGroupForDispensing, setSelectedGroupForDispensing] = useState(null);

    // Tải dữ liệu chờ xác nhận
    const fetchPendingVerification = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await medicationOrderGroupAPI.getPendingVerificationGroups();
            if (response && response.data) {
                setPendingVerification(response.data);
            } else {
                setPendingVerification([]);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách nhóm y lệnh chờ xác nhận');
        } finally {
            setLoading(false);
        }
    };

    // Tải dữ liệu chờ chuẩn bị
    const fetchPendingPreparation = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await medicationOrderGroupAPI.getPendingPreparationGroups();
            if (response && response.data) {
                setPendingPreparation(response.data);
            } else {
                setPendingPreparation([]);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách nhóm y lệnh chờ chuẩn bị');
        } finally {
            setLoading(false);
        }
    };

    // Tải dữ liệu sẵn sàng dispensing
    const fetchReadyForDispensing = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await medicationOrderGroupAPI.getReadyForDispensingGroups();
            if (response && response.data) {
                setReadyForDispensing(response.data);
            } else {
                setReadyForDispensing([]);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách nhóm y lệnh sẵn sàng dispensing');
        } finally {
            setLoading(false);
        }
    };

    // Tải dữ liệu khi component mount hoặc tab thay đổi
    useEffect(() => {
        if (activeTab === 'pending-verification') {
            fetchPendingVerification();
        } else if (activeTab === 'pending-preparation') {
            fetchPendingPreparation();
        } else if (activeTab === 'ready-for-dispensing') {
            fetchReadyForDispensing();
        }
    }, [activeTab]);

    // Xử lý xác nhận nhóm y lệnh
    const handleVerifyGroup = async (group) => {
        const notes = prompt(`Ghi chú xác nhận nhóm y lệnh #${group.medicationOrderGroupId}:`);
        if (notes === null) return; // User cancelled

        setActionLoading(group.medicationOrderGroupId);
        try {
            const response = await medicationOrderGroupAPI.verifyMedicationOrderGroup(
                group.medicationOrderGroupId,
                notes
            );

            if (response && (response.code === 200 || response.code === 201)) {
                alert('Xác nhận nhóm y lệnh thành công!');
                await fetchPendingVerification();
            } else {
                alert(response?.message || 'Không thể xác nhận nhóm y lệnh');
            }
        } catch (err) {
            console.error('Error verifying group:', err);
            alert(err.message || 'Không thể xác nhận nhóm y lệnh');
        } finally {
            setActionLoading(null);
        }
    };

    // Xử lý chuẩn bị nhóm y lệnh
    const handlePrepareGroup = async (group) => {
        const notes = prompt(`Ghi chú chuẩn bị nhóm y lệnh #${group.medicationOrderGroupId}:`);
        if (notes === null) return; // User cancelled

        setActionLoading(group.medicationOrderGroupId);
        try {
            const response = await medicationOrderGroupAPI.prepareMedicationOrderGroup(
                group.medicationOrderGroupId,
                notes
            );

            if (response && (response.code === 200 || response.code === 201)) {
                alert('Chuẩn bị nhóm y lệnh thành công!');
                await fetchPendingPreparation();
            } else {
                alert(response?.message || 'Không thể chuẩn bị nhóm y lệnh');
            }
        } catch (err) {
            console.error('Error preparing group:', err);
            alert(err.message || 'Không thể chuẩn bị nhóm y lệnh');
        } finally {
            setActionLoading(null);
        }
    };

    // Xử lý mở modal dispensing
    const handleDispenseGroup = (group) => {
        setSelectedGroupForDispensing(group);
        setShowDispensingModal(true);
    };

    // Xử lý xác nhận dispensing từ modal
    const handleConfirmDispensing = async (nurseId, notes, nurseData) => {
        if (!selectedGroupForDispensing) return;

        setActionLoading(selectedGroupForDispensing.medicationOrderGroupId);
        try {
            const response = await medicationOrderGroupAPI.dispenseMedicationOrderGroup(
                selectedGroupForDispensing.medicationOrderGroupId,
                parseInt(nurseId),
                notes || ''
            );

            if (response && (response.code === 200 || response.code === 201)) {
                alert(`Dispensing nhóm y lệnh thành công!\nĐiều dưỡng nhận: ${nurseData.fullName} (${nurseData.employeeCode})`);
                setShowDispensingModal(false);
                setSelectedGroupForDispensing(null);
                await fetchReadyForDispensing();
            } else {
                alert(response?.message || 'Không thể dispensing nhóm y lệnh');
            }
        } catch (err) {
            console.error('Error dispensing group:', err);
            alert(err.message || 'Không thể dispensing nhóm y lệnh');
        } finally {
            setActionLoading(null);
        }
    };

    // Xử lý đóng modal dispensing
    const handleCloseDispensingModal = () => {
        if (actionLoading) return; // Không cho đóng khi đang xử lý
        setShowDispensingModal(false);
        setSelectedGroupForDispensing(null);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
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
            'VERIFIED': 'status-verified',
            'PREPARED': 'status-prepared',
            'DISPENSED': 'status-dispensed',
            'REJECTED': 'status-rejected',
            'HELD': 'status-held',
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

    const handleViewDetail = (groupId) => {
        navigate(`/staff/duoc-si/danh-sach-y-lenh-theo-nhom/${groupId}`);
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
                    <h1>Danh sách Y lệnh theo Nhóm</h1>
                    <p>Quản lý và xử lý các nhóm y lệnh thuốc</p>
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
                    className={`tab-button ${activeTab === 'pending-preparation' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending-preparation')}
                >
                    <FiActivity /> Chờ chuẩn bị ({pendingPreparation.length})
                </button>
                <button
                    className={`tab-button ${activeTab === 'ready-for-dispensing' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ready-for-dispensing')}
                >
                    <FiPackage /> Chuẩn bị Dispensing ({readyForDispensing.length})
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'pending-verification' && (
                    <div className="groups-container">
                        {pendingVerification.length === 0 ? (
                            <div className="no-data">
                                <FiClock />
                                <p>Không có nhóm y lệnh nào chờ xác nhận.</p>
                            </div>
                        ) : (
                            <div className="groups-list">
                                {pendingVerification.map(group => (
                                    <MedicationOrderGroupCard
                                        key={group.medicationOrderGroupId}
                                        group={group}
                                        onVerify={handleVerifyGroup}
                                        onViewDetail={handleViewDetail}
                                        actionLoading={actionLoading}
                                        actionType="verify"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'pending-preparation' && (
                    <div className="groups-container">
                        {pendingPreparation.length === 0 ? (
                            <div className="no-data">
                                <FiActivity />
                                <p>Không có nhóm y lệnh nào chờ chuẩn bị.</p>
                            </div>
                        ) : (
                            <div className="groups-list">
                                {pendingPreparation.map(group => (
                                    <MedicationOrderGroupCard
                                        key={group.medicationOrderGroupId}
                                        group={group}
                                        onPrepare={handlePrepareGroup}
                                        onViewDetail={handleViewDetail}
                                        actionLoading={actionLoading}
                                        actionType="prepare"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'ready-for-dispensing' && (
                    <div className="groups-container">
                        {readyForDispensing.length === 0 ? (
                            <div className="no-data">
                                <FiPackage />
                                <p>Không có nhóm y lệnh nào sẵn sàng dispensing.</p>
                            </div>
                        ) : (
                            <div className="groups-list">
                                {readyForDispensing.map(group => (
                                    <MedicationOrderGroupCard
                                        key={group.medicationOrderGroupId}
                                        group={group}
                                        onDispense={handleDispenseGroup}
                                        onViewDetail={handleViewDetail}
                                        actionLoading={actionLoading}
                                        actionType="dispense"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Dispensing Modal */}
            <DispensingModal
                isOpen={showDispensingModal}
                onClose={handleCloseDispensingModal}
                onConfirm={handleConfirmDispensing}
                group={selectedGroupForDispensing}
                loading={actionLoading === selectedGroupForDispensing?.medicationOrderGroupId}
            />
        </div>
    );
};

// Component thẻ nhóm y lệnh
const MedicationOrderGroupCard = ({ group, onVerify, onPrepare, onDispense, onViewDetail, actionLoading, actionType }) => {
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
                </div>

                <div className="group-actions">
                    <button
                        className="btn-action btn-view"
                        onClick={() => onViewDetail(group.medicationOrderGroupId)}
                    >
                        <FiEye />
                        Chi tiết
                    </button>
                    {actionType === 'verify' && (
                        <button
                            className="btn-action btn-verify"
                            onClick={() => onVerify(group)}
                            disabled={actionLoading === group.medicationOrderGroupId}
                        >
                            <FiCheckCircle />
                            {actionLoading === group.medicationOrderGroupId ? 'Đang xử lý...' : 'Xác nhận'}
                        </button>
                    )}
                    {actionType === 'prepare' && (
                        <button
                            className="btn-action btn-prepare"
                            onClick={() => onPrepare(group)}
                            disabled={actionLoading === group.medicationOrderGroupId}
                        >
                            <FiActivity />
                            {actionLoading === group.medicationOrderGroupId ? 'Đang xử lý...' : 'Chuẩn bị'}
                        </button>
                    )}
                    {actionType === 'dispense' && (
                        <button
                            className="btn-action btn-dispense"
                            onClick={() => onDispense(group)}
                            disabled={actionLoading === group.medicationOrderGroupId}
                        >
                            <FiPackage />
                            {actionLoading === group.medicationOrderGroupId ? 'Đang xử lý...' : 'Dispensing'}
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
        </div>
    );
};

export default MedicationOrderGroupsListPage;

