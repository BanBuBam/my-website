import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { receptionistEncounterAPI } from '../../../../services/staff/receptionistAPI';
import {
    FiArrowLeft, FiRefreshCw, FiUser, FiCalendar, FiActivity,
    FiMapPin, FiAlertCircle, FiFileText, FiPlus
} from 'react-icons/fi';
import './EncounterDetailPage.css';

const EncounterDetailPage = () => {
    const { encounterId } = useParams();
    const navigate = useNavigate();
    const [encounter, setEncounter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEncounterDetail();
    }, [encounterId]);

    const fetchEncounterDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await receptionistEncounterAPI.getEncounterDetail(encounterId);

            if (response && response.data) {
                setEncounter(response.data);
            }
        } catch (err) {
            console.error('Error fetching encounter detail:', err);
            setError(err.message || 'Không thể tải thông tin encounter');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/staff/le-tan/cap-cuu');
    };

    const handleCreateEmergency = () => {
        // TODO: Navigate to create emergency page or open modal
        alert('Chức năng tạo Emergency đang được phát triển');
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

    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'PLANNED': 'status-planned',
            'ARRIVED': 'status-arrived',
            'IN_PROGRESS': 'status-in-progress',
            'FINISHED': 'status-finished',
            'CANCELLED': 'status-cancelled',
        };
        return statusMap[status] || 'status-default';
    };

    if (loading) {
        return (
            <div className="encounter-detail-page">
                <div className="loading-container">
                    <FiRefreshCw className="spinner" />
                    <p>Đang tải thông tin encounter...</p>
                </div>
            </div>
        );
    }

    if (error || !encounter) {
        return (
            <div className="encounter-detail-page">
                <div className="error-container">
                    <FiAlertCircle className="error-icon" />
                    <p>{error || 'Không tìm thấy thông tin encounter'}</p>
                    <button className="btn-back" onClick={handleBack}>
                        <FiArrowLeft /> Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="encounter-detail-page">
            {/* Header */}
            <div className="page-header">
                <button className="btn-back" onClick={handleBack}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-title">
                    <h1>Chi tiết Encounter</h1>
                    <p>Encounter ID: {encounter.encounterId}</p>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={fetchEncounterDetail}>
                        <FiRefreshCw /> Làm mới
                    </button>
                    <button className="btn-create-emergency" onClick={handleCreateEmergency}>
                        <FiPlus /> Tạo Emergency
                    </button>
                </div>
            </div>

            {/* Status Banner */}
            <div className="status-banner">
                <div className="banner-left">
                    <span className={`status-badge ${getStatusBadgeClass(encounter.status)}`}>
                        {encounter.statusDescription || encounter.status}
                    </span>
                    {encounter.encounterType && (
                        <span className="type-badge">{encounter.encounterType}</span>
                    )}
                </div>
                <div className="banner-right">
                    {encounter.nextPossibleActions && encounter.nextPossibleActions.length > 0 && (
                        <div className="actions-info">
                            <span className="actions-label">Hành động có thể:</span>
                            <div className="actions-list">
                                {encounter.nextPossibleActions.map((action, index) => (
                                    <span key={index} className="action-badge">{action}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Flags */}
            {(encounter.canCheckIn || encounter.canDischarge || encounter.canCancel) && (
                <div className="action-flags">
                    {encounter.canCheckIn && (
                        <div className="flag-item can-checkin">
                            <FiActivity /> Có thể Check-in
                        </div>
                    )}
                    {encounter.canDischarge && (
                        <div className="flag-item can-discharge">
                            <FiFileText /> Có thể Xuất viện
                        </div>
                    )}
                    {encounter.canCancel && (
                        <div className="flag-item can-cancel">
                            <FiAlertCircle /> Có thể Hủy
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
                            <span className="value">{encounter.patientName}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Mã bệnh nhân:</span>
                            <span className="value">{encounter.patientCode}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Patient ID:</span>
                            <span className="value">{encounter.patientId}</span>
                        </div>
                    </div>
                </div>

                {/* Encounter Information */}
                <div className="info-card">
                    <div className="card-header">
                        <FiActivity />
                        <h3>Thông tin Encounter</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="label">Loại encounter:</span>
                            <span className="value">{encounter.encounterType || '-'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Loại khám:</span>
                            <span className="value">{encounter.visitType || '-'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Kết quả:</span>
                            <span className="value">{encounter.disposition || '-'}</span>
                        </div>
                        {encounter.bookingId && (
                            <div className="info-row">
                                <span className="label">Booking ID:</span>
                                <span className="value">{encounter.bookingId}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Department & Location */}
                <div className="info-card">
                    <div className="card-header">
                        <FiMapPin />
                        <h3>Khoa & Vị trí</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="label">Khoa:</span>
                            <span className="value">{encounter.departmentName || '-'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Department ID:</span>
                            <span className="value">{encounter.departmentId || '-'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Vị trí:</span>
                            <span className="value">{encounter.location || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="info-card">
                    <div className="card-header">
                        <FiCalendar />
                        <h3>Thời gian</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="label">Thời gian bắt đầu:</span>
                            <span className="value">{formatDateTime(encounter.startDatetime)}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Thời gian kết thúc:</span>
                            <span className="value">{formatDateTime(encounter.endDatetime)}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Thời gian tạo:</span>
                            <span className="value">{formatDateTime(encounter.createdAt)}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Cập nhật lần cuối:</span>
                            <span className="value">{formatDateTime(encounter.updatedAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Created By */}
                <div className="info-card">
                    <div className="card-header">
                        <FiUser />
                        <h3>Người tạo</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="label">Tên nhân viên:</span>
                            <span className="value">{encounter.createdByEmployeeName || '-'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Employee ID:</span>
                            <span className="value">{encounter.createdByEmployeeId || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Version Info */}
                <div className="info-card">
                    <div className="card-header">
                        <FiFileText />
                        <h3>Thông tin Phiên bản</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="label">Version:</span>
                            <span className="value">{encounter.version}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EncounterDetailPage;
