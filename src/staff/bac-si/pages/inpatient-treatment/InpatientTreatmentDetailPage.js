import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorInpatientTreatmentAPI } from '../../../../services/staff/doctorAPI';
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
    FiPlusCircle
} from 'react-icons/fi';
import CreateMedicationModal from './CreateMedicationModal';
import CreateDischargePlanModal from './CreateDischargePlanModal';
import './InpatientTreatmentDetailPage.css';

const InpatientTreatmentDetailPage = () => {
    const { inpatientStayId } = useParams();
    const navigate = useNavigate();
    const [stay, setStay] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMedicationModal, setShowMedicationModal] = useState(false);
    const [showDischargePlanModal, setShowDischargePlanModal] = useState(false);
    const [isDischarged, setIsDischarged] = useState(false);

    useEffect(() => {
        fetchStayDetail();
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

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'ACTIVE': 'status-active',
            'DISCHARGED': 'status-discharged',
            'TRANSFERRED': 'status-transferred',
        };
        return statusMap[status] || 'status-default';
    };

    const handleMedicationSuccess = () => {
        // Optionally refresh the stay data or show success message
        alert('Tạo lượt thuốc điều trị thành công!');
    };

    const handleDischargePlanSuccess = () => {
        // Optionally refresh the stay data or show success message
        alert('Tạo kế hoạch xuất viện thành công!');
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
                        className="btn-action btn-medication"
                        onClick={() => setShowMedicationModal(true)}
                    >
                        <FiPlusCircle />
                        <span>Tạo lượt thuốc điều trị</span>
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

            {/* Medication Modal */}
            <CreateMedicationModal
                isOpen={showMedicationModal}
                onClose={() => setShowMedicationModal(false)}
                inpatientStayId={stay.inpatientStayId}
                encounterId={stay.encounterId}
                onSuccess={handleMedicationSuccess}
            />

            {/* Discharge Plan Modal */}
            <CreateDischargePlanModal
                isOpen={showDischargePlanModal}
                onClose={() => setShowDischargePlanModal(false)}
                inpatientStayId={stay.inpatientStayId}
                onSuccess={handleDischargePlanSuccess}
            />
        </div>
    );
};

export default InpatientTreatmentDetailPage;

