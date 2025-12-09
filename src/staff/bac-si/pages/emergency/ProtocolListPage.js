import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorDiagnosticOrderAPI } from '../../../../services/staff/doctorAPI';
import {
  FiArrowLeft,
  FiRefreshCw,
  FiAlertCircle,
  FiAlertTriangle,
  FiCheckCircle,
  FiEye,
} from 'react-icons/fi';
import './ProtocolListPage.css';

const ProtocolListPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProtocols();
  }, [patientId]);

  const fetchProtocols = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await doctorDiagnosticOrderAPI.getProtocolsByPatient(patientId);
      if (response && response.data) {
        setProtocols(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Error fetching protocols:', err);
      setError(err.message || 'Không thể tải danh sách protocol');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewDetail = (protocolId) => {
    navigate(`/staff/bac-si/protocols/${protocolId}`);
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

  const getProtocolTypeBadge = (type) => {
    const typeMap = {
      CODE_BLUE: { label: 'CODE BLUE', color: '#1e40af' },
      CODE_RED: { label: 'CODE RED', color: '#dc2626' },
      CODE_ORANGE: { label: 'CODE ORANGE', color: '#ea580c' },
      CODE_PINK: { label: 'CODE PINK', color: '#ec4899' },
      STROKE_ALERT: { label: 'STROKE ALERT', color: '#7c3aed' },
      STEMI_ALERT: { label: 'STEMI ALERT', color: '#dc2626' },
      TRAUMA_ALERT: { label: 'TRAUMA ALERT', color: '#ea580c' },
    };

    const info = typeMap[type] || { label: type, color: '#6b7280' };

    return (
      <span className="protocol-type-badge" style={{ backgroundColor: info.color }}>
        {info.label}
      </span>
    );
  };

  const getStatusBadge = (status, isActive, isResolved) => {
    if (isResolved) {
      return (
        <span className="status-badge status-resolved">
          <FiCheckCircle /> Đã giải quyết
        </span>
      );
    }
    if (isActive) {
      return (
        <span className="status-badge status-active">
          <FiAlertTriangle /> Đang hoạt động
        </span>
      );
    }
    return (
      <span className="status-badge status-inactive">
        <FiAlertCircle /> {status}
      </span>
    );
  };

  const getSeverityBadge = (severity) => {
    const severityMap = {
      CRITICAL: { label: 'Nguy kịch', className: 'severity-critical' },
      HIGH: { label: 'Cao', className: 'severity-high' },
      MEDIUM: { label: 'Trung bình', className: 'severity-medium' },
      LOW: { label: 'Thấp', className: 'severity-low' },
    };

    const info = severityMap[severity] || { label: severity, className: 'severity-default' };

    return <span className={`severity-badge ${info.className}`}>{info.label}</span>;
  };

  if (loading) {
    return (
      <div className="protocol-list-page">
        <div className="loading-container">
          <FiRefreshCw className="spinner" />
          <p>Đang tải danh sách protocol...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="protocol-list-page">
      {/* Header */}
      <div className="page-header">
        <button className="btn-back" onClick={handleBack}>
          <FiArrowLeft /> Quay lại
        </button>
        <div className="header-title">
          <h1>Danh sách Protocol</h1>
          <p>Patient ID: {patientId}</p>
        </div>
        <button className="btn-refresh" onClick={fetchProtocols}>
          <FiRefreshCw /> Làm mới
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      )}

      {/* Protocols List */}
      {protocols.length === 0 ? (
        <div className="empty-state">
          <FiAlertCircle className="empty-icon" />
          <p>Không có protocol nào cho bệnh nhân này</p>
        </div>
      ) : (
        <div className="protocols-grid">
          {protocols.map((protocol) => (
            <div key={protocol.protocolId} className="protocol-card">
              <div className="card-header">
                <div className="header-left">
                  {getProtocolTypeBadge(protocol.protocolType)}
                  {getSeverityBadge(protocol.severityLevel)}
                </div>
                {getStatusBadge(protocol.status, protocol.active, protocol.resolved)}
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="label">Protocol ID:</span>
                  <span className="value">{protocol.protocolId}</span>
                </div>
                <div className="info-row">
                  <span className="label">Khoa:</span>
                  <span className="value">{protocol.departmentName || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Vị trí:</span>
                  <span className="value">{protocol.location || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Kích hoạt bởi:</span>
                  <span className="value">{protocol.activatedByEmployeeName || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Thời gian kích hoạt:</span>
                  <span className="value">{formatDateTime(protocol.activatedAt)}</span>
                </div>
                {protocol.description && (
                  <div className="info-row full-width">
                    <span className="label">Mô tả:</span>
                    <span className="value">{protocol.description}</span>
                  </div>
                )}
              </div>

              <div className="card-footer">
                <button className="btn-view-detail" onClick={() => handleViewDetail(protocol.protocolId)}>
                  <FiEye /> Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProtocolListPage;
