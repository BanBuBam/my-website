import React, { useState, useEffect } from 'react';
import './CreateEmployeePage.css';
import { FiSave, FiX, FiUser, FiBriefcase, FiMapPin, FiPhone } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { adminEmployeeAPI, adminDepartmentAPI } from '../../../../services/staff/adminAPI';

const CreateEmployeePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [departments, setDepartments] = useState([]);

    // Form data state
    const [formData, setFormData] = useState({
        // Person info
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'MALE',
        idCardNumber: '',
        phoneNumber: '',
        email: '',
        addressLine: '',
        wardId: 1,
        nationId: 1,
        photoUrl: '',
        emergencyContactName: '',
        emergencyContactPhone: '',

        // Employee info
        departmentId: '',
        employeeCode: '',
        jobTitle: '',
        roleType: 'DOCTOR',
        specialization: '',
        licenseNumber: '',
        isActive: true,
        hireDate: new Date().toISOString().split('T')[0],
    });

    // Fetch departments on mount
    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await adminDepartmentAPI.getDepartments();
            if (response && response.data) {
                setDepartments(response.data);
            }
        } catch (err) {
            console.error('Error fetching departments:', err);
        }
    };

    // Handle input change
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    // Validate form
    const validateForm = () => {
        if (!formData.firstName || !formData.firstName.trim()) {
            setError('Vui lòng nhập họ và tên đệm');
            return false;
        }
        if (!formData.lastName || !formData.lastName.trim()) {
            setError('Vui lòng nhập tên');
            return false;
        }
        if (!formData.dateOfBirth) {
            setError('Vui lòng chọn ngày sinh');
            return false;
        }
        if (!formData.phoneNumber || !formData.phoneNumber.trim()) {
            setError('Vui lòng nhập số điện thoại');
            return false;
        }
        if (!formData.email || !formData.email.trim()) {
            setError('Vui lòng nhập email');
            return false;
        }
        if (!formData.departmentId) {
            setError('Vui lòng chọn khoa');
            return false;
        }
        if (!formData.employeeCode || !formData.employeeCode.trim()) {
            setError('Vui lòng nhập mã nhân viên');
            return false;
        }
        if (!formData.jobTitle || !formData.jobTitle.trim()) {
            setError('Vui lòng nhập chức vụ');
            return false;
        }
        if (!formData.hireDate) {
            setError('Vui lòng chọn ngày vào làm');
            return false;
        }
        return true;
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Prepare data for API
            const fullName = `${formData.firstName} ${formData.lastName}`.trim();

            const employeeData = {
                person: {
                    firstName: formData.firstName || null,
                    lastName: formData.lastName || null,
                    fullName: fullName || null,
                    dateOfBirth: formData.dateOfBirth || null,
                    gender: formData.gender || null,
                    idCardNumber: formData.idCardNumber || null,
                    phoneNumber: formData.phoneNumber || null,
                    email: formData.email || null,
                    addressLine: formData.addressLine || null,
                    wardId: formData.wardId ? parseInt(formData.wardId) : null,
                    nationId: formData.nationId ? parseInt(formData.nationId) : null,
                    photoUrl: formData.photoUrl || null,
                    emergencyContactName: formData.emergencyContactName || null,
                    emergencyContactPhone: formData.emergencyContactPhone || null,
                },
                departmentId: formData.departmentId ? parseInt(formData.departmentId) : null,
                employeeCode: formData.employeeCode || null,
                jobTitle: formData.jobTitle || null,
                roleType: formData.roleType || null,
                specialization: formData.specialization || null,
                licenseNumber: formData.licenseNumber || null,
                isActive: formData.isActive,
                hireDate: formData.hireDate || null,
            };

            const response = await adminEmployeeAPI.createEmployee(employeeData);

            if (response && response.data) {
                setSuccess('Tạo nhân viên thành công!');
                setTimeout(() => {
                    navigate('/staff/admin/employees');
                }, 1500);
            }
        } catch (err) {
            console.error('Error creating employee:', err);
            setError(err.message || 'Không thể tạo nhân viên. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        navigate('/staff/admin/employees');
    };

    return (
        <div className="create-employee-page">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h2>Tạo mới Nhân viên</h2>
                    <p>Điền đầy đủ thông tin để tạo nhân viên mới</p>
                </div>
            </div>

            {/* Messages */}
            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}
            {success && (
                <div className="alert alert-success">
                    {success}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="employee-form">
                {/* Personal Information Section */}
                <div className="form-section">
                    <div className="section-header">
                        <FiUser />
                        <h3>Thông tin cá nhân</h3>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="required">Họ và tên đệm</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="Ví dụ: Nguyễn Văn"
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label className="required">Tên</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Ví dụ: An"
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label className="required">Ngày sinh</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label className="required">Giới tính</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="MALE">Nam</option>
                                <option value="FEMALE">Nữ</option>
                                <option value="OTHER">Khác</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Số CMND/CCCD</label>
                            <input
                                type="text"
                                name="idCardNumber"
                                value={formData.idCardNumber}
                                onChange={handleChange}
                                placeholder="Số CMND/CCCD"
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label className="required">Số điện thoại</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="0123456789"
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group full-width">
                            <label className="required">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="email@example.com"
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>

                {/* Address Section */}
                <div className="form-section">
                    <div className="section-header">
                        <FiMapPin />
                        <h3>Địa chỉ</h3>
                    </div>
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Địa chỉ chi tiết</label>
                            <input
                                type="text"
                                name="addressLine"
                                value={formData.addressLine}
                                onChange={handleChange}
                                placeholder="Số nhà, tên đường"
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>

                {/* Emergency Contact Section */}
                <div className="form-section">
                    <div className="section-header">
                        <FiPhone />
                        <h3>Liên hệ khẩn cấp</h3>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Tên người liên hệ</label>
                            <input
                                type="text"
                                name="emergencyContactName"
                                value={formData.emergencyContactName}
                                onChange={handleChange}
                                placeholder="Họ tên người thân"
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label>Số điện thoại liên hệ</label>
                            <input
                                type="tel"
                                name="emergencyContactPhone"
                                value={formData.emergencyContactPhone}
                                onChange={handleChange}
                                placeholder="0123456789"
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>

                {/* Employee Information Section */}
                <div className="form-section">
                    <div className="section-header">
                        <FiBriefcase />
                        <h3>Thông tin công việc</h3>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="required">Mã nhân viên</label>
                            <input
                                type="text"
                                name="employeeCode"
                                value={formData.employeeCode}
                                onChange={handleChange}
                                placeholder="Ví dụ: DOC001"
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label className="required">Chức vụ</label>
                            <input
                                type="text"
                                name="jobTitle"
                                value={formData.jobTitle}
                                onChange={handleChange}
                                placeholder="Ví dụ: Bác sĩ chuyên khoa"
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label className="required">Vai trò</label>
                            <select
                                name="roleType"
                                value={formData.roleType}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="DOCTOR">Bác sĩ</option>
                                <option value="NURSE">Điều dưỡng</option>
                                <option value="RECEPTIONIST">Lễ tân</option>
                                <option value="LAB_TECH">Dược sĩ</option>
                                <option value="CASHIER">Kế toán</option>
                                <option value="MANAGER">Quản lý</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="required">Khoa</label>
                            <select
                                name="departmentId"
                                value={formData.departmentId}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="">-- Chọn khoa --</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.departmentName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Chuyên khoa</label>
                            <input
                                type="text"
                                name="specialization"
                                value={formData.specialization}
                                onChange={handleChange}
                                placeholder="Ví dụ: Tim mạch"
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label>Số giấy phép hành nghề</label>
                            <input
                                type="text"
                                name="licenseNumber"
                                value={formData.licenseNumber}
                                onChange={handleChange}
                                placeholder="Số giấy phép"
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label className="required">Ngày vào làm</label>
                            <input
                                type="date"
                                name="hireDate"
                                value={formData.hireDate}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <span>Kích hoạt ngay</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        <FiX /> Hủy
                    </button>
                    <button
                        type="submit"
                        className="btn-submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <>Đang lưu...</>
                        ) : (
                            <>
                                <FiSave /> Tạo nhân viên
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateEmployeePage;
