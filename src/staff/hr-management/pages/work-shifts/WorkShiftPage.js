import React, { useState, useEffect } from 'react';
import './WorkShiftPage.css';
import { hrWorkShiftAPI } from '../../../../services/staff/hrAPI';
import { FiPlus, FiEdit2, FiTrash2, FiClock } from 'react-icons/fi';

const WorkShiftPage = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const response = await hrWorkShiftAPI.getWorkShifts();
      if (response.success) {
        setShifts(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching work shifts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ca làm việc này?')) {
      try {
        await hrWorkShiftAPI.deleteWorkShift(id);
        fetchShifts();
      } catch (err) {
        alert('Lỗi khi xóa ca làm việc: ' + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="work-shift-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="work-shift-page">
      <div className="page-header">
        <div>
          <h1>Quản lý Ca làm việc</h1>
          <p className="page-subtitle">Quản lý các ca làm việc trong hệ thống</p>
        </div>
        <button className="btn-primary">
          <FiPlus /> Thêm Ca làm việc
        </button>
      </div>

      <div className="shift-cards">
        {shifts.length > 0 ? (
          shifts.map((shift) => (
            <div key={shift.id} className="shift-card">
              <div className="shift-icon">
                <FiClock />
              </div>
              <div className="shift-info">
                <h3>{shift.name || 'N/A'}</h3>
                <p className="shift-time">
                  {shift.startTime || 'N/A'} - {shift.endTime || 'N/A'}
                </p>
                <p className="shift-description">{shift.description || 'Không có mô tả'}</p>
              </div>
              <div className="shift-actions">
                <button className="btn-icon btn-edit" title="Chỉnh sửa">
                  <FiEdit2 />
                </button>
                <button
                  className="btn-icon btn-delete"
                  onClick={() => handleDelete(shift.id)}
                  title="Xóa"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-data-card">
            <p>Chưa có ca làm việc nào</p>
          </div>
        )}
      </div>

      <div className="table-container">
        <h3>Chi tiết Ca làm việc</h3>
        <table className="shift-table">
          <thead>
            <tr>
              <th>Tên ca</th>
              <th>Giờ bắt đầu</th>
              <th>Giờ kết thúc</th>
              <th>Số giờ làm việc</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {shifts.length > 0 ? (
              shifts.map((shift) => (
                <tr key={shift.id}>
                  <td><strong>{shift.name || 'N/A'}</strong></td>
                  <td>{shift.startTime || 'N/A'}</td>
                  <td>{shift.endTime || 'N/A'}</td>
                  <td>{shift.hours || 'N/A'} giờ</td>
                  <td>{shift.description || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${shift.isActive ? 'active' : 'inactive'}`}>
                      {shift.isActive ? 'Hoạt động' : 'Ngừng'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon btn-edit" title="Chỉnh sửa">
                        <FiEdit2 />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(shift.id)}
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
                <td colSpan="7" className="no-data">
                  Chưa có ca làm việc nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkShiftPage;

