import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiTrash2 } from 'react-icons/fi';
import './EditEmployeeModal.css';

const EditEmployeeModal = ({ employee, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    // Person data
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
    
    // Employee data
    employeeCode: '',
    departmentId: 1,
    jobTitle: '',
    roleType: 'RECEPTIONIST',
    specialization: '',
    licenseNumber: '',
    isActive: true,
    hireDate: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      const person = employee.person || {};
      setFormData({
        // Person data
        firstName: person.firstName || '',
        lastName: person.lastName || '',
        dateOfBirth: person.dateOfBirth || '',
        gender: person.gender || 'MALE',
        phoneNumber: person.phoneNumber || '',
        email: person.email || '',
        addressLine: person.addressLine || '',
        idCardNumber: person.idCardNumber || '',
        wardId: person.wardId || 1,
        nationId: person.nationId || 1,
        emergencyContactName: person.emergencyContactName || '',
        emergencyContactPhone: person.emergencyContactPhone || '',
        
        // Employee data
        employeeCode: employee.employeeCode || '',
        departmentId: employee.department?.id || 1,
        jobTitle: employee.jobTitle || '',
        roleType: employee.roleType || 'RECEPTIONIST',
        specialization: employee.specialization || '',
        licenseNumber: employee.licenseNumber || '',
        isActive: employee.isActive !== undefined ? employee.isActive : true,
        hireDate: employee.hireDate || '',
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Build the request body matching API UPDATE structure
      // API UPDATE requires nested person object like CREATE
      const requestData = {
        person: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          phoneNumber: formData.phoneNumber.trim(),
          email: formData.email.trim(),
          addressLine: formData.addressLine.trim(),
          idCardNumber: formData.idCardNumber.trim(),
          wardId: parseInt(formData.wardId),
          nationId: parseInt(formData.nationId),
          emergencyContactName: formData.emergencyContactName.trim() || '',
          emergencyContactPhone: formData.emergencyContactPhone.trim() || '',
        },
        departmentId: parseInt(formData.departmentId),
        employeeCode: formData.employeeCode.trim(),
        jobTitle: formData.jobTitle.trim(),
        roleType: formData.roleType,
        specialization: formData.specialization.trim(),
        licenseNumber: formData.licenseNumber.trim(),
        isActive: formData.isActive,
        hireDate: formData.hireDate,
      };

      console.log('Submitting update with data:', requestData);
      await onSave(requestData);
      onClose();
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Lỗi khi lưu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      setLoading(true);
      try {
        await onDelete(employee.id);
        onClose();
      } catch (error) {
        console.error('Error deleting employee:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!employee) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content edit-employee-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Thông Tin Nhân viên</h2>
          <button className="btn-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              {/* Left Column - Personal Info */}
              <div className="form-section">
                <h3>Thông tin cá nhân</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Họ *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Tên *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Giới tính *</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} required>
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Ngày sinh *</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>CCCD/CMND *</label>
                  <input
                    type="text"
                    name="idCardNumber"
                    value={formData.idCardNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Địa chỉ *</label>
                  <textarea
                    name="addressLine"
                    value={formData.addressLine}
                    onChange={handleChange}
                    rows="2"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Người liên hệ khẩn cấp</label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>SĐT liên hệ khẩn cấp</label>
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Employment Info */}
              <div className="form-section">
                <h3>Thông tin công việc</h3>
                
                <div className="form-group">
                  <label>Mã nhân viên *</label>
                  <input
                    type="text"
                    name="employeeCode"
                    value={formData.employeeCode}
                    onChange={handleChange}
                    required
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Phòng ban *</label>
                  <select name="departmentId" value={formData.departmentId} onChange={handleChange} required>
                    <option value="1">Khoa Nội</option>
                    <option value="2">Khoa Ngoại</option>
                    <option value="3">Khoa Sản</option>
                    <option value="4">Khoa Nhi</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Chức vụ *</label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Loại vai trò *</label>
                  <select name="roleType" value={formData.roleType} onChange={handleChange} required>
                    <option value="RECEPTIONIST">Lễ tân</option>
                    <option value="DOCTOR">Bác sĩ</option>
                    <option value="NURSE">Điều dưỡng</option>
                    <option value="PHARMACIST">Dược sĩ</option>
                    <option value="LAB_TECH">Kỹ thuật viên</option>
                    <option value="CASHIER">Thu ngân</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Chuyên môn *</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Số giấy phép *</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Ngày vào làm *</label>
                  <input
                    type="date"
                    name="hireDate"
                    value={formData.hireDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    <span>Đang làm việc</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-delete-employee" onClick={handleDelete} disabled={loading}>
              <FiTrash2 /> Xóa nhân viên
            </button>
            <div className="footer-actions">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                Hủy
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                <FiSave /> {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployeeModal;

