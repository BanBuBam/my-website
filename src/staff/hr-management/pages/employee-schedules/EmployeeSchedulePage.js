import React, { useState, useEffect } from 'react';
import '../shared/SchedulePage.css';
import { hrEmployeeScheduleAPI } from '../../../../services/staff/hrAPI';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi';

const EmployeeSchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await hrEmployeeScheduleAPI.getEmployeeSchedules();
      if (response.success) {
        setSchedules(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching employee schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch ca làm việc này?')) {
      try {
        await hrEmployeeScheduleAPI.deleteEmployeeSchedule(id);
        fetchSchedules();
      } catch (err) {
        alert('Lỗi khi xóa lịch ca làm việc: ' + err.message);
      }
    }
  };

  if (loading) {
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
          <h1>Lịch ca làm việc Nhân viên</h1>
          <p className="page-subtitle">Quản lý lịch ca làm việc của nhân viên</p>
        </div>
        <button className="btn-primary">
          <FiPlus /> Thêm Lịch ca làm việc
        </button>
      </div>

      <div className="calendar-view">
        <div className="calendar-header">
          <FiCalendar />
          <h2>Lịch ca làm việc trong tuần</h2>
        </div>
        <div className="calendar-placeholder">
          <p>Giao diện lịch ca làm việc sẽ được hiển thị ở đây</p>
        </div>
      </div>

      <div className="table-container">
        <h3>Danh sách Lịch ca làm việc</h3>
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Phòng ban</th>
              <th>Ngày</th>
              <th>Ca làm việc</th>
              <th>Giờ bắt đầu</th>
              <th>Giờ kết thúc</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {schedules.length > 0 ? (
              schedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td>{schedule.employeeName || 'N/A'}</td>
                  <td>{schedule.department || 'N/A'}</td>
                  <td>{schedule.date ? new Date(schedule.date).toLocaleDateString('vi-VN') : 'N/A'}</td>
                  <td>{schedule.shiftName || 'N/A'}</td>
                  <td>{schedule.startTime || 'N/A'}</td>
                  <td>{schedule.endTime || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${schedule.status === 'scheduled' ? 'active' : 'inactive'}`}>
                      {schedule.status === 'scheduled' ? 'Đã xếp lịch' : 'Hủy'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon btn-edit" title="Chỉnh sửa">
                        <FiEdit2 />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(schedule.id)}
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
                <td colSpan="8" className="no-data">
                  Chưa có lịch ca làm việc nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeSchedulePage;

