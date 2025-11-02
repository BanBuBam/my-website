import React, { useState, useEffect } from 'react';
import { FiX, FiUserPlus, FiUsers } from 'react-icons/fi';
import './AddEmployeeAccountModal.css';
import { hrEmployeeAPI } from '../../../services/staff/hrAPI';

const AddEmployeeAccountModal = ({ isOpen, onClose, onSubmit }) => {
  const [mode, setMode] = useState('existing'); // 'existing' or 'new'
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  
  // Form data for existing employee
  const [existingEmployeeForm, setExistingEmployeeForm] = useState({
    employeeId: '',
    username: '',
    password: '',
    confirmPassword: '',
    roles: [],
  });

  // Form data for new employee with account
  const [newEmployeeForm, setNewEmployeeForm] = useState({
    // Person info
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'MALE',
    phoneNumber: '',
    email: '',
    addressLine: '',
    idCardNumber: '',
    wardId: 1,
    nationId: 1,
    emergencyContactName: '',
    emergencyContactPhone: '',
    // Employee info
    departmentId: 1,
    employeeCode: '',
    jobTitle: '',
    roleType: 'RECEPTIONIST',
    specialization: '',
    licenseNumber: '',
    hireDate: '',
    // Account info
    username: '',
    password: '',
    confirmPassword: '',
    roles: [],
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
    if (isOpen && mode === 'existing') {
      fetchEmployees();
    }
  }, [isOpen, mode]);

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await hrEmployeeAPI.getEmployees();
      console.log('📋 Employees response:', response);
      if (response && response.data) {
        console.log('📋 Total employees:', response.data.length);
        console.log('📋 Employees without account:', response.data.filter(emp => !emp.hasAccount).length);
        console.log('📋 Sample employee:', response.data[0]);
        setEmployees(response.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      alert('Lỗi khi tải danh sách nhân viên: ' + error.message);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setErrors({});
  };

  const handleExistingEmployeeChange = (e) => {
    const { name, value } = e.target;
    setExistingEmployeeForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNewEmployeeChange = (e) => {
    const { name, value } = e.target;
    setNewEmployeeForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleToggle = (role) => {
    if (mode === 'existing') {
      setExistingEmployeeForm(prev => ({
        ...prev,
        roles: prev.roles.includes(role)
          ? prev.roles.filter(r => r !== role)
          : [...prev.roles, role]
      }));
    } else {
      setNewEmployeeForm(prev => ({
        ...prev,
        roles: prev.roles.includes(role)
          ? prev.roles.filter(r => r !== role)
          : [...prev.roles, role]
      }));
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

  const validateExistingEmployeeForm = () => {
    const newErrors = {};

    if (!existingEmployeeForm.employeeId) {
      newErrors.employeeId = 'Vui lòng chọn nhân viên';
    } else {
      // Kiểm tra employee có tồn tại trong danh sách không
      const selectedEmployee = employees.find(emp => emp.id === parseInt(existingEmployeeForm.employeeId));
      if (!selectedEmployee) {
        newErrors.employeeId = 'Nhân viên không tồn tại';
      } else if (selectedEmployee.hasAccount) {
        newErrors.employeeId = 'Nhân viên này đã có tài khoản';
      }
    }

    if (!existingEmployeeForm.username.trim()) {
      newErrors.username = 'Vui lòng nhập username';
    } else if (existingEmployeeForm.username.trim().length < 3) {
      newErrors.username = 'Username phải có ít nhất 3 ký tự';
    }

    if (!existingEmployeeForm.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else {
      const passwordError = validatePassword(existingEmployeeForm.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }

    if (existingEmployeeForm.password !== existingEmployeeForm.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (existingEmployeeForm.roles.length === 0) {
      newErrors.roles = 'Vui lòng chọn ít nhất 1 vai trò';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      console.log('❌ Validation errors:', newErrors);
    }

    return Object.keys(newErrors).length === 0;
  };

  const validateNewEmployeeForm = () => {
    const newErrors = {};
    
    // Person validation
    if (!newEmployeeForm.firstName.trim()) newErrors.firstName = 'Vui lòng nhập tên';
    if (!newEmployeeForm.lastName.trim()) newErrors.lastName = 'Vui lòng nhập họ';
    if (!newEmployeeForm.dateOfBirth) newErrors.dateOfBirth = 'Vui lòng chọn ngày sinh';
    if (!newEmployeeForm.phoneNumber.trim()) newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
    if (!newEmployeeForm.email.trim()) newErrors.email = 'Vui lòng nhập email';
    if (!newEmployeeForm.idCardNumber.trim()) newErrors.idCardNumber = 'Vui lòng nhập CMND/CCCD';
    
    // Employee validation
    if (!newEmployeeForm.employeeCode.trim()) newErrors.employeeCode = 'Vui lòng nhập mã nhân viên';
    if (!newEmployeeForm.jobTitle.trim()) newErrors.jobTitle = 'Vui lòng nhập chức vụ';
    if (!newEmployeeForm.hireDate) newErrors.hireDate = 'Vui lòng chọn ngày vào làm';
    
    // Account validation
    if (!newEmployeeForm.username.trim()) {
      newErrors.username = 'Vui lòng nhập username';
    } else if (newEmployeeForm.username.trim().length < 3) {
      newErrors.username = 'Username phải có ít nhất 3 ký tự';
    }

    if (!newEmployeeForm.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else {
      const passwordError = validatePassword(newEmployeeForm.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }

    if (newEmployeeForm.password !== newEmployeeForm.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (newEmployeeForm.roles.length === 0) {
      newErrors.roles = 'Vui lòng chọn ít nhất 1 vai trò';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      console.log('❌ Validation errors:', newErrors);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (mode === 'existing') {
        if (!validateExistingEmployeeForm()) return;

        const selectedEmployee = employees.find(emp => emp.id === parseInt(existingEmployeeForm.employeeId));

        const submitData = {
          employeeId: parseInt(existingEmployeeForm.employeeId),
          username: existingEmployeeForm.username.trim(),
          password: existingEmployeeForm.password,
          roles: existingEmployeeForm.roles,
          isActive: true, // Mặc định tài khoản mới là active
        };

        console.log('📤 Submitting existing employee account');
        console.log('📤 Selected employee:', selectedEmployee);
        console.log('📤 Submit data:', submitData);
        console.log('📤 Employee ID:', submitData.employeeId, 'Type:', typeof submitData.employeeId);
        console.log('📤 Username:', submitData.username);
        console.log('📤 Roles:', submitData.roles);
        console.log('📤 Has account?:', selectedEmployee?.hasAccount);

        await onSubmit(submitData, 'existing');
      } else {
        if (!validateNewEmployeeForm()) return;

        const submitData = {
          person: {
            firstName: newEmployeeForm.firstName.trim(),
            lastName: newEmployeeForm.lastName.trim(),
            dateOfBirth: newEmployeeForm.dateOfBirth,
            gender: newEmployeeForm.gender,
            phoneNumber: newEmployeeForm.phoneNumber.trim(),
            email: newEmployeeForm.email.trim(),
            addressLine: newEmployeeForm.addressLine.trim() || '',
            idCardNumber: newEmployeeForm.idCardNumber.trim(),
            wardId: parseInt(newEmployeeForm.wardId) || 1,
            nationId: parseInt(newEmployeeForm.nationId) || 1,
            emergencyContactName: newEmployeeForm.emergencyContactName.trim() || '',
            emergencyContactPhone: newEmployeeForm.emergencyContactPhone.trim() || '',
          },
          departmentId: parseInt(newEmployeeForm.departmentId) || 1,
          employeeCode: newEmployeeForm.employeeCode.trim(),
          jobTitle: newEmployeeForm.jobTitle.trim(),
          roleType: newEmployeeForm.roleType,
          specialization: newEmployeeForm.specialization.trim() || '',
          licenseNumber: newEmployeeForm.licenseNumber.trim() || '',
          hireDate: newEmployeeForm.hireDate,
          username: newEmployeeForm.username.trim(),
          password: newEmployeeForm.password,
          roles: newEmployeeForm.roles,
        };

        console.log('📤 Submitting new employee with account:', submitData);
        await onSubmit(submitData, 'new');
      }

      handleClose();
    } catch (error) {
      console.error('❌ Error in handleSubmit:', error);
      // Error đã được handle ở parent component
    }
  };

  const handleClose = () => {
    setMode('existing');
    setExistingEmployeeForm({
      employeeId: '',
      username: '',
      password: '',
      confirmPassword: '',
      roles: [],
    });
    setNewEmployeeForm({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'MALE',
      phoneNumber: '',
      email: '',
      addressLine: '',
      idCardNumber: '',
      wardId: 1,
      nationId: 1,
      emergencyContactName: '',
      emergencyContactPhone: '',
      departmentId: 1,
      employeeCode: '',
      jobTitle: '',
      roleType: 'RECEPTIONIST',
      specialization: '',
      licenseNumber: '',
      hireDate: '',
      username: '',
      password: '',
      confirmPassword: '',
      roles: [],
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

        {/* Mode Selection */}
        <div className="mode-selection">
          <button
            className={`mode-btn ${mode === 'existing' ? 'active' : ''}`}
            onClick={() => handleModeChange('existing')}
          >
            <FiUsers />
            <span>Tạo cho nhân viên có sẵn</span>
          </button>
          <button
            className={`mode-btn ${mode === 'new' ? 'active' : ''}`}
            onClick={() => handleModeChange('new')}
          >
            <FiUserPlus />
            <span>Tạo nhân viên mới + tài khoản</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'existing' ? (
            <ExistingEmployeeForm
              formData={existingEmployeeForm}
              employees={employees}
              loadingEmployees={loadingEmployees}
              errors={errors}
              availableRoles={AVAILABLE_ROLES}
              onChange={handleExistingEmployeeChange}
              onRoleToggle={handleRoleToggle}
            />
          ) : (
            <NewEmployeeForm
              formData={newEmployeeForm}
              errors={errors}
              availableRoles={AVAILABLE_ROLES}
              onChange={handleNewEmployeeChange}
              onRoleToggle={handleRoleToggle}
            />
          )}

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

// Sub-component: Form for existing employee
const ExistingEmployeeForm = ({ formData, employees, loadingEmployees, errors, availableRoles, onChange, onRoleToggle }) => (
  <div className="form-content">
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
              onChange={onChange}
              className={errors.employeeId ? 'error' : ''}
            >
              <option value="">-- Chọn nhân viên --</option>
              {employees
                .filter(emp => !emp.hasAccount) // Chỉ hiển thị nhân viên chưa có tài khoản
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

    <div className="form-section">
      <h3>Thông tin tài khoản</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Username <span className="required">*</span></label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
            placeholder="Nhập lại mật khẩu"
            className={errors.confirmPassword ? 'error' : ''}
          />
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
        </div>
      </div>

      <div className="form-group">
        <label>Vai trò <span className="required">*</span></label>
        <div className="roles-grid">
          {availableRoles.map(role => (
            <label key={role} className="role-checkbox">
              <input
                type="checkbox"
                checked={formData.roles.includes(role)}
                onChange={() => onRoleToggle(role)}
              />
              <span>{role}</span>
            </label>
          ))}
        </div>
        {errors.roles && <span className="error-message">{errors.roles}</span>}
      </div>
    </div>
  </div>
);

// Sub-component: Form for new employee with account
const NewEmployeeForm = ({ formData, errors, availableRoles, onChange, onRoleToggle }) => (
  <div className="form-content scrollable">
    <div className="form-section">
      <h3>Thông tin cá nhân</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Họ <span className="required">*</span></label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={onChange}
            placeholder="Nguyễn Văn"
            className={errors.lastName ? 'error' : ''}
          />
          {errors.lastName && <span className="error-message">{errors.lastName}</span>}
        </div>

        <div className="form-group">
          <label>Tên <span className="required">*</span></label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={onChange}
            placeholder="A"
            className={errors.firstName ? 'error' : ''}
          />
          {errors.firstName && <span className="error-message">{errors.firstName}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Ngày sinh <span className="required">*</span></label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={onChange}
            className={errors.dateOfBirth ? 'error' : ''}
          />
          {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
        </div>

        <div className="form-group">
          <label>Giới tính <span className="required">*</span></label>
          <select name="gender" value={formData.gender} onChange={onChange}>
            <option value="MALE">Nam</option>
            <option value="FEMALE">Nữ</option>
            <option value="OTHER">Khác</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Số điện thoại <span className="required">*</span></label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={onChange}
            placeholder="0123456789"
            className={errors.phoneNumber ? 'error' : ''}
          />
          {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
        </div>

        <div className="form-group">
          <label>Email <span className="required">*</span></label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            placeholder="example@email.com"
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>
      </div>

      <div className="form-group">
        <label>CMND/CCCD <span className="required">*</span></label>
        <input
          type="text"
          name="idCardNumber"
          value={formData.idCardNumber}
          onChange={onChange}
          placeholder="001234567890"
          className={errors.idCardNumber ? 'error' : ''}
        />
        {errors.idCardNumber && <span className="error-message">{errors.idCardNumber}</span>}
      </div>

      <div className="form-group">
        <label>Địa chỉ</label>
        <input
          type="text"
          name="addressLine"
          value={formData.addressLine}
          onChange={onChange}
          placeholder="Số nhà, đường, phường/xã"
        />
      </div>
    </div>

    <div className="form-section">
      <h3>Thông tin nhân viên</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Mã nhân viên <span className="required">*</span></label>
          <input
            type="text"
            name="employeeCode"
            value={formData.employeeCode}
            onChange={onChange}
            placeholder="E0001"
            className={errors.employeeCode ? 'error' : ''}
          />
          {errors.employeeCode && <span className="error-message">{errors.employeeCode}</span>}
        </div>

        <div className="form-group">
          <label>Chức vụ <span className="required">*</span></label>
          <input
            type="text"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={onChange}
            placeholder="Lễ tân"
            className={errors.jobTitle ? 'error' : ''}
          />
          {errors.jobTitle && <span className="error-message">{errors.jobTitle}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Loại vai trò <span className="required">*</span></label>
          <select name="roleType" value={formData.roleType} onChange={onChange}>
            <option value="RECEPTIONIST">Lễ tân</option>
            <option value="DOCTOR">Bác sĩ</option>
            <option value="NURSE">Điều dưỡng</option>
            <option value="PHARMACIST">Dược sĩ</option>
            <option value="LAB_TECH">Kỹ thuật viên</option>
            <option value="CASHIER">Thu ngân</option>
          </select>
        </div>

        <div className="form-group">
          <label>Ngày vào làm <span className="required">*</span></label>
          <input
            type="date"
            name="hireDate"
            value={formData.hireDate}
            onChange={onChange}
            className={errors.hireDate ? 'error' : ''}
          />
          {errors.hireDate && <span className="error-message">{errors.hireDate}</span>}
        </div>
      </div>

      <div className="form-group">
        <label>Chuyên môn</label>
        <input
          type="text"
          name="specialization"
          value={formData.specialization}
          onChange={onChange}
          placeholder="Ví dụ: Nội khoa"
        />
      </div>
    </div>

    <div className="form-section">
      <h3>Thông tin tài khoản</h3>
      <div className="form-group">
        <label>Username <span className="required">*</span></label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={onChange}
          placeholder="Nhập username"
          className={errors.username ? 'error' : ''}
        />
        {errors.username && <span className="error-message">{errors.username}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Mật khẩu <span className="required">*</span></label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={onChange}
            placeholder="Tối thiểu 8 ký tự"
            className={errors.password ? 'error' : ''}
          />
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label>Xác nhận mật khẩu <span className="required">*</span></label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={onChange}
            placeholder="Nhập lại mật khẩu"
            className={errors.confirmPassword ? 'error' : ''}
          />
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
        </div>
      </div>

      <div className="form-group">
        <label>Vai trò <span className="required">*</span></label>
        <div className="roles-grid">
          {availableRoles.map(role => (
            <label key={role} className="role-checkbox">
              <input
                type="checkbox"
                checked={formData.roles.includes(role)}
                onChange={() => onRoleToggle(role)}
              />
              <span>{role}</span>
            </label>
          ))}
        </div>
        {errors.roles && <span className="error-message">{errors.roles}</span>}
      </div>
    </div>
  </div>
);

export default AddEmployeeAccountModal;

