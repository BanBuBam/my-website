import React, { useState, useEffect } from 'react';
import './EditRoleModal.css';
import { FiX, FiSave, FiShield } from 'react-icons/fi';
import { adminRoleAPI } from '../../../services/staff/adminAPI';

const EditRoleModal = ({ isOpen, onClose, role, onSuccess }) => {
  const [formData, setFormData] = useState({
    roleName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && role) {
      setFormData({
        roleName: role.roleName || '',
      });
      setError(null);
    }
  }, [isOpen, role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.roleName.trim()) {
      setError('Vui lòng nhập tên role');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await adminRoleAPI.updateRole(role.roleId, {
        roleName: formData.roleName.trim()
      });

      if (response && response.status === 'OK') {
        onSuccess && onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Error updating role:', err);
      setError(err.message || 'Không thể cập nhật role');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content edit-role-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2><FiShield /> Chỉnh sửa Role</h2>
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
              <label htmlFor="roleId">ID Role</label>
              <input
                type="text"
                id="roleId"
                value={role?.roleId || ''}
                disabled
                className="form-control disabled"
              />
            </div>

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
                placeholder="Ví dụ: ROLE_SENIOR_PHARMACIST"
                className="form-control"
                disabled={loading}
                required
              />
              <small className="form-hint">
                Tên role phải viết hoa, bắt đầu bằng "ROLE_" và không chứa khoảng trắng
              </small>
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
                  Đang lưu...
                </>
              ) : (
                <>
                  <FiSave /> Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRoleModal;

