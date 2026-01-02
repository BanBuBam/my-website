import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { labTechnicianDiagnosticAPI } from '../../../../services/staff/labTechnicianAPI';
import {
    FiArrowLeft, FiActivity, FiRefreshCw, FiAlertCircle,
    FiClock, FiCheckCircle, FiUser, FiFileText, FiCalendar, FiX
} from 'react-icons/fi';
import './DiagnosticOrderDetailPage.css';

const DiagnosticOrderDetailPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    
    // Report modal state
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportData, setReportData] = useState({
        results: '',
        interpretation: '',
    });

    useEffect(() => {
        fetchOrderDetail();
    }, [orderId]);

    const fetchOrderDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('🔍 Fetching diagnostic order detail, ID:', orderId);
            const response = await labTechnicianDiagnosticAPI.getDiagnosticOrderDetail(parseInt(orderId));
            console.log('📦 Response received:', response);
            if (response && response.data) {
                console.log('✅ Order data:', response.data);
                setOrder(response.data);
            } else {
                console.log('⚠️ No data in response');
            }
        } catch (err) {
            console.error('❌ Error fetching order detail:', err);
            setError(err.message || 'Không thể tải chi tiết chỉ định');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/staff/ky-thuat-vien/diagnostic-orders');
    };

    // Tiếp nhận chỉ định
    const handleAccept = async () => {
        if (!window.confirm('Bạn có chắc muốn tiếp nhận chỉ định này?')) return;

        try {
            setActionLoading(true);
            setError(null);
            
            const orderData = {
                emergencyEncounterId: order.emergencyEncounterId,
                diagnosticType: order.diagnosticType,
                urgencyLevel: order.urgencyLevel,
                orderDetails: order.orderDetails,
                clinicalIndication: order.clinicalIndication,
            };

            const response = await labTechnicianDiagnosticAPI.acceptDiagnosticOrder(orderId, orderData);
            
            if (response && response.data) {
                setSuccessMessage('Tiếp nhận chỉ định xét nghiệm thành công!');
                setOrder(response.data);
                setTimeout(() => setSuccessMessage(null), 3000);
            }
        } catch (err) {
            console.error('Error accepting order:', err);
            setError(err.message || 'Không thể tiếp nhận chỉ định');
        } finally {
            setActionLoading(false);
        }
    };

    // Bắt đầu thực hiện
    const handleStart = async () => {
        if (!window.confirm('Bạn có chắc muốn bắt đầu thực hiện xét nghiệm?')) return;

        try {
            setActionLoading(true);
            setError(null);
            
            const orderData = {
                emergencyEncounterId: order.emergencyEncounterId,
                diagnosticType: order.diagnosticType,
                urgencyLevel: order.urgencyLevel,
                orderDetails: order.orderDetails,
                clinicalIndication: order.clinicalIndication,
            };

            const response = await labTechnicianDiagnosticAPI.startDiagnosticOrder(orderId, orderData);
            
            if (response && response.data) {
                setSuccessMessage('Bắt đầu thực hiện xét nghiệm thành công!');
                setOrder(response.data);
                setTimeout(() => setSuccessMessage(null), 3000);
            }
        } catch (err) {
            console.error('Error starting order:', err);
            setError(err.message || 'Không thể bắt đầu thực hiện');
        } finally {
            setActionLoading(false);
        }
    };

    // Hoàn thành xét nghiệm
    const handleComplete = async () => {
        if (!window.confirm('Bạn có chắc muốn hoàn thành xét nghiệm?')) return;

        try {
            setActionLoading(true);
            setError(null);
            
            const orderData = {
                emergencyEncounterId: order.emergencyEncounterId,
                diagnosticType: order.diagnosticType,
                urgencyLevel: order.urgencyLevel,
                orderDetails: order.orderDetails,
                clinicalIndication: order.clinicalIndication,
            };

            const response = await labTechnicianDiagnosticAPI.completeDiagnosticOrder(orderId, orderData);
            
            if (response && response.data) {
                setSuccessMessage('Hoàn thành xét nghiệm thành công!');
                setOrder(response.data);
                setTimeout(() => setSuccessMessage(null), 3000);
            }
        } catch (err) {
            console.error('Error completing order:', err);
            setError(err.message || 'Không thể hoàn thành xét nghiệm');
        } finally {
            setActionLoading(false);
        }
    };

    // Mở modal báo cáo
    const handleOpenReportModal = () => {
        setShowReportModal(true);
        setReportData({
            results: order.results || '',
            interpretation: order.interpretation || '',
        });
    };

    // Báo cáo kết quả
    const handleReport = async () => {
        if (!reportData.results || !reportData.interpretation) {
            setError('Vui lòng nhập đầy đủ kết quả và diễn giải');
            return;
        }

        try {
            setActionLoading(true);
            setError(null);
            
            const orderData = {
                emergencyEncounterId: order.emergencyEncounterId,
                diagnosticType: order.diagnosticType,
                urgencyLevel: order.urgencyLevel,
                orderDetails: order.orderDetails,
                clinicalIndication: order.clinicalIndication,
            };

            const response = await labTechnicianDiagnosticAPI.reportDiagnosticOrder(
                orderId,
                reportData.results,
                reportData.interpretation,
                orderData
            );
            
            if (response && response.data) {
                setSuccessMessage('Báo cáo kết quả xét nghiệm thành công!');
                setOrder(response.data);
                setShowReportModal(false);
                setTimeout(() => setSuccessMessage(null), 3000);
            }
        } catch (err) {
            console.error('Error reporting order:', err);
            setError(err.message || 'Không thể báo cáo kết quả');
        } finally {
            setActionLoading(false);
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

    const getStatusBadge = (status) => {
        const statusMap = {
            'ORDERED': { label: 'Đã đặt', className: 'status-ordered', icon: <FiClock /> },
            'ACCEPTED': { label: 'Đã tiếp nhận', className: 'status-accepted', icon: <FiCheckCircle /> },
            'IN_PROGRESS': { label: 'Đang thực hiện', className: 'status-in-progress', icon: <FiActivity /> },
            'COMPLETED': { label: 'Hoàn thành', className: 'status-completed', icon: <FiCheckCircle /> },
            'REPORTED': { label: 'Đã báo cáo', className: 'status-reported', icon: <FiFileText /> },
            'CONFIRMED': { label: 'Đã xác nhận', className: 'status-confirmed', icon: <FiCheckCircle /> },
            'CANCELLED': { label: 'Đã hủy', className: 'status-cancelled', icon: <FiAlertCircle /> },
        };

        const statusInfo = statusMap[status] || { label: status, className: 'status-default', icon: <FiAlertCircle /> };

        return (
            <span className={`status-badge ${statusInfo.className}`}>
                {statusInfo.icon}
                {statusInfo.label}
            </span>
        );
    };

    const getUrgencyBadge = (urgency) => {
        const urgencyMap = {
            'STAT': { label: 'Khẩn cấp', className: 'urgency-stat' },
            'URGENT': { label: 'Gấp', className: 'urgency-urgent' },
            'ROUTINE': { label: 'Thường', className: 'urgency-routine' },
        };

        const urgencyInfo = urgencyMap[urgency] || { label: urgency, className: 'urgency-default' };

        return (
            <span className={`urgency-badge ${urgencyInfo.className}`}>
                {urgencyInfo.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="diagnostic-order-detail-page">
                <div className="loading-container">
                    <FiRefreshCw className="spinner" />
                    <p>Đang tải chi tiết chỉ định...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="diagnostic-order-detail-page">
                <div className="error-container">
                    <FiAlertCircle className="error-icon" />
                    <p>{error || 'Không tìm thấy thông tin chỉ định'}</p>
                    <button className="btn-back" onClick={handleBack}>
                        <FiArrowLeft /> Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="diagnostic-order-detail-page">
            {/* Header */}
            <div className="page-header">
                <button className="btn-back" onClick={handleBack}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-title">
                    <h1>Chi tiết lệnh chẩn đoán</h1>
                    <p>Order ID: {order.id}</p>
                </div>
                <div className="header-actions">
                    {order.status === 'ORDERED' && (
                        <button className="btn-action btn-accept" onClick={handleAccept} disabled={actionLoading}>
                            <FiCheckCircle /> {actionLoading ? 'Đang xử lý...' : 'Tiếp nhận'}
                        </button>
                    )}
                    {order.status === 'ACCEPTED' && (
                        <button className="btn-action btn-start" onClick={handleStart} disabled={actionLoading}>
                            <FiActivity /> {actionLoading ? 'Đang xử lý...' : 'Thực hiện'}
                        </button>
                    )}
                    {order.status === 'IN_PROGRESS' && (
                        <button className="btn-action btn-complete" onClick={handleComplete} disabled={actionLoading}>
                            <FiCheckCircle /> {actionLoading ? 'Đang xử lý...' : 'Hoàn thành'}
                        </button>
                    )}
                    {order.status === 'COMPLETED' && (
                        <button className="btn-action btn-report" onClick={handleOpenReportModal} disabled={actionLoading}>
                            <FiFileText /> Báo cáo
                        </button>
                    )}
                    <button className="btn-refresh" onClick={fetchOrderDetail}>
                        <FiRefreshCw /> Làm mới
                    </button>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="success-message">
                    <FiCheckCircle />
                    <span>{successMessage}</span>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="error-message-banner">
                    <FiAlertCircle />
                    <span>{error}</span>
                </div>
            )}

            {/* Status Banner */}
            <div className="status-banner">
                <div className="banner-left">
                    {getStatusBadge(order.status)}
                    {getUrgencyBadge(order.urgencyLevel)}
                </div>
                <div className="banner-right">
                    <span className="diagnostic-type">{order.diagnosticType}</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="content-grid">
                {/* Basic Information */}
                <div className="info-card">
                    <div className="card-header">
                        <FiFileText />
                        <h3>Thông tin cơ bản</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="label">Order ID:</span>
                            <span className="value">{order.id}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Emergency Encounter ID:</span>
                            <span className="value">{order.emergencyEncounterId}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Loại chẩn đoán:</span>
                            <span className="value">{order.diagnosticType}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Mức độ khẩn:</span>
                            <span className="value">{getUrgencyBadge(order.urgencyLevel)}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Trạng thái:</span>
                            <span className="value">{getStatusBadge(order.status)}</span>
                        </div>
                    </div>
                </div>

                {/* Order Details */}
                <div className="info-card">
                    <div className="card-header">
                        <FiActivity />
                        <h3>Chi tiết chỉ định</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="label">Chi tiết chỉ định:</span>
                            <span className="value">{order.orderDetails || '-'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Chỉ định lâm sàng:</span>
                            <span className="value">{order.clinicalIndication || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Results */}
                {(order.results || order.interpretation) && (
                    <div className="info-card full-width">
                        <div className="card-header">
                            <FiCheckCircle />
                            <h3>Kết quả</h3>
                        </div>
                        <div className="card-body">
                            {order.results && (
                                <div className="info-row">
                                    <span className="label">Kết quả:</span>
                                    <span className="value">{order.results}</span>
                                </div>
                            )}
                            {order.interpretation && (
                                <div className="info-row">
                                    <span className="label">Diễn giải:</span>
                                    <span className="value">{order.interpretation}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Staff Information */}
                <div className="info-card">
                    <div className="card-header">
                        <FiUser />
                        <h3>Thông tin nhân viên</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="label">Bác sĩ chỉ định:</span>
                            <span className="value">
                                {order.orderedByDoctorId ? `ID: ${order.orderedByDoctorId}` : '-'}
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="label">Người báo cáo:</span>
                            <span className="value">
                                {order.reportedByEmployeeId ? `ID: ${order.reportedByEmployeeId}` : '-'}
                            </span>
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
                            <span className="label">Thời gian chỉ định:</span>
                            <span className="value">{formatDateTime(order.orderedAt)}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Thời gian hoàn thành dự kiến:</span>
                            <span className="value">{formatDateTime(order.targetCompletionTime)}</span>
                        </div>
                        {order.completedAt && (
                            <div className="info-row">
                                <span className="label">Thời gian hoàn thành:</span>
                                <span className="value">{formatDateTime(order.completedAt)}</span>
                            </div>
                        )}
                        <div className="info-row">
                            <span className="label">Thời gian tạo:</span>
                            <span className="value">{formatDateTime(order.createdAt)}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Cập nhật lần cuối:</span>
                            <span className="value">{formatDateTime(order.updatedAt)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
                    <div className="modal-content report-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Báo cáo kết quả xét nghiệm</h3>
                            <button className="btn-close-modal" onClick={() => setShowReportModal(false)}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Kết quả <span className="required">*</span></label>
                                <textarea
                                    value={reportData.results}
                                    onChange={(e) => setReportData({ ...reportData, results: e.target.value })}
                                    placeholder="Nhập kết quả xét nghiệm..."
                                    rows="4"
                                />
                            </div>
                            <div className="form-group">
                                <label>Diễn giải <span className="required">*</span></label>
                                <textarea
                                    value={reportData.interpretation}
                                    onChange={(e) => setReportData({ ...reportData, interpretation: e.target.value })}
                                    placeholder="Nhập diễn giải kết quả..."
                                    rows="4"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowReportModal(false)}>
                                Hủy
                            </button>
                            <button className="btn-submit" onClick={handleReport} disabled={actionLoading}>
                                <FiFileText /> {actionLoading ? 'Đang lưu...' : 'Lưu báo cáo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiagnosticOrderDetailPage;
