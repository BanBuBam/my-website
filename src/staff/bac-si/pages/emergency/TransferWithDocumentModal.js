import React, { useState, useEffect } from 'react';
import { hospitalAPI } from '../../../../services/staff/doctorAPI';
import { FiX, FiSave, FiAlertCircle } from 'react-icons/fi';
import './TransferWithDocumentModal.css';

const TransferWithDocumentModal = ({ emergencyEncounterId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);

  const [formData, setFormData] = useState({
    targetHospitalId: '',
    transferReason: '',
    currentDiagnosis: '',
    treatmentSummary: '',
    currentMedications: '',
    specialty: '',
    priority: 'ROUTINE',
    specialRequirements: '',
    medicalRecordsSummary: '',
    notes: '',
  });

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoadingHospitals(true);
      const response = await hospitalAPI.getHospitals();
      if (response && response.data) {
        setHospitals(response.data);
      }
    } catch (err) {
      console.error('Error fetching hospitals:', err);
      setError('Không thể tải danh sách bệnh viện');
    } finally {
      setLoadingHospitals(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.targetHospitalId) {
      setError('Vui lòng chọn bệnh viện đích');
      return;
    }

    if (!formData.transferReason) {
      setError('Vui lòng nhập lý do chuyển viện');
      return;
    }

    if (!formData.currentDiagnosis) {
      setError('Vui lòng nhập chẩn đoán hiện tại');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const submitData = {
        ...formData,
        targetHospitalId: parseInt(formData.targetHospitalId),
      };

      await onSuccess(submitData);
    } catch (err) {
      console.error('Error transferring patient:', err);
      setError(err.message || 'Không thể chuyển viện');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="transfer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Chuyển viện có giấy</h3>
          <button className="btn-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          )}

          {/* Thông tin bệnh viện */}
          <div className="form-section">
            <h4>Thông tin bệnh viện</h4>
            <div className="form-group">
              <label>
                Bệnh viện đích <span className="required">*</span>
              </label>
              {loadingHospitals ? (
                <p className="loading-text">Đang tải danh sách bệnh viện...</p>
              ) : (
                <select
                  name="targetHospitalId"
                  value={formData.targetHospitalId}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Chọn bệnh viện --</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital.hospitalId} value={hospital.hospitalId}>
                      {hospital.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label>
                Lý do chuyển viện <span className="required">*</span>
              </label>
              <textarea
                name="transferReason"
                value={formData.transferReason}
                onChange={handleChange}
                placeholder="Nhập lý do chuyển viện"
                rows="2"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Chuyên khoa</label>
                <input
                  type="text"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  placeholder="VD: Tim mạch, Ngoại khoa..."
                />
              </div>

              <div className="form-group">
                <label>Mức độ ưu tiên</label>
                <select name="priority" value={formData.priority} onChange={handleChange}>
                  <option value="ROUTINE">Thường</option>
                  <option value="URGENT">Gấp</option>
                  <option value="EMERGENCY">Khẩn cấp</option>
                </select>
              </div>
            </div>
          </div>

          {/* Thông tin y tế */}
          <div className="form-section">
            <h4>Thông tin y tế</h4>
            <div className="form-group">
              <label>
                Chẩn đoán hiện tại <span className="required">*</span>
              </label>
              <textarea
                name="currentDiagnosis"
                value={formData.currentDiagnosis}
                onChange={handleChange}
                placeholder="Nhập chẩn đoán hiện tại"
                rows="2"
                required
              />
            </div>

            <div className="form-group">
              <label>Tóm tắt điều trị</label>
              <textarea
                name="treatmentSummary"
                value={formData.treatmentSummary}
                onChange={handleChange}
                placeholder="Nhập tóm tắt quá trình điều trị"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Thuốc đang dùng</label>
              <textarea
                name="currentMedications"
                value={formData.currentMedications}
                onChange={handleChange}
                placeholder="Nhập danh sách thuốc đang sử dụng"
                rows="2"
              />
            </div>

            <div className="form-group">
              <label>Tóm tắt hồ sơ bệnh án</label>
              <textarea
                name="medicalRecordsSummary"
                value={formData.medicalRecordsSummary}
                onChange={handleChange}
                placeholder="Nhập tóm tắt hồ sơ bệnh án"
                rows="3"
              />
            </div>
          </div>

          {/* Yêu cầu đặc biệt */}
          <div className="form-section">
            <h4>Yêu cầu đặc biệt</h4>
            <div className="form-group">
              <label>Yêu cầu đặc biệt</label>
              <textarea
                name="specialRequirements"
                value={formData.specialRequirements}
                onChange={handleChange}
                placeholder="VD: Cần xe cứu thương, thiết bị hỗ trợ..."
                rows="2"
              />
            </div>

            <div className="form-group">
              <label>Ghi chú</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Ghi chú bổ sung"
                rows="2"
              />
            </div>
          </div>
        </form>

        <div className="modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button type="submit" className="btn-submit" onClick={handleSubmit} disabled={loading}>
            <FiSave /> {loading ? 'Đang xử lý...' : 'Chuyển viện'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferWithDocumentModal;
