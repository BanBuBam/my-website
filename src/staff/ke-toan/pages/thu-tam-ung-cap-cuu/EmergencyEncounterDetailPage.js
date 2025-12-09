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
  FiCheckCircle
} from 'react-icons/fi';

const EmergencyEncounterDetailPage = () => {
  const { emergencyEncounterId } = useParams();
  const navigate = useNavigate();
  const [encounter, setEncounter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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

  const handlePaymentSuccess = (response) => {
    alert('Thu tạm ứng thành công!');
    // Refresh encounter data
    fetchEncounterDetail();
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
        <h1>Chi tiết ca cấp cứu</h1>
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
      <div className="action-buttons">
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
    </div>
  );
};

export default EmergencyEncounterDetailPage;
