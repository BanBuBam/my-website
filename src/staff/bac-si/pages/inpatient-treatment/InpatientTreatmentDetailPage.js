import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorInpatientTreatmentAPI, medicationOrderAPI } from '../../../../services/staff/doctorAPI';
import {
    FiArrowLeft,
    FiUser,
    FiCalendar,
    FiActivity,
    FiAlertCircle,
    FiFileText,
    FiTruck,
    FiMove,
    FiLogOut,
    FiPlusCircle,
    FiPackage,
    FiEye,
    FiPause,
    FiPlay,
    FiXCircle,
    FiClock,
    FiList
} from 'react-icons/fi';
import CreateDischargePlanModal from './CreateDischargePlanModal';
import HoldMedicationModal from './HoldMedicationModal';
import ResumeMedicationModal from './ResumeMedicationModal';
import DiscontinueMedicationModal from './DiscontinueMedicationModal';
import './InpatientTreatmentDetailPage.css';

const InpatientTreatmentDetailPage = () => {
    const { inpatientStayId } = useParams();
    const navigate = useNavigate();
    const [stay, setStay] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDischargePlanModal, setShowDischargePlanModal] = useState(false);
    const [isDischarged, setIsDischarged] = useState(false);

    // Medication Order Groups
    const [medicationOrderGroups, setMedicationOrderGroups] = useState([]);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [groupsError, setGroupsError] = useState(null);
    const [expandedGroups, setExpandedGroups] = useState({});

    // Modals for medication actions
    const [showHoldModal, setShowHoldModal] = useState(false);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [showDiscontinueModal, setShowDiscontinueModal] = useState(false);
    const [selectedMedication, setSelectedMedication] = useState(null);

    useEffect(() => {
        fetchStayDetail();
        fetchMedicationOrderGroups();
    }, [inpatientStayId]);

    const fetchStayDetail = async () => {
        try {
            setLoading(true);
            const response = await doctorInpatientTreatmentAPI.getInpatientStayDetail(inpatientStayId);
            if (response && response.data) {
                setStay(response.data);
                setIsDischarged(response.data.isDischarged);
            }
        } catch (err) {
            console.error('Error loading stay detail:', err);
            setError(err.message || 'Không thể tải thông tin điều trị nội trú');
        } finally {
            setLoading(false);
        }
    };

    const fetchMedicationOrderGroups = async () => {
        try {
            setLoadingGroups(true);
            setGroupsError(null);
            const response = await medicationOrderAPI.getMedicationOrderGroupsByInpatientStay(inpatientStayId);
            if (response && response.data) {
                setMedicationOrderGroups(response.data);
            }
        } catch (err) {
            console.error('Error loading medication order groups:', err);
            setGroupsError(err.message || 'Không thể tải danh sách nhóm y lệnh');
        } finally {
            setLoadingGroups(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
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

    const handleDischargePlanSuccess = () => {
        // Optionally refresh the stay data or show success message
        alert('Tạo kế hoạch xuất viện thành công!');
    };

    const toggleGroupExpansion = (groupId) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    const handleHoldMedication = (medication) => {
        setSelectedMedication(medication);
        setShowHoldModal(true);
    };

    const handleResumeMedication = (medication) => {
        setSelectedMedication(medication);
        setShowResumeModal(true);
    };

    const handleDiscontinueMedication = (medication) => {
        setSelectedMedication(medication);
        setShowDiscontinueModal(true);
    };

    const handleMedicationActionSuccess = () => {
        fetchMedicationOrderGroups();
    };

    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'ACTIVE': 'status-active',
            'PENDING': 'status-pending',
            'COMPLETED': 'status-completed',
            'HELD': 'status-held',
            'DISCONTINUED': 'status-discontinued',
            'DISCHARGED': 'status-discharged',
            'TRANSFERRED': 'status-transferred',
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

    if (loading) {
        return (
            <div className="inpatient-treatment-detail-page">
                <div className="loading-state">
                    <FiActivity className="spinner" />
                    <p>Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="inpatient-treatment-detail-page">
                <div className="error-state">
                    <FiAlertCircle />
                    <p>{error}</p>
                    <button onClick={() => navigate(-1)} className="btn-back">
                        <FiArrowLeft /> Quay lại
                    </button>
                </div>
            </div>
        );
    }

    if (!stay) {
        return (
            <div className="inpatient-treatment-detail-page">
                <div className="empty-state">
                    <FiAlertCircle />
                    <p>Không tìm thấy thông tin điều trị nội trú</p>
                    <button onClick={() => navigate(-1)} className="btn-back">
                        <FiArrowLeft /> Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="inpatient-treatment-detail-page">
            {/* Header */}
            <div className="page-header">
                <button onClick={() => navigate(-1)} className="btn-back">
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-content">
                    <FiActivity className="header-icon" />
                    <div>
                        <h1>Chi tiết Điều trị Nội trú</h1>
                        <p>Inpatient Stay ID: #{stay.inpatientStayId} | Encounter ID: #{stay.encounterId}</p>
                    </div>
                </div>
                <span className={`status-badge ${getStatusBadgeClass(stay.currentStatus)}`}>
                    {stay.statusDisplay || stay.currentStatus}
                </span>
            </div>

            {/* Patient Information */}
            <div className="info-section">
                <h2><FiUser /> Thông tin Bệnh nhân</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <label>Họ tên:</label>
                        <span>{stay.patientName}</span>
                    </div>
                    <div className="info-item">
                        <label>Mã bệnh nhân:</label>
                        <span>{stay.patientCode}</span>
                    </div>
                    <div className="info-item">
                        <label>Giới tính:</label>
                        <span>{stay.patientGender === 'MALE' ? 'Nam' : stay.patientGender === 'FEMALE' ? 'Nữ' : stay.patientGender}</span>
                    </div>
                    <div className="info-item">
                        <label>Tuổi:</label>
                        <span>{stay.patientAge} tuổi</span>
                    </div>
                    <div className="info-item">
                        <label>Nhóm máu:</label>
                        <span>{stay.bloodType || '-'}</span>
                    </div>
                    <div className="info-item">
                        <label>Dị ứng:</label>
                        <span>{stay.allergies || 'Không có'}</span>
                    </div>
                </div>
            </div>

            {/* Stay Information */}
            <div className="info-section">
                <h2><FiCalendar /> Thông tin Lưu trú</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <label>Giường:</label>
                        <span>{stay.bedDisplay || `${stay.bedNumber} - ${stay.roomNumber}`}</span>
                    </div>
                    <div className="info-item">
                        <label>Loại phòng:</label>
                        <span>{stay.roomType || '-'}</span>
                    </div>
                    <div className="info-item">
                        <label>Khoa:</label>
                        <span>{stay.departmentName}</span>
                    </div>
                    <div className="info-item">
                        <label>Ngày nhập viện:</label>
                        <span>{formatDate(stay.admissionDate)}</span>
                    </div>
                    <div className="info-item">
                        <label>Ngày xuất viện:</label>
                        <span>{formatDate(stay.dischargeDate)}</span>
                    </div>
                    <div className="info-item">
                        <label>Thời gian lưu trú:</label>
                        <span className="highlight">{stay.lengthOfStayDisplay || `${stay.lengthOfStay} ngày`}</span>
                    </div>
                    <div className="info-item">
                        <label>Loại nhập viện:</label>
                        <span>{stay.admissionTypeDisplay || stay.admissionType}</span>
                    </div>
                    <div className="info-item">
                        <label>Trạng thái:</label>
                        <span className={getStatusBadgeClass(stay.currentStatus)}>
                            {stay.statusDisplay || stay.currentStatus}
                        </span>
                    </div>
                </div>
            </div>

            {/* Medical Information */}
            <div className="info-section">
                <h2><FiFileText /> Thông tin Y tế</h2>
                <div className="diagnosis-box">
                    <label>Chẩn đoán nhập viện:</label>
                    <p>{stay.admissionDiagnosis}</p>
                </div>
                <div className="info-grid">
                    <div className="info-item">
                        <label>Bác sĩ điều trị:</label>
                        <span>{stay.attendingDoctorName}</span>
                    </div>
                    <div className="info-item">
                        <label>Chuyên khoa:</label>
                        <span>{stay.attendingDoctorSpecialization || '-'}</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="action-section">
                <h2>Thao tác</h2>
                <div className="action-buttons">
                    <button
                        className="btn-action btn-medication-group"
                        onClick={() => navigate(`/staff/bac-si/dieu-tri-noi-tru/${inpatientStayId}/tao-nhom-y-lenh`)}
                    >
                        <FiPlusCircle />
                        <span>Tạo nhóm y lệnh</span>
                    </button>
                    <button
                        className="btn-action btn-medication-single"
                        onClick={() => navigate(`/staff/bac-si/dieu-tri-noi-tru/${inpatientStayId}/tao-y-lenh-le`)}
                    >
                        <FiPackage />
                        <span>Thêm y lệnh lẻ</span>
                    </button>
                    <button className="btn-action btn-transfer-hospital">
                        <FiTruck />
                        <span>Tạo yêu cầu chuyển viện</span>
                    </button>
                    <button className="btn-action btn-transfer-bed">
                        <FiMove />
                        <span>Tạo yêu cầu chuyển giường</span>
                    </button>
                    { isDischarged && (
                        <button
                            className="btn-action btn-discharge"
                            onClick={() => setShowDischargePlanModal(true)}
                        >
                            <FiLogOut/>
                            <span>Tạo yêu cầu xuất viện</span>
                        </button>
                        )
                    }
                </div>
            </div>

            {/* Medication Order Groups Section */}
            <div className="medication-groups-section">
                <div className="section-header">
                    <h2><FiList /> Danh sách nhóm y lệnh</h2>
                </div>

                {loadingGroups ? (
                    <div className="loading-state-inline">
                        <p>Đang tải danh sách nhóm y lệnh...</p>
                    </div>
                ) : groupsError ? (
                    <div className="error-state-inline">
                        <FiAlertCircle />
                        <p>{groupsError}</p>
                    </div>
                ) : medicationOrderGroups.length === 0 ? (
                    <div className="empty-state-inline">
                        <FiAlertCircle />
                        <p>Chưa có nhóm y lệnh nào</p>
                    </div>
                ) : (
                    <div className="medication-groups-list">
                        {medicationOrderGroups.map((group) => (
                            <div key={group.medicationOrderGroupId} className="medication-group-card">
                                <div className="group-header">
                                    <div className="group-info">
                                        <h3>
                                            Nhóm y lệnh #{group.medicationOrderGroupId}
                                            <span className={`status-badge ${getStatusBadgeClass(group.status)}`}>
                                                {group.status}
                                            </span>
                                            <span className={`priority-badge ${getPriorityBadgeClass(group.priority)}`}>
                                                {group.priority}
                                            </span>
                                            {group.isStat && (
                                                <span className="stat-badge">STAT</span>
                                            )}
                                        </h3>
                                        <div className="group-meta">
                                            <span><FiClock /> {formatDateTime(group.orderDate)}</span>
                                            <span><FiUser /> {group.orderedByDoctorName}</span>
                                            <span><FiPackage /> {group.medicationCount} thuốc</span>
                                        </div>
                                    </div>
                                    <button
                                        className="btn-expand"
                                        onClick={() => toggleGroupExpansion(group.medicationOrderGroupId)}
                                    >
                                        {expandedGroups[group.medicationOrderGroupId] ? '▼' : '▶'}
                                    </button>
                                </div>

                                {group.orderNotes && (
                                    <div className="group-notes">
                                        <strong>Ghi chú:</strong> {group.orderNotes}
                                    </div>
                                )}

                                {expandedGroups[group.medicationOrderGroupId] && (
                                    <div className="medications-list">
                                        <h4>Danh sách thuốc:</h4>
                                        {group.medications && group.medications.map((medication) => (
                                            <div key={medication.medicationOrderId} className="medication-item-card">
                                                <div className="medication-details">
                                                    <div className="medication-name">
                                                        <strong>{medication.medicineName}</strong>
                                                        <span className={`status-badge ${getStatusBadgeClass(medication.status)}`}>
                                                            {medication.statusDisplay || medication.status}
                                                        </span>
                                                    </div>
                                                    <div className="medication-info-grid">
                                                        <div className="info-item">
                                                            <label>Liều lượng:</label>
                                                            <span>{medication.dosage}</span>
                                                        </div>
                                                        <div className="info-item">
                                                            <label>Đường dùng:</label>
                                                            <span>{medication.routeDisplay || medication.route}</span>
                                                        </div>
                                                        <div className="info-item">
                                                            <label>Tần suất:</label>
                                                            <span>{medication.frequency}</span>
                                                        </div>
                                                        <div className="info-item">
                                                            <label>Số lượng:</label>
                                                            <span>{medication.quantityOrdered}</span>
                                                        </div>
                                                        {medication.isPrn && (
                                                            <div className="info-item">
                                                                <span className="badge-prn">PRN</span>
                                                            </div>
                                                        )}
                                                        {medication.isStat && (
                                                            <div className="info-item">
                                                                <span className="badge-stat">STAT</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="medication-actions">
                                                    <button
                                                        className="btn-action-small btn-view"
                                                        onClick={() => alert(`View details for medication ${medication.medicationOrderId}`)}
                                                        title="Xem chi tiết"
                                                    >
                                                        <FiEye />
                                                    </button>
                                                    {medication.status !== 'HELD' && medication.status !== 'DISCONTINUED' && (
                                                        <button
                                                            className="btn-action-small btn-hold"
                                                            onClick={() => handleHoldMedication(medication)}
                                                            title="Tạm dừng"
                                                        >
                                                            <FiPause />
                                                        </button>
                                                    )}
                                                    {medication.status === 'HELD' && (
                                                        <button
                                                            className="btn-action-small btn-resume"
                                                            onClick={() => handleResumeMedication(medication)}
                                                            title="Tiếp tục"
                                                        >
                                                            <FiPlay />
                                                        </button>
                                                    )}
                                                    {medication.status !== 'DISCONTINUED' && (
                                                        <button
                                                            className="btn-action-small btn-discontinue"
                                                            onClick={() => handleDiscontinueMedication(medication)}
                                                            title="Ngừng y lệnh"
                                                        >
                                                            <FiXCircle />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            <CreateDischargePlanModal
                isOpen={showDischargePlanModal}
                onClose={() => setShowDischargePlanModal(false)}
                inpatientStayId={stay.inpatientStayId}
                onSuccess={handleDischargePlanSuccess}
            />

            <HoldMedicationModal
                isOpen={showHoldModal}
                onClose={() => setShowHoldModal(false)}
                medicationOrder={selectedMedication}
                onSuccess={handleMedicationActionSuccess}
            />

            <ResumeMedicationModal
                isOpen={showResumeModal}
                onClose={() => setShowResumeModal(false)}
                medicationOrder={selectedMedication}
                onSuccess={handleMedicationActionSuccess}
            />

            <DiscontinueMedicationModal
                isOpen={showDiscontinueModal}
                onClose={() => setShowDiscontinueModal(false)}
                medicationOrder={selectedMedication}
                onSuccess={handleMedicationActionSuccess}
            />
        </div>
    );
};

export default InpatientTreatmentDetailPage;

