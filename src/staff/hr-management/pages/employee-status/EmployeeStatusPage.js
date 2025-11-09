import React, { useState, useEffect } from 'react';
import './EmployeeStatusPage.css';
import { hrEmployeeStatusAPI, hrEmployeeAPI } from '../../../../services/staff/hrAPI';
import { FiActivity, FiCheckCircle, FiXCircle, FiClock, FiPlus, FiX } from 'react-icons/fi';

const EmployeeStatusPage = () => {
  const [employeeStatus, setEmployeeStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    employeeId: '',
    availableDate: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '17:00',
    availabilityType: 'AVAILABLE',
    recurringPattern: 'NONE',
    recurringEndDate: '',
    reason: '',
    priorityLevel: 'NORMAL',
  });

  useEffect(() => {
    fetchEmployeeStatus();
    fetchEmployees();
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

  const fetchEmployees = async () => {
    try {
      const response = await hrEmployeeAPI.getEmployees();
      if (response.data) {
        setEmployees(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
    setFormData({
      employeeId: '',
      availableDate: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '17:00',
      availabilityType: 'AVAILABLE',
      recurringPattern: 'NONE',
      recurringEndDate: '',
      reason: '',
      priorityLevel: 'NORMAL',
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      employeeId: '',
      availableDate: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '17:00',
      availabilityType: 'AVAILABLE',
      recurringPattern: 'NONE',
      recurringEndDate: '',
      reason: '',
      priorityLevel: 'NORMAL',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.employeeId) {
      showNotification('Vui lòng chọn nhân viên', 'error');
      return false;
    }

    if (!formData.availableDate) {
      showNotification('Vui lòng chọn ngày bắt đầu', 'error');
      return false;
    }

    // Check if date is in the past
    const selectedDate = new Date(formData.availableDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      showNotification('Ngày bắt đầu không được là ngày quá khứ', 'error');
      return false;
    }

    if (!formData.startTime || !formData.endTime) {
      showNotification('Vui lòng nhập giờ bắt đầu và giờ kết thúc', 'error');
      return false;
    }

    // Check if endTime is after startTime
    if (formData.endTime <= formData.startTime) {
      showNotification('Giờ kết thúc phải sau giờ bắt đầu', 'error');
      return false;
    }

    // Check recurring end date if pattern is not NONE
    if (formData.recurringPattern !== 'NONE') {
      if (!formData.recurringEndDate) {
        showNotification('Vui lòng chọn ngày kết thúc lặp lại', 'error');
        return false;
      }

      const recurringEnd = new Date(formData.recurringEndDate);
      if (recurringEnd <= selectedDate) {
        showNotification('Ngày kết thúc lặp lại phải sau ngày bắt đầu', 'error');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // Prepare data for API
      const apiData = {
        employeeId: parseInt(formData.employeeId),
        availableDate: formData.availableDate,
        startTime: formData.startTime + ':00', // Add seconds
        endTime: formData.endTime + ':00', // Add seconds
        availabilityType: formData.availabilityType,
        priorityLevel: formData.priorityLevel,
      };

      // Add optional fields
      if (formData.recurringPattern && formData.recurringPattern !== 'NONE') {
        apiData.recurringPattern = formData.recurringPattern;
        apiData.recurringEndDate = formData.recurringEndDate;
      }

      if (formData.reason && formData.reason.trim()) {
        apiData.reason = formData.reason.trim();
      }

      console.log('Submitting availability data:', apiData);

      const response = await hrEmployeeStatusAPI.createEmployeeAvailability(apiData);

      if (response) {
        showNotification('✅ Tạo tình trạng sẵn sàng thành công!', 'success');
        handleCloseModal();
        fetchEmployeeStatus(); // Refresh list
      }
    } catch (error) {
      console.error('Error creating availability:', error);
      showNotification(error.message || 'Có lỗi xảy ra khi tạo tình trạng sẵn sàng', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
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
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>
            <FiX />
          </button>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1>Tình trạng Sẵn sàng Nhân viên</h1>
          <p className="page-subtitle">Theo dõi tình trạng làm việc của nhân viên</p>
        </div>
        <button className="btn-primary" onClick={handleOpenModal}>
          <FiPlus /> Tạo Tình Trạng Sẵn Sàng
        </button>
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

      {/* Create Availability Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Tạo Tình Trạng Sẵn Sàng Làm Việc</h2>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  {/* Column 1 - Basic Info */}
                  <div className="form-column">
                    <div className="form-group">
                      <label>
                        Nhân viên <span className="required">*</span>
                      </label>
                      <select
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">-- Chọn nhân viên --</option>
                        {employees.map((emp) => (
                          <option key={emp.employeeId} value={emp.employeeId}>
                            {emp.fullName} ({emp.employeeCode})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>
                        Ngày bắt đầu <span className="required">*</span>
                      </label>
                      <input
                        type="date"
                        name="availableDate"
                        value={formData.availableDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Giờ bắt đầu <span className="required">*</span>
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Giờ kết thúc <span className="required">*</span>
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Column 2 - Advanced Config */}
                  <div className="form-column">
                    <div className="form-group">
                      <label>
                        Loại tình trạng <span className="required">*</span>
                      </label>
                      <select
                        name="availabilityType"
                        value={formData.availabilityType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="AVAILABLE">Sẵn sàng</option>
                        <option value="UNAVAILABLE">Không sẵn sàng</option>
                        <option value="BUSY">Bận</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>
                        Mức độ ưu tiên <span className="required">*</span>
                      </label>
                      <select
                        name="priorityLevel"
                        value={formData.priorityLevel}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="LOW">Thấp</option>
                        <option value="NORMAL">Bình thường</option>
                        <option value="HIGH">Cao</option>
                        <option value="URGENT">Khẩn cấp</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Mẫu lặp lại</label>
                      <select
                        name="recurringPattern"
                        value={formData.recurringPattern}
                        onChange={handleInputChange}
                      >
                        <option value="NONE">Không lặp lại</option>
                        <option value="DAILY">Hàng ngày</option>
                        <option value="WEEKLY">Hàng tuần</option>
                        <option value="MONTHLY">Hàng tháng</option>
                      </select>
                    </div>

                    {formData.recurringPattern !== 'NONE' && (
                      <div className="form-group">
                        <label>
                          Ngày kết thúc lặp lại <span className="required">*</span>
                        </label>
                        <input
                          type="date"
                          name="recurringEndDate"
                          value={formData.recurringEndDate}
                          onChange={handleInputChange}
                          min={formData.availableDate}
                          required={formData.recurringPattern !== 'NONE'}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Full width - Reason */}
                <div className="form-group full-width">
                  <label>Lý do (tùy chọn)</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Nhập lý do (tùy chọn)..."
                    maxLength="500"
                  />
                  <small className="char-count">
                    {formData.reason.length}/500 ký tự
                  </small>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Đang tạo...' : 'Tạo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeStatusPage;

