import React, { useState, useEffect } from 'react';
import './EncounterManagementPage.css';
import {
    FiRefreshCw, FiUser, FiClock, FiActivity, FiCalendar,
    FiAlertCircle, FiCheckCircle, FiMapPin, FiFileText
} from 'react-icons/fi';
import { doctorEncounterAPI } from '../../../../services/staff/doctorAPI';

const EncounterManagementPage = () => {
    const [encounters, setEncounters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load encounters on component mount
    useEffect(() => {
        fetchEncounters();
    }, []);

    const fetchEncounters = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get doctorId from localStorage
            const userInfo = JSON.parse(localStorage.getItem('staffUserInfo') || '{}');
            const doctorId = userInfo.employeeId;

            if (!doctorId) {
                throw new Error('Không tìm thấy thông tin bác sĩ');
            }

            const response = await doctorEncounterAPI.getEncountersByDoctor(doctorId);

            if (response && response.data) {
                setEncounters(response.data);
            }
        } catch (err) {
            console.error('Error fetching encounters:', err);
            setError(err.message || 'Không thể tải danh sách encounters');
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '';
        const date = new Date(dateTimeString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'CHECKED_IN': { class: 'badge-checked-in', icon: <FiCheckCircle />, text: 'Đã check-in' },
            'IN_PROGRESS': { class: 'badge-in-progress', icon: <FiActivity />, text: 'Đang khám' },
            'COMPLETED': { class: 'badge-completed', icon: <FiCheckCircle />, text: 'Hoàn thành' },
            'CANCELLED': { class: 'badge-cancelled', icon: <FiAlertCircle />, text: 'Đã hủy' },
            'DISCHARGED': { class: 'badge-discharged', icon: <FiCheckCircle />, text: 'Đã xuất viện' },
        };

        const statusInfo = statusMap[status] || { class: 'badge-default', icon: <FiAlertCircle />, text: status };

        return (
            <span className={`status-badge ${statusInfo.class}`}>
                {statusInfo.icon}
                {statusInfo.text}
            </span>
        );
    };

    const getEncounterTypeDisplay = (type) => {
        const typeMap = {
            'OUTPATIENT': 'Ngoại trú',
            'INPATIENT': 'Nội trú',
            'EMERGENCY': 'Cấp cứu',
        };
        return typeMap[type] || type;
    };

    return (
        <div className="encounter-management-page">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h2>Quản lý Encounters</h2>
                    <p>Danh sách encounters được phân công cho bác sĩ</p>
                </div>
                <button className="btn-refresh" onClick={fetchEncounters} disabled={loading}>
                    <FiRefreshCw className={loading ? 'spinning' : ''} />
                    {loading ? 'Đang tải...' : 'Làm mới'}
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="error-message">
                    <FiAlertCircle />
                    <span>{error}</span>
                </div>
            )}

            {/* Loading State */}
            {loading && encounters.length === 0 && (
                <div className="loading-state">
                    <FiRefreshCw className="spinning" />
                    <p>Đang tải danh sách encounters...</p>
                </div>
            )}

            {/* Encounters List */}
            {!loading && encounters.length === 0 && !error && (
                <div className="empty-state">
                    <FiFileText />
                    <p>Không có encounter nào</p>
                </div>
            )}

            {encounters.length > 0 && (
                <div className="encounters-grid">
                    {encounters.map((encounter) => (
                        <div key={encounter.encounterId} className="encounter-card">
                            <div className="encounter-header">
                                <div className="encounter-id">
                                    <span className="label">Encounter ID:</span>
                                    <span className="value">#{encounter.encounterId}</span>
                                </div>
                                {getStatusBadge(encounter.status)}
                            </div>

                            <div className="encounter-body">
                                <div className="patient-info">
                                    <div className="info-row">
                                        <FiUser className="icon" />
                                        <div className="info-content">
                                            <span className="patient-name">{encounter.patientName}</span>
                                            <span className="patient-code">{encounter.patientCode}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="encounter-details">
                                    <div className="detail-item">
                                        <FiActivity className="icon" />
                                        <div>
                                            <span className="detail-label">Loại:</span>
                                            <span className="detail-value">{getEncounterTypeDisplay(encounter.encounterType)}</span>
                                        </div>
                                    </div>

                                    {encounter.visitType && (
                                        <div className="detail-item">
                                            <FiFileText className="icon" />
                                            <div>
                                                <span className="detail-label">Visit Type:</span>
                                                <span className="detail-value">{encounter.visitType}</span>
                                            </div>
                                        </div>
                                    )}

                                    {encounter.location && (
                                        <div className="detail-item">
                                            <FiMapPin className="icon" />
                                            <div>
                                                <span className="detail-label">Địa điểm:</span>
                                                <span className="detail-value">{encounter.location}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="detail-item">
                                        <FiClock className="icon" />
                                        <div>
                                            <span className="detail-label">Bắt đầu:</span>
                                            <span className="detail-value">{formatDateTime(encounter.startDatetime)}</span>
                                        </div>
                                    </div>

                                    {encounter.endDatetime && (
                                        <div className="detail-item">
                                            <FiCheckCircle className="icon" />
                                            <div>
                                                <span className="detail-label">Kết thúc:</span>
                                                <span className="detail-value">{formatDateTime(encounter.endDatetime)}</span>
                                            </div>
                                        </div>
                                    )}

                                    {encounter.chiefComplaint && (
                                        <div className="detail-item full-width">
                                            <FiAlertCircle className="icon" />
                                            <div>
                                                <span className="detail-label">Lý do khám:</span>
                                                <span className="detail-value">{encounter.chiefComplaint}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="encounter-footer">
                                <div className="footer-info">
                                    <span className="created-by">
                                        Tạo bởi: {encounter.createdByEmployeeName || 'N/A'}
                                    </span>
                                    {encounter.bookingId && (
                                        <span className="booking-id">
                                            Booking ID: #{encounter.bookingId}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Summary */}
            {encounters.length > 0 && (
                <div className="summary-section">
                    <div className="summary-card">
                        <span className="summary-label">Tổng số encounters:</span>
                        <span className="summary-value">{encounters.length}</span>
                    </div>
                    <div className="summary-card">
                        <span className="summary-label">Đang khám:</span>
                        <span className="summary-value">
                            {encounters.filter(e => e.status === 'IN_PROGRESS').length}
                        </span>
                    </div>
                    <div className="summary-card">
                        <span className="summary-label">Hoàn thành:</span>
                        <span className="summary-value">
                            {encounters.filter(e => e.status === 'COMPLETED').length}
                        </span>
                    </div>
                    <div className="summary-card">
                        <span className="summary-label">Đã check-in:</span>
                        <span className="summary-value">
                            {encounters.filter(e => e.status === 'CHECKED_IN').length}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EncounterManagementPage;

