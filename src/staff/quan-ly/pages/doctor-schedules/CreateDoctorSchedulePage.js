import React, { useState, useEffect } from 'react';
import './CreateDoctorSchedulePage.css';
import { FiSave, FiX, FiCalendar, FiClock, FiUser, FiMapPin } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { adminDoctorScheduleAPI, adminClinicAPI } from '../../../../services/staff/adminAPI';

const CreateDoctorSchedulePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingDoctors, setLoadingDoctors] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [clinics, setClinics] = useState([]);

    // Form data state
    const [formData, setFormData] = useState({
        doctorEmployeeId: '',
        clinicId: '',
        scheduleDate: new Date().toISOString().split('T')[0],
        startTime: '08:00:00',
        endTime: '17:00:00',
        breakStartTime: '',
        breakEndTime: '',
        bufferTimeMinutes: 5,
        maxPatientsPerSlot: 5,
        slotDurationMinutes: 15,
    });

    // Fetch clinics on mount
    useEffect(() => {
        fetchClinics();
    }, []);

    // Fetch doctors when clinic changes
    useEffect(() => {
        if (formData.clinicId) {
            fetchDoctorsByClinic(formData.clinicId);
        } else {
            setDoctors([]);
            setFormData(prev => ({ ...prev, doctorEmployeeId: '' }));
        }
    }, [formData.clinicId]);

    const fetchClinics = async () => {
        try {
            setLoading(true);
            const response = await adminClinicAPI.getClinics();
            if (response && response.content) {
                setClinics(response.content);
            }
        } catch (err) {
            console.error('Error fetching clinics:', err);
            setError('Không thể tải danh sách phòng khám');
        } finally {
            setLoading(false);
        }
    };

    const fetchDoctorsByClinic = async (clinicId) => {
        try {
            setLoadingDoctors(true);
            setDoctors([]);
            const response = await adminClinicAPI.getDoctorsByClinic(clinicId);
            if (response && Array.isArray(response)) {
                setDoctors(response);
            }
        } catch (err) {
            console.error('Error fetching doctors by clinic:', err);
            setError('Không thể tải danh sách bác sĩ');
        } finally {
            setLoadingDoctors(false);
        }
    };

    // Handle input change
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value ? parseInt(value) : '') : value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    // Validate form
    const validateForm = () => {
        if (!formData.doctorEmployeeId) {
            setError('Vui lòng chọn bác sĩ');
            return false;
        }
        if (!formData.clinicId) {
            setError('Vui lòng chọn phòng khám');
            return false;
        }
        if (!formData.scheduleDate) {
            setError('Vui lòng chọn ngày làm việc');
            return false;
        }
        if (!formData.startTime) {
            setError('Vui lòng nhập giờ bắt đầu');
            return false;
        }
        if (!formData.endTime) {
            setError('Vui lòng nhập giờ kết thúc');
            return false;
        }
        if (formData.startTime >= formData.endTime) {
            setError('Giờ kết thúc phải sau giờ bắt đầu');
            return false;
        }
        if (formData.breakStartTime && formData.breakEndTime) {
            if (formData.breakStartTime >= formData.breakEndTime) {
                setError('Giờ kết thúc nghỉ phải sau giờ bắt đầu nghỉ');
                return false;
            }
        }
        if (!formData.bufferTimeMinutes || formData.bufferTimeMinutes < 0) {
            setError('Vui lòng nhập thời gian đệm hợp lệ');
            return false;
        }
        if (!formData.maxPatientsPerSlot || formData.maxPatientsPerSlot < 1) {
            setError('Vui lòng nhập số bệnh nhân tối đa hợp lệ');
            return false;
        }
        if (!formData.slotDurationMinutes || formData.slotDurationMinutes < 1) {
            setError('Vui lòng nhập thời lượng khung giờ hợp lệ');
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
            const scheduleData = {
                doctorEmployeeId: parseInt(formData.doctorEmployeeId),
                clinicId: parseInt(formData.clinicId),
                scheduleDate: formData.scheduleDate,
                startTime: formData.startTime,
                endTime: formData.endTime,
                breakStartTime: formData.breakStartTime || null,
                breakEndTime: formData.breakEndTime || null,
                bufferTimeMinutes: parseInt(formData.bufferTimeMinutes),
                maxPatientsPerSlot: parseInt(formData.maxPatientsPerSlot),
                slotDurationMinutes: parseInt(formData.slotDurationMinutes),
            };

            const response = await adminDoctorScheduleAPI.createDoctorSchedule(scheduleData);

            if (response && response.data) {
                setSuccess('Tạo lịch làm việc bác sĩ thành công!');
                // Chờ 2 giây để hiển thị thông báo trước khi chuyển trang
                setTimeout(() => {
                    navigate('/staff/admin/doctor-schedules');
                }, 2000);
            }
        } catch (err) {
            console.error('Error creating doctor schedule:', err);
            setError(err.message || 'Không thể tạo lịch làm việc. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        navigate('/staff/admin/doctor-schedules');
    };

    return (
        <div className="create-doctor-schedule-page">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h2>Tạo lịch làm việc Bác sĩ</h2>
                    <p>Điền đầy đủ thông tin để tạo lịch làm việc cho bác sĩ</p>
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
            <form onSubmit={handleSubmit} className="schedule-form">
                {/* Doctor & Clinic Section */}
                <div className="form-section">
                    <div className="section-header">
                        <FiUser />
                        <h3>Thông tin bác sĩ và phòng khám</h3>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="required">Phòng khám</label>
                            <select
                                name="clinicId"
                                value={formData.clinicId}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="">-- Chọn phòng khám --</option>
                                {clinics.map(clinic => (
                                    <option key={clinic.clinicId || clinic.id} value={clinic.clinicId || clinic.id}>
                                        {clinic.displayName || clinic.clinicName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="required">Bác sĩ</label>
                            <select
                                name="doctorEmployeeId"
                                value={formData.doctorEmployeeId}
                                onChange={handleChange}
                                disabled={loading || loadingDoctors || !formData.clinicId}
                            >
                                <option value="">
                                    {!formData.clinicId
                                        ? '-- Vui lòng chọn phòng khám trước --'
                                        : loadingDoctors
                                        ? '-- Đang tải danh sách bác sĩ... --'
                                        : doctors.length === 0
                                        ? '-- Không có bác sĩ nào --'
                                        : '-- Chọn bác sĩ --'
                                    }
                                </option>
                                {doctors.map(doctor => (
                                    <option key={doctor.id} value={doctor.id}>
                                        {doctor.fullName} - {doctor.employeeCode}
                                        {doctor.specialization && ` (${doctor.specialization})`}
                                        {doctor.departmentName && ` - ${doctor.departmentName}`}
                                    </option>
                                ))}
                            </select>
                            {formData.clinicId && doctors.length > 0 && (
                                <small>{doctors.length} bác sĩ có sẵn trong phòng khám này</small>
                            )}
                        </div>
                    </div>
                </div>

                {/* Schedule Date & Time Section */}
                <div className="form-section">
                    <div className="section-header">
                        <FiCalendar />
                        <h3>Ngày và giờ làm việc</h3>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="required">Ngày làm việc</label>
                            <input
                                type="date"
                                name="scheduleDate"
                                value={formData.scheduleDate}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label className="required">Giờ bắt đầu</label>
                            <input
                                type="time"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleChange}
                                disabled={loading}
                                step="1"
                            />
                        </div>
                        <div className="form-group">
                            <label className="required">Giờ kết thúc</label>
                            <input
                                type="time"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleChange}
                                disabled={loading}
                                step="1"
                            />
                        </div>
                    </div>
                </div>

                {/* Break Time Section */}
                <div className="form-section">
                    <div className="section-header">
                        <FiClock />
                        <h3>Thời gian nghỉ giữa ca (tùy chọn)</h3>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Giờ bắt đầu nghỉ</label>
                            <input
                                type="time"
                                name="breakStartTime"
                                value={formData.breakStartTime}
                                onChange={handleChange}
                                disabled={loading}
                                step="1"
                            />
                        </div>
                        <div className="form-group">
                            <label>Giờ kết thúc nghỉ</label>
                            <input
                                type="time"
                                name="breakEndTime"
                                value={formData.breakEndTime}
                                onChange={handleChange}
                                disabled={loading}
                                step="1"
                            />
                        </div>
                    </div>
                </div>

                {/* Slot Configuration Section */}
                <div className="form-section">
                    <div className="section-header">
                        <FiMapPin />
                        <h3>Cấu hình khung giờ khám</h3>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="required">Thời lượng mỗi khung giờ (phút)</label>
                            <input
                                type="number"
                                name="slotDurationMinutes"
                                value={formData.slotDurationMinutes}
                                onChange={handleChange}
                                placeholder="15"
                                min="1"
                                disabled={loading}
                            />
                            <small>Thời gian cho mỗi lượt khám (ví dụ: 15 phút)</small>
                        </div>
                        <div className="form-group">
                            <label className="required">Số bệnh nhân tối đa/khung giờ</label>
                            <input
                                type="number"
                                name="maxPatientsPerSlot"
                                value={formData.maxPatientsPerSlot}
                                onChange={handleChange}
                                placeholder="5"
                                min="1"
                                disabled={loading}
                            />
                            <small>Số lượng bệnh nhân tối đa trong 1 khung giờ</small>
                        </div>
                        <div className="form-group">
                            <label className="required">Thời gian đệm (phút)</label>
                            <input
                                type="number"
                                name="bufferTimeMinutes"
                                value={formData.bufferTimeMinutes}
                                onChange={handleChange}
                                placeholder="5"
                                min="0"
                                disabled={loading}
                            />
                            <small>Thời gian dự phòng giữa các khung giờ</small>
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
                                <FiSave /> Tạo lịch làm việc
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateDoctorSchedulePage;


