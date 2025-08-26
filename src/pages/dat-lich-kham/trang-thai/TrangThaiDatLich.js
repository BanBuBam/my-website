import React, { useState, useEffect } from 'react';
import './TrangThaiDatLich.css'; 

// Dữ liệu mẫu với ngày tháng đã được chuẩn hóa (YYYY-MM-DD)
const mockAppointments = [
  { id: 1, specialty: 'Khoa Tim mạch', doctor: 'BS. Nguyễn Văn A', date: '2025-08-28', time: '09:30', status: 'Đã xác nhận' },
  { id: 2, specialty: 'Khoa Tai Mũi Họng', doctor: 'BS. Trần Thị B', date: '2025-08-30', time: '14:00', status: 'Chờ xác nhận' },
  { id: 3, specialty: 'Khám tổng quát', doctor: '', date: '2025-07-15', time: '10:00', status: 'Đã hoàn thành' },
  { id: 4, specialty: 'Khoa Răng Hàm Mặt', doctor: 'BS. Lê Văn C', date: '2025-08-20', time: '11:00', status: 'Đã hủy' },
  { id: 5, specialty: 'Khoa Tim mạch', doctor: 'BS. Nguyễn Văn A', date: '2025-09-05', time: '10:30', status: 'Chờ xác nhận' },
];

const AppointmentCard = ({ appointment }) => {
    const getStatusClass = (status) => {
        switch (status) {
          case 'Đã xác nhận': return 'status-confirmed';
          case 'Chờ xác nhận': return 'status-pending';
          case 'Đã hủy': return 'status-cancelled';
          case 'Đã hoàn thành': return 'status-completed';
          default: return '';
        }
    };
    const handleCancel = () => {
        if (window.confirm(`Bạn có chắc chắn muốn hủy lịch khám tại ${appointment.specialty} vào lúc ${appointment.time} ${appointment.date}?`)) {
          console.log(`Yêu cầu hủy lịch hẹn #${appointment.id}`);
        }
    };
    return (
        <div className="appointment-card">
          <div className="card-header">
            <span className={`status-badge ${getStatusClass(appointment.status)}`}>{appointment.status}</span>
          </div>
          <div className="card-body">
            <h3 className="specialty">{appointment.specialty}</h3>
            {appointment.doctor && <p className="doctor">{appointment.doctor}</p>}
            <p className="datetime">{`${appointment.time} - ${new Date(appointment.date).toLocaleDateString('vi-VN')}`}</p>
          </div>
          {(appointment.status === 'Chờ xác nhận' || appointment.status === 'Đã xác nhận') && (
            <div className="card-footer">
              <button onClick={handleCancel} className="btn-cancel">Hủy lịch</button>
            </div>
          )}
        </div>
    );
};

const TrangThaiDatLich = () => {
  const [appointments, setAppointments] = useState(mockAppointments);
  const [filteredAppointments, setFilteredAppointments] = useState(mockAppointments);

  // State cho các bộ lọc
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // useEffect sẽ chạy lại mỗi khi bộ lọc thay đổi
  useEffect(() => {
    let result = appointments;

    // Lọc theo trạng thái
    if (statusFilter !== 'Tất cả') {
      result = result.filter(app => app.status === statusFilter);
    }

    // Lọc theo ngày bắt đầu
    if (startDate) {
      result = result.filter(app => new Date(app.date) >= new Date(startDate));
    }

    // Lọc theo ngày kết thúc
    if (endDate) {
      result = result.filter(app => new Date(app.date) <= new Date(endDate));
    }

    setFilteredAppointments(result);
  }, [statusFilter, startDate, endDate, appointments]);

  const statusOptions = ['Tất cả', 'Chờ xác nhận', 'Đã xác nhận', 'Đã hoàn thành', 'Đã hủy'];

  return (
    <div className="appointment-status-page">
      <h1>Trạng thái đặt lịch</h1>

      {/* --- KHU VỰC BỘ LỌC MỚI --- */}
      <div className="filter-bar">
        <div className="filter-group status-filter">
          <label>Trạng thái</label>
          <div className="status-buttons">
            {statusOptions.map(status => (
              <button
                key={status}
                className={statusFilter === status ? 'active' : ''}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group date-filter">
          <label>Ngày đặt lịch</label>
          <div className="date-inputs">
            <input 
              type="date" 
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
            <span>-</span>
            <input 
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>
      {/* --------------------------- */}

      <div className="appointment-list">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map(app => (
            <AppointmentCard key={app.id} appointment={app} />
          ))
        ) : (
          <p className="no-results">Không tìm thấy lịch hẹn nào phù hợp.</p>
        )}
      </div>
    </div>
  );
};

export default TrangThaiDatLich;