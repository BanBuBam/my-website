import React, { useState, useEffect } from 'react';
import './CreateRoleModal.css';
import { FiX, FiPlus, FiShield } from 'react-icons/fi';
import { adminRoleAPI } from '../../../services/staff/adminAPI';

const CreateRoleModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    roleName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        roleName: '',
      });
      setError(null);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const roleName = formData.roleName.trim();

    if (!roleName) {
      setError('Vui lòng nhập tên role');
      return false;
    }

    if (roleName.length < 2 || roleName.length > 255) {
      setError('Tên role phải có độ dài từ 2-255 ký tự');
      return false;
    }

    if (!roleName.startsWith('ROLE_')) {
      setError('Tên role phải bắt đầu bằng "ROLE_"');
      return false;
    }

    if (!/^[A-Z_]+$/.test(roleName)) {
      setError('Tên role chỉ được chứa chữ cái in hoa và dấu gạch dưới');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await adminRoleAPI.createRole({
        roleName: formData.roleName.trim()
      });

      if (response && (response.status === 'CREATED' || response.status === 'OK')) {
        alert('Tạo role mới thành công!');
        onSuccess && onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Error creating role:', err);
      if (err.message && err.message.includes('unique')) {
        setError('Tên role đã tồn tại. Vui lòng chọn tên khác!');
      } else {
        setError(err.message || 'Không thể tạo role. Vui lòng thử lại!');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-role-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2><FiShield /> Tạo Role mới</h2>
          <button className="btn-close" onClick={onClose} disabled={loading}>
            <FiX />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="roleName">
                Tên Role <span className="required">*</span>
              </label>
              <input
                type="text"
                id="roleName"
                name="roleName"
                value={formData.roleName}
                onChange={handleChange}
                placeholder="Ví dụ: ROLE_PHARMACIST"
                className="form-control"
                disabled={loading}
                required
              />
              <small className="form-hint">
                • Độ dài: 2-255 ký tự<br />
                • Bắt đầu bằng "ROLE_"<br />
                • Chỉ chứa chữ cái in hoa và dấu gạch dưới (_)<br />
                • Phải là duy nhất trong hệ thống
              </small>
            </div>

            <div className="info-box">
              <strong>Ví dụ tên role hợp lệ:</strong>
              <ul>
                <li>ROLE_PHARMACIST</li>
                <li>ROLE_SENIOR_DOCTOR</li>
                <li>ROLE_LAB_TECHNICIAN</li>
                <li>ROLE_DEPARTMENT_HEAD</li>
              </ul>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Đang tạo...
                </>
              ) : (
                <>
                  <FiPlus /> Tạo Role
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoleModal;

