import React, { useState } from 'react';
import './AddEmployeeModal.css';
import { FiX } from 'react-icons/fi';

const AddEmployeeModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
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
    isActive: true,
    hireDate: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Vui lòng nhập tên';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Vui lòng nhập họ';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại phải có 10-11 số';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Vui lòng chọn ngày sinh';
    }

    if (!formData.idCardNumber.trim()) {
      newErrors.idCardNumber = 'Vui lòng nhập CCCD';
    } else if (!/^[0-9]{9,12}$/.test(formData.idCardNumber)) {
      newErrors.idCardNumber = 'CCCD phải có 9-12 số';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.employeeCode.trim()) {
      newErrors.employeeCode = 'Vui lòng nhập mã nhân viên';
    }

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Vui lòng nhập chức vụ';
    }

    if (!formData.specialization.trim()) {
      newErrors.specialization = 'Vui lòng nhập chuyên môn';
    }

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'Vui lòng nhập số giấy phép';
    }

    if (!formData.hireDate) {
      newErrors.hireDate = 'Vui lòng chọn ngày vào làm';
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Build the request data according to API structure
    const submitData = {
      person: {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim(),
        addressLine: formData.addressLine.trim() || '',
        idCardNumber: formData.idCardNumber.trim(),
        wardId: Number(formData.wardId) || 1,
        nationId: Number(formData.nationId) || 1,
        emergencyContactName: formData.emergencyContactName.trim() || '',
        emergencyContactPhone: formData.emergencyContactPhone.trim() || ''
      },
      departmentId: Number(formData.departmentId) || 1,
      employeeCode: formData.employeeCode.trim(),
      jobTitle: formData.jobTitle.trim(),
      roleType: formData.roleType,
      specialization: formData.specialization.trim(),
      licenseNumber: formData.licenseNumber.trim(),
      isActive: formData.isActive !== false,
      hireDate: formData.hireDate
    };

    console.log('Submitting employee data:', JSON.stringify(submitData, null, 2));
    console.log('Access Token:', localStorage.getItem('staffAccessToken') ? 'Present' : 'Missing');

    try {
      await onSubmit(submitData);
      handleClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Lỗi khi thêm nhân viên: ' + error.message);
    }
  };

  const handleClose = () => {
    setFormData({
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
      isActive: true,
      hireDate: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Thêm Nhân viên mới</h2>
          <button className="close-button" onClick={handleClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="employee-form">
          <div className="form-grid">
            {/* Thông tin cá nhân */}
            <div className="form-section">
              <h3>Thông tin cá nhân</h3>
              
              <div className="form-group">
                <label>Họ <span className="required">*</span></label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Nhập họ"
                />
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>

              <div className="form-group">
                <label>Tên <span className="required">*</span></label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Nhập tên"
                />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label>Giới tính <span className="required">*</span></label>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                </select>
              </div>

              <div className="form-group">
                <label>Ngày sinh <span className="required">*</span></label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
                {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
              </div>

              <div className="form-group">
                <label>Số điện thoại <span className="required">*</span></label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="0123456789"
                />
                {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
              </div>

              <div className="form-group">
                <label>Email <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@hospital.com"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label>CCCD <span className="required">*</span></label>
                <input
                  type="text"
                  name="idCardNumber"
                  value={formData.idCardNumber}
                  onChange={handleChange}
                  placeholder="Nhập số CCCD"
                />
                {errors.idCardNumber && <span className="error-message">{errors.idCardNumber}</span>}
              </div>

              <div className="form-group">
                <label>Địa chỉ</label>
                <input
                  type="text"
                  name="addressLine"
                  value={formData.addressLine}
                  onChange={handleChange}
                  placeholder="Số nhà, đường, quận, thành phố"
                />
              </div>

              <div className="form-group">
                <label>Người liên hệ khẩn cấp</label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  placeholder="Tên người liên hệ"
                />
              </div>

              <div className="form-group">
                <label>SĐT người liên hệ khẩn cấp</label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  placeholder="0123456789"
                />
              </div>
            </div>

            {/* Thông tin công việc */}
            <div className="form-section">
              <h3>Thông tin công việc</h3>

              <div className="form-group">
                <label>Mã nhân viên <span className="required">*</span></label>
                <input
                  type="text"
                  name="employeeCode"
                  value={formData.employeeCode}
                  onChange={handleChange}
                  placeholder="Ví dụ: EMP001"
                />
                {errors.employeeCode && <span className="error-message">{errors.employeeCode}</span>}
              </div>

              <div className="form-group">
                <label>Phòng ban <span className="required">*</span></label>
                <select name="departmentId" value={formData.departmentId} onChange={handleChange}>
                  <option value="1">Khoa Nội</option>
                  <option value="2">Khoa Ngoại</option>
                  <option value="3">Khoa Sản</option>
                  <option value="4">Khoa Nhi</option>
                </select>
              </div>

              <div className="form-group">
                <label>Chức vụ <span className="required">*</span></label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  placeholder="Ví dụ: Lễ tân"
                />
                {errors.jobTitle && <span className="error-message">{errors.jobTitle}</span>}
              </div>

              <div className="form-group">
                <label>Loại vai trò <span className="required">*</span></label>
                <select name="roleType" value={formData.roleType} onChange={handleChange}>
                  <option value="RECEPTIONIST">Lễ tân</option>
                  <option value="DOCTOR">Bác sĩ</option>
                  <option value="NURSE">Điều dưỡng</option>
                  <option value="PHARMACIST">Dược sĩ</option>
                  <option value="LAB_TECH">Kỹ thuật viên</option>
                  <option value="CASHIER">Thu ngân</option>
                </select>
              </div>

              <div className="form-group">
                <label>Chuyên môn <span className="required">*</span></label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="Ví dụ: Lễ tân"
                />
                {errors.specialization && <span className="error-message">{errors.specialization}</span>}
              </div>

              <div className="form-group">
                <label>Số giấy phép <span className="required">*</span></label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="Ví dụ: LT-00001"
                />
                {errors.licenseNumber && <span className="error-message">{errors.licenseNumber}</span>}
              </div>

              <div className="form-group">
                <label>Ngày vào làm <span className="required">*</span></label>
                <input
                  type="date"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleChange}
                />
                {errors.hireDate && <span className="error-message">{errors.hireDate}</span>}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              Hủy
            </button>
            <button type="submit" className="btn-submit">
              Thêm nhân viên
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;

