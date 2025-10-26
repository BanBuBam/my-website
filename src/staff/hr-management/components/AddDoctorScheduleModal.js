import React, { useState, useEffect } from 'react';
import './AddDoctorScheduleModal.css';
import { hrEmployeeAPI } from '../../../services/staff/hrAPI';

const AddDoctorScheduleModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    doctorEmployeeId: '',
    clinicId: '1',
    scheduleDate: '',
    startTime: '08:00',
    endTime: '17:00',
    breakStartTime: '12:00',
    breakEndTime: '13:00',
    bufferTimeMinutes: 5,
    maxPatientsPerSlot: 5,
    slotDurationMinutes: 15,
  });

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
    }
  }, [isOpen]);

  const fetchDoctors = async () => {
    try {
      const response = await hrEmployeeAPI.searchByRole('DOCTOR');
      console.log('Doctors response:', response);
      
      if (response.data) {
        const doctorList = Array.isArray(response.data) ? response.data : [response.data];
        setDoctors(doctorList);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      alert('Không thể tải danh sách bác sĩ');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.doctorEmployeeId) {
        alert('Vui lòng chọn bác sĩ');
        setLoading(false);
        return;
      }

      if (!formData.scheduleDate) {
        alert('Vui lòng chọn ngày làm việc');
        setLoading(false);
        return;
      }

      // Build request data
      const requestData = {
        doctorEmployeeId: parseInt(formData.doctorEmployeeId),
        clinicId: parseInt(formData.clinicId),
        scheduleDate: formData.scheduleDate,
        startTime: formData.startTime + ':00',
        endTime: formData.endTime + ':00',
        breakStartTime: formData.breakStartTime + ':00',
        breakEndTime: formData.breakEndTime + ':00',
        bufferTimeMinutes: parseInt(formData.bufferTimeMinutes),
        maxPatientsPerSlot: parseInt(formData.maxPatientsPerSlot),
        slotDurationMinutes: parseInt(formData.slotDurationMinutes),
      };

      console.log('Submitting schedule data:', requestData);
      await onSubmit(requestData);
      
      // Reset form
      setFormData({
        doctorEmployeeId: '',
        clinicId: '1',
        scheduleDate: '',
        startTime: '08:00',
        endTime: '17:00',
        breakStartTime: '12:00',
        breakEndTime: '13:00',
        bufferTimeMinutes: 5,
        maxPatientsPerSlot: 5,
        slotDurationMinutes: 15,
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting schedule:', error);
      alert('Lỗi khi thêm lịch làm việc: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Thêm Lịch làm việc Bác sĩ</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label>Bác sĩ <span className="required">*</span></label>
                <select
                  name="doctorEmployeeId"
                  value={formData.doctorEmployeeId}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Chọn bác sĩ --</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.employeeCode} - {doctor.person?.lastName} {doctor.person?.firstName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Phòng khám <span className="required">*</span></label>
                <select
                  name="clinicId"
                  value={formData.clinicId}
                  onChange={handleChange}
                  required
                >
                  <option value="1">Phòng khám 1</option>
                  <option value="2">Phòng khám 2</option>
                  <option value="3">Phòng khám 3</option>
                  <option value="4">Phòng khám 4</option>
                  <option value="5">Phòng khám 5</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ngày làm việc <span className="required">*</span></label>
                <input
                  type="date"
                  name="scheduleDate"
                  value={formData.scheduleDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Thời lượng slot (phút) <span className="required">*</span></label>
                <input
                  type="number"
                  name="slotDurationMinutes"
                  value={formData.slotDurationMinutes}
                  onChange={handleChange}
                  min="5"
                  max="60"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Giờ bắt đầu <span className="required">*</span></label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Giờ kết thúc <span className="required">*</span></label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Giờ bắt đầu nghỉ</label>
                <input
                  type="time"
                  name="breakStartTime"
                  value={formData.breakStartTime}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Giờ kết thúc nghỉ</label>
                <input
                  type="time"
                  name="breakEndTime"
                  value={formData.breakEndTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Thời gian đệm (phút)</label>
                <input
                  type="number"
                  name="bufferTimeMinutes"
                  value={formData.bufferTimeMinutes}
                  onChange={handleChange}
                  min="0"
                  max="30"
                />
              </div>

              <div className="form-group">
                <label>Số bệnh nhân tối đa/slot</label>
                <input
                  type="number"
                  name="maxPatientsPerSlot"
                  value={formData.maxPatientsPerSlot}
                  onChange={handleChange}
                  min="1"
                  max="20"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Thêm lịch làm việc'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDoctorScheduleModal;

