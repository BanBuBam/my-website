import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { financeEmergencyAPI } from '../../../../services/staff/financeAPI';
import './EmergencyAdvancePaymentListPage.css';
import { 
  FiActivity, FiClock, FiUser, FiAlertCircle, FiCalendar, 
  FiDollarSign, FiFileText, FiCheckCircle 
} from 'react-icons/fi';

const EmergencyAdvancePaymentListPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [activeEncounters, setActiveEncounters] = useState([]);
  const [recentDischarges, setRecentDischarges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoursFilter, setHoursFilter] = useState(24);
  const [actionLoading, setActionLoading] = useState(null);

  // Modal states
  const [showAdvancePaymentModal, setShowAdvancePaymentModal] = useState(false);
  const [selectedEncounter, setSelectedEncounter] = useState(null);

  useEffect(() => {
    if (activeTab === 'active') {
      fetchActiveEncounters();
    } else {
      fetchRecentDischarges();
    }
  }, [activeTab, hoursFilter]);

  const fetchActiveEncounters = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await financeEmergencyAPI.getActiveEmergencyEncounters();
      if (response.data) {
        setActiveEncounters(response.data);
      }
    } catch (err) {
      setError('Không thể tải danh sách cấp cứu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentDischarges = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await financeEmergencyAPI.getRecentDischarges(hoursFilter);
      if (response.data) {
        setRecentDischarges(response.data);
      }
    } catch (err) {
      setError('Không thể tải danh sách xuất viện: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEncounterClick = (emergencyEncounterId) => {
    navigate(`/staff/tai-chinh/thu-tam-ung-cap-cuu/${emergencyEncounterId}`);
  };

  // Handle advance payment
  const handleAdvancePayment = (encounter) => {
    setSelectedEncounter(encounter);
    setShowAdvancePaymentModal(true);
  };

  // Handle create invoice
  const handleCreateInvoice = async (encounter) => {
    if (!window.confirm(`Bạn có chắc chắn muốn tạo hóa đơn cho bệnh nhân ${encounter.patientName}?`)) {
      return;
    }

    setActionLoading(`invoice-${encounter.emergencyEncounterId}`);
    try {
      const response = await financeEmergencyAPI.createEmergencyInvoice(encounter.emergencyEncounterId);
      
      if (response && response.invoiceId) {
        alert(`Tạo hóa đơn thành công!\nSố hóa đơn: ${response.invoiceNumber}\nTổng tiền: ${response.totalAmount.toLocaleString('vi-VN')} VND`);
        // Refresh data
        if (activeTab === 'active') {
          fetchActiveEncounters();
        } else {
          fetchRecentDischarges();
        }
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
  const handleSettlement = async (encounter) => {
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

    setActionLoading(`settlement-${encounter.emergencyEncounterId}`);
    try {
      const response = await financeEmergencyAPI.settleEmergencyEncounter(
        encounter.emergencyEncounterId, 
        refundMethod.toUpperCase()
      );
      
      if (response && (response.code === 200 || response.code === 201)) {
        alert('Quyết toán thành công!');
        // Refresh data
        if (activeTab === 'active') {
          fetchActiveEncounters();
        } else {
          fetchRecentDischarges();
        }
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

  // Handle advance payment confirmation
  const handleAdvancePaymentConfirm = async (paymentData) => {
    setActionLoading(`advance-${selectedEncounter.emergencyEncounterId}`);
    try {
      const depositData = {
        emergencyEncounterId: selectedEncounter.emergencyEncounterId,
        patientId: selectedEncounter.patientId,
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        notes: paymentData.notes || '',
      };

      const response = await financeEmergencyAPI.collectAdvancePayment(depositData);
      
      if (response) {
        alert(`Thu tạm ứng thành công!\nSố tiền: ${paymentData.amount.toLocaleString('vi-VN')} VND\nPhương thức: ${paymentData.paymentMethod}`);
        setShowAdvancePaymentModal(false);
        setSelectedEncounter(null);
        // Refresh data
        if (activeTab === 'active') {
          fetchActiveEncounters();
        } else {
          fetchRecentDischarges();
        }
      }
    } catch (err) {
      console.error('Error collecting advance payment:', err);
      alert(err.message || 'Không thể thu tạm ứng');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const renderEncounterCard = (encounter) => (
    <div
      key={encounter.emergencyEncounterId}
      className="emergency-encounter-card"
      style={{ borderLeft: `4px solid ${encounter.emergencyCategoryColor || '#666'}` }}
    >
      <div className="encounter-header">
        <div className="patient-info">
          <h3>{encounter.patientName}</h3>
          <span className="patient-code">{encounter.patientCode}</span>
        </div>
        <div
          className="emergency-category"
          style={{ backgroundColor: encounter.emergencyCategoryColor || '#666' }}
        >
          {encounter.emergencyCategoryIcon && <span>{encounter.emergencyCategoryIcon}</span>}
          {encounter.emergencyCategoryDisplay}
        </div>
      </div>

      <div className="encounter-details">
        <div className="detail-row">
          <FiAlertCircle />
          <span className="label">Triệu chứng:</span>
          <span className="value">{encounter.chiefComplaint || 'N/A'}</span>
        </div>
        <div className="detail-row">
          <FiClock />
          <span className="label">Thời gian đến:</span>
          <span className="value">{formatDateTime(encounter.arrivalTime)}</span>
        </div>
        <div className="detail-row">
          <FiUser />
          <span className="label">Bác sĩ:</span>
          <span className="value">{encounter.assignedDoctorName || 'Chưa phân công'}</span>
        </div>
        <div className="detail-row">
          <FiActivity />
          <span className="label">Trạng thái:</span>
          <span
            className="status-badge"
            style={{ backgroundColor: encounter.statusColor || '#666' }}
          >
            {encounter.statusDisplay}
          </span>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="encounter-actions">
        <button
          className="btn-action btn-advance-payment"
          onClick={(e) => {
            e.stopPropagation();
            handleAdvancePayment(encounter);
          }}
          disabled={actionLoading === `advance-${encounter.emergencyEncounterId}`}
        >
          <FiDollarSign />
          {actionLoading === `advance-${encounter.emergencyEncounterId}` ? 'Đang xử lý...' : 'Thu tạm ứng'}
        </button>
        <button
          className="btn-action btn-create-invoice"
          onClick={(e) => {
            e.stopPropagation();
            handleCreateInvoice(encounter);
          }}
          disabled={actionLoading === `invoice-${encounter.emergencyEncounterId}`}
        >
          <FiFileText />
          {actionLoading === `invoice-${encounter.emergencyEncounterId}` ? 'Đang xử lý...' : 'Tạo hóa đơn'}
        </button>
        <button
          className="btn-action btn-settlement"
          onClick={(e) => {
            e.stopPropagation();
            handleSettlement(encounter);
          }}
          disabled={actionLoading === `settlement-${encounter.emergencyEncounterId}`}
        >
          <FiCheckCircle />
          {actionLoading === `settlement-${encounter.emergencyEncounterId}` ? 'Đang xử lý...' : 'Quyết toán'}
        </button>
      </div>

      <div className="encounter-footer">
        <div className="billing-info">
          <span className={`billing-type ${encounter.hasInsurance ? 'insured' : 'self-pay'}`}>
            {encounter.billingTypeDisplay || (encounter.hasInsurance ? 'Bảo hiểm' : 'Viện phí')}
          </span>
          {encounter.hasInsurance && (
            <span className="insurance-coverage">
              Bảo hiểm: {encounter.insuranceCoveragePercent}%
            </span>
          )}
        </div>
        {encounter.isWaitTimeExceeded && (
          <span className="wait-time-warning">
            ⚠️ Quá thời gian chờ
          </span>
        )}
        <button
          className="btn-view-detail"
          onClick={() => handleEncounterClick(encounter.emergencyEncounterId)}
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  );

  return (
    <div className="emergency-advance-payment-list-page">
      <div className="page-header">
        <h1>Thu tạm ứng cấp cứu</h1>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <FiActivity />
          Danh sách cấp cứu
          {activeEncounters.length > 0 && (
            <span className="tab-count">{activeEncounters.length}</span>
          )}
        </button>
        <button
          className={`tab ${activeTab === 'discharged' ? 'active' : ''}`}
          onClick={() => setActiveTab('discharged')}
        >
          <FiCalendar />
          Danh sách mới xuất viện
          {recentDischarges.length > 0 && (
            <span className="tab-count">{recentDischarges.length}</span>
          )}
        </button>
      </div>

      {activeTab === 'discharged' && (
        <div className="filter-section">
          <label>
            Lọc theo thời gian xuất viện:
            <input
              type="number"
              value={hoursFilter}
              onChange={(e) => setHoursFilter(e.target.value || 24)}
              min="1"
              max="168"
              placeholder="24"
            />
            <span>giờ</span>
          </label>
        </div>
      )}

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <FiAlertCircle />
          <p>{error}</p>
          <button onClick={activeTab === 'active' ? fetchActiveEncounters : fetchRecentDischarges}>
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="encounters-grid">
          {activeTab === 'active' && activeEncounters.length === 0 && (
            <div className="empty-state">
              <FiActivity />
              <p>Không có ca cấp cứu nào đang hoạt động</p>
            </div>
          )}
          {activeTab === 'active' && activeEncounters.map(renderEncounterCard)}

          {activeTab === 'discharged' && recentDischarges.length === 0 && (
            <div className="empty-state">
              <FiCalendar />
              <p>Không có ca xuất viện nào trong {hoursFilter} giờ qua</p>
            </div>
          )}
          {activeTab === 'discharged' && recentDischarges.map(renderEncounterCard)}
        </div>
      )}

      {/* Advance Payment Modal */}
      {showAdvancePaymentModal && selectedEncounter && (
        <AdvancePaymentModal
          encounter={selectedEncounter}
          onConfirm={handleAdvancePaymentConfirm}
          onCancel={() => {
            setShowAdvancePaymentModal(false);
            setSelectedEncounter(null);
          }}
          loading={actionLoading === `advance-${selectedEncounter.emergencyEncounterId}`}
        />
      )}
    </div>
  );
};

// Advance Payment Modal Component
const AdvancePaymentModal = ({ encounter, onConfirm, onCancel, loading }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    onConfirm({
      amount: parseFloat(amount),
      paymentMethod,
      notes,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content advance-payment-modal">
        <div className="modal-header">
          <h3>Thu tạm ứng cấp cứu</h3>
          <button className="btn-close" onClick={onCancel} disabled={loading}>×</button>
        </div>

        <div className="modal-body">
          <div className="patient-info-modal">
            <h4>Thông tin bệnh nhân</h4>
            <p><strong>Tên:</strong> {encounter.patientName}</p>
            <p><strong>Mã BN:</strong> {encounter.patientCode}</p>
            <p><strong>Encounter ID:</strong> {encounter.emergencyEncounterId}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="amount">Số tiền tạm ứng (VND) *</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Nhập số tiền..."
                min="1"
                step="1000"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="paymentMethod">Phương thức thanh toán *</label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
                disabled={loading}
              >
                <option value="CASH">Tiền mặt</option>
                <option value="BANK_TRANSFER">Chuyển khoản</option>
                <option value="VNPAY">VNPay</option>
                <option value="CREDIT_CARD">Thẻ tín dụng</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Ghi chú</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập ghi chú (tùy chọn)..."
                rows="3"
                disabled={loading}
              />
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button 
            className="btn-cancel" 
            onClick={onCancel}
            disabled={loading}
          >
            Hủy
          </button>
          <button 
            className="btn-confirm" 
            onClick={handleSubmit}
            disabled={loading || !amount}
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận thu tiền'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyAdvancePaymentListPage;
