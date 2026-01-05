import React, { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import './EditEmployeeAccountModal.css';

const EditEmployeeAccountModal = ({ account, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '', // Thêm field email
    roles: [],
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  const AVAILABLE_ROLES = [
    'RECEPTIONIST',
    'DOCTOR',
    'NURSE',
    'PHARMACIST',
    'LAB_TECH',
    'CASHIER',
    'MANAGER',
    'ADMIN'
  ];

  useEffect(() => {
    if (account && isOpen) {
      setFormData({
        username: account.username || '',
        email: account.email || '', // Lấy email từ account prop
        roles: account.roles || [],
        isActive: account.isActive !== false,
      });
    }
  }, [account, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleToggle = (role) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Vui lòng nhập username';
    }
    
    // Thêm validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không đúng định dạng';
    }

    if (formData.roles.length === 0) {
      newErrors.roles = 'Vui lòng chọn ít nhất 1 vai trò';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    // Chuẩn bị payload đúng chuẩn theo API Document
    const submitData = {
      username: formData.username.trim(),
      email: formData.email.trim(), // Thêm email vào payload
      isActive: formData.isActive,
      roles: formData.roles, 
    };

    // Log kiểm tra
    console.log('📝 EditEmployeeAccountModal - Submitting...');
    console.log('📝 Submit data:', submitData);

    // API Endpoint: PUT /api/v1/employee-accounts/{id}
    const idToUse = account.id; // API thường dùng ID của account, không phải employeeId
    
    await onSubmit(idToUse, submitData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      username: '',
      email: '',
      roles: [],
      isActive: true,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen || !account) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content edit-account-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Chỉnh sửa Tài khoản</h2>
            <p className="account-info">
              {account.fullName} ({account.employeeCode})
            </p>
          </div>
          <button className="close-button" onClick={handleClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-content">
            <div className="form-section">
              <h3>Thông tin tài khoản</h3>
              
              {/* Username Input */}
              <div className="form-group">
                <label>Username <span className="required">*</span></label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Nhập username"
                  className={errors.username ? 'error' : ''}
                />
                {errors.username && <span className="error-message">{errors.username}</span>}
              </div>

              {/* Email Input - Mới thêm */}
              <div className="form-group">
                <label>Email <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Nhập email (ví dụ: bsy@hospital.com)"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              {/* Roles Selection */}
              <div className="form-group">
                <label>Vai trò <span className="required">*</span></label>
                <div className="roles-grid">
                  {AVAILABLE_ROLES.map(role => (
                    <label key={role} className="role-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.roles.includes(role)}
                        onChange={() => handleRoleToggle(role)}
                      />
                      <span>{role}</span>
                    </label>
                  ))}
                </div>
                {errors.roles && <span className="error-message">{errors.roles}</span>}
              </div>

              {/* Is Active Checkbox */}
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  <span>Tài khoản đang hoạt động</span>
                </label>
              </div>
            </div>

            <div className="info-section">
              <h4>ℹ️ Lưu ý:</h4>
              <ul>
                <li>Không thể thay đổi mật khẩu ở đây. Sử dụng chức năng "Reset mật khẩu" để đổi mật khẩu.</li>
                <li>Thay đổi vai trò sẽ ảnh hưởng đến quyền truy cập của nhân viên.</li>
                <li>Email được sử dụng để nhận thông báo và khôi phục mật khẩu.</li>
              </ul>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              Hủy
            </button>
            <button type="submit" className="btn-submit">
              <FiSave />
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployeeAccountModal;