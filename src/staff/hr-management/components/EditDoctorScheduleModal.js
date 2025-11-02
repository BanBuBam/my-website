import React, { useState, useEffect } from 'react';
import './AddDoctorScheduleModal.css';
import { hrDoctorScheduleAPI } from '../../../services/staff/hrAPI';

const EditDoctorScheduleModal = ({ isOpen, onClose, onSubmit, schedule }) => {
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
    if (isOpen && schedule) {
      console.log('📝 Opening edit modal with schedule:', schedule);
      console.log('📝 Schedule keys:', Object.keys(schedule));
      console.log('📝 doctorEmployeeId:', schedule.doctorEmployeeId);
      console.log('📝 clinicId:', schedule.clinicId);

      fetchClinics();

      // Populate form with schedule data
      const formDataToSet = {
        doctorEmployeeId: schedule.doctorEmployeeId || '', // Will be set later from doctorEmployeeCode
        clinicId: schedule.clinicId || '',
        scheduleDate: schedule.scheduleDate || '',
        startTime: schedule.startTime ? schedule.startTime.substring(0, 5) : '08:00',
        endTime: schedule.endTime ? schedule.endTime.substring(0, 5) : '17:00',
        breakStartTime: schedule.breakStartTime ? schedule.breakStartTime.substring(0, 5) : '12:00',
        breakEndTime: schedule.breakEndTime ? schedule.breakEndTime.substring(0, 5) : '13:00',
        bufferTimeMinutes: schedule.bufferTimeMinutes || 5,
        maxPatientsPerSlot: schedule.maxPatientsPerSlot || 5,
        slotDurationMinutes: schedule.slotDurationMinutes || 15,
      };

      console.log('📝 doctorEmployeeCode from schedule:', schedule.doctorEmployeeCode);

      console.log('📝 Setting form data:', formDataToSet);
      setFormData(formDataToSet);
    }
  }, [isOpen, schedule]);

  useEffect(() => {
    if (formData.clinicId) {
      fetchDoctorsByClinic(formData.clinicId);
    }
  }, [formData.clinicId]);

  // Find and set doctorEmployeeId when doctors are loaded
  useEffect(() => {
    if (doctors.length > 0 && schedule && schedule.doctorEmployeeCode && !formData.doctorEmployeeId) {
      console.log('🔍 Finding doctor by code:', schedule.doctorEmployeeCode);

      const doctor = doctors.find(d =>
        (d.employeeCode === schedule.doctorEmployeeCode) ||
        (d.doctorCode === schedule.doctorEmployeeCode)
      );

      if (doctor) {
        // Ưu tiên id trước, sau đó mới đến doctorEmployeeId, employeeId
        const doctorId = doctor.id || doctor.doctorEmployeeId || doctor.employeeId;
        console.log('✅ Found doctor:', doctor);
        console.log('✅ Doctor ID field:', doctor.id ? 'id' : (doctor.doctorEmployeeId ? 'doctorEmployeeId' : 'employeeId'));
        console.log('✅ Setting doctorEmployeeId to:', doctorId);

        setFormData(prev => ({
          ...prev,
          doctorEmployeeId: doctorId
        }));
      } else {
        console.log('❌ Doctor not found with code:', schedule.doctorEmployeeCode);
      }
    }
  }, [doctors, schedule]);

  const fetchClinics = async () => {
    try {
      const response = await hrDoctorScheduleAPI.getClinics();
      console.log('Clinics response:', response);

      if (response.content && Array.isArray(response.content)) {
        setClinics(response.content);
      } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
        setClinics(response.data.content);
      } else if (Array.isArray(response)) {
        setClinics(response);
      }
    } catch (error) {
      console.error('Error fetching clinics:', error);
      alert('Lỗi khi tải danh sách phòng khám');
    }
  };

  const fetchDoctorsByClinic = async (clinicId) => {
    try {
      const response = await hrDoctorScheduleAPI.getDoctorsByClinic(clinicId);
      console.log('📞 Doctors response for clinic', clinicId, ':', response);

      let doctorsList = [];
      if (Array.isArray(response)) {
        doctorsList = response;
      } else if (response.content && Array.isArray(response.content)) {
        doctorsList = response.content;
      } else if (response.data && Array.isArray(response.data)) {
        doctorsList = response.data;
      }

      console.log('👨‍⚕️ Doctors list:', doctorsList);
      if (doctorsList.length > 0) {
        console.log('👨‍⚕️ First doctor:', doctorsList[0]);
        console.log('👨‍⚕️ Keys:', Object.keys(doctorsList[0]));
      }

      setDoctors(doctorsList);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      alert('Lỗi khi tải danh sách bác sĩ');
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
      // Validation
      if (!formData.doctorEmployeeId || !formData.clinicId || !formData.scheduleDate) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc');
        setLoading(false);
        return;
      }

      // Find selected doctor - check id, doctorEmployeeId, or employeeId
      const selectedDoctor = doctors.find(d =>
        (d.id && d.id === parseInt(formData.doctorEmployeeId)) ||
        (d.doctorEmployeeId && d.doctorEmployeeId === parseInt(formData.doctorEmployeeId)) ||
        (d.employeeId && d.employeeId === parseInt(formData.doctorEmployeeId))
      );

      console.log('🔍 Looking for doctor with ID:', formData.doctorEmployeeId);
      console.log('👨‍⚕️ Found doctor:', selectedDoctor);

      if (!selectedDoctor) {
        alert('Vui lòng chọn bác sĩ');
        setLoading(false);
        return;
      }

      // Build request data - Gửi doctorEmployeeCode để xác định bác sĩ
      const requestData = {
        doctorEmployeeCode: selectedDoctor.employeeCode || selectedDoctor.doctorCode || selectedDoctor.code,
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

      console.log('📤 Updating schedule with data:', requestData);
      console.log('📤 Selected doctor:', selectedDoctor);

      await onSubmit(requestData);
      
      onClose();
    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('Lỗi khi cập nhật lịch làm việc: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chỉnh sửa Lịch làm việc</h2>
          <button className="btn-close" onClick={onClose}>×</button>
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
                  {clinics.map((clinic) => (
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
                  <option value="">-- Chọn bác sĩ --</option>
                  {doctors.map((doctor) => (
                    <option
                      key={doctor.doctorEmployeeId || doctor.employeeId || doctor.id}
                      value={doctor.doctorEmployeeId || doctor.employeeId || doctor.id}
                    >
                      {doctor.employeeName || doctor.doctorName || doctor.name} - {doctor.employeeCode || doctor.doctorCode || doctor.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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

            <div className="form-row">
              <div className="form-group">
                <label>Giờ bắt đầu</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Giờ kết thúc</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Giờ nghỉ bắt đầu</label>
                <input
                  type="time"
                  name="breakStartTime"
                  value={formData.breakStartTime}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Giờ nghỉ kết thúc</label>
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
                <label>Thời lượng mỗi slot (phút)</label>
                <input
                  type="number"
                  name="slotDurationMinutes"
                  value={formData.slotDurationMinutes}
                  onChange={handleChange}
                  min="5"
                  max="60"
                  step="5"
                />
              </div>

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

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDoctorScheduleModal;

