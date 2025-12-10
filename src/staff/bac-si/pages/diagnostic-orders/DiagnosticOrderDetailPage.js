import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorDiagnosticOrderAPI } from '../../../../services/staff/doctorAPI';
import {
  FiArrowLeft,
  FiActivity,
  FiRefreshCw,
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiUser,
  FiFileText,
  FiCalendar,
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

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await doctorDiagnosticOrderAPI.getDiagnosticOrderDetail(parseInt(orderId));
      if (response && response.data) {
        setOrder(response.data);
      }
    } catch (err) {
      console.error('Error fetching order detail:', err);
      setError(err.message || 'Không thể tải chi tiết chỉ định');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/staff/bac-si/diagnostic-orders');
  };

  // Xác nhận kết quả xét nghiệm
  const handleConfirm = async () => {
    if (!window.confirm('Bạn có chắc muốn xác nhận kết quả xét nghiệm này?')) return;

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

      const response = await doctorDiagnosticOrderAPI.confirmDiagnosticOrder(orderId, orderData);

      if (response && response.data) {
        setSuccessMessage('Xác nhận kết quả xét nghiệm thành công!');
        setOrder(response.data);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error confirming order:', err);
      setError(err.message || 'Không thể xác nhận kết quả');
    } finally {
      setActionLoading(false);
    }
  };

  // Cập nhật trạng thái điều trị
  const handleUpdateStatus = async () => {
    if (!window.confirm('Bạn có chắc muốn cập nhật trạng thái điều trị thành "Đang điều trị"?'))
      return;

    try {
      setActionLoading(true);
      setError(null);

      const response = await doctorDiagnosticOrderAPI.updateEmergencyStatus(
        order.emergencyEncounterId,
        'IN_TREATMENT'
      );

      if (response && response.data) {
        setSuccessMessage('Cập nhật trạng thái điều trị thành công!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.message || 'Không thể cập nhật trạng thái');
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
      ORDERED: { label: 'Đã đặt', className: 'status-ordered', icon: <FiClock /> },
      ACCEPTED: { label: 'Đã tiếp nhận', className: 'status-accepted', icon: <FiCheckCircle /> },
      IN_PROGRESS: {
        label: 'Đang thực hiện',
        className: 'status-in-progress',
        icon: <FiActivity />,
      },
      COMPLETED: { label: 'Hoàn thành', className: 'status-completed', icon: <FiCheckCircle /> },
      REPORTED: { label: 'Đã báo cáo', className: 'status-reported', icon: <FiFileText /> },
      CONFIRMED: { label: 'Đã xác nhận', className: 'status-confirmed', icon: <FiCheckCircle /> },
      CANCELLED: { label: 'Đã hủy', className: 'status-cancelled', icon: <FiAlertCircle /> },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      className: 'status-default',
      icon: <FiAlertCircle />,
    };

    return (
      <span className={`status-badge ${statusInfo.className}`}>
        {statusInfo.icon}
        {statusInfo.label}
      </span>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const urgencyMap = {
      STAT: { label: 'Khẩn cấp', className: 'urgency-stat' },
      URGENT: { label: 'Gấp', className: 'urgency-urgent' },
      ROUTINE: { label: 'Thường', className: 'urgency-routine' },
    };

    const urgencyInfo = urgencyMap[urgency] || {
      label: urgency,
      className: 'urgency-default',
    };

    return <span className={`urgency-badge ${urgencyInfo.className}`}>{urgencyInfo.label}</span>;
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
          <h1>Chi tiết Chỉ định Xét nghiệm</h1>
          <p>Order ID: {order.id}</p>
        </div>
        <div className="header-actions">
          {order.status === 'REPORTED' && (
            <button
              className="btn-action btn-confirm"
              onClick={handleConfirm}
              disabled={actionLoading}
            >
              <FiCheckCircle /> {actionLoading ? 'Đang xử lý...' : 'Xác nhận kết quả'}
            </button>
          )}
          <button
            className="btn-action btn-update-status"
            onClick={handleUpdateStatus}
            disabled={actionLoading}
          >
            <FiActivity /> {actionLoading ? 'Đang xử lý...' : 'Cập nhật trạng thái điều trị'}
          </button>
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
    </div>
  );
};

export default DiagnosticOrderDetailPage;
