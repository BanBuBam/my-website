import React, { useState } from 'react';
import { financeEmergencyAPI } from '../../../../services/staff/financeAPI';
import './CollectAdvancePaymentModal.css';
import { FiX, FiDollarSign, FiCreditCard, FiFileText, FiAlertCircle } from 'react-icons/fi';

const CollectAdvancePaymentModal = ({ isOpen, onClose, encounter, onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'CASH',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const paymentMethods = [
    { value: 'CASH', label: 'Tiền mặt' },
    { value: 'BANK_TRANSFER', label: 'Chuyển khoản' },
    { value: 'CREDIT_CARD', label: 'Thẻ tín dụng' },
    { value: 'DEBIT_CARD', label: 'Thẻ ghi nợ' },
    { value: 'MOMO', label: 'MoMo' },
    { value: 'ZALOPAY', label: 'ZaloPay' },
    { value: 'VNPAY', label: 'VNPay' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const depositData = {
        emergencyEncounterId: encounter.emergencyEncounterId,
        patientId: encounter.encounterId, // Using encounterId as patientId based on API structure
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || '',
      };

      const response = await financeEmergencyAPI.collectAdvancePayment(depositData);

      if (response.status) {
        // Success
        if (onSuccess) {
          onSuccess(response);
        }
        handleClose();
      } else {
        setError(response.message || 'Có lỗi xảy ra khi thu tạm ứng');
      }
    } catch (err) {
      setError(err.message || 'Không thể thu tạm ứng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      amount: '',
      paymentMethod: 'CASH',
      notes: '',
    });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content collect-advance-payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FiDollarSign />
            Thu tạm ứng cấp cứu
          </h2>
          <button className="close-button" onClick={handleClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          {/* Patient Information */}
          <div className="patient-info-section">
            <h3>Thông tin bệnh nhân</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Họ tên:</span>
                <span className="value">{encounter.patientName}</span>
              </div>
              <div className="info-item">
                <span className="label">Mã BN:</span>
                <span className="value">{encounter.patientCode}</span>
              </div>
              <div className="info-item">
                <span className="label">Phân loại:</span>
                <span
                  className="emergency-badge"
                  style={{ backgroundColor: encounter.emergencyCategoryColor }}
                >
                  {encounter.emergencyCategoryDisplay}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Triệu chứng:</span>
                <span className="value">{encounter.chiefComplaint || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="payment-form">
            <div className="form-group">
              <label htmlFor="amount">
                <FiDollarSign />
                Số tiền tạm ứng <span className="required">*</span>
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Nhập số tiền"
                min="0.01"
                step="0.01"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="paymentMethod">
                <FiCreditCard />
                Phương thức thanh toán <span className="required">*</span>
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                required
                disabled={loading}
              >
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="notes">
                <FiFileText />
                Ghi chú
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Nhập ghi chú (nếu có)"
                rows="3"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="error-message">
                <FiAlertCircle />
                {error}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleClose}
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <FiDollarSign />
                    Thu tạm ứng
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CollectAdvancePaymentModal;
