import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { receptionistEmergencyAPI } from '../../../../services/staff/receptionistAPI';
import {
    FiArrowLeft, FiRefreshCw, FiUser, FiClock, FiActivity,
    FiHeart, FiAlertCircle, FiTruck, FiPhone, FiFileText,
    FiCalendar, FiAlertTriangle
} from 'react-icons/fi';
import './EmergencyDetailPage.css';

const EmergencyDetailPage = () => {
    const { emergencyEncounterId } = useParams();
    const navigate = useNavigate();
    const [emergency, setEmergency] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEmergencyDetail();
    }, [emergencyEncounterId]);

    const fetchEmergencyDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await receptionistEmergencyAPI.getEmergencyDetail(emergencyEncounterId);

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
        navigate('/staff/le-tan/cap-cuu');
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
        </div>
    );
};

export default EmergencyDetailPage;
