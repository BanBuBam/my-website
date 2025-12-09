import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doctorConsultationAPI } from '../../../../services/staff/doctorAPI';
import { departmentAPI } from '../../../../services/staff/doctorAPI';
import {
    FiArrowLeft, FiSave, FiAlertCircle, FiCheckCircle
} from 'react-icons/fi';
import './CreateConsultationPage.css';

const CreateConsultationPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [departments, setDepartments] = useState([]);

    // Form data
    const [formData, setFormData] = useState({
        emergencyEncounterId: '',
        consultationReason: '',
        doctorAdvice: '',
        homeCareInstructions: '',
        warningSignsToReturn: '',
        recommendedDepartmentId: '',
        recommendedSpecialty: '',
        suggestedAppointmentTime: '',
        appointmentPriority: 'ROUTINE',
        createdBookingId: '',
        consultingDoctorId: '',
        consultationTime: new Date().toISOString().slice(0, 16),
    });

    // Get doctor ID from localStorage
    const getDoctorId = () => {
        const employeeId = localStorage.getItem('employeeId');
        return employeeId ? parseInt(employeeId) : null;
    };

    useEffect(() => {
        fetchDepartments();
        // Set consulting doctor ID
        const doctorId = getDoctorId();
        if (doctorId) {
            setFormData(prev => ({ ...prev, consultingDoctorId: doctorId }));
        }
        
        // Get emergencyEncounterId from URL query parameter
        const emergencyEncounterId = searchParams.get('emergencyEncounterId');
        if (emergencyEncounterId) {
            setFormData(prev => ({ ...prev, emergencyEncounterId: emergencyEncounterId }));
        }
    }, [searchParams]);

    // Fetch departments
    const fetchDepartments = async () => {
        try {
            const response = await departmentAPI.getDepartments();
            if (response && response.data.content) {
                setDepartments(response.data.content);
            }
        } catch (err) {
            console.error('Error fetching departments:', err);
        }
    };

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.emergencyEncounterId || !formData.consultationReason) {
            setError('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Prepare data
            const submitData = {
                ...formData,
                emergencyEncounterId: parseInt(formData.emergencyEncounterId),
                recommendedDepartmentId: formData.recommendedDepartmentId ? parseInt(formData.recommendedDepartmentId) : null,
                createdBookingId: formData.createdBookingId ? parseInt(formData.createdBookingId) : null,
                consultingDoctorId: parseInt(formData.consultingDoctorId),
            };

            const response = await doctorConsultationAPI.createConsultation(submitData);

            if (response && response.data) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/staff/bac-si/hoi-chan');
                }, 2000);
            }
        } catch (err) {
            console.error('Error creating consultation:', err);
            setError(err.message || 'Không thể tạo hội chẩn');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/staff/bac-si/hoi-chan');
    };

    return (
        <div className="create-consultation-page">
            {/* Header */}
            <div className="page-header">
                <button className="btn-back" onClick={handleBack}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-title">
                    <h1>Tạo hội chẩn mới</h1>
                    <p>Tạo hội chẩn cho bệnh nhân cấp cứu</p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="error-message">
                    <FiAlertCircle />
                    <span>{error}</span>
                </div>
            )}

            {/* Success Message */}
            {success && (
                <div className="success-message">
                    <FiCheckCircle />
                    <span>Tạo hội chẩn thành công! Đang chuyển hướng...</span>
                </div>
            )}

            {/* Form */}
            <form className="consultation-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3>Thông tin cơ bản</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Emergency Encounter ID <span className="required">*</span></label>
                            <input
                                type="number"
                                name="emergencyEncounterId"
                                value={formData.emergencyEncounterId}
                                onChange={handleChange}
                                placeholder="Nhập Emergency Encounter ID"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Thời gian hội chẩn</label>
                            <input
                                type="datetime-local"
                                name="consultationTime"
                                value={formData.consultationTime}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Lý do hội chẩn <span className="required">*</span></label>
                            <textarea
                                name="consultationReason"
                                value={formData.consultationReason}
                                onChange={handleChange}
                                placeholder="Nhập lý do hội chẩn"
                                rows="3"
                                required
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Lời khuyên của bác sĩ</label>
                            <textarea
                                name="doctorAdvice"
                                value={formData.doctorAdvice}
                                onChange={handleChange}
                                placeholder="Nhập lời khuyên của bác sĩ"
                                rows="3"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Hướng dẫn chăm sóc</h3>
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Hướng dẫn chăm sóc tại nhà</label>
                            <textarea
                                name="homeCareInstructions"
                                value={formData.homeCareInstructions}
                                onChange={handleChange}
                                placeholder="Nhập hướng dẫn chăm sóc tại nhà"
                                rows="3"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Dấu hiệu cảnh báo cần quay lại</label>
                            <textarea
                                name="warningSignsToReturn"
                                value={formData.warningSignsToReturn}
                                onChange={handleChange}
                                placeholder="Nhập dấu hiệu cảnh báo"
                                rows="3"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Đề xuất tái khám</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Khoa đề xuất</label>
                            <select
                                name="recommendedDepartmentId"
                                value={formData.recommendedDepartmentId}
                                onChange={handleChange}
                            >
                                <option value="">-- Chọn khoa --</option>
                                {departments.map(dept => (
                                    <option key={dept.departmentId} value={dept.departmentId}>
                                        {dept.departmentName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Chuyên khoa đề xuất</label>
                            <input
                                type="text"
                                name="recommendedSpecialty"
                                value={formData.recommendedSpecialty}
                                onChange={handleChange}
                                placeholder="Nhập chuyên khoa"
                            />
                        </div>

                        <div className="form-group">
                            <label>Thời gian hẹn đề xuất</label>
                            <input
                                type="datetime-local"
                                name="suggestedAppointmentTime"
                                value={formData.suggestedAppointmentTime}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Mức độ ưu tiên</label>
                            <select
                                name="appointmentPriority"
                                value={formData.appointmentPriority}
                                onChange={handleChange}
                            >
                                <option value="ROUTINE">ROUTINE</option>
                                <option value="URGENT">URGENT</option>
                                <option value="FOLLOW_UP">FOLLOW_UP</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Booking ID (nếu đã tạo)</label>
                            <input
                                type="number"
                                name="createdBookingId"
                                value={formData.createdBookingId}
                                onChange={handleChange}
                                placeholder="Nhập Booking ID"
                            />
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={handleBack}>
                        Hủy
                    </button>
                    <button type="submit" className="btn-submit" disabled={loading}>
                        <FiSave /> {loading ? 'Đang lưu...' : 'Lưu hội chẩn'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateConsultationPage;
