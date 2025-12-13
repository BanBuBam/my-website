import React, { useState, useEffect } from 'react';
import { FiX, FiUserPlus, FiUsers } from 'react-icons/fi';
import './AddEmployeeAccountModal.css';
import { adminEmployeeAPI } from '../../../services/staff/adminAPI';

const AddEmployeeAccountModal = ({ isOpen, onClose, onSubmit }) => {
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Form data - API: POST /api/v1/employee-accounts
  // Request body: { employeeId, username, password, isActive }
  const [formData, setFormData] = useState({
    employeeId: '',
    username: '',
    password: '',
    confirmPassword: '',
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await adminEmployeeAPI.getEmployees();
      console.log('📋 Employees response:', response);
      if (response && response.data) {
        const employeeList = response.data.content || response.data;
        console.log('📋 Total employees:', employeeList.length);
        console.log('📋 Employees without account:', employeeList.filter(emp => !emp.hasAccount).length);
        console.log('📋 Sample employee:', employeeList[0]);
        setEmployees(employeeList);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      alert('Lỗi khi tải danh sách nhân viên: ' + error.message);
    } finally {
      setLoadingEmployees(false);
    }
  };

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

  const validatePassword = (password) => {
    // Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!minLength) return 'Mật khẩu phải có ít nhất 8 ký tự';
    if (!hasUpperCase) return 'Mật khẩu phải có ít nhất 1 chữ hoa';
    if (!hasLowerCase) return 'Mật khẩu phải có ít nhất 1 chữ thường';
    if (!hasNumber) return 'Mật khẩu phải có ít nhất 1 chữ số';
    if (!hasSpecialChar) return 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*...)';

    return null;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Vui lòng chọn nhân viên';
    } else {
      const selectedEmployee = employees.find(emp => emp.id === parseInt(formData.employeeId));
      if (!selectedEmployee) {
        newErrors.employeeId = 'Nhân viên không tồn tại';
      } else if (selectedEmployee.hasAccount) {
        newErrors.employeeId = 'Tất cả nhân viên đã có tài khoản';
      }
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Vui lòng nhập username';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username phải có ít nhất 3 ký tự';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else {
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      console.log('❌ Validation errors:', newErrors);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const selectedEmployee = employees.find(emp => emp.id === parseInt(formData.employeeId));

      // Prepare data theo đúng API specification
      // API: POST /api/v1/employee-accounts
      // Request body: { employeeId, username, password, isActive }
      const submitData = {
        employeeId: parseInt(formData.employeeId),
        username: formData.username.trim(),
        password: formData.password,
        isActive: formData.isActive,
      };

      console.log('📤 Submitting employee account');
      console.log('📤 Selected employee:', selectedEmployee);
      console.log('📤 Submit data:', submitData);

      await onSubmit(submitData);
      handleClose();
    } catch (error) {
      console.error('❌ Error in handleSubmit:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      employeeId: '',
      username: '',
      password: '',
      confirmPassword: '',
      isActive: true,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content add-account-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Tạo Tài khoản Nhân viên</h2>
          <button className="close-button" onClick={handleClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-content">
            {/* Thông tin nhân viên */}
            <div className="form-section">
              <h3>Thông tin nhân viên</h3>
              <div className="form-group">
                <label>Chọn nhân viên <span className="required">*</span></label>
                {loadingEmployees ? (
                  <p>Đang tải danh sách nhân viên...</p>
                ) : (
                  <>
                    <select
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      className={errors.employeeId ? 'error' : ''}
                    >
                      <option value="">-- Chọn nhân viên --</option>
                      {employees
                        .filter(emp => !emp.hasAccount)
                        .map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {emp.employeeCode} - {emp.person?.firstName} {emp.person?.lastName} ({emp.jobTitle})
                          </option>
                        ))}
                    </select>
                    {employees.filter(emp => !emp.hasAccount).length === 0 && (
                      <small style={{ color: '#ff6b6b', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                        Tất cả nhân viên đã có tài khoản
                      </small>
                    )}
                  </>
                )}
                {errors.employeeId && <span className="error-message">{errors.employeeId}</span>}
              </div>
            </div>

            {/* Thông tin tài khoản */}
            <div className="form-section">
              <h3>Thông tin tài khoản</h3>
              <div className="form-row">
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
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mật khẩu <span className="required">*</span></label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="VD: Admin@123"
                    className={errors.password ? 'error' : ''}
                  />
                  {errors.password && <span className="error-message">{errors.password}</span>}
                  {!errors.password && (
                    <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      Mật khẩu phải có: chữ hoa, chữ thường, số và ký tự đặc biệt (!@#$%...)
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label>Xác nhận mật khẩu <span className="required">*</span></label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Nhập lại mật khẩu"
                    className={errors.confirmPassword ? 'error' : ''}
                  />
                  {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  <span>Kích hoạt tài khoản ngay</span>
                </label>
                <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                  Nếu bỏ chọn, tài khoản sẽ bị vô hiệu hóa và không thể đăng nhập
                </small>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              Hủy
            </button>
            <button type="submit" className="btn-submit">
              Tạo tài khoản
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeAccountModal;

