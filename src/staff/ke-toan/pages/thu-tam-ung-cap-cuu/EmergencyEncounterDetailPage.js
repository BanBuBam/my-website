import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { financeEmergencyAPI } from '../../../../services/staff/financeAPI';
import CollectAdvancePaymentModal from './CollectAdvancePaymentModal';
import './EmergencyEncounterDetailPage.css';
import {
  FiArrowLeft,
  FiUser,
  FiActivity,
  FiClock,
  FiAlertCircle,
  FiPhone,
  FiDollarSign,
  FiFileText,
  FiCheckCircle,
  FiRefreshCw
} from 'react-icons/fi';

const EmergencyEncounterDetailPage = () => {
  const { emergencyEncounterId } = useParams();
  const navigate = useNavigate();
  const [encounter, setEncounter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    fetchEncounterDetail();
  }, [emergencyEncounterId]);

  const fetchEncounterDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await financeEmergencyAPI.getEmergencyEncounterDetail(emergencyEncounterId);
      if (response.data) {
        setEncounter(response.data);
      }
    } catch (err) {
      setError('Không thể tải chi tiết ca cấp cứu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const handleCollectAdvancePayment = () => {
    setShowPaymentModal(true);
  };

  // Handle create invoice
  const handleCreateInvoice = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn tạo hóa đơn cho bệnh nhân ${encounter.patientName}?`)) {
      return;
    }

    setActionLoading('invoice');
    try {
      const response = await financeEmergencyAPI.createEmergencyInvoice(encounter.emergencyEncounterId);
      
      if (response && response.invoiceId) {
        alert(`Tạo hóa đơn thành công!\nSố hóa đơn: ${response.invoiceNumber}\nTổng tiền: ${response.totalAmount.toLocaleString('vi-VN')} VND`);
        // Refresh encounter data
        fetchEncounterDetail();
      } else {
        alert('Tạo hóa đơn thành công!');
      }
    } catch (err) {
      console.error('Error creating invoice:', err);
      alert(err.message || 'Không thể tạo hóa đơn');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle settlement
  const handleSettlement = async () => {
    const refundMethod = window.prompt(
      'Chọn phương thức hoàn tiền:\n- CASH (Tiền mặt)\n- BANK_TRANSFER (Chuyển khoản)\n- VNPAY (VNPay)',
      'CASH'
    );

    if (!refundMethod) return;

    if (!['CASH', 'BANK_TRANSFER', 'VNPAY'].includes(refundMethod.toUpperCase())) {
      alert('Phương thức hoàn tiền không hợp lệ!');
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn quyết toán cho bệnh nhân ${encounter.patientName}?`)) {
      return;
    }

    setActionLoading('settlement');
    try {
      const response = await financeEmergencyAPI.settleEmergencyEncounter(
        encounter.emergencyEncounterId, 
        refundMethod.toUpperCase()
      );
      
      if (response && (response.code === 200 || response.code === 201)) {
        alert('Quyết toán thành công!');
        // Refresh encounter data
        fetchEncounterDetail();
      } else {
        alert(response?.message || 'Quyết toán thành công!');
      }
    } catch (err) {
      console.error('Error settling encounter:', err);
      alert(err.message || 'Không thể quyết toán');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle view invoice
  const handleViewInvoice = async () => {
    setActionLoading('view-invoice');
    try {
      const response = await financeEmergencyAPI.getEmergencyInvoice(encounter.emergencyEncounterId);
      
      if (response && response.data) {
        setInvoiceData(response.data);
        setShowInvoiceModal(true);
      } else {
        alert('Không tìm thấy hóa đơn cho ca cấp cứu này');
      }
    } catch (err) {
      console.error('Error viewing invoice:', err);
      alert(err.message || 'Không thể xem hóa đơn');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePaymentSuccess = (response) => {
    alert('Thu tạm ứng thành công!');
    // Refresh encounter data
    fetchEncounterDetail();
    setShowPaymentModal(false);
  };

  if (loading) {
    return (
      <div className="emergency-encounter-detail-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error || !encounter) {
    return (
      <div className="emergency-encounter-detail-page">
        <div className="error-state">
          <FiAlertCircle />
          <p>{error || 'Không tìm thấy thông tin ca cấp cứu'}</p>
          <button onClick={() => navigate('/staff/tai-chinh/thu-tam-ung-cap-cuu')}>
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="emergency-encounter-detail-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigate('/staff/tai-chinh/thu-tam-ung-cap-cuu')}>
          <FiArrowLeft />
          Quay lại
        </button>
        <div className="header-title">
          <h1>Chi tiết ca cấp cứu</h1>
          <p>Emergency Encounter ID: {encounter.emergencyEncounterId}</p>
        </div>
        <div className="header-actions">
          <button className="btn-refresh" onClick={fetchEncounterDetail}>
            <FiRefreshCw /> Làm mới
          </button>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="action-buttons-row">
        <button 
          className="btn-advance-payment" 
          onClick={handleCollectAdvancePayment}
          disabled={actionLoading === 'advance'}
        >
          <FiDollarSign /> 
          {actionLoading === 'advance' ? 'Đang xử lý...' : 'Thu tạm ứng'}
        </button>
        <button 
          className="btn-view-invoice" 
          onClick={handleViewInvoice}
          disabled={actionLoading === 'view-invoice'}
        >
          <FiFileText /> 
          {actionLoading === 'view-invoice' ? 'Đang tải...' : 'Xem hóa đơn'}
        </button>
        <button 
          className="btn-create-invoice" 
          onClick={handleCreateInvoice}
          disabled={actionLoading === 'invoice'}
        >
          <FiFileText /> 
          {actionLoading === 'invoice' ? 'Đang xử lý...' : 'Tạo hóa đơn'}
        </button>
        <button 
          className="btn-settlement" 
          onClick={handleSettlement}
          disabled={actionLoading === 'settlement'}
        >
          <FiCheckCircle /> 
          {actionLoading === 'settlement' ? 'Đang xử lý...' : 'Quyết toán'}
        </button>
      </div>

      <div className="encounter-content">
        {/* Patient Information Card */}
        <div className="info-card patient-card">
          <div className="card-header">
            <FiUser />
            <h2>Thông tin bệnh nhân</h2>
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
              <span className="label">Mã encounter:</span>
              <span className="value">{encounter.encounterId}</span>
            </div>
          </div>
        </div>

        {/* Emergency Information Card */}
        <div className="info-card emergency-card">
          <div className="card-header">
            <FiActivity />
            <h2>Thông tin cấp cứu</h2>
          </div>
          <div className="card-body">
            <div className="info-row">
              <span className="label">Phân loại:</span>
              <span
                className="emergency-category-badge"
                style={{ backgroundColor: encounter.emergencyCategoryColor }}
              >
                {encounter.emergencyCategoryIcon && <span>{encounter.emergencyCategoryIcon}</span>}
                {encounter.emergencyCategoryDisplay}
              </span>
            </div>
            <div className="info-row">
              <span className="label">Triệu chứng chính:</span>
              <span className="value">{encounter.chiefComplaint || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="label">Phương thức đến:</span>
              <span className="value">{encounter.arrivalMethod || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="label">Thời gian đến:</span>
              <span className="value">{formatDateTime(encounter.arrivalTime)}</span>
            </div>
            <div className="info-row">
              <span className="label">Người đi cùng:</span>
              <span className="value">{encounter.accompaniedBy || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="label">Đánh giá ban đầu:</span>
              <span className="value">{encounter.initialAssessment || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="label">Chỉ số sinh tồn:</span>
              <span className="value">{encounter.vitalSigns || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="label">Điểm đau:</span>
              <span className="value">{encounter.painScore !== null ? `${encounter.painScore}/10` : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Medical Staff Card */}
        <div className="info-card staff-card">
          <div className="card-header">
            <FiUser />
            <h2>Nhân viên y tế</h2>
          </div>
          <div className="card-body">
            <div className="info-row">
              <span className="label">Điều dưỡng phân loại:</span>
              <span className="value">{encounter.triageNurseName || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="label">Bác sĩ phụ trách:</span>
              <span className="value">{encounter.assignedDoctorName || 'Chưa phân công'}</span>
            </div>
          </div>
        </div>

        {/* Emergency Contact Card */}
        <div className="info-card contact-card">
          <div className="card-header">
            <FiPhone />
            <h2>Liên hệ khẩn cấp</h2>
          </div>
          <div className="card-body">
            <div className="info-row">
              <span className="label">Người liên hệ:</span>
              <span className="value">{encounter.emergencyContactName || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="label">Số điện thoại:</span>
              <span className="value">{encounter.emergencyContactPhone || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="info-card status-card">
          <div className="card-header">
            <FiCheckCircle />
            <h2>Trạng thái</h2>
          </div>
          <div className="card-body">
            <div className="info-row">
              <span className="label">Trạng thái hiện tại:</span>
              <span
                className="status-badge"
                style={{ backgroundColor: encounter.statusColor }}
              >
                {encounter.statusDisplay}
              </span>
            </div>
            <div className="info-row">
              <span className="label">Thời gian chờ:</span>
              <span className="value">
                {encounter.waitTimeMinutes} phút
                {encounter.isWaitTimeExceeded && (
                  <span className="warning-text"> (Quá thời gian chờ)</span>
                )}
              </span>
            </div>
            <div className="info-row">
              <span className="label">Cập nhật lần cuối:</span>
              <span className="value">{formatDateTime(encounter.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Billing Information Card */}
        <div className="info-card billing-card">
          <div className="card-header">
            <FiDollarSign />
            <h2>Thông tin thanh toán</h2>
          </div>
          <div className="card-body">
            <div className="info-row">
              <span className="label">Loại thanh toán:</span>
              <span className={`billing-type ${encounter.hasInsurance ? 'insured' : 'self-pay'}`}>
                {encounter.billingTypeDisplay || (encounter.hasInsurance ? 'Bảo hiểm' : 'Viện phí')}
              </span>
            </div>
            {encounter.hasInsurance && (
              <>
                <div className="info-row">
                  <span className="label">Số thẻ BHYT:</span>
                  <span className="value">{encounter.insuranceCardNumber || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Tỷ lệ bảo hiểm:</span>
                  <span className="value">{encounter.insuranceCoveragePercent}%</span>
                </div>
              </>
            )}
            {encounter.invoiceId && (
              <div className="info-row">
                <span className="label">Mã hóa đơn:</span>
                <span className="value">{encounter.invoiceId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Discharge Information (if completed) */}
        {encounter.isCompleted && (
          <div className="info-card discharge-card">
            <div className="card-header">
              <FiFileText />
              <h2>Thông tin xuất viện</h2>
            </div>
            <div className="card-body">
              {encounter.dischargeSummary && (
                <div className="info-row">
                  <span className="label">Tóm tắt xuất viện:</span>
                  <span className="value">{encounter.dischargeSummary}</span>
                </div>
              )}
              {encounter.dischargeInstructions && (
                <div className="info-row">
                  <span className="label">Hướng dẫn:</span>
                  <span className="value">{encounter.dischargeInstructions}</span>
                </div>
              )}
              {encounter.dischargeMedications && (
                <div className="info-row">
                  <span className="label">Thuốc xuất viện:</span>
                  <span className="value">{encounter.dischargeMedications}</span>
                </div>
              )}
              {encounter.prescriptionId && (
                <div className="info-row">
                  <span className="label">Mã đơn thuốc:</span>
                  <span className="value">{encounter.prescriptionId}</span>
                </div>
              )}
              {encounter.hospitalReferralCode && (
                <div className="info-row">
                  <span className="label">Mã chuyển viện:</span>
                  <span className="value">{encounter.hospitalReferralCode}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="legacy-action-buttons" style={{ display: 'none' }}>
        <button className="btn-primary" onClick={handleCollectAdvancePayment}>
          <FiDollarSign />
          Thu tạm ứng
        </button>
      </div>

      {/* Payment Modal */}
      <CollectAdvancePaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        encounter={encounter}
        onSuccess={handlePaymentSuccess}
      />

      {/* Invoice View Modal */}
      {showInvoiceModal && invoiceData && (
        <InvoiceViewModal
          invoice={invoiceData}
          onClose={() => {
            setShowInvoiceModal(false);
            setInvoiceData(null);
          }}
        />
      )}
    </div>
  );
};

// Invoice View Modal Component
const InvoiceViewModal = ({ invoice, onClose }) => {
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-';
    return `${amount.toLocaleString('vi-VN')} VND`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'ISSUED': { label: 'Đã phát hành', className: 'status-issued' },
      'PARTIAL_PAID': { label: 'Thanh toán một phần', className: 'status-partial' },
      'PAID': { label: 'Đã thanh toán', className: 'status-paid' },
      'CANCELLED': { label: 'Đã hủy', className: 'status-cancelled' },
      'PARTIALLY_PAID': { label: 'Thanh toán một phần', className: 'status-partial' },
    };
    
    const statusInfo = statusMap[status] || { label: status, className: 'status-default' };
    return <span className={`invoice-status-badge ${statusInfo.className}`}>{statusInfo.label}</span>;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content invoice-view-modal">
        <div className="modal-header">
          <h3>
            <FiFileText />
            Chi tiết hóa đơn
          </h3>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="invoice-header-info">
            <div className="invoice-number">
              <h4>Số hóa đơn: {invoice.invoiceNumber}</h4>
              {getStatusBadge(invoice.status)}
              {invoice.isOverdue && (
                <span className="overdue-badge">⚠️ Quá hạn</span>
              )}
            </div>
          </div>

          <div className="invoice-details-grid">
            <div className="detail-section">
              <h5>Thông tin bệnh nhân</h5>
              <div className="detail-item">
                <label>Tên bệnh nhân:</label>
                <span>{invoice.patientName}</span>
              </div>
              <div className="detail-item">
                <label>Patient ID:</label>
                <span>{invoice.patientId}</span>
              </div>
              <div className="detail-item">
                <label>Encounter ID:</label>
                <span>{invoice.encounterId}</span>
              </div>
            </div>

            <div className="detail-section">
              <h5>Thông tin thanh toán</h5>
              <div className="detail-item">
                <label>Tổng tiền:</label>
                <span className="amount-total">{formatCurrency(invoice.totalAmount)}</span>
              </div>
              <div className="detail-item">
                <label>Đã thanh toán:</label>
                <span className="amount-paid">{formatCurrency(invoice.amountPaid)}</span>
              </div>
              <div className="detail-item">
                <label>Còn lại:</label>
                <span className="amount-unpaid">{formatCurrency(invoice.unpaidAmount)}</span>
              </div>
              <div className="detail-item">
                <label>Trạng thái thanh toán:</label>
                <span>{invoice.paymentStatus}</span>
              </div>
            </div>

            <div className="detail-section">
              <h5>Thông tin bảo hiểm</h5>
              <div className="detail-item">
                <label>Số thẻ BHYT:</label>
                <span>{invoice.healthInsuranceNumber || 'Không có'}</span>
              </div>
              <div className="detail-item">
                <label>BHYT chi trả:</label>
                <span>{formatCurrency(invoice.insuranceCoveredAmount)}</span>
              </div>
              <div className="detail-item">
                <label>Bệnh nhân trả:</label>
                <span>{formatCurrency(invoice.patientResponsibleAmount)}</span>
              </div>
              <div className="detail-item">
                <label>Trạng thái BHYT:</label>
                <span>{invoice.insuranceClaimStatus}</span>
              </div>
            </div>

            <div className="detail-section">
              <h5>Thông tin khác</h5>
              <div className="detail-item">
                <label>Ngày phát hành:</label>
                <span>{formatDate(invoice.issueDate)}</span>
              </div>
              <div className="detail-item">
                <label>Ngày đến hạn:</label>
                <span>{formatDate(invoice.dueDate)}</span>
              </div>
              <div className="detail-item">
                <label>Người tạo:</label>
                <span>{invoice.createdByEmployeeName}</span>
              </div>
              <div className="detail-item">
                <label>Cập nhật cuối:</label>
                <span>{invoice.updatedByEmployeeName}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="invoice-notes">
              <h5>Ghi chú</h5>
              <p>{invoice.notes}</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-close-modal" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyEncounterDetailPage;
