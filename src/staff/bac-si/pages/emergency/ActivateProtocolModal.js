import React, { useState, useEffect } from 'react';
import { departmentAPI } from '../../../../services/staff/doctorAPI';
import { FiX, FiSave, FiAlertCircle, FiAlertTriangle } from 'react-icons/fi';
import './ActivateProtocolModal.css';

const ActivateProtocolModal = ({ patientId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  const protocolTypes = [
    { value: 'CODE_BLUE', label: 'CODE BLUE - Ngừng tim/ngừng thở', color: '#1e40af' },
    { value: 'CODE_RED', label: 'CODE RED - Cháy nổ', color: '#dc2626' },
    { value: 'CODE_ORANGE', label: 'CODE ORANGE - Thảm họa hàng loạt', color: '#ea580c' },
    { value: 'CODE_PINK', label: 'CODE PINK - Bắt cóc trẻ em', color: '#ec4899' },
    { value: 'STROKE_ALERT', label: 'STROKE ALERT - Đột quỵ', color: '#7c3aed' },
    { value: 'STEMI_ALERT', label: 'STEMI ALERT - Nhồi máu cơ tim', color: '#dc2626' },
    { value: 'TRAUMA_ALERT', label: 'TRAUMA ALERT - Chấn thương nặng', color: '#ea580c' },
  ];

  const severityLevels = [
    { value: 'CRITICAL', label: 'Nguy kịch' },
    { value: 'HIGH', label: 'Cao' },
    { value: 'MEDIUM', label: 'Trung bình' },
    { value: 'LOW', label: 'Thấp' },
  ];

  const [formData, setFormData] = useState({
    protocolType: '',
    departmentId: '',
    patientId: patientId || '',
    location: '',
    severityLevel: 'CRITICAL',
    description: '',
    additionalNotes: '',
    specificDetails: '',
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const response = await departmentAPI.getDepartments('', 0, 100);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.protocolType) {
      setError('Vui lòng chọn loại protocol');
      return;
    }

    if (!formData.departmentId) {
      setError('Vui lòng chọn khoa');
      return;
    }

    if (!formData.location) {
      setError('Vui lòng nhập vị trí');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const submitData = {
        ...formData,
        departmentId: parseInt(formData.departmentId),
        patientId: formData.patientId ? parseInt(formData.patientId) : null,
      };

      await onSuccess(submitData);
    } catch (err) {
      console.error('Error activating protocol:', err);
      setError(err.message || 'Không thể kích hoạt protocol');
    } finally {
      setLoading(false);
    }
  };

  const getProtocolColor = () => {
    const protocol = protocolTypes.find((p) => p.value === formData.protocolType);
    return protocol ? protocol.color : '#6b7280';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="protocol-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ borderLeftColor: getProtocolColor() }}>
          <div className="header-content">
            <FiAlertTriangle className="header-icon" style={{ color: getProtocolColor() }} />
            <h3>Kích hoạt Protocol Khẩn cấp</h3>
          </div>
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

          <div className="warning-banner">
            <FiAlertTriangle />
            <span>
              Kích hoạt protocol sẽ thông báo đến toàn bộ nhân viên liên quan. Vui lòng đảm bảo
              thông tin chính xác.
            </span>
          </div>

          {/* Protocol Type */}
          <div className="form-group">
            <label>
              Loại Protocol <span className="required">*</span>
            </label>
            <select
              name="protocolType"
              value={formData.protocolType}
              onChange={handleChange}
              required
              className="protocol-select"
            >
              <option value="">-- Chọn loại protocol --</option>
              {protocolTypes.map((protocol) => (
                <option key={protocol.value} value={protocol.value}>
                  {protocol.label}
                </option>
              ))}
            </select>
          </div>

          {/* Department & Location */}
          <div className="form-row">
            <div className="form-group">
              <label>
                Khoa <span className="required">*</span>
              </label>
              {loadingDepartments ? (
                <p className="loading-text">Đang tải...</p>
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
                Vị trí <span className="required">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="VD: Phòng cấp cứu, Giường 5..."
                required
              />
            </div>
          </div>

          {/* Severity & Patient ID */}
          <div className="form-row">
            <div className="form-group">
              <label>
                Mức độ nghiêm trọng <span className="required">*</span>
              </label>
              <select
                name="severityLevel"
                value={formData.severityLevel}
                onChange={handleChange}
                required
              >
                {severityLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Patient ID (tùy chọn)</label>
              <input
                type="number"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                placeholder="Nhập Patient ID"
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Mô tả tình huống</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Mô tả ngắn gọn tình huống khẩn cấp"
              rows="2"
            />
          </div>

          {/* Specific Details */}
          <div className="form-group">
            <label>Chi tiết cụ thể</label>
            <textarea
              name="specificDetails"
              value={formData.specificDetails}
              onChange={handleChange}
              placeholder="VD: Dấu hiệu sinh tồn, triệu chứng, thời gian xảy ra..."
              rows="3"
            />
          </div>

          {/* Additional Notes */}
          <div className="form-group">
            <label>Ghi chú bổ sung</label>
            <textarea
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleChange}
              placeholder="Ghi chú thêm (nếu có)"
              rows="2"
            />
          </div>
        </form>

        <div className="modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button
            type="submit"
            className="btn-submit btn-emergency"
            onClick={handleSubmit}
            disabled={loading}
          >
            <FiAlertTriangle /> {loading ? 'Đang kích hoạt...' : 'Kích hoạt Protocol'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivateProtocolModal;
