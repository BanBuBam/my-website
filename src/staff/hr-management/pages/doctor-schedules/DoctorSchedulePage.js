import React, { useState, useEffect } from 'react';
import '../shared/SchedulePage.css';
import { hrDoctorScheduleAPI } from '../../../../services/staff/hrAPI';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi';
import AddDoctorScheduleModal from '../../components/AddDoctorScheduleModal';

const DoctorSchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await hrDoctorScheduleAPI.getDoctorSchedules();
      console.log('Schedules response:', response);

      if (response.data) {
        const scheduleList = Array.isArray(response.data) ? response.data : [response.data];
        setSchedules(scheduleList);
      } else if (response.success) {
        setSchedules(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching doctor schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async (scheduleData) => {
    try {
      const response = await hrDoctorScheduleAPI.createDoctorSchedule(scheduleData);
      console.log('Create schedule response:', response);

      if (response.code === 200 || response.code === 201 || response.status === 'OK') {
        alert('Thêm lịch làm việc thành công!');
        fetchSchedules();
        setShowAddModal(false);
      } else {
        alert('Không thể thêm lịch làm việc');
      }
    } catch (err) {
      console.error('Error creating schedule:', err);
      alert('Lỗi khi thêm lịch làm việc: ' + err.message);
      throw err;
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch làm việc này?')) {
      try {
        await hrDoctorScheduleAPI.deleteDoctorSchedule(id);
        alert('Xóa lịch làm việc thành công!');
        fetchSchedules();
      } catch (err) {
        alert('Lỗi khi xóa lịch làm việc: ' + err.message);
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
          <h1>Lịch làm việc Bác sĩ</h1>
          <p className="page-subtitle">Quản lý lịch làm việc của các bác sĩ</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <FiPlus /> Thêm Lịch làm việc
        </button>
      </div>

      {/* Add Schedule Modal */}
      <AddDoctorScheduleModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSchedule}
      />

      <div className="calendar-view">
        <div className="calendar-header">
          <FiCalendar />
          <h2>Lịch làm việc trong tuần</h2>
        </div>
        <div className="calendar-placeholder">
          <p>Giao diện lịch làm việc sẽ được hiển thị ở đây</p>
        </div>
      </div>

      <div className="table-container">
        <h3>Danh sách Lịch làm việc</h3>
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Bác sĩ</th>
              <th>Chuyên khoa</th>
              <th>Ngày</th>
              <th>Giờ bắt đầu</th>
              <th>Giờ kết thúc</th>
              <th>Phòng khám</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {schedules.length > 0 ? (
              schedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td>{schedule.doctorName || 'N/A'}</td>
                  <td>{schedule.specialty || 'N/A'}</td>
                  <td>{schedule.date ? new Date(schedule.date).toLocaleDateString('vi-VN') : 'N/A'}</td>
                  <td>{schedule.startTime || 'N/A'}</td>
                  <td>{schedule.endTime || 'N/A'}</td>
                  <td>{schedule.room || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${schedule.status === 'active' ? 'active' : 'inactive'}`}>
                      {schedule.status === 'active' ? 'Hoạt động' : 'Hủy'}
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
                  Chưa có lịch làm việc nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DoctorSchedulePage;

