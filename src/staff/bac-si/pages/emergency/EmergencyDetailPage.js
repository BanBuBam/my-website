import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorEmergencyAPI, employeeAPI } from '../../../../services/staff/doctorAPI';
import {
    FiArrowLeft, FiRefreshCw, FiUser, FiClock, FiActivity,
    FiHeart, FiAlertCircle, FiTruck, FiPhone, FiFileText,
    FiCalendar, FiAlertTriangle, FiUserPlus, FiX, FiCheck
} from 'react-icons/fi';
import './EmergencyDetailPage.css';

const EmergencyDetailPage = () => {
    const { emergencyEncounterId } = useParams();
    const navigate = useNavigate();
    const [emergency, setEmergency] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Assign nurse modal state
    const [showAssignNurseModal, setShowAssignNurseModal] = useState(false);
    const [nurses, setNurses] = useState([]);
    const [selectedNurseId, setSelectedNurseId] = useState('');
    const [assigningNurse, setAssigningNurse] = useState(false);
    const [assignError, setAssignError] = useState(null);

    // Assign doctor modal state
    const [showAssignDoctorModal, setShowAssignDoctorModal] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [assigningDoctor, setAssigningDoctor] = useState(false);
    const [assignDoctorError, setAssignDoctorError] = useState(null);

    useEffect(() => {
        fetchEmergencyDetail();
    }, [emergencyEncounterId]);

    const fetchEmergencyDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await doctorEmergencyAPI.getEmergencyDetail(emergencyEncounterId);

            if (response && response.data) {
                setEmergency(response.data);
            }
        } catch (err) {
            console.error('Error fetching emergency detail:', err);
            setError(err.message || 'Không thể tải thông tin cấp cứu');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/staff/bac-si/cap-cuu');
    };

    const handleOpenAssignNurseModal = async () => {
        setShowAssignNurseModal(true);
        setAssignError(null);
        try {
            const response = await employeeAPI.getNurses(0, 100);
            if (response && response.data && response.data.content) {
                // Filter only active nurses
                const activeNurses = response.data.content.filter(nurse => nurse.isActive);
                setNurses(activeNurses);
            }
        } catch (err) {
            console.error('Error fetching nurses:', err);
            setAssignError('Không thể tải danh sách điều dưỡng');
        }
    };

    const handleCloseAssignNurseModal = () => {
        setShowAssignNurseModal(false);
        setSelectedNurseId('');
        setAssignError(null);
    };

    const handleAssignNurse = async () => {
        if (!selectedNurseId) {
            setAssignError('Vui lòng chọn điều dưỡng');
            return;
        }

        try {
            setAssigningNurse(true);
            setAssignError(null);
            const response = await doctorEmergencyAPI.assignNurse(emergencyEncounterId, parseInt(selectedNurseId));
            
            if (response && response.data) {
                setEmergency(response.data);
                handleCloseAssignNurseModal();
                alert('Phân công điều dưỡng thành công!');
            }
        } catch (err) {
            console.error('Error assigning nurse:', err);
            setAssignError(err.message || 'Không thể phân công điều dưỡng');
        } finally {
            setAssigningNurse(false);
        }
    };

    const handleOpenAssignDoctorModal = async () => {
        setShowAssignDoctorModal(true);
        setAssignDoctorError(null);
        try {
            const response = await employeeAPI.getDoctors(0, 100);
            if (response && response.data && response.data.content) {
                // Filter only active doctors
                const activeDoctors = response.data.content.filter(doctor => doctor.isActive);
                setDoctors(activeDoctors);
            }
        } catch (err) {
            console.error('Error fetching doctors:', err);
            setAssignDoctorError('Không thể tải danh sách bác sĩ');
        }
    };

    const handleCloseAssignDoctorModal = () => {
        setShowAssignDoctorModal(false);
        setSelectedDoctorId('');
        setAssignDoctorError(null);
    };

    const handleAssignDoctor = async () => {
        if (!selectedDoctorId) {
            setAssignDoctorError('Vui lòng chọn bác sĩ');
            return;
        }

        try {
            setAssigningDoctor(true);
            setAssignDoctorError(null);
            const response = await doctorEmergencyAPI.assignDoctor(emergencyEncounterId, parseInt(selectedDoctorId));
            
            if (response && response.data) {
                setEmergency(response.data);
                handleCloseAssignDoctorModal();
                alert('Phân công bác sĩ thành công!');
            }
        } catch (err) {
            console.error('Error assigning doctor:', err);
            setAssignDoctorError(err.message || 'Không thể phân công bác sĩ');
        } finally {
            setAssigningDoctor(false);
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
            minute: '2-digit',
        });
    };

    const getCategoryBadgeClass = (colorCode) => {
        const colorMap = {
            'RED': 'category-red',
            'ORANGE': 'category-orange',
            'YELLOW': 'category-yellow',
            'GREEN': 'category-green',
            'BLUE': 'category-blue',
        };
        return colorMap[colorCode] || 'category-default';
    };

    const getStatusBadgeClass = (statusColor) => {
        const colorMap = {
            'red': 'status-red',
            'orange': 'status-orange',
            'yellow': 'status-yellow',
            'green': 'status-green',
            'blue': 'status-blue',
            'gray': 'status-gray',
        };
        return colorMap[statusColor] || 'status-default';
    };

    if (loading) {
        return (
            <div className="emergency-detail-page">
                <div className="loading-container">
                    <FiRefreshCw className="spinner" />
                    <p>Đang tải thông tin cấp cứu...</p>
                </div>
            </div>
        );
    }

    if (error || !emergency) {
        return (
            <div className="emergency-detail-page">
                <div className="error-container">
                    <FiAlertCircle className="error-icon" />
                    <p>{error || 'Không tìm thấy thông tin cấp cứu'}</p>
                    <button className="btn-back" onClick={handleBack}>
                        <FiArrowLeft /> Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="emergency-detail-page">
            {/* Header */}
            <div className="page-header">
                <button className="btn-back" onClick={handleBack}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-title">
                    <h1>Chi tiết Cấp cứu</h1>
                    <p>Emergency Encounter ID: {emergency.emergencyEncounterId}</p>
                </div>
                <div className="header-actions">
                    <button className="btn-assign-doctor" onClick={handleOpenAssignDoctorModal}>
                        <FiUserPlus /> Phân công Bác sĩ
                    </button>
                    <button className="btn-assign-nurse" onClick={handleOpenAssignNurseModal}>
                        <FiUserPlus /> Phân công Điều dưỡng
                    </button>
                    <button className="btn-refresh" onClick={fetchEmergencyDetail}>
                        <FiRefreshCw /> Làm mới
                    </button>
                </div>
            </div>

            {/* Status Banner */}
            <div className="status-banner">
                <div className="banner-left">
                    <span className={`category-badge ${getCategoryBadgeClass(emergency.colorCode)}`}>
                        {emergency.emergencyCategoryIcon && <span className="category-icon">{emergency.emergencyCategoryIcon}</span>}
                        {emergency.emergencyCategoryDisplay}
                    </span>
                    <span className={`status-badge ${getStatusBadgeClass(emergency.statusColor)}`}>
                        {emergency.statusDisplay}
                    </span>
                </div>
                <div className="banner-right">
                    <div className="priority-info">
                        <span className="priority-label">Độ ưu tiên:</span>
                        <span className="priority-value">{emergency.priorityScore}</span>
                    </div>
                </div>
            </div>

            {/* Alerts Section */}
            {(emergency.isLifeThreatening || emergency.requiresImmediateAttention || emergency.isWaitTimeExceeded) && (
                <div className="alerts-banner">
                    {emergency.isLifeThreatening && (
                        <div className="alert-item critical">
                            <FiAlertTriangle />
                            <span>NGUY KỊCH - Cần xử lý khẩn cấp</span>
                        </div>
                    )}
                    {emergency.requiresImmediateAttention && (
                        <div className="alert-item urgent">
                            <FiClock />
                            <span>Cần xử lý ngay lập tức</span>
                        </div>
                    )}
                    {emergency.isWaitTimeExceeded && (
                        <div className="alert-item exceeded">
                            <FiAlertCircle />
                            <span>Đã quá thời gian chờ tối đa ({emergency.maxWaitTimeMinutes} phút)</span>
                        </div>
                    )}
                </div>
            )}

            {/* Main Content */}
            <div className="content-grid">
                {/* Patient Information */}
                <div className="info-card">
                    <div className="card-header">
                        <FiUser />
                        <h3>Thông tin Bệnh nhân</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="label">Họ tên:</span>
                            <span className="value">{emergency.patientName}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Mã bệnh nhân:</span>
                            <span className="value">{emergency.patientCode}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Encounter ID:</span>
                            <span className="value">{emergency.encounterId}</span>
                        </div>
                    </div>
                </div>

                {/* Emergency Information */}
                <div className="info-card">
                    <div className="card-header">
                        <FiTruck />
                        <h3>Thông tin Cấp cứu</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="label">Phương thức đến:</span>
                            <span className="value">{emergency.arrivalMethod || '-'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Thời gian đến:</span>
                            <span className="value">{formatDateTime(emergency.arrivalTime)}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Thời gian chờ:</span>
                            <span className={`value ${emergency.isWaitTimeExceeded ? 'exceeded' : ''}`}>
                                {emergency.waitTimeMinutes} phút
                                {emergency.isWaitTimeExceeded && ' (Quá hạn)'}
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="label">Người đi cùng:</span>
                            <span className="value">{emergency.accompaniedBy || '-'}</span>
                        </div>
                        {emergency.arrivedByAmbulance && (
                            <div className="info-row">
                                <span className="badge-ambulance">
                                    <FiTruck /> Đến bằng xe cứu thương
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact Information */}
                <div className="info-card">
                    <div className="card-header">
                        <FiPhone />
                        <h3>Liên hệ Khẩn cấp</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="label">Tên người liên hệ:</span>
                            <span className="value">{emergency.emergencyContactName || '-'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Số điện thoại:</span>
                            <span className="value">{emergency.emergencyContactPhone || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Medical Assessment */}
                <div className="info-card">
                    <div className="card-header">
                        <FiActivity />
                        <h3>Đánh giá Y tế</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="label">Lý do khám:</span>
                            <span className="value">{emergency.chiefComplaint || '-'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Đánh giá ban đầu:</span>
                            <span className="value">{emergency.initialAssessment || '-'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Dấu hiệu sinh tồn:</span>
                            <span className="value">{emergency.vitalSigns || '-'}</span>
                        </div>
                        {emergency.painScore > 0 && (
                            <div className="info-row">
                                <span className="label">Điểm đau:</span>
                                <span className="value pain-score">
                                    <FiHeart /> {emergency.painScore}/10
                                    {emergency.hasSeverePain && ' (Đau nghiêm trọng)'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Staff Assignment */}
                <div className="info-card">
                    <div className="card-header">
                        <FiUser />
                        <h3>Phân công Nhân viên</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="label">Y tá phân loại:</span>
                            <span className="value">
                                {emergency.triageNurseName || '-'}
                                {emergency.triageNurseId && ` (ID: ${emergency.triageNurseId})`}
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="label">Bác sĩ phụ trách:</span>
                            <span className="value">
                                {emergency.assignedDoctorName || '-'}
                                {emergency.assignedDoctorId && ` (ID: ${emergency.assignedDoctorId})`}
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="label">Trạng thái phân loại:</span>
                            <span className={`value ${emergency.isTriageComplete ? 'completed' : 'pending'}`}>
                                {emergency.isTriageComplete ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="label">Đã phân công bác sĩ:</span>
                            <span className={`value ${emergency.isDoctorAssigned ? 'completed' : 'pending'}`}>
                                {emergency.isDoctorAssigned ? 'Có' : 'Chưa'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Insurance & Billing */}
                <div className="info-card">
                    <div className="card-header">
                        <FiFileText />
                        <h3>Bảo hiểm & Thanh toán</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="label">Có bảo hiểm:</span>
                            <span className={`value ${emergency.hasInsurance ? 'yes' : 'no'}`}>
                                {emergency.hasInsurance ? 'Có' : 'Không'}
                            </span>
                        </div>
                        {emergency.hasInsurance && (
                            <>
                                <div className="info-row">
                                    <span className="label">Số thẻ BHYT:</span>
                                    <span className="value">{emergency.insuranceCardNumber || '-'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Tỷ lệ chi trả:</span>
                                    <span className="value">{emergency.insuranceCoveragePercent}%</span>
                                </div>
                            </>
                        )}
                        <div className="info-row">
                            <span className="label">Loại thanh toán:</span>
                            <span className="value">{emergency.billingTypeDisplay || emergency.billingType || '-'}</span>
                        </div>
                        {emergency.invoiceId && (
                            <div className="info-row">
                                <span className="label">Invoice ID:</span>
                                <span className="value">{emergency.invoiceId}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Discharge Information */}
                {(emergency.dischargeSummary || emergency.dischargeInstructions || emergency.dischargeMedications) && (
                    <div className="info-card full-width">
                        <div className="card-header">
                            <FiFileText />
                            <h3>Thông tin Xuất viện</h3>
                        </div>
                        <div className="card-body">
                            {emergency.dischargeSummary && (
                                <div className="info-row">
                                    <span className="label">Tóm tắt xuất viện:</span>
                                    <span className="value">{emergency.dischargeSummary}</span>
                                </div>
                            )}
                            {emergency.dischargeInstructions && (
                                <div className="info-row">
                                    <span className="label">Hướng dẫn xuất viện:</span>
                                    <span className="value">{emergency.dischargeInstructions}</span>
                                </div>
                            )}
                            {emergency.dischargeMedications && (
                                <div className="info-row">
                                    <span className="label">Thuốc xuất viện:</span>
                                    <span className="value">{emergency.dischargeMedications}</span>
                                </div>
                            )}
                            {emergency.prescriptionId && (
                                <div className="info-row">
                                    <span className="label">Prescription ID:</span>
                                    <span className="value">{emergency.prescriptionId}</span>
                                </div>
                            )}
                            {emergency.hospitalReferralCode && (
                                <div className="info-row">
                                    <span className="label">Mã chuyển viện:</span>
                                    <span className="value">{emergency.hospitalReferralCode}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Timeline */}
                <div className="info-card full-width">
                    <div className="card-header">
                        <FiCalendar />
                        <h3>Thời gian</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="label">Thời gian tạo:</span>
                            <span className="value">{formatDateTime(emergency.createdAt)}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Cập nhật lần cuối:</span>
                            <span className="value">{formatDateTime(emergency.updatedAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Summary */}
                {emergency.summary && (
                    <div className="info-card full-width">
                        <div className="card-header">
                            <FiFileText />
                            <h3>Tóm tắt</h3>
                        </div>
                        <div className="card-body">
                            <p className="summary-text">{emergency.summary}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Assign Nurse Modal */}
            {showAssignNurseModal && (
                <div className="modal-overlay" onClick={handleCloseAssignNurseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                <FiUserPlus /> Phân công Điều dưỡng
                            </h3>
                            <button className="btn-close" onClick={handleCloseAssignNurseModal}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body">
                            {assignError && (
                                <div className="error-message">
                                    <FiAlertCircle />
                                    <span>{assignError}</span>
                                </div>
                            )}
                            
                            <div className="form-group">
                                <label htmlFor="nurseSelect">
                                    Chọn Điều dưỡng <span className="required">*</span>
                                </label>
                                <select
                                    id="nurseSelect"
                                    value={selectedNurseId}
                                    onChange={(e) => setSelectedNurseId(e.target.value)}
                                    disabled={assigningNurse}
                                >
                                    <option value="">-- Chọn điều dưỡng --</option>
                                    {nurses.map((nurse) => (
                                        <option key={nurse.id} value={nurse.id}>
                                            {nurse.fullName} - {nurse.employeeCode} ({nurse.departmentName})
                                        </option>
                                    ))}
                                </select>
                                {nurses.length === 0 && !assignError && (
                                    <small className="text-muted">Đang tải danh sách điều dưỡng...</small>
                                )}
                            </div>

                            {emergency.triageNurseName && (
                                <div className="current-nurse-info">
                                    <FiUser />
                                    <span>Điều dưỡng hiện tại: <strong>{emergency.triageNurseName}</strong></span>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-cancel"
                                onClick={handleCloseAssignNurseModal}
                                disabled={assigningNurse}
                            >
                                <FiX /> Hủy
                            </button>
                            <button
                                className="btn-submit"
                                onClick={handleAssignNurse}
                                disabled={assigningNurse || !selectedNurseId}
                            >
                                <FiCheck />
                                {assigningNurse ? 'Đang phân công...' : 'Phân công'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Doctor Modal */}
            {showAssignDoctorModal && (
                <div className="modal-overlay" onClick={handleCloseAssignDoctorModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                <FiUserPlus /> Phân công Bác sĩ
                            </h3>
                            <button className="btn-close" onClick={handleCloseAssignDoctorModal}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body">
                            {assignDoctorError && (
                                <div className="error-message">
                                    <FiAlertCircle />
                                    <span>{assignDoctorError}</span>
                                </div>
                            )}
                            
                            <div className="form-group">
                                <label htmlFor="doctorSelect">
                                    Chọn Bác sĩ <span className="required">*</span>
                                </label>
                                <select
                                    id="doctorSelect"
                                    value={selectedDoctorId}
                                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                                    disabled={assigningDoctor}
                                >
                                    <option value="">-- Chọn bác sĩ --</option>
                                    {doctors.map((doctor) => (
                                        <option key={doctor.id} value={doctor.id}>
                                            {doctor.fullName} - {doctor.employeeCode} ({doctor.specialization || doctor.departmentName})
                                        </option>
                                    ))}
                                </select>
                                {doctors.length === 0 && !assignDoctorError && (
                                    <small className="text-muted">Đang tải danh sách bác sĩ...</small>
                                )}
                            </div>

                            {emergency.assignedDoctorName && (
                                <div className="current-nurse-info">
                                    <FiUser />
                                    <span>Bác sĩ hiện tại: <strong>{emergency.assignedDoctorName}</strong></span>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-cancel"
                                onClick={handleCloseAssignDoctorModal}
                                disabled={assigningDoctor}
                            >
                                <FiX /> Hủy
                            </button>
                            <button
                                className="btn-submit"
                                onClick={handleAssignDoctor}
                                disabled={assigningDoctor || !selectedDoctorId}
                            >
                                <FiCheck />
                                {assigningDoctor ? 'Đang phân công...' : 'Phân công'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmergencyDetailPage;
