import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { hrTimeOffAPI } from '../../../services/staff/hrAPI';
import './EditTimeOffRequestModal.css';

const EditTimeOffRequestModal = ({ isOpen, onClose, onSuccess, requestData }) => {
  const [formData, setFormData] = useState({
    leaveType: 'ANNUAL_LEAVE',
    startDate: '',
    endDate: '',
    startTime: '08:00',
    endTime: '17:00',
    totalDays: 0,
    reason: '',
    contactDuringLeave: '',
    emergencyContact: '',
    isHalfDay: false,
    isPaid: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const leaveTypes = [
    { value: 'ANNUAL_LEAVE', label: 'Nghỉ phép năm' },
    { value: 'SICK_LEAVE', label: 'Nghỉ ốm' },
    { value: 'PERSONAL_LEAVE', label: 'Nghỉ cá nhân' },
    { value: 'MATERNITY_LEAVE', label: 'Nghỉ thai sản' },
    { value: 'UNPAID_LEAVE', label: 'Nghỉ không lương' },
    { value: 'EMERGENCY_LEAVE', label: 'Nghỉ khẩn cấp' },
  ];

  useEffect(() => {
    if (requestData && isOpen) {
      setFormData({
        leaveType: requestData.leaveType || 'ANNUAL_LEAVE',
        startDate: requestData.startDate || '',
        endDate: requestData.endDate || '',
        startTime: requestData.startTime?.substring(0, 5) || '08:00',
        endTime: requestData.endTime?.substring(0, 5) || '17:00',
        totalDays: requestData.totalDays || 0,
        reason: requestData.reason || '',
        contactDuringLeave: requestData.contactDuringLeave || '',
        emergencyContact: requestData.emergencyContact || '',
        isHalfDay: requestData.isHalfDay || false,
        isPaid: requestData.isPaid !== false,
      });
      setError('');
    }
  }, [requestData, isOpen]);

  const calculateTotalDays = (start, end, isHalf) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isHalf ? diffDays * 0.5 : diffDays;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: newValue };
      
      if (name === 'startDate' || name === 'endDate' || name === 'isHalfDay') {
        updated.totalDays = calculateTotalDays(
          updated.startDate,
          updated.endDate,
          updated.isHalfDay
        );
      }
      
      return updated;
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.startDate) {
      setError('Vui lòng chọn ngày bắt đầu');
      return false;
    }
    if (!formData.endDate) {
      setError('Vui lòng chọn ngày kết thúc');
      return false;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('Ngày kết thúc phải sau ngày bắt đầu');
      return false;
    }
    if (!formData.reason.trim()) {
      setError('Vui lòng nhập lý do');
      return false;
    }
    if (!formData.contactDuringLeave.trim()) {
      setError('Vui lòng nhập số điện thoại liên hệ');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime + ':00',
        endTime: formData.endTime + ':00',
        totalDays: formData.totalDays,
        reason: formData.reason,
        contactDuringLeave: formData.contactDuringLeave,
        emergencyContact: formData.emergencyContact,
        isHalfDay: formData.isHalfDay,
        isPaid: formData.isPaid,
      };

      const response = await hrTimeOffAPI.updateTimeOffRequest(requestData.id, payload);
      
      if (response.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(response.error || 'Lỗi khi cập nhật đơn nghỉ phép');
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật đơn nghỉ phép');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modalOverlay">
      <div className="modal">
        <div className="modalHeader">
          <h2>Chỉnh Sửa Đơn Nghỉ Phép</h2>
          <button className="closeBtn" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {error && <div className="error">{error}</div>}

          <div className="formGroup">
            <label>Loại Nghỉ Phép *</label>
            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleInputChange}
              className="input"
            >
              {leaveTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="formRow">
            <div className="formGroup">
              <label>Ngày Bắt Đầu *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="input"
              />
            </div>
            <div className="formGroup">
              <label>Ngày Kết Thúc *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="input"
              />
            </div>
          </div>

          <div className="formRow">
            <div className="formGroup">
              <label>Giờ Bắt Đầu</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className="input"
              />
            </div>
            <div className="formGroup">
              <label>Giờ Kết Thúc</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className="input"
              />
            </div>
          </div>

          <div className="formGroup">
            <label>Tổng Số Ngày: {formData.totalDays.toFixed(1)}</label>
          </div>

          <div className="formGroup">
            <label>Lý Do *</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              className="textarea"
              rows="3"
              placeholder="Nhập lý do nghỉ phép"
            />
          </div>

          <div className="formGroup">
            <label>Số Điện Thoại Liên Hệ *</label>
            <input
              type="tel"
              name="contactDuringLeave"
              value={formData.contactDuringLeave}
              onChange={handleInputChange}
              className="input"
              placeholder="0123456789"
            />
          </div>

          <div className="formGroup">
            <label>Số Điện Thoại Khẩn Cấp</label>
            <input
              type="tel"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleInputChange}
              className="input"
              placeholder="0987654321"
            />
          </div>

          <div className="checkboxGroup">
            <label>
              <input
                type="checkbox"
                name="isHalfDay"
                checked={formData.isHalfDay}
                onChange={handleInputChange}
              />
              Nửa ngày
            </label>
            <label>
              <input
                type="checkbox"
                name="isPaid"
                checked={formData.isPaid}
                onChange={handleInputChange}
              />
              Có lương
            </label>
          </div>

          <div className="formActions">
            <button
              type="button"
              className="cancelBtn"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="submitBtn"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Cập Nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTimeOffRequestModal;

