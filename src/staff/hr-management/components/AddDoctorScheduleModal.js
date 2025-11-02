import React, { useState, useEffect } from 'react';
import './AddDoctorScheduleModal.css';
import { hrDoctorScheduleAPI } from '../../../services/staff/hrAPI';

const AddDoctorScheduleModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    doctorEmployeeId: '',
    clinicId: '',
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
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchClinics();
      // Reset doctors when modal opens
      setDoctors([]);
      setFormData(prev => ({
        ...prev,
        doctorEmployeeId: '',
        clinicId: ''
      }));
    }
  }, [isOpen]);

  // Fetch doctors when clinic is selected
  useEffect(() => {
    if (formData.clinicId) {
      fetchDoctorsByClinic(formData.clinicId);
    } else {
      setDoctors([]);
      setFormData(prev => ({
        ...prev,
        doctorEmployeeId: ''
      }));
    }
  }, [formData.clinicId]);

  const fetchDoctorsByClinic = async (clinicId) => {
    try {
      const response = await hrDoctorScheduleAPI.getDoctorsByClinic(clinicId);
      console.log('Doctors by clinic response:', response);

      // Handle different response structures
      let doctorList = [];
      if (response.data && Array.isArray(response.data)) {
        doctorList = response.data;
      } else if (Array.isArray(response)) {
        doctorList = response;
      } else if (response.content && Array.isArray(response.content)) {
        doctorList = response.content;
      } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
        doctorList = response.data.content;
      }

      console.log('Doctors in clinic count:', doctorList.length);
      console.log('Doctors in clinic:', doctorList);
      setDoctors(doctorList);
    } catch (err) {
      console.error('Error fetching doctors by clinic:', err);
      alert('Không thể tải danh sách bác sĩ trong phòng khám này');
      setDoctors([]);
    }
  };

  const fetchClinics = async () => {
    try {
      const response = await hrDoctorScheduleAPI.getClinics();
      console.log('Clinics response:', response);

      // API returns paginated structure with content array
      if (response.content && Array.isArray(response.content)) {
        console.log('Clinics count:', response.content.length);
        console.log('Clinics list:', response.content);
        setClinics(response.content);
      } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
        console.log('Clinics count:', response.data.content.length);
        console.log('Clinics list:', response.data.content);
        setClinics(response.data.content);
      } else if (Array.isArray(response)) {
        console.log('Response is array:', response);
        setClinics(response);
      }
    } catch (err) {
      console.error('Error fetching clinics:', err);
      alert('Không thể tải danh sách phòng khám');
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

      if (!formData.clinicId) {
        alert('Vui lòng chọn phòng khám');
        setLoading(false);
        return;
      }

      if (!formData.scheduleDate) {
        alert('Vui lòng chọn ngày làm việc');
        setLoading(false);
        return;
      }

      // Find selected doctor to get employeeCode
      const selectedDoctor = doctors.find(doc => doc.id === parseInt(formData.doctorEmployeeId));
      if (!selectedDoctor) {
        alert('Không tìm thấy thông tin bác sĩ');
        setLoading(false);
        return;
      }

      // Build request data
      const requestData = {
        doctorEmployeeCode: selectedDoctor.employeeCode,
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
      console.log('Form data before submit:', formData);
      console.log('Selected doctor:', selectedDoctor);

      const result = await onSubmit(requestData);
      console.log('Submit result:', result);
      
      // Reset form
      setFormData({
        doctorEmployeeId: '',
        clinicId: '',
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
                <label>Phòng khám <span className="required">*</span></label>
                <select
                  name="clinicId"
                  value={formData.clinicId}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Chọn phòng khám --</option>
                  {clinics.map(clinic => (
                    <option key={clinic.clinicId} value={clinic.clinicId}>
                      {clinic.clinicName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Bác sĩ <span className="required">*</span></label>
                <select
                  name="doctorEmployeeId"
                  value={formData.doctorEmployeeId}
                  onChange={handleChange}
                  required
                  disabled={!formData.clinicId}
                >
                  <option value="">
                    {!formData.clinicId
                      ? '-- Vui lòng chọn phòng khám trước --'
                      : doctors.length === 0
                        ? '-- Không có bác sĩ trong phòng khám này --'
                        : '-- Chọn bác sĩ --'}
                  </option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.employeeCode} - {doctor.fullName}
                    </option>
                  ))}
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

