import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorFollowUpAPI } from '../../../../services/staff/doctorAPI';
import {
    FiArrowLeft,
    FiUser,
    FiCalendar,
    FiAlertCircle,
    FiFileText,
    FiClock,
    FiPhone
} from 'react-icons/fi';
import './FollowUpDetailPage.css';

const FollowUpDetailPage = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [followUp, setFollowUp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFollowUpDetail();
    }, [appointmentId]);

    const fetchFollowUpDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await doctorFollowUpAPI.getFollowUpDetail(appointmentId);
            if (response && response.data) {
                setFollowUp(response.data);
            }
        } catch (err) {
            console.error('Error loading follow-up detail:', err);
            setError(err.message || 'Không thể tải thông tin tái khám');
        } finally {
            setLoading(false);
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
        return date.toLocaleString('vi-VN');
    };

    const getStatusDisplay = (status) => {
        const statusMap = {
            'SCHEDULED': 'Đã lên lịch',
            'COMPLETED': 'Đã hoàn thành',
            'CANCELLED': 'Đã hủy',
            'NO_SHOW': 'Không đến',
        };
        return statusMap[status] || status;
    };

    const getStatusClass = (status) => {
        const classMap = {
            'SCHEDULED': 'status-scheduled',
            'COMPLETED': 'status-completed',
            'CANCELLED': 'status-cancelled',
            'NO_SHOW': 'status-no-show',
        };
        return classMap[status] || '';
    };

    const getPriorityDisplay = (priority) => {
        const priorityMap = {
            'ROUTINE': 'Thường',
            'URGENT': 'Khẩn',
            'ASAP': 'Càng sớm càng tốt',
        };
        return priorityMap[priority] || priority;
    };

    if (loading) {
        return (
            <div className="follow-up-detail-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    if (error || !followUp) {
        return (
            <div className="follow-up-detail-page">
                <div className="error-state">
                    <FiAlertCircle />
                    <p>{error || 'Không tìm thấy thông tin tái khám'}</p>
                    <button onClick={() => navigate(-1)} className="btn-back-error">
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="follow-up-detail-page">
            <div className="page-header">
                <button onClick={() => navigate(-1)} className="btn-back">
                    <FiArrowLeft /> Quay lại
                </button>
                <h1>Chi tiết Tái khám</h1>
                <span className={`status-badge ${getStatusClass(followUp.status)}`}>
                    {getStatusDisplay(followUp.status)}
                </span>
            </div>

            <div className="detail-content">
                {/* Patient Information */}
                <div className="info-card">
                    <div className="card-header">
                        <FiUser />
                        <h2>Thông tin Bệnh nhân</h2>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="label">Họ tên:</span>
                            <span className="value">{followUp.patientName}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Mã bệnh nhân:</span>
                            <span className="value">{followUp.patientId}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Số điện thoại:</span>
                            <span className="value">
                                <FiPhone /> {followUp.patientPhone}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Appointment Information */}
                <div className="info-card">
                    <div className="card-header">
                        <FiCalendar />
                        <h2>Thông tin Lịch tái khám</h2>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="label">Ngày tái khám:</span>
                            <span className="value highlight">{formatDate(followUp.reExaminationDate)}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Độ ưu tiên:</span>
                            <span className="value">{getPriorityDisplay(followUp.priority)}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Lý do tái khám:</span>
                            <span className="value">{followUp.reason || '-'}</span>
                        </div>
                        {followUp.notes && (
                            <div className="notes-box">
                                <span className="label">Ghi chú:</span>
                                <p>{followUp.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Doctor Information */}
                <div className="info-card">
                    <div className="card-header">
                        <FiUser />
                        <h2>Thông tin Bác sĩ</h2>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="label">Bác sĩ:</span>
                            <span className="value">{followUp.doctorName}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Chuyên khoa:</span>
                            <span className="value">{followUp.doctorSpecialization || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Original Encounter Information */}
                <div className="info-card">
                    <div className="card-header">
                        <FiFileText />
                        <h2>Thông tin Lượt khám gốc</h2>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="label">Mã lượt khám:</span>
                            <span className="value">{followUp.originalEncounterId}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Loại lượt khám:</span>
                            <span className="value">{followUp.originalEncounterType || '-'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Ngày khám:</span>
                            <span className="value">{formatDateTime(followUp.originalEncounterDate)}</span>
                        </div>
                        {followUp.originalDiagnosis && (
                            <div className="diagnosis-box">
                                <span className="label">Chẩn đoán:</span>
                                <p>{followUp.originalDiagnosis}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Creation Information */}
                <div className="info-card">
                    <div className="card-header">
                        <FiClock />
                        <h2>Thông tin Tạo lịch</h2>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="label">Người tạo:</span>
                            <span className="value">{followUp.createdByEmployeeName}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Ngày tạo:</span>
                            <span className="value">{formatDateTime(followUp.createdAt)}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Cập nhật lần cuối:</span>
                            <span className="value">{formatDateTime(followUp.updatedAt)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FollowUpDetailPage;
