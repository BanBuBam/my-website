import React, { useState, useEffect } from 'react';
import './EmployeeStatusPage.css';
import { hrEmployeeStatusAPI } from '../../../../services/staff/hrAPI';
import { FiActivity, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';

const EmployeeStatusPage = () => {
  const [employeeStatus, setEmployeeStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchEmployeeStatus();
  }, []);

  const fetchEmployeeStatus = async () => {
    try {
      setLoading(true);
      const response = await hrEmployeeStatusAPI.getEmployeeStatus();
      if (response.success) {
        setEmployeeStatus(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching employee status:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStatus = employeeStatus.filter(emp =>
    !filterStatus || emp.status === filterStatus
  );

  const statusCounts = {
    available: employeeStatus.filter(e => e.status === 'available').length,
    busy: employeeStatus.filter(e => e.status === 'busy').length,
    offline: employeeStatus.filter(e => e.status === 'offline').length,
  };

  if (loading) {
    return (
      <div className="employee-status-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-status-page">
      <div className="page-header">
        <div>
          <h1>Tình trạng Sẵn sàng Nhân viên</h1>
          <p className="page-subtitle">Theo dõi tình trạng làm việc của nhân viên</p>
        </div>
      </div>

      <div className="status-summary">
        <div className="summary-card available">
          <div className="summary-icon">
            <FiCheckCircle />
          </div>
          <div className="summary-content">
            <h3>{statusCounts.available}</h3>
            <p>Sẵn sàng</p>
          </div>
        </div>

        <div className="summary-card busy">
          <div className="summary-icon">
            <FiClock />
          </div>
          <div className="summary-content">
            <h3>{statusCounts.busy}</h3>
            <p>Đang bận</p>
          </div>
        </div>

        <div className="summary-card offline">
          <div className="summary-icon">
            <FiXCircle />
          </div>
          <div className="summary-content">
            <h3>{statusCounts.offline}</h3>
            <p>Offline</p>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <label>Lọc theo trạng thái:</label>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Tất cả</option>
          <option value="available">Sẵn sàng</option>
          <option value="busy">Đang bận</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      <div className="table-container">
        <table className="status-table">
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Phòng ban</th>
              <th>Chức vụ</th>
              <th>Trạng thái</th>
              <th>Vị trí hiện tại</th>
              <th>Cập nhật lần cuối</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {filteredStatus.length > 0 ? (
              filteredStatus.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <div className="employee-info">
                      <div className={`status-indicator ${emp.status}`}></div>
                      <span>{emp.name || 'N/A'}</span>
                    </div>
                  </td>
                  <td>{emp.department || 'N/A'}</td>
                  <td>{emp.position || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${emp.status}`}>
                      {emp.status === 'available' && 'Sẵn sàng'}
                      {emp.status === 'busy' && 'Đang bận'}
                      {emp.status === 'offline' && 'Offline'}
                    </span>
                  </td>
                  <td>{emp.currentLocation || 'N/A'}</td>
                  <td>
                    {emp.lastUpdated
                      ? new Date(emp.lastUpdated).toLocaleString('vi-VN')
                      : 'N/A'}
                  </td>
                  <td>{emp.note || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeStatusPage;

