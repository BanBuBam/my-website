import React, { useState, useEffect } from 'react';
import { doctorBedAPI } from '../../../../services/staff/doctorAPI';
import { FiX, FiSave, FiAlertCircle } from 'react-icons/fi';
import './AdmitInpatientModal.css';

const AdmitInpatientModal = ({ emergencyEncounterId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [beds, setBeds] = useState([]);
  const [filteredBeds, setFilteredBeds] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingBeds, setLoadingBeds] = useState(true);

  const [formData, setFormData] = useState({
    departmentId: '',
    admissionDiagnosis: '',
    admissionNotes: '',
    preferredBedId: '',
  });

  useEffect(() => {
    fetchDepartments();
    fetchBeds();
  }, []);

  useEffect(() => {
    if (formData.departmentId) {
      const filtered = beds.filter(
        (bed) => bed.departmentId === parseInt(formData.departmentId)
      );
      setFilteredBeds(filtered);
    } else {
      setFilteredBeds(beds);
    }
  }, [formData.departmentId, beds]);

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const response = await doctorBedAPI.getDepartments();
      if (response && response.data && response.data.content) {
        setDepartments(response.data.content);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError('Không thể tải danh sách khoa');
    } finally {
      setLoadingDepartments(false);
    }
  };

  const fetchBeds = async () => {
    try {
      setLoadingBeds(true);
      const response = await doctorBedAPI.getAllAvailableBeds();
      if (response && response.data) {
        setBeds(response.data);
        setFilteredBeds(response.data);
      }
    } catch (err) {
      console.error('Error fetching beds:', err);
      setError('Không thể tải danh sách giường');
    } finally {
      setLoadingBeds(false);
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

    if (!formData.departmentId) {
      setError('Vui lòng chọn khoa');
      return;
    }

    if (!formData.admissionDiagnosis) {
      setError('Vui lòng nhập chẩn đoán nhập viện');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const submitData = {
        departmentId: parseInt(formData.departmentId),
        admissionDiagnosis: formData.admissionDiagnosis,
        admissionNotes: formData.admissionNotes,
        preferredBedId: formData.preferredBedId ? parseInt(formData.preferredBedId) : null,
      };

      await onSuccess(submitData);
    } catch (err) {
      console.error('Error admitting patient:', err);
      setError(err.message || 'Không thể nhập viện');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="admit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Nhập viện nội trú</h3>
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

          <div className="form-group">
            <label>
              Khoa điều trị <span className="required">*</span>
            </label>
            {loadingDepartments ? (
              <p className="loading-text">Đang tải danh sách khoa...</p>
            ) : (
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                required
              >
                <option value="">-- Chọn khoa --</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.departmentName}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label>
              Chẩn đoán nhập viện <span className="required">*</span>
            </label>
            <textarea
              name="admissionDiagnosis"
              value={formData.admissionDiagnosis}
              onChange={handleChange}
              placeholder="Nhập chẩn đoán nhập viện"
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label>Ghi chú nhập viện</label>
            <textarea
              name="admissionNotes"
              value={formData.admissionNotes}
              onChange={handleChange}
              placeholder="Nhập ghi chú (nếu có)"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Giường ưu tiên (tùy chọn)</label>
            {loadingBeds ? (
              <p className="loading-text">Đang tải danh sách giường...</p>
            ) : (
              <>
                <select
                  name="preferredBedId"
                  value={formData.preferredBedId}
                  onChange={handleChange}
                >
                  <option value="">-- Chọn giường (tùy chọn) --</option>
                  {filteredBeds.map((bed) => (
                    <option key={bed.hospitalBedId} value={bed.hospitalBedId}>
                      {bed.displayName} - {bed.departmentName} - {bed.roomNumber} ({bed.bedType})
                    </option>
                  ))}
                </select>
                {formData.departmentId && filteredBeds.length === 0 && (
                  <p className="info-text">Không có giường trống trong khoa này</p>
                )}
                {!formData.departmentId && (
                  <p className="info-text">Chọn khoa để xem giường trống</p>
                )}
                {filteredBeds.length > 0 && (
                  <p className="info-text">
                    Có {filteredBeds.length} giường trống
                    {formData.departmentId && ' trong khoa này'}
                  </p>
                )}
              </>
            )}
          </div>
        </form>

        <div className="modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button type="submit" className="btn-submit" onClick={handleSubmit} disabled={loading}>
            <FiSave /> {loading ? 'Đang xử lý...' : 'Nhập viện'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdmitInpatientModal;
