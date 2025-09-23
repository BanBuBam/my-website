import React, { useState, useEffect } from 'react';
import './QuanLyLichHenPage.css';

import { FiCalendar, FiPlus, FiFilter, FiEdit, FiTrash2, FiList, FiArrowLeft } from 'react-icons/fi';

// Mock data for appointments
const allAppointments = [
  { id: 1, patientName: 'Nguyễn Văn An', doctor: 'BS. Trần Minh Hoàng', specialty: 'Tim mạch', dateTime: '2025-09-18T08:30:00', reason: 'Khám định kỳ', status: 'Đã xác nhận' },
  { id: 2, patientName: 'Lê Thị Bình', doctor: 'BS. Nguyễn Thị An', specialty: 'Nội tổng quát', dateTime: '2025-09-18T10:00:00', reason: 'Tư vấn sức khỏe', status: 'Đã xác nhận' },
  { id: 3, patientName: 'Phạm Văn Cường', doctor: 'BS. Lê Văn Bình', specialty: 'Da liễu', dateTime: '2025-09-18T14:30:00', reason: 'Khám da', status: 'Chờ xác nhận' },
  { id: 4, patientName: 'Vũ Thị Dung', doctor: 'BS. Trần Minh Hoàng', specialty: 'Tim mạch', dateTime: '2025-09-19T11:00:00', reason: 'Tái khám', status: 'Đã xác nhận' },
];

// Mock data for doctors
const allDoctors = [
    'BS. Trần Minh Hoàng',
    'BS. Nguyễn Thị An',
    'BS. Lê Văn Bình',
    'BS. Hoàng Thị Cường',
];

// --- Sub-component for Calendar View ---
const AppointmentCalendarView = ({ appointments, doctors, filters, onFilterChange }) => {
    const timeSlots = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
        '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', 
        '16:00', '16:30', '17:00'
    ];

    return (
        <div className="calendar-view-container">
            <div className="card calendar-filters">
                <h4>Bộ lọc</h4>
                <div className="form-group">
                    <label>Ngày khám</label>
                    <input type="date" name="date" value={filters.date} onChange={onFilterChange} />
                </div>
                <div className="form-group">
                    <label>Bác sĩ</label>
                    <select name="doctor" value={filters.doctor} onChange={onFilterChange}>
                        <option value="all">Tất cả bác sĩ</option>
                        {doctors.map(doc => <option key={doc} value={doc}>{doc}</option>)}
                    </select>
                </div>
            </div>
            <div className="time-slot-container">
                <h4>Lịch khám ngày {new Date(filters.date + 'T00:00:00').toLocaleDateString('vi-VN')}</h4>
                <div className="time-slot-grid">
                    {timeSlots.map(slot => {
                        const appointment = appointments.find(app => {
                            const appTime = new Date(app.dateTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                            return appTime === slot;
                        });
                        return (
                            <div key={slot} className={`time-slot-card ${appointment ? 'booked' : 'empty'}`}>
                                <span className="time">{slot}</span>
                                {appointment ? (
                                    <span className="patient-name">{appointment.patientName}</span>
                                ) : (
                                    <span className="status-empty">Trống</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// --- Sub-component for List View ---
const AppointmentListView = ({ appointments, stats, filters, onFilterChange }) => {
    return (
      <>
        <div className="card filter-card">
          <h4>Bộ lọc</h4>
          <form className="filter-form">
            <div className="form-group"><label>Ngày khám</label><input type="date" name="date" value={filters.date} onChange={onFilterChange} /></div>
            <div className="form-group"><label>Khoa</label><select name="specialty" value={filters.specialty} onChange={onFilterChange}><option value="all">Tất cả khoa</option><option value="Tim mạch">Tim mạch</option><option value="Nội tổng quát">Nội tổng quát</option><option value="Răng hàm mặt">Răng hàm mặt</option><option value="Da liễu">Da liễu</option></select></div>
            <div className="form-group"><label>Trạng thái</label><select name="status" value={filters.status} onChange={onFilterChange}><option value="all">Tất cả trạng thái</option><option value="Đã xác nhận">Đã xác nhận</option><option value="Chờ xác nhận">Chờ xác nhận</option><option value="Đã hủy">Đã hủy</option></select></div>
            <button type="submit" className="filter-button" onClick={(e) => e.preventDefault()}><FiFilter /> Lọc</button>
          </form>
        </div>

        <div className="stats-container">
            <div className="stat-item"><span className="stat-value blue">{stats.total}</span><span className="stat-title">Tổng số lịch hẹn</span></div>
            <div className="stat-item"><span className="stat-value green">{stats.confirmed}</span><span className="stat-title">Đã xác nhận</span></div>
            <div className="stat-item"><span className="stat-value orange">{stats.pending}</span><span className="stat-title">Chờ xác nhận</span></div>
            <div className="stat-item"><span className="stat-value red">{stats.cancelled}</span><span className="stat-title">Đã hủy</span></div>
        </div>

        <div className="card appointment-list-card">
          <div className="list-header"><span>Bệnh nhân</span><span>Bác sĩ</span><span>Khoa</span><span>Ngày giờ</span><span>Lý do</span><span>Trạng thái</span><span>Thao tác</span></div>
          {appointments.length > 0 ? appointments.map(app => (
            <div key={app.id} className="appointment-row">
              <span className="patient-name">{app.patientName}</span><span>{app.doctor}</span><span>{app.specialty}</span><span>{new Date(app.dateTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span><span>{app.reason}</span><span><div className={`status-badge status-${app.status.toLowerCase().replace(/ /g, '-')}`}>{app.status}</div></span><span className="action-icons"><button className="icon-btn"><FiEdit /></button><button className="icon-btn"><FiTrash2 /></button></span>
            </div>
          )) : <p className="no-results">Không có lịch hẹn nào phù hợp.</p>}
        </div>
      </>
    );
};

// --- Sub-component for Create Appointment Form ---
const AppointmentCreateForm = ({ doctors, onBack, onCreate }) => {
    const [formData, setFormData] = useState({
        patientName: '',
        phone: '',
        doctor: '',
        date: '',
        time: '',
        reason: '',
        notes: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate(formData); 
        alert('Tạo lịch hẹn thành công!');
        onBack();
    };

    return (
        <div className="card">
            <div className="edit-form-header">
                <h3>Tạo lịch hẹn mới</h3>
                <button onClick={onBack} className="back-button"><FiArrowLeft /> Quay lại</button>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="form-section">
                    <div className="form-grid">
                        <div className="form-group"><label>Tên bệnh nhân *</label><input type="text" name="patientName" value={formData.patientName} onChange={handleChange} required /></div>
                        <div className="form-group"><label>Số điện thoại *</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} required /></div>
                        <div className="form-group"><label>Bác sĩ *</label><select name="doctor" value={formData.doctor} onChange={handleChange} required><option value="">Chọn bác sĩ</option>{doctors.map(doc => <option key={doc} value={doc}>{doc}</option>)}</select></div>
                        <div className="form-group"><label>Ngày khám *</label><input type="date" name="date" value={formData.date} onChange={handleChange} required /></div>
                        <div className="form-group"><label>Giờ khám *</label><select name="time" value={formData.time} onChange={handleChange} required><option value="">Chọn giờ khám</option><option>08:00</option><option>08:30</option><option>09:00</option></select></div>
                        <div className="form-group full-width"><label>Lý do khám *</label><input type="text" name="reason" value={formData.reason} onChange={handleChange} required /></div>
                        <div className="form-group full-width"><label>Ghi chú</label><textarea name="notes" rows="4" value={formData.notes} onChange={handleChange}></textarea></div>
                    </div>
                </div>
                <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={onBack}>Hủy</button>
                    <button type="submit" className="update-btn">Tạo lịch hẹn</button>
                </div>
            </form>
        </div>
    );
};


// --- Main Page Component ---
const QuanLyLichHenPage = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list', 'calendar', or 'create'
  const [appointments, setAppointments] = useState(allAppointments);
  const [filteredAppointments, setFilteredAppointments] = useState(allAppointments);
  
  const [filters, setFilters] = useState({
    date: new Date().toISOString().slice(0, 10),
    specialty: 'all',
    status: 'all',
    doctor: 'all',
  });
  
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, cancelled: 0 });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Effect to apply filters
  useEffect(() => {
    let result = appointments;

    if (filters.date) {
        result = result.filter(app => app.dateTime.startsWith(filters.date));
    }

    if (viewMode === 'list') {
        if (filters.specialty !== 'all') {
            result = result.filter(app => app.specialty === filters.specialty);
        }
        if (filters.status !== 'all') {
            result = result.filter(app => app.status === filters.status);
        }
    } else if (viewMode === 'calendar') {
        if (filters.doctor !== 'all') {
            result = result.filter(app => app.doctor === filters.doctor);
        }
    }

    setFilteredAppointments(result);
  }, [filters, appointments, viewMode]);

  // Effect to calculate stats
  useEffect(() => {
    const total = filteredAppointments.length;
    const confirmed = filteredAppointments.filter(a => a.status === 'Đã xác nhận').length;
    const pending = filteredAppointments.filter(a => a.status === 'Chờ xác nhận').length;
    const cancelled = filteredAppointments.filter(a => a.status === 'Đã hủy').length;
    setStats({ total, confirmed, pending, cancelled });
  }, [filteredAppointments]);

  // Handler to add a new appointment
  const handleCreateAppointment = (newAppointmentData) => {
    const newAppointment = {
        ...newAppointmentData,
        id: appointments.length + 1, // Simple ID generation for demo
        dateTime: `${newAppointmentData.date}T${newAppointmentData.time}:00`,
        status: 'Chờ xác nhận', // New appointments are pending by default
    };
    setAppointments(prev => [newAppointment, ...prev]);
  };

  return (
    <div className="appointment-page">
      <div className="page-header">
          <div>
              <h2>Quản lý Lịch hẹn</h2>
              <p>Quản lý lịch hẹn và đặt lịch khám bệnh</p>
          </div>
      </div>

      <div className="action-bar">
        <h3>
          {viewMode === 'list' && 'Danh sách lịch hẹn'}
          {viewMode === 'calendar' && 'Lịch khám theo ngày'}
          {viewMode === 'create' && 'Tạo lịch hẹn mới'}
        </h3>
        <div className="action-buttons">
          {viewMode === 'list' && <button className="action-btn-secondary" onClick={() => setViewMode('calendar')}><FiCalendar /> Xem lịch</button>}
          {viewMode === 'calendar' && <button className="action-btn-secondary" onClick={() => setViewMode('list')}><FiList /> Danh sách</button>}
          <button className="action-btn-primary" onClick={() => setViewMode('create')}><FiPlus /> Tạo lịch hẹn</button>
        </div>
      </div>
      
      {viewMode === 'list' && <AppointmentListView appointments={filteredAppointments} stats={stats} filters={filters} onFilterChange={handleFilterChange} />}
      {viewMode === 'calendar' && <AppointmentCalendarView appointments={filteredAppointments} doctors={allDoctors} filters={filters} onFilterChange={handleFilterChange} />}
      {viewMode === 'create' && <AppointmentCreateForm doctors={allDoctors} onBack={() => setViewMode('list')} onCreate={handleCreateAppointment} />}
    </div>
  );
};

export default QuanLyLichHenPage;