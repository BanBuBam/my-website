import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../../services/api';
import './BookAppointment.css';

const BookAppointment = () => {
  // State for form data
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // Form fields
  const [formData, setFormData] = useState({
    appointmentType: 'FIRST_VISIT',
    priority: 'NORMAL',
    reason: '',
    symptoms: '',
    notes: ''
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  // Load departments on mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Load doctors when department or date changes
  useEffect(() => {
    if (selectedDepartment && selectedDate) {
      fetchDoctors();
    }
  }, [selectedDepartment, selectedDate]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getDepartments();
      if (response && response.data) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách khoa:', error);
      setError('Không thể tải danh sách khoa');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      setError('');
      setDoctors([]);
      setSelectedDoctor(null);
      setSelectedSlot(null);
      
      const response = await bookingAPI.getDoctorsByDepartment(selectedDepartment, selectedDate);
      if (response && response.data && response.data.doctors) {
        setDoctors(response.data.doctors);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách bác sĩ:', error);
      setError('Không thể tải danh sách bác sĩ');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
    setSelectedDoctor(null);
    setSelectedSlot(null);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedDoctor(null);
    setSelectedSlot(null);
  };

  const handleDoctorSelect = (doctor) => {
    if (!doctor.hasSchedule) return;
    setSelectedDoctor(doctor);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    if (!slot.isAvailable) return;
    setSelectedSlot(slot);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!selectedDepartment) {
      setError('Vui lòng chọn khoa khám');
      return;
    }
    if (!selectedDoctor) {
      setError('Vui lòng chọn bác sĩ');
      return;
    }
    if (!selectedSlot) {
      setError('Vui lòng chọn khung giờ khám');
      return;
    }
    if (!formData.reason.trim()) {
      setError('Vui lòng nhập lý do khám');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const bookingData = {
        doctorEmployeeId: selectedDoctor.doctorId,
        departmentId: parseInt(selectedDepartment),
        scheduledDatetime: selectedSlot.slotDateTime,
        bookingSource: 'ONLINE',
        appointmentType: formData.appointmentType,
        priority: formData.priority,
        reason: formData.reason,
        symptoms: formData.symptoms,
        notes: formData.notes
      };

      const response = await bookingAPI.createBooking(bookingData);
      
      if (response && response.data) {
        setBookingResult(response.data);
        setShowSuccessModal(true);
        setSuccess('Đặt lịch khám thành công!');
        
        // Reset form
        resetForm();
      }
    } catch (error) {
      console.error('Lỗi khi đặt lịch khám:', error);
      setError(error.message || 'Không thể đặt lịch khám. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedDepartment('');
    setSelectedDate('');
    setDoctors([]);
    setSelectedDoctor(null);
    setSelectedSlot(null);
    setFormData({
      appointmentType: 'FIRST_VISIT',
      priority: 'NORMAL',
      reason: '',
      symptoms: '',
      notes: ''
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="book-appointment-container">
      <div className="book-appointment-content">
        {/* Header */}
        <div className="page-header">
          <h1>Đặt lịch khám bệnh</h1>
          <p>Chọn khoa, bác sĩ và thời gian phù hợp để đặt lịch khám</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && !showSuccessModal && <div className="success-message">{success}</div>}

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="booking-form-container">
          {/* Step 1: Chọn khoa và ngày */}
          <div className="form-section">
            <h3>Bước 1: Chọn khoa và ngày khám</h3>
            
            <div className="form-group">
              <label htmlFor="department">
                Chọn khoa <span className="required">*</span>
              </label>
              <select
                id="department"
                value={selectedDepartment}
                onChange={handleDepartmentChange}
                disabled={loading}
                required
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
              <label htmlFor="date">
                Chọn ngày khám <span className="required">*</span>
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={handleDateChange}
                min={getMinDate()}
                disabled={!selectedDepartment || loading}
                required
              />
            </div>
          </div>

          {/* Step 2: Chọn bác sĩ */}
          {selectedDepartment && selectedDate && (
            <div className="form-section">
              <h3>Bước 2: Chọn bác sĩ</h3>
              
              {loadingDoctors ? (
                <div className="loading">Đang tải danh sách bác sĩ...</div>
              ) : doctors.length === 0 ? (
                <div className="info-message">Không có bác sĩ nào trong khoa này</div>
              ) : (
                <div className="doctors-grid">
                  {doctors.map(doctor => (
                    <div
                      key={doctor.doctorId}
                      className={`doctor-card ${selectedDoctor?.doctorId === doctor.doctorId ? 'selected' : ''} ${!doctor.hasSchedule ? 'disabled' : ''}`}
                      onClick={() => handleDoctorSelect(doctor)}
                    >
                      <div className="doctor-header">
                        <div className="doctor-info">
                          <h4>{doctor.fullName}</h4>
                          <p>{doctor.title}</p>
                          <p>{doctor.specialization}</p>
                        </div>
                        <div className="doctor-fee">
                          {formatCurrency(doctor.consultationFee)}
                        </div>
                      </div>
                      <div className="schedule-info">
                        <div className={`schedule-status ${doctor.hasSchedule ? 'available' : 'unavailable'}`}>
                          {doctor.scheduleMessage}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Chọn khung giờ */}
          {selectedDoctor && selectedDoctor.hasSchedule && (
            <div className="form-section">
              <h3>Bước 3: Chọn khung giờ khám</h3>
              
              <div className="time-slots">
                {selectedDoctor.availableSlots.map((slot, index) => (
                  <div
                    key={index}
                    className={`time-slot ${selectedSlot?.slotTime === slot.slotTime ? 'selected' : ''} ${!slot.isAvailable ? 'disabled' : ''}`}
                    onClick={() => handleSlotSelect(slot)}
                  >
                    <div>{slot.slotTime}</div>
                    <div className="slot-info">
                      {slot.currentBookings}/{slot.maxPatients}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Thông tin khám */}
          {selectedSlot && (
            <div className="form-section">
              <h3>Bước 4: Thông tin khám bệnh</h3>

              <div className="form-group">
                <label htmlFor="appointmentType">
                  Loại khám <span className="required">*</span>
                </label>
                <select
                  id="appointmentType"
                  name="appointmentType"
                  value={formData.appointmentType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="FIRST_VISIT">Khám lần đầu</option>
                  <option value="FOLLOW_UP">Tái khám</option>
                  <option value="EMERGENCY">Cấp cứu</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priority">
                  Mức độ ưu tiên <span className="required">*</span>
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  required
                >
                  <option value="NORMAL">Bình thường</option>
                  <option value="URGENT">Khẩn cấp</option>
                  <option value="EMERGENCY">Cấp cứu</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="reason">
                  Lý do khám <span className="required">*</span>
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Đau đầu kéo dài 3 ngày"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="symptoms">
                  Triệu chứng
                </label>
                <textarea
                  id="symptoms"
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Sốt, ho, đau họng"
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">
                  Ghi chú
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Thông tin bổ sung (nếu có)"
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetForm}
              disabled={loading}
            >
              Làm mới
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !selectedSlot}
            >
              {loading ? 'Đang xử lý...' : 'Đặt lịch khám'}
            </button>
          </div>
        </form>

        {/* Success Modal */}
        {showSuccessModal && bookingResult && (
          <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>✓ Đặt lịch thành công!</h2>
                <p>{bookingResult.statusDescription || 'Chờ xác nhận'}</p>
              </div>

              <div className="modal-body">
                <div className="booking-detail">
                  <div className="booking-detail-item">
                    <span className="label">Mã đặt lịch:</span>
                    <span className="value">#{bookingResult.bookingId}</span>
                  </div>
                  {bookingResult.doctor && (
                    <>
                      <div className="booking-detail-item">
                        <span className="label">Bác sĩ:</span>
                        <span className="value">{bookingResult.doctor.fullName}</span>
                      </div>
                      <div className="booking-detail-item">
                        <span className="label">Chuyên khoa:</span>
                        <span className="value">{bookingResult.doctor.specialization}</span>
                      </div>
                    </>
                  )}
                  {bookingResult.department && (
                    <div className="booking-detail-item">
                      <span className="label">Khoa:</span>
                      <span className="value">{bookingResult.department.departmentName}</span>
                    </div>
                  )}
                  <div className="booking-detail-item">
                    <span className="label">Thời gian khám:</span>
                    <span className="value">{formatDateTime(bookingResult.scheduledDatetime)}</span>
                  </div>
                  <div className="booking-detail-item">
                    <span className="label">Trạng thái:</span>
                    <span className="value">{bookingResult.statusDescription}</span>
                  </div>
                </div>

                <div className="info-message">
                  Vui lòng đến trước giờ hẹn 15 phút để làm thủ tục.
                  Bạn có thể xem lại lịch hẹn trong mục "Lịch sử khám".
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowSuccessModal(false)}
                >
                  Đóng
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setShowSuccessModal(false);
                    window.location.href = '/lich-su-kham';
                  }}
                >
                  Xem lịch sử khám
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;

