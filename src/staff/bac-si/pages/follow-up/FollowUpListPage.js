import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorFollowUpAPI } from '../../../../services/staff/doctorAPI';
import { FiCalendar, FiUser, FiAlertCircle, FiClock, FiFileText } from 'react-icons/fi';
import './FollowUpListPage.css';

const FollowUpListPage = () => {
    const navigate = useNavigate();
    const [followUps, setFollowUps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFollowUps();
    }, []);

    const fetchFollowUps = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Get doctorId from localStorage (employeeId)
            const employeeId = localStorage.getItem('employeeId');
            if (!employeeId) {
                setError('Không tìm thấy thông tin bác sĩ');
                return;
            }

            const response = await doctorFollowUpAPI.getFollowUpsByDoctor(employeeId);
            if (response && response.data) {
                setFollowUps(response.data);
            }
        } catch (err) {
            console.error('Error loading follow-ups:', err);
            setError(err.message || 'Không thể tải danh sách tái khám');
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

    const getPriorityClass = (priority) => {
        const classMap = {
            'ROUTINE': 'priority-routine',
            'URGENT': 'priority-urgent',
            'ASAP': 'priority-asap',
        };
        return classMap[priority] || '';
    };

    const handleViewDetail = (appointmentId) => {
        navigate(`/staff/bac-si/tai-kham/${appointmentId}`);
    };

    if (loading) {
        return (
            <div className="follow-up-list-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải danh sách tái khám...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="follow-up-list-page">
                <div className="error-state">
                    <FiAlertCircle />
                    <p>{error}</p>
                    <button onClick={fetchFollowUps} className="btn-retry">
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="follow-up-list-page">
            <div className="page-header">
                <h1>Quản lý Tái khám</h1>
                <p>Danh sách lịch tái khám của bệnh nhân</p>
            </div>

            {followUps.length === 0 ? (
                <div className="empty-state">
                    <FiCalendar />
                    <p>Chưa có lịch tái khám nào</p>
                </div>
            ) : (
                <div className="follow-ups-grid">
                    {followUps.map((followUp) => (
                        <div
                            key={followUp.reExaminationAppointmentId}
                            className="follow-up-card"
                            onClick={() => handleViewDetail(followUp.reExaminationAppointmentId)}
                        >
                            <div className="card-header">
                                <div className="patient-info">
                                    <FiUser />
                                    <div>
                                        <h3>{followUp.patientName}</h3>
                                        <span className="patient-phone">{followUp.patientPhone}</span>
                                    </div>
                                </div>
                                <div className="badges">
                                    <span className={`status-badge ${getStatusClass(followUp.status)}`}>
                                        {getStatusDisplay(followUp.status)}
                                    </span>
                                    {followUp.priority && (
                                        <span className={`priority-badge ${getPriorityClass(followUp.priority)}`}>
                                            {getPriorityDisplay(followUp.priority)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="card-body">
                                <div className="info-row">
                                    <FiCalendar />
                                    <span className="label">Ngày tái khám:</span>
                                    <span className="value">{formatDate(followUp.reExaminationDate)}</span>
                                </div>
                                <div className="info-row">
                                    <FiFileText />
                                    <span className="label">Lý do:</span>
                                    <span className="value">{followUp.reason || '-'}</span>
                                </div>
                                <div className="info-row">
                                    <FiClock />
                                    <span className="label">Lượt khám gốc:</span>
                                    <span className="value">{formatDateTime(followUp.originalEncounterDate)}</span>
                                </div>
                                {followUp.originalDiagnosis && (
                                    <div className="diagnosis-box">
                                        <span className="label">Chẩn đoán gốc:</span>
                                        <p>{followUp.originalDiagnosis}</p>
                                    </div>
                                )}
                            </div>

                            <div className="card-footer">
                                <span className="created-by">
                                    Tạo bởi: {followUp.createdByEmployeeName}
                                </span>
                                <span className="created-at">
                                    {formatDateTime(followUp.createdAt)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FollowUpListPage;
