import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { medicationOrderGroupAPI } from '../../../../services/staff/pharmacistAPI';
import {
    FiArrowLeft,
    FiPackage,
    FiUser,
    FiCalendar,
    FiFileText,
    FiAlertCircle,
    FiCheckCircle,
    FiXCircle,
    FiTruck,
    FiClock,
    FiPause
} from 'react-icons/fi';
import VerifyMedicationGroupModal from './VerifyMedicationGroupModal';
import CancelMedicationGroupModal from './CancelMedicationGroupModal';
import PrepareMedicationGroupModal from './PrepareMedicationGroupModal';
import DiscontinueMedicationGroupModal from './DiscontinueMedicationGroupModal';
import DispenseMedicationGroupModal from './DispenseMedicationGroupModal';
import './MedicationOrderGroupDetailPage.css';

const MedicationOrderGroupDetailPage = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showPrepareModal, setShowPrepareModal] = useState(false);
    const [showDiscontinueModal, setShowDiscontinueModal] = useState(false);
    const [showDispenseModal, setShowDispenseModal] = useState(false);

    useEffect(() => {
        fetchGroupDetail();
    }, [groupId]);

    const fetchGroupDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await medicationOrderGroupAPI.getGroupDetail(groupId);
            if (response && response.data) {
                setGroup(response.data);
            }
        } catch (err) {
            console.error('Error loading group detail:', err);
            setError(err.message || 'Không thể tải chi tiết nhóm y lệnh');
        } finally {
            setLoading(false);
        }
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

    const formatCurrency = (amount) => {
        if (!amount) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
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
            'ACTIVE': 'status-active',
            'COMPLETED': 'status-completed',
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

    const handleBack = () => {
        navigate('/staff/duoc-si/danh-sach-y-lenh-theo-nhom');
    };

    const handleApprove = () => {
        setShowVerifyModal(true);
    };

    const handleReject = () => {
        setShowCancelModal(true);
    };

    const handleDispense = () => {
        setShowDispenseModal(true);
    };

    const handlePrepare = () => {
        setShowPrepareModal(true);
    };

    const handleHold = () => {
        setShowDiscontinueModal(true);
    };

    const handleModalSuccess = () => {
        // Refresh group detail after successful action
        fetchGroupDetail();
    };

    if (loading) {
        return (
            <div className="medication-order-group-detail-page">
                <div className="loading-state">
                    <p>Đang tải chi tiết nhóm y lệnh...</p>
                </div>
            </div>
        );
    }

    if (error || !group) {
        return (
            <div className="medication-order-group-detail-page">
                <div className="error-state">
                    <FiAlertCircle />
                    <p>{error || 'Không tìm thấy nhóm y lệnh'}</p>
                    <button onClick={handleBack} className="btn-back">
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="medication-order-group-detail-page">
            {/* Page Header */}
            <div className="page-header">
                <button className="btn-back-header" onClick={handleBack}>
                    <FiArrowLeft />
                    <span>Quay lại</span>
                </button>
                <div className="header-title">
                    <FiPackage className="page-icon" />
                    <h1>Chi tiết nhóm y lệnh #{group.medicationOrderGroupId}</h1>
                </div>
            </div>

            {/* Patient Information */}
            <div className="info-section">
                <h2><FiUser /> Thông tin bệnh nhân</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <label>Tên bệnh nhân:</label>
                        <span>{group.patientName}</span>
                    </div>
                    <div className="info-item">
                        <label>Mã bệnh nhân:</label>
                        <span>{group.patientId}</span>
                    </div>
                    <div className="info-item">
                        <label>Mã lượt khám:</label>
                        <span>{group.encounterId}</span>
                    </div>
                    <div className="info-item">
                        <label>Mã lượt nội trú:</label>
                        <span>{group.inpatientStayId || '-'}</span>
                    </div>
                </div>
            </div>

            {/* Order Information */}
            <div className="info-section">
                <h2><FiFileText /> Thông tin y lệnh</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <label>Ngày y lệnh:</label>
                        <span>{formatDateTime(group.orderDate)}</span>
                    </div>
                    <div className="info-item">
                        <label>Bác sĩ chỉ định:</label>
                        <span>{group.orderedByDoctorName}</span>
                    </div>
                    <div className="info-item">
                        <label>Thời gian chỉ định:</label>
                        <span>{formatDateTime(group.orderedAt)}</span>
                    </div>
                    <div className="info-item">
                        <label>Trạng thái:</label>
                        <span className={`status-badge ${getStatusBadgeClass(group.status)}`}>
                            {group.status}
                        </span>
                    </div>
                    <div className="info-item">
                        <label>Độ ưu tiên:</label>
                        <span className={`priority-badge ${getPriorityBadgeClass(group.priority)}`}>
                            {group.priority}
                        </span>
                    </div>
                    {group.isStat && (
                        <div className="info-item">
                            <label>STAT:</label>
                            <span className="stat-badge">STAT</span>
                        </div>
                    )}
                </div>
                {group.orderNotes && (
                    <div className="notes-box">
                        <label>Ghi chú y lệnh:</label>
                        <p>{group.orderNotes}</p>
                    </div>
                )}
            </div>

            {/* Verification Information */}
            {group.verifiedByPharmacistId && (
                <div className="info-section">
                    <h2><FiCheckCircle /> Thông tin xác minh</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Dược sĩ xác minh:</label>
                            <span>{group.verifiedByPharmacistName}</span>
                        </div>
                        <div className="info-item">
                            <label>Thời gian xác minh:</label>
                            <span>{formatDateTime(group.verifiedAt)}</span>
                        </div>
                    </div>
                    {group.verificationNotes && (
                        <div className="notes-box">
                            <label>Ghi chú xác minh:</label>
                            <p>{group.verificationNotes}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Preparation Information */}
            {group.preparedByPharmacistId && (
                <div className="info-section">
                    <h2><FiClock /> Thông tin chuẩn bị</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Dược sĩ chuẩn bị:</label>
                            <span>{group.preparedByPharmacistName}</span>
                        </div>
                        <div className="info-item">
                            <label>Thời gian chuẩn bị:</label>
                            <span>{formatDateTime(group.preparedAt)}</span>
                        </div>
                    </div>
                    {group.preparationNotes && (
                        <div className="notes-box">
                            <label>Ghi chú chuẩn bị:</label>
                            <p>{group.preparationNotes}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Dispensing Information */}
            {group.dispensedByPharmacistId && (
                <div className="info-section">
                    <h2><FiTruck /> Thông tin xuất kho</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Dược sĩ xuất kho:</label>
                            <span>{group.dispensedByPharmacistName}</span>
                        </div>
                        <div className="info-item">
                            <label>Thời gian xuất kho:</label>
                            <span>{formatDateTime(group.dispensedAt)}</span>
                        </div>
                    </div>
                    {group.dispensedNotes && (
                        <div className="notes-box">
                            <label>Ghi chú xuất kho:</label>
                            <p>{group.dispensedNotes}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Medications List */}
            <div className="info-section medications-section">
                <h2><FiPackage /> Danh sách thuốc ({group.medicationCount})</h2>
                {group.medications && group.medications.length > 0 ? (
                    <div className="medications-table-container">
                        <table className="medications-table">
                            <thead>
                                <tr>
                                    <th>Tên thuốc</th>
                                    <th>Mã thuốc</th>
                                    <th>Liều lượng</th>
                                    <th>Đường dùng</th>
                                    <th>Tần suất</th>
                                    <th>Thời gian</th>
                                    <th>Số lượng</th>
                                    <th>Trạng thái</th>
                                    <th>Độ ưu tiên</th>
                                    <th>Đơn giá</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {group.medications.map((medication, index) => (
                                    <tr key={medication.medicationOrderId || index}>
                                        <td>
                                            <strong>{medication.medicineName}</strong>
                                            {medication.specialInstructions && (
                                                <div className="special-instructions">
                                                    {medication.specialInstructions}
                                                </div>
                                            )}
                                        </td>
                                        <td>{medication.medicineCode || '-'}</td>
                                        <td>{medication.dosage}</td>
                                        <td>{medication.routeDisplay || medication.route}</td>
                                        <td>{medication.frequency}</td>
                                        <td>
                                            {medication.durationDays ? `${medication.durationDays} ngày` : '-'}
                                            {medication.scheduledDatetime && (
                                                <div className="scheduled-time">
                                                    {formatDateTime(medication.scheduledDatetime)}
                                                </div>
                                            )}
                                        </td>
                                        <td>{medication.quantityOrdered}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusBadgeClass(medication.status)}`}>
                                                {medication.statusDisplay || medication.status}
                                            </span>
                                            {medication.isPrn && (
                                                <span className="badge-prn">PRN</span>
                                            )}
                                            {medication.isStat && (
                                                <span className="badge-stat">STAT</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`priority-badge ${getPriorityBadgeClass(medication.priority)}`}>
                                                {medication.priorityDisplay || medication.priority}
                                            </span>
                                        </td>
                                        <td>{formatCurrency(medication.unitPrice)}</td>
                                        <td>
                                            <strong>{formatCurrency(medication.finalPrice || medication.totalPrice)}</strong>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-medications">
                        <FiAlertCircle />
                        <p>Không có thuốc nào trong nhóm y lệnh này</p>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="action-section">
                <h2>Thao tác</h2>
                <div className="action-buttons">
                    <button className="btn-action btn-approve" onClick={handleApprove}>
                        <FiCheckCircle />
                        <span>Phê duyệt</span>
                    </button>
                    <button className="btn-action btn-reject" onClick={handleReject}>
                        <FiXCircle />
                        <span>Từ chối</span>
                    </button>
                    <button className="btn-action btn-dispense" onClick={handleDispense}>
                        <FiTruck />
                        <span>Xuất kho</span>
                    </button>
                    <button className="btn-action btn-prepare" onClick={handlePrepare}>
                        <FiClock />
                        <span>Chuẩn bị</span>
                    </button>
                    <button className="btn-action btn-hold" onClick={handleHold}>
                        <FiPause />
                        <span>Tạm dừng</span>
                    </button>
                </div>
            </div>

            {/* Modals */}
            <VerifyMedicationGroupModal
                isOpen={showVerifyModal}
                onClose={() => setShowVerifyModal(false)}
                group={group}
                onSuccess={handleModalSuccess}
            />
            <CancelMedicationGroupModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                group={group}
                onSuccess={handleModalSuccess}
            />
            <PrepareMedicationGroupModal
                isOpen={showPrepareModal}
                onClose={() => setShowPrepareModal(false)}
                group={group}
                onSuccess={handleModalSuccess}
            />
            <DiscontinueMedicationGroupModal
                isOpen={showDiscontinueModal}
                onClose={() => setShowDiscontinueModal(false)}
                group={group}
                onSuccess={handleModalSuccess}
            />
            <DispenseMedicationGroupModal
                isOpen={showDispenseModal}
                onClose={() => setShowDispenseModal(false)}
                group={group}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
};

export default MedicationOrderGroupDetailPage;

