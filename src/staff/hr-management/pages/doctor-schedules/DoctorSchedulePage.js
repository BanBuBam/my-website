import React, { useState, useEffect } from 'react';
import '../shared/SchedulePage.css';
import { hrDoctorScheduleAPI } from '../../../../services/staff/hrAPI';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiFilter, FiClock, FiUser, FiSearch, FiCheckCircle, FiX, FiHome } from 'react-icons/fi';
import AddDoctorScheduleModal from '../../components/AddDoctorScheduleModal';
import EditDoctorScheduleModal from '../../components/EditDoctorScheduleModal';

const DoctorSchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Filter states
  const [viewMode, setViewMode] = useState('today'); // 'today', 'all', 'doctor', 'clinic', 'date', 'dateRange'
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedClinic, setSelectedClinic] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayDate()); // Mặc định là hôm nay
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Data for filters
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);

  // Available slots view
  const [showAvailableSlots, setShowAvailableSlots] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [viewMode, selectedDoctor, selectedClinic, selectedDate, startDate, endDate]);

  const fetchInitialData = async () => {
    try {
      // Gọi API với pagination (lấy tất cả clinics, size=100)
      const clinicsResponse = await hrDoctorScheduleAPI.getClinics('', 0, 100);
      if (clinicsResponse.content && Array.isArray(clinicsResponse.content)) {
        setClinics(clinicsResponse.content);
      } else if (clinicsResponse.data && clinicsResponse.data.content && Array.isArray(clinicsResponse.data.content)) {
        setClinics(clinicsResponse.data.content);
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      let response;

      console.log('🔍 Fetching schedules with:', {
        viewMode,
        selectedDoctor,
        selectedClinic,
        selectedDate,
        startDate,
        endDate
      });

      switch (viewMode) {
        case 'today':
          // Lấy lịch làm việc của tất cả bác sĩ hôm nay
          console.log('📞 Calling getSchedulesByDate with today:', selectedDate);
          response = await hrDoctorScheduleAPI.getSchedulesByDate(selectedDate);
          break;

        case 'doctor':
          if (selectedDoctor) {
            console.log('📞 Calling getSchedulesByDoctor with doctorId:', selectedDoctor);
            response = await hrDoctorScheduleAPI.getSchedulesByDoctor(selectedDoctor);
          } else {
            console.log('📞 No doctor selected, fetching all schedules');
            response = await hrDoctorScheduleAPI.getDoctorSchedules();
          }
          break;

        case 'clinic':
          if (selectedClinic && selectedDate) {
            console.log('📞 Calling getSchedulesByClinicAndDate with:', selectedClinic, selectedDate);
            response = await hrDoctorScheduleAPI.getSchedulesByClinicAndDate(selectedClinic, selectedDate);
          } else if (selectedClinic) {
            console.log('📞 Clinic selected but no date, fetching all schedules');
            response = await hrDoctorScheduleAPI.getDoctorSchedules();
          } else {
            console.log('📞 No clinic selected, fetching all schedules');
            response = await hrDoctorScheduleAPI.getDoctorSchedules();
          }
          break;

        case 'date':
          if (selectedDoctor && selectedDate) {
            console.log('📞 Calling getScheduleByDoctorAndDate with:', selectedDoctor, selectedDate);
            response = await hrDoctorScheduleAPI.getScheduleByDoctorAndDate(selectedDoctor, selectedDate);
          } else if (selectedDate) {
            // Nếu chỉ có date mà không có doctor, lấy tất cả bác sĩ trong ngày đó
            console.log('📞 Only date selected, calling getSchedulesByDate');
            response = await hrDoctorScheduleAPI.getSchedulesByDate(selectedDate);
          } else if (selectedDoctor) {
            console.log('📞 Doctor selected but no date, calling getSchedulesByDoctor');
            response = await hrDoctorScheduleAPI.getSchedulesByDoctor(selectedDoctor);
          } else {
            console.log('📞 No doctor selected, fetching all schedules');
            response = await hrDoctorScheduleAPI.getDoctorSchedules();
          }
          break;

        case 'dateRange':
          if (selectedDoctor && startDate && endDate) {
            console.log('📞 Calling getSchedulesByDateRange with:', selectedDoctor, startDate, endDate);
            response = await hrDoctorScheduleAPI.getSchedulesByDateRange(selectedDoctor, startDate, endDate);
          } else if (selectedDoctor) {
            console.log('📞 Doctor selected but no date range, calling getSchedulesByDoctor');
            response = await hrDoctorScheduleAPI.getSchedulesByDoctor(selectedDoctor);
          } else {
            console.log('📞 No doctor selected, fetching all schedules');
            response = await hrDoctorScheduleAPI.getDoctorSchedules();
          }
          break;

        case 'all':
          console.log('📞 Fetching all schedules');
          response = await hrDoctorScheduleAPI.getDoctorSchedules();
          break;

        default:
          console.log('📞 Default case: fetching schedules for today');
          response = await hrDoctorScheduleAPI.getSchedulesByDate(getTodayDate());
      }

      console.log('✅ Schedules response:', response);

      // Handle different response formats
      if (Array.isArray(response)) {
        console.log('✅ Response is array, length:', response.length);
        setSchedules(response);
      } else if (response.content && Array.isArray(response.content)) {
        console.log('✅ Response has content array, length:', response.content.length);
        setSchedules(response.content);
      } else if (response.data) {
        const scheduleList = Array.isArray(response.data) ? response.data : [response.data];
        console.log('✅ Response has data, converted to array, length:', scheduleList.length);
        setSchedules(scheduleList);
      } else if (response.doctorScheduleId) {
        // Single schedule object
        console.log('✅ Response is single schedule object');
        setSchedules([response]);
      } else {
        console.log('⚠️ Response format not recognized, setting empty array');
        setSchedules([]);
      }
    } catch (err) {
      console.error('❌ Error fetching doctor schedules:', err);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async (scheduleData) => {
    try {
      console.log('handleAddSchedule called with:', scheduleData);
      const response = await hrDoctorScheduleAPI.createDoctorSchedule(scheduleData);
      console.log('Create schedule response:', response);

      if (response && response.doctorScheduleId) {
        alert('Thêm lịch làm việc thành công!');
        fetchSchedules();
        setShowAddModal(false);
        return response;
      } else {
        const errorMsg = response.message || 'Không thể thêm lịch làm việc';
        alert(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('Error creating schedule:', err);
      const errorMessage = err.message || 'Lỗi không xác định';
      alert('Lỗi khi thêm lịch làm việc: ' + errorMessage);
      throw err;
    }
  };

  const handleEditSchedule = async (scheduleData) => {
    try {
      const response = await hrDoctorScheduleAPI.updateDoctorSchedule(
        selectedSchedule.doctorScheduleId,
        scheduleData
      );

      if (response && response.doctorScheduleId) {
        alert('Cập nhật lịch làm việc thành công!');
        fetchSchedules();
        setShowEditModal(false);
        setSelectedSchedule(null);
        return response;
      } else {
        const errorMsg = response.message || 'Không thể cập nhật lịch làm việc';
        alert(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('Error updating schedule:', err);
      alert('Lỗi khi cập nhật lịch làm việc: ' + err.message);
      throw err;
    }
  };

  const handleDelete = async (schedule) => {
    console.log('🗑️ Delete clicked for schedule:', schedule);
    console.log('🗑️ Schedule ID:', schedule.doctorScheduleId);

    if (window.confirm(`Bạn có chắc chắn muốn xóa lịch làm việc của ${schedule.doctorName || 'bác sĩ'} vào ngày ${schedule.scheduleDate}?`)) {
      try {
        console.log('🗑️ Calling deleteDoctorSchedule with ID:', schedule.doctorScheduleId);
        const response = await hrDoctorScheduleAPI.deleteDoctorSchedule(schedule.doctorScheduleId);
        console.log('🗑️ Delete response:', response);

        alert('Xóa lịch làm việc thành công!');
        fetchSchedules();
      } catch (err) {
        console.error('🗑️ Delete error:', err);
        alert('Lỗi khi xóa lịch làm việc: ' + err.message);
      }
    }
  };

  const handleEdit = (schedule) => {
    console.log('✏️ Edit clicked for schedule:', schedule);
    console.log('✏️ Schedule keys:', Object.keys(schedule));
    console.log('✏️ doctorEmployeeId:', schedule.doctorEmployeeId);
    console.log('✏️ clinicId:', schedule.clinicId);

    setSelectedSchedule(schedule);
    setShowEditModal(true);
  };

  const handleViewAvailableSlots = async (schedule) => {
    try {
      setLoading(true);
      const response = await hrDoctorScheduleAPI.getAvailableSlots(
        schedule.doctorEmployeeId,
        schedule.scheduleDate
      );

      console.log('Available slots response:', response);

      let slots = [];
      if (Array.isArray(response)) {
        slots = response;
      } else if (response.data && Array.isArray(response.data)) {
        slots = response.data;
      } else if (response.content && Array.isArray(response.content)) {
        slots = response.content;
      }

      // Log first slot to debug field names
      if (slots.length > 0) {
        console.log('First slot structure:', slots[0]);
        console.log('Slot keys:', Object.keys(slots[0]));
      }

      setAvailableSlots(slots);
      setShowAvailableSlots(true);
    } catch (err) {
      console.error('Error fetching available slots:', err);
      alert('Lỗi khi lấy danh sách slot trống: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorChange = (doctorId) => {
    setSelectedDoctor(doctorId);
    // useEffect will automatically call fetchSchedules when selectedDoctor changes
  };

  const handleClinicChange = async (clinicId) => {
    console.log('🏥 Clinic changed to:', clinicId);
    setSelectedClinic(clinicId);
    setSelectedDoctor(''); // Reset doctor when clinic changes

    // Fetch doctors for selected clinic
    if (clinicId) {
      try {
        console.log('📞 Fetching doctors for clinic:', clinicId);
        const response = await hrDoctorScheduleAPI.getDoctorsByClinic(clinicId);
        console.log('👨‍⚕️ Doctors response:', response);

        let doctorsList = [];
        if (Array.isArray(response)) {
          doctorsList = response;
        } else if (response.content && Array.isArray(response.content)) {
          doctorsList = response.content;
        } else if (response.data && Array.isArray(response.data)) {
          doctorsList = response.data;
        }

        console.log('👨‍⚕️ Doctors list:', doctorsList);
        console.log('👨‍⚕️ Number of doctors:', doctorsList.length);

        // Debug: Log first doctor structure
        if (doctorsList.length > 0) {
          console.log('👨‍⚕️ First doctor structure:', doctorsList[0]);
          console.log('👨‍⚕️ First doctor keys:', Object.keys(doctorsList[0]));
          console.log('👨‍⚕️ doctorEmployeeId:', doctorsList[0].doctorEmployeeId);
          console.log('👨‍⚕️ employeeId:', doctorsList[0].employeeId);
        }

        setDoctors(doctorsList);
      } catch (err) {
        console.error('❌ Error fetching doctors:', err);
        setDoctors([]);
      }
    } else {
      console.log('🏥 No clinic selected, clearing doctors');
      setDoctors([]);
    }
  };

  const resetFilters = () => {
    setViewMode('today');
    setSelectedDoctor('');
    setSelectedClinic('');
    setSelectedDate(getTodayDate());
    setStartDate('');
    setEndDate('');
    setDoctors([]);
  };

  if (loading && schedules.length === 0) {
    return (
      <div className="schedule-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="schedule-page">
      <div className="page-header">
        <div>
          <h1>Lịch làm việc Bác sĩ</h1>
          <p className="page-subtitle">Quản lý lịch làm việc của các bác sĩ</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn-secondary"
            onClick={() => {
              setViewMode('today');
              setSelectedDate(getTodayDate());
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FiCalendar /> Hôm nay
          </button>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <FiPlus /> Thêm Lịch làm việc
          </button>
        </div>
      </div>

      {/* Modals */}
      <AddDoctorScheduleModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSchedule}
      />

      {showEditModal && selectedSchedule && (
        <EditDoctorScheduleModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSchedule(null);
          }}
          onSubmit={handleEditSchedule}
          schedule={selectedSchedule}
        />
      )}

      {/* FILTER SECTION - New design matching InventoryTransactionsPage */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        borderRadius: '16px',
        marginBottom: '1.5rem',
        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(30%, -30%)',
          pointerEvents: 'none'
        }}></div>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              padding: '0.75rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <FiFilter size={20} style={{ color: '#fff' }} />
            </div>
            <div>
              <h3 style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#fff',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                Bộ lọc lịch làm việc
              </h3>
              <p style={{
                margin: 0,
                fontSize: '0.85rem',
                color: 'rgba(255, 255, 255, 0.9)',
                marginTop: '0.25rem'
              }}>
                Chọn chế độ xem và lọc theo các tiêu chí
              </p>
            </div>
          </div>

          {/* Filter Status Badge */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            color: viewMode !== 'today' ? '#28a745' : '#667eea',
            padding: '0.5rem 1rem',
            borderRadius: '25px',
            fontSize: '0.9rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            {viewMode !== 'today' ? <FiCheckCircle size={16} /> : <FiCalendar size={16} />}
            <span>{viewMode === 'today' ? `Lịch hôm nay` : 'Đang lọc'}</span>
          </div>
        </div>

        {/* Filter Content Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          position: 'relative',
          zIndex: 1
        }}>
          {/* View Mode Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '2px solid #f0f0f0'
            }}>
              <FiCalendar size={18} style={{ color: '#667eea' }} />
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#2d3748' }}>
                Chế độ xem
              </h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'dateRange' ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)', gap: '1rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                  <FiClock size={14} style={{ color: '#667eea' }} />
                  Chế độ xem
                </label>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="today">🗓️ Lịch hôm nay ({selectedDate})</option>
                  <option value="all">Tất cả lịch làm việc</option>
                  <option value="doctor">Theo bác sĩ</option>
                  <option value="clinic">Theo phòng khám & ngày</option>
                  <option value="date">Theo ngày</option>
                  <option value="dateRange">Theo bác sĩ & khoảng thời gian</option>
                </select>
              </div>

              {(viewMode === 'clinic' || viewMode === 'doctor' || viewMode === 'date' || viewMode === 'dateRange') && (
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                    <FiHome size={14} style={{ color: '#667eea' }} />
                    Phòng khám
                  </label>
                  <select
                    value={selectedClinic}
                    onChange={(e) => handleClinicChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '0.95rem',
                      backgroundColor: '#fff',
                      cursor: 'pointer',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">-- Chọn phòng khám --</option>
                    {clinics.map((clinic) => (
                      <option key={clinic.clinicId} value={clinic.clinicId}>
                        {clinic.clinicName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(viewMode === 'doctor' || viewMode === 'date' || viewMode === 'dateRange') && selectedClinic && (
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                    <FiUser size={14} style={{ color: '#667eea' }} />
                    Bác sĩ
                  </label>
                  <select
                    value={selectedDoctor}
                    onChange={(e) => handleDoctorChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '0.95rem',
                      backgroundColor: '#fff',
                      cursor: 'pointer',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
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
              )}

              {(viewMode === 'clinic' || viewMode === 'date') && (
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                    <FiCalendar size={14} style={{ color: '#667eea' }} />
                    Ngày
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              {viewMode === 'dateRange' && (
                <>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                      <FiCalendar size={14} style={{ color: '#667eea' }} />
                      Từ ngày
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '2px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '0.95rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                      <FiCalendar size={14} style={{ color: '#667eea' }} />
                      Đến ngày
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '2px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '0.95rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Reset Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '1rem',
            borderTop: '2px solid #f0f0f0'
          }}>
            <button
              onClick={resetFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: '#fff',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                color: '#4a5568',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <FiX size={16} />
              Đặt lại bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">
            <FiCalendar />
          </div>
          <div className="stat-info">
            <h4>Tổng lịch làm việc</h4>
            <p className="stat-value">{schedules.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiUser />
          </div>
          <div className="stat-info">
            <h4>Bác sĩ đang làm việc</h4>
            <p className="stat-value">
              {new Set(schedules.map(s => s.doctorEmployeeId)).size}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiClock />
          </div>
          <div className="stat-info">
            <h4>Lịch hôm nay</h4>
            <p className="stat-value">
              {schedules.filter(s => {
                const today = new Date().toISOString().split('T')[0];
                return s.scheduleDate === today;
              }).length}
            </p>
          </div>
        </div>
      </div>

      {/* Schedules Table */}
      <div className="table-container">
        <div className="table-header">
          <h3>Danh sách Lịch làm việc</h3>
          {loading && <div className="inline-spinner"></div>}
        </div>

        <div className="table-wrapper">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Bác sĩ</th>
                <th>Mã NV</th>
                <th>Phòng khám</th>
                <th>Ngày làm việc</th>
                <th>Giờ làm việc</th>
                <th>Giờ nghỉ</th>
                <th>Thời lượng slot</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {schedules.length > 0 ? (
                schedules.map((schedule) => (
                  <tr key={schedule.doctorScheduleId}>
                    <td>{schedule.doctorScheduleId}</td>
                    <td>
                      <div className="doctor-info">
                        <strong>{schedule.doctorName || 'N/A'}</strong>
                      </div>
                    </td>
                    <td>{schedule.doctorEmployeeCode || 'N/A'}</td>
                    <td>{schedule.clinicName || `Phòng ${schedule.clinicId}`}</td>
                    <td>
                      <span className="date-badge">
                        {schedule.scheduleDate ? new Date(schedule.scheduleDate).toLocaleDateString('vi-VN') : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div className="time-range">
                        <FiClock size={14} />
                        {schedule.startTime} - {schedule.endTime}
                      </div>
                    </td>
                    <td>
                      <div className="time-range break">
                        {schedule.breakStartTime} - {schedule.breakEndTime}
                      </div>
                    </td>
                    <td>
                      <span className="slot-duration">
                        {schedule.slotDurationMinutes} phút
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${schedule.isActive ? 'active' : 'inactive'}`}>
                        {schedule.isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                      {schedule.isToday && (
                        <span className="status-badge today">Hôm nay</span>
                      )}
                      {schedule.isPast && (
                        <span className="status-badge past">Đã qua</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-view"
                          onClick={() => handleViewAvailableSlots(schedule)}
                          title="Xem slot trống"
                        >
                          <FiSearch />
                        </button>
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(schedule)}
                          title="Chỉnh sửa"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(schedule)}
                          title="Xóa"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="no-data">
                    <FiCalendar size={48} />
                    <p>Chưa có lịch làm việc nào</p>
                    <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                      <FiPlus /> Thêm lịch làm việc đầu tiên
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Available Slots Modal */}
      {showAvailableSlots && (
        <div className="modal-overlay" onClick={() => setShowAvailableSlots(false)}>
          <div className="modal-content available-slots-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Slot còn trống</h2>
              <button className="btn-close" onClick={() => setShowAvailableSlots(false)}>×</button>
            </div>
            <div className="modal-body">
              {availableSlots.length > 0 ? (
                <div className="slots-grid">
                  {availableSlots.map((slot, index) => {
                    // Extract time from slotTime (format: HH:MM:SS)
                    const slotTime = slot.slotTime || '-';

                    // Extract end time from slotEndDateTime (format: YYYY-MM-DDTHH:MM:SS)
                    let endTime = '-';
                    if (slot.slotEndDateTime) {
                      const endDateTime = new Date(slot.slotEndDateTime);
                      endTime = endDateTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                    }

                    // Handle different possible field names for available slots count
                    const availableCount = slot.availableSpots || slot.availableSlots || slot.available_slots || slot.remainingSlots || 0;
                    const maxPatients = slot.maxPatients || slot.max_patients || slot.maxSlots || 0;

                    return (
                      <div key={index} className="slot-card">
                        <div className="slot-time">
                          <FiClock />
                          {slotTime} - {endTime}
                        </div>
                        <div className="slot-info">
                          <span>Còn trống: {availableCount}/{maxPatients}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-data">
                  <p>Không có slot trống</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSchedulePage;

