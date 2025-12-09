import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorDiagnosticOrderAPI } from '../../../../services/staff/doctorAPI';
import {
  FiArrowLeft,
  FiRefreshCw,
  FiAlertCircle,
  FiAlertTriangle,
  FiCheckCircle,
  FiUser,
  FiMapPin,
  FiCalendar,
  FiFileText,
} from 'react-icons/fi';
import './ProtocolDetailPage.css';

const ProtocolDetailPage = () => {
  const { protocolId } = useParams();
  const navigate = useNavigate();
  const [protocol, setProtocol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProtocolDetail();
  }, [protocolId]);

  const fetchProtocolDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await doctorDiagnosticOrderAPI.getProtocolDetail(protocolId);
      if (response && response.data) {
        setProtocol(response.data);
      }
    } catch (err) {
      console.error('Error fetching protocol detail:', err);
      setError(err.message || 'Không thể tải chi tiết protocol');
    } finally {
      setLoading(false);
    }
  };

  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [procedures, setProcedures] = useState([]);
  const [responseTeam, setResponseTeam] = useState([]);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const handleBack = () => {
    navigate(-1);
  };

  const handleSendAlert = async () => {
    if (!alertMessage.trim()) {
      setError('Vui lòng nhập nội dung cảnh báo');
      return;
    }
    try {
      setActionLoading(true);
      await doctorDiagnosticOrderAPI.sendProtocolAlert(protocolId, alertMessage);
      setSuccessMessage('Gửi cảnh báo thành công!');
      setShowAlertModal(false);
      setAlertMessage('');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || 'Không thể gửi cảnh báo');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGetProcedures = async () => {
    try {
      setActionLoading(true);
      const response = await doctorDiagnosticOrderAPI.getProtocolProcedures(protocol.protocolType);
      setProcedures(response?.data || []);
      setSuccessMessage('Đã tải quy trình!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || 'Không thể tải quy trình');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGetResponseTeam = async () => {
    try {
      setActionLoading(true);
      const response = await doctorDiagnosticOrderAPI.getResponseTeam(
        protocol.protocolType,
        protocol.departmentId
      );
      setResponseTeam(response?.data || []);
      setSuccessMessage('Đã tải đội phản ứng!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || 'Không thể tải đội phản ứng');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!resolutionNotes.trim()) {
      setError('Vui lòng nhập ghi chú giải quyết');
      return;
    }
    try {
      setActionLoading(true);
      const response = await doctorDiagnosticOrderAPI.resolveProtocol(protocolId, resolutionNotes);
      if (response?.data) {
        setProtocol(response.data);
      }
      setSuccessMessage('Giải quyết protocol thành công!');
      setShowResolveModal(false);
      setResolutionNotes('');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || 'Không thể giải quyết protocol');
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

  const getProtocolColor = (type) => {
    const colorMap = {
      CODE_BLUE: '#1e40af',
      CODE_RED: '#dc2626',
      CODE_ORANGE: '#ea580c',
      CODE_PINK: '#ec4899',
      STROKE_ALERT: '#7c3aed',
      STEMI_ALERT: '#dc2626',
      TRAUMA_ALERT: '#ea580c',
    };
    return colorMap[type] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="protocol-detail-page">
        <div className="loading-container">
          <FiRefreshCw className="spinner" />
          <p>Đang tải chi tiết protocol...</p>
        </div>
      </div>
    );
  }

  if (error || !protocol) {
    return (
      <div className="protocol-detail-page">
        <div className="error-container">
          <FiAlertCircle className="error-icon" />
          <p>{error || 'Không tìm thấy thông tin protocol'}</p>
          <button className="btn-back" onClick={handleBack}>
            <FiArrowLeft /> Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="protocol-detail-page">
      {/* Header */}
      <div className="page-header" style={{ borderLeftColor: getProtocolColor(protocol.protocolType) }}>
        <button className="btn-back" onClick={handleBack}>
          <FiArrowLeft /> Quay lại
        </button>
        <div className="header-title">
          <h1>{protocol.protocolType}</h1>
          <p>Protocol ID: {protocol.protocolId}</p>
        </div>
        <div className="header-actions">
          <button className="btn-action" onClick={() => setShowAlertModal(true)} disabled={actionLoading}>
            <FiAlertTriangle /> Gửi cảnh báo
          </button>
          <button className="btn-action" onClick={handleGetProcedures} disabled={actionLoading}>
            <FiFileText /> Lấy quy trình
          </button>
          <button className="btn-action" onClick={handleGetResponseTeam} disabled={actionLoading}>
            <FiUser /> Lấy đội phản ứng
          </button>
          {!protocol.resolved && (
            <button className="btn-action btn-resolve" onClick={() => setShowResolveModal(true)} disabled={actionLoading}>
              <FiCheckCircle /> Giải quyết
            </button>
          )}
          <button className="btn-refresh" onClick={fetchProtocolDetail}>
            <FiRefreshCw /> Làm mới
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="success-message">
          <FiCheckCircle />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="error-message">
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      )}

      {/* Status Banner */}
      <div className="status-banner" style={{ borderLeftColor: getProtocolColor(protocol.protocolType) }}>
        <div className="banner-left">
          <span className={`status-badge ${protocol.resolved ? 'resolved' : 'active'}`}>
            {protocol.resolved ? <FiCheckCircle /> : <FiAlertTriangle />}
            {protocol.statusDisplay || protocol.status}
          </span>
          <span className={`severity-badge severity-${protocol.severityLevel?.toLowerCase()}`}>
            {protocol.severityDisplay || protocol.severityLevel}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-grid">
        {/* Basic Info */}
        <div className="info-card">
          <div className="card-header">
            <FiFileText />
            <h3>Thông tin cơ bản</h3>
          </div>
          <div className="card-body">
            <div className="info-row">
              <span className="label">Loại Protocol:</span>
              <span className="value">{protocol.protocolType}</span>
            </div>
            <div className="info-row">
              <span className="label">Khoa:</span>
              <span className="value">{protocol.departmentName || '-'}</span>
            </div>
            <div className="info-row">
              <span className="label">Bệnh nhân:</span>
              <span className="value">{protocol.patientName || `ID: ${protocol.patientId}`}</span>
            </div>
            <div className="info-row">
              <span className="label">Vị trí:</span>
              <span className="value">{protocol.location || '-'}</span>
            </div>
          </div>
        </div>

        {/* Staff Info */}
        <div className="info-card">
          <div className="card-header">
            <FiUser />
            <h3>Thông tin nhân viên</h3>
          </div>
          <div className="card-body">
            <div className="info-row">
              <span className="label">Kích hoạt bởi:</span>
              <span className="value">{protocol.activatedByEmployeeName || '-'}</span>
            </div>
            <div className="info-row">
              <span className="label">Thời gian kích hoạt:</span>
              <span className="value">{formatDateTime(protocol.activatedAt)}</span>
            </div>
            {protocol.resolved && (
              <>
                <div className="info-row">
                  <span className="label">Giải quyết bởi:</span>
                  <span className="value">{protocol.resolvedByEmployeeName || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Thời gian giải quyết:</span>
                  <span className="value">{formatDateTime(protocol.resolvedAt)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        {(protocol.description || protocol.specificDetails || protocol.additionalNotes) && (
          <div className="info-card full-width">
            <div className="card-header">
              <FiFileText />
              <h3>Mô tả & Chi tiết</h3>
            </div>
            <div className="card-body">
              {protocol.description && (
                <div className="info-section">
                  <h4>Mô tả:</h4>
                  <p>{protocol.description}</p>
                </div>
              )}
              {protocol.specificDetails && (
                <div className="info-section">
                  <h4>Chi tiết cụ thể:</h4>
                  <p>{protocol.specificDetails}</p>
                </div>
              )}
              {protocol.additionalNotes && (
                <div className="info-section">
                  <h4>Ghi chú bổ sung:</h4>
                  <p>{protocol.additionalNotes}</p>
                </div>
              )}
              {protocol.resolutionNotes && (
                <div className="info-section">
                  <h4>Ghi chú giải quyết:</h4>
                  <p>{protocol.resolutionNotes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Response Team */}
        {protocol.responseTeam && protocol.responseTeam.length > 0 && (
          <div className="info-card">
            <div className="card-header">
              <FiUser />
              <h3>Đội phản ứng</h3>
            </div>
            <div className="card-body">
              <ul className="team-list">
                {protocol.responseTeam.map((member, index) => (
                  <li key={index}>{member}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Actions */}
        {((protocol.actionsRequired && protocol.actionsRequired.length > 0) ||
          (protocol.completedActions && protocol.completedActions.length > 0)) && (
          <div className="info-card">
            <div className="card-header">
              <FiCheckCircle />
              <h3>Hành động</h3>
            </div>
            <div className="card-body">
              {protocol.actionsRequired && protocol.actionsRequired.length > 0 && (
                <div className="actions-section">
                  <h4>Yêu cầu:</h4>
                  <ul className="actions-list">
                    {protocol.actionsRequired.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
              {protocol.completedActions && protocol.completedActions.length > 0 && (
                <div className="actions-section">
                  <h4>Đã hoàn thành:</h4>
                  <ul className="actions-list completed">
                    {protocol.completedActions.map((action, index) => (
                      <li key={index}>
                        <FiCheckCircle /> {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Procedures */}
        {procedures.length > 0 && (
          <div className="info-card full-width">
            <div className="card-header">
              <FiFileText />
              <h3>Quy trình xử lý</h3>
            </div>
            <div className="card-body">
              <ol className="procedures-list">
                {procedures.map((proc, index) => (
                  <li key={index}>{proc}</li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* Response Team (from API) */}
        {responseTeam.length > 0 && (
          <div className="info-card">
            <div className="card-header">
              <FiUser />
              <h3>Đội phản ứng (API)</h3>
            </div>
            <div className="card-body">
              <ul className="team-list">
                {responseTeam.map((member, index) => (
                  <li key={index}>{member}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Alert Modal */}
      {showAlertModal && (
        <div className="modal-overlay" onClick={() => setShowAlertModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Gửi cảnh báo</h3>
              <button onClick={() => setShowAlertModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <textarea
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                placeholder="Nhập nội dung cảnh báo..."
                rows="4"
              />
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowAlertModal(false)}>Hủy</button>
              <button onClick={handleSendAlert} disabled={actionLoading}>
                {actionLoading ? 'Đang gửi...' : 'Gửi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="modal-overlay" onClick={() => setShowResolveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Giải quyết Protocol</h3>
              <button onClick={() => setShowResolveModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Nhập ghi chú giải quyết..."
                rows="4"
              />
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowResolveModal(false)}>Hủy</button>
              <button onClick={handleResolve} disabled={actionLoading}>
                {actionLoading ? 'Đang xử lý...' : 'Giải quyết'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProtocolDetailPage;
