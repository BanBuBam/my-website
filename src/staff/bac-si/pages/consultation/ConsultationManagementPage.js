import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorConsultationAPI } from '../../../../services/staff/doctorAPI';
import {
    FiUsers, FiPlus, FiRefreshCw, FiAlertCircle,
    FiCalendar, FiCheckCircle, FiClock, FiFileText
} from 'react-icons/fi';
import './ConsultationManagementPage.css';

const ConsultationManagementPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('my-consultations'); // my-consultations, without-booking
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Tab 1: Danh sách hội chẩn của bác sĩ
    const [myConsultations, setMyConsultations] = useState([]);

    // Tab 2: Danh sách chưa tạo booking
    const [withoutBooking, setWithoutBooking] = useState([]);

    // Get doctor ID from localStorage
    const getDoctorId = () => {
        const employeeId = localStorage.getItem('employeeId');
        return employeeId ? parseInt(employeeId) : null;
    };

    useEffect(() => {
        if (activeTab === 'my-consultations') {
            fetchMyConsultations();
        } else if (activeTab === 'without-booking') {
            fetchWithoutBooking();
        }
    }, [activeTab]);

    // Fetch my consultations
    const fetchMyConsultations = async () => {
        const doctorId = getDoctorId();
        if (!doctorId) {
            setError('Không tìm thấy thông tin bác sĩ');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await doctorConsultationAPI.getConsultationsByDoctor(doctorId);
            if (response && response.data) {
                // Ensure data is an array
                const consultationsData = Array.isArray(response.data) ? response.data : [];
                setMyConsultations(consultationsData);
            } else {
                setMyConsultations([]);
            }
        } catch (err) {
            console.error('Error fetching consultations:', err);
            setError(err.message || 'Không thể tải danh sách hội chẩn');
            setMyConsultations([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch consultations without booking
    const fetchWithoutBooking = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await doctorConsultationAPI.getConsultationsWithoutBooking();
            if (response && response.data) {
                // Ensure data is an array
                const consultationsData = Array.isArray(response.data) ? response.data : [];
                setWithoutBooking(consultationsData);
            } else {
                setWithoutBooking([]);
            }
        } catch (err) {
            console.error('Error fetching consultations without booking:', err);
            setError(err.message || 'Không thể tải danh sách hội chẩn chưa tạo booking');
            setWithoutBooking([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle create new consultation
    const handleCreateNew = () => {
        navigate('/staff/bac-si/hoi-chan/tao-moi');
    };

    // Format date
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

    // Get priority badge
    const getPriorityBadge = (priority, display) => {
        const priorityMap = {
            'LOW': { className: 'priority-low' },
            'MEDIUM': { className: 'priority-medium' },
            'HIGH': { className: 'priority-high' },
            'URGENT': { className: 'priority-urgent' },
        };

        const priorityInfo = priorityMap[priority] || { className: 'priority-default' };

        return (
            <span className={`priority-badge ${priorityInfo.className}`}>
                {display || priority}
            </span>
        );
    };

    // Render consultations table
    const renderConsultationsTable = (consultations) => {
        if (loading) {
            return (
                <div className="loading-state">
                    <FiRefreshCw className="spinner" />
                    <p>Đang tải...</p>
                </div>
            );
        }

        if (consultations.length === 0) {
            return (
                <div className="empty-state">
                    <FiFileText />
                    <p>Không có hội chẩn nào</p>
                </div>
            );
        }

        return (
            <div className="consultations-table-container">
                <table className="consultations-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Encounter ID</th>
                            <th>Lý do hội chẩn</th>
                            <th>Khoa đề xuất</th>
                            <th>Ưu tiên</th>
                            <th>Thời gian hẹn</th>
                            <th>Booking</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {consultations.map((consultation) => (
                            <tr key={consultation.consultationId}>
                                <td>{consultation.consultationId}</td>
                                <td>{consultation.emergencyEncounterId}</td>
                                <td className="reason-cell">{consultation.consultationReason}</td>
                                <td>{consultation.recommendedDepartmentName || '-'}</td>
                                <td>
                                    {getPriorityBadge(
                                        consultation.appointmentPriority,
                                        consultation.appointmentPriorityDisplay
                                    )}
                                </td>
                                <td>{formatDateTime(consultation.suggestedAppointmentTime)}</td>
                                <td>
                                    {consultation.hasCreatedBooking ? (
                                        <span className="badge-success">
                                            <FiCheckCircle /> {consultation.bookingCode}
                                        </span>
                                    ) : (
                                        <span className="badge-warning">
                                            <FiClock /> Chưa tạo
                                        </span>
                                    )}
                                </td>
                                <td>
                                    {consultation.isFollowUpRecommended && (
                                        <span className="badge-info">Cần tái khám</span>
                                    )}
                                    {consultation.isUrgentFollowUp && (
                                        <span className="badge-urgent">Khẩn cấp</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="consultation-management-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-title">
                    <FiUsers className="header-icon" />
                    <div>
                        <h1>Quản lý Hội chẩn</h1>
                        <p>Quản lý các hội chẩn cấp cứu</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={() => {
                        if (activeTab === 'my-consultations') fetchMyConsultations();
                        else if (activeTab === 'without-booking') fetchWithoutBooking();
                    }}>
                        <FiRefreshCw /> Làm mới
                    </button>
                    <button className="btn-create" onClick={handleCreateNew}>
                        <FiPlus /> Tạo hội chẩn mới
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                <button
                    className={`tab-button ${activeTab === 'my-consultations' ? 'active' : ''}`}
                    onClick={() => setActiveTab('my-consultations')}
                >
                    <FiFileText /> Danh sách hội chẩn
                </button>
                <button
                    className={`tab-button ${activeTab === 'without-booking' ? 'active' : ''}`}
                    onClick={() => setActiveTab('without-booking')}
                >
                    <FiClock /> Chưa tạo booking
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="error-message">
                    <FiAlertCircle />
                    <span>{error}</span>
                </div>
            )}

            {/* Tab Content */}
            <div className="tab-content">
                {/* Tab 1: My Consultations */}
                {activeTab === 'my-consultations' && (
                    <div className="tab-panel">
                        <div className="panel-header">
                            <h3>Danh sách hội chẩn của tôi</h3>
                            <span className="count-badge">{myConsultations.length} hội chẩn</span>
                        </div>
                        {renderConsultationsTable(myConsultations)}
                    </div>
                )}

                {/* Tab 2: Without Booking */}
                {activeTab === 'without-booking' && (
                    <div className="tab-panel">
                        <div className="panel-header">
                            <h3>Danh sách chưa tạo booking</h3>
                            <span className="count-badge">{withoutBooking.length} hội chẩn</span>
                        </div>
                        {renderConsultationsTable(withoutBooking)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConsultationManagementPage;
