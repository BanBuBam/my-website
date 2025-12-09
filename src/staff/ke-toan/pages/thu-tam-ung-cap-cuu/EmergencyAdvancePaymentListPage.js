import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { financeEmergencyAPI } from '../../../../services/staff/financeAPI';
import './EmergencyAdvancePaymentListPage.css';
import { FiActivity, FiClock, FiUser, FiAlertCircle, FiCalendar } from 'react-icons/fi';

const EmergencyAdvancePaymentListPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [activeEncounters, setActiveEncounters] = useState([]);
  const [recentDischarges, setRecentDischarges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoursFilter, setHoursFilter] = useState(24);

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

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const renderEncounterCard = (encounter) => (
    <div
      key={encounter.emergencyEncounterId}
      className="emergency-encounter-card"
      onClick={() => handleEncounterClick(encounter.emergencyEncounterId)}
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
    </div>
  );
};

export default EmergencyAdvancePaymentListPage;
