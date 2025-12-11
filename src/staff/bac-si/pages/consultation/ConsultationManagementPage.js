import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorConsultationAPI, doctorDiagnosticOrderAPI } from '../../../../services/staff/doctorAPI';
import {
    FiUsers, FiPlus, FiRefreshCw, FiAlertCircle,
    FiCalendar, FiCheckCircle, FiClock, FiFileText, FiEye, FiX
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

    // Detail modal state
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedConsultation, setSelectedConsultation] = useState(null);
    const [consultationDetail, setConsultationDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [detailError, setDetailError] = useState(null);

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

    // Handle view consultation detail
    const handleViewDetail = async (consultation) => {
        setSelectedConsultation(consultation);
        setShowDetailModal(true);
        setLoadingDetail(true);
        setDetailError(null);
        setConsultationDetail(null);

        try {
            // Sử dụng consultationId làm diagnostic order ID
            const response = await doctorDiagnosticOrderAPI.getDiagnosticOrderDetail(consultation.consultationId);
            if (response && response.data) {
                setConsultationDetail(response.data);
            }
        } catch (err) {
            console.error('Error fetching consultation detail:', err);
            setDetailError(err.message || 'Không thể tải chi tiết hội chẩn');
        } finally {
            setLoadingDetail(false);
        }
    };

    // Handle close detail modal
    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedConsultation(null);
        setConsultationDetail(null);
        setDetailError(null);
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
                            <th>Thao tác</th>
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
                                <td>
                                    <button 
                                        className="btn-view-detail"
                                        onClick={() => handleViewDetail(consultation)}
                                        title="Xem chi tiết"
                                    >
                                        <FiEye /> Chi tiết
                                    </button>
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

            {/* Detail Modal */}
            {showDetailModal && (
                <div className="modal-overlay" onClick={handleCloseDetailModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                <FiFileText /> Chi tiết Hội chẩn #{selectedConsultation?.consultationId}
                            </h3>
                            <button className="btn-close" onClick={handleCloseDetailModal}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body">
                            {loadingDetail ? (
                                <div className="loading-state">
                                    <FiRefreshCw className="spinner" />
                                    <p>Đang tải chi tiết...</p>
                                </div>
                            ) : detailError ? (
                                <div className="error-state">
                                    <FiAlertCircle />
                                    <p>{detailError}</p>
                                </div>
                            ) : consultationDetail ? (
                                <div className="consultation-detail">
                                    <div className="detail-section">
                                        <h4>Thông tin cơ bản</h4>
                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <label>ID:</label>
                                                <span>{consultationDetail.id}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Emergency Encounter ID:</label>
                                                <span>{consultationDetail.emergencyEncounterId}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Loại chẩn đoán:</label>
                                                <span>{consultationDetail.diagnosticType || '-'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Mức độ khẩn cấp:</label>
                                                <span>{consultationDetail.urgencyLevel || '-'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Trạng thái:</label>
                                                <span>{consultationDetail.status || '-'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Bác sĩ chỉ định:</label>
                                                <span>{consultationDetail.orderedByDoctorId || '-'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="detail-section">
                                        <h4>Chi tiết chỉ định</h4>
                                        <div className="detail-text">
                                            <label>Chi tiết chỉ định:</label>
                                            <p>{consultationDetail.orderDetails || 'Không có thông tin'}</p>
                                        </div>
                                        <div className="detail-text">
                                            <label>Chỉ định lâm sàng:</label>
                                            <p>{consultationDetail.clinicalIndication || 'Không có thông tin'}</p>
                                        </div>
                                    </div>

                                    <div className="detail-section">
                                        <h4>Kết quả</h4>
                                        <div className="detail-text">
                                            <label>Kết quả:</label>
                                            <p>{consultationDetail.results || 'Chưa có kết quả'}</p>
                                        </div>
                                        <div className="detail-text">
                                            <label>Diễn giải:</label>
                                            <p>{consultationDetail.interpretation || 'Chưa có diễn giải'}</p>
                                        </div>
                                    </div>

                                    <div className="detail-section">
                                        <h4>Thời gian</h4>
                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <label>Thời gian chỉ định:</label>
                                                <span>{formatDateTime(consultationDetail.orderedAt)}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Thời gian hoàn thành dự kiến:</label>
                                                <span>{formatDateTime(consultationDetail.targetCompletionTime)}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Thời gian hoàn thành:</label>
                                                <span>{formatDateTime(consultationDetail.completedAt)}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Người báo cáo:</label>
                                                <span>{consultationDetail.reportedByEmployeeId || '-'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Ngày tạo:</label>
                                                <span>{formatDateTime(consultationDetail.createdAt)}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Cập nhật lần cuối:</label>
                                                <span>{formatDateTime(consultationDetail.updatedAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <FiFileText />
                                    <p>Không có dữ liệu chi tiết</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn-close-modal" onClick={handleCloseDetailModal}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConsultationManagementPage;
