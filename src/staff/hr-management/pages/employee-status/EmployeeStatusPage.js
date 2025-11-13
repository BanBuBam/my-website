import React, { useState, useEffect } from 'react';
import './EmployeeStatusPage.css';
import { hrEmployeeStatusAPI, hrEmployeeAPI } from '../../../../services/staff/hrAPI';
import { FiActivity, FiCheckCircle, FiXCircle, FiClock, FiPlus, FiX, FiCalendar, FiUser } from 'react-icons/fi';

const EmployeeStatusPage = () => {
  const [availabilityData, setAvailabilityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  // View mode: 'employee', 'date', 'preferred', 'recurring'
  const [viewMode, setViewMode] = useState('employee');

  // Date range filter (cho chế độ employee)
  const [useDateRange, setUseDateRange] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Date filter (cho chế độ date - xem nhân viên sẵn sàng trong ngày)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateViewType, setDateViewType] = useState('available'); // 'available' hoặc 'unavailable'

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
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (viewMode === 'employee' && selectedEmployee) {
      fetchEmployeeAvailability(selectedEmployee);
    }
  }, [viewMode, selectedEmployee, useDateRange, startDate, endDate]);

  useEffect(() => {
    if (viewMode === 'date' && selectedDate) {
      fetchEmployeesByDate(selectedDate, dateViewType);
    } else if (viewMode === 'preferred') {
      fetchPreferredAvailability();
    } else if (viewMode === 'recurring') {
      fetchRecurringAvailability();
    }
  }, [viewMode, selectedDate, dateViewType]);

  const fetchEmployeeAvailability = async (employeeId) => {
    try {
      setLoading(true);
      let response;

      // Nếu sử dụng date range và có đủ thông tin
      if (useDateRange && startDate && endDate) {
        response = await hrEmployeeStatusAPI.getEmployeeAvailabilityByDateRange(
          employeeId,
          startDate,
          endDate
        );
      } else {
        // Lấy tất cả dữ liệu
        response = await hrEmployeeStatusAPI.getEmployeeAvailabilityById(employeeId);
      }

      console.log('API Response:', response);

      // API trả về mảng trực tiếp
      if (Array.isArray(response)) {
        setAvailabilityData(response);
      } else if (response.data && Array.isArray(response.data)) {
        setAvailabilityData(response.data);
      } else {
        setAvailabilityData([]);
      }
    } catch (err) {
      console.error('Error fetching employee availability:', err);
      setAvailabilityData([]);
      showNotification('Không thể tải dữ liệu tình trạng sẵn sàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await hrEmployeeAPI.getEmployees();
      if (response.data) {
        setEmployees(response.data || []);
        // Tự động chọn nhân viên đầu tiên nếu có và đang ở chế độ employee
        if (response.data.length > 0 && viewMode === 'employee') {
          setSelectedEmployee(response.data[0].employeeId.toString());
        }
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchEmployeesByDate = async (date, type) => {
    try {
      setLoading(true);
      let response;

      if (type === 'available') {
        response = await hrEmployeeStatusAPI.getAvailableEmployeesByDate(date);
        console.log('API Response (Available by Date):', response);
      } else {
        response = await hrEmployeeStatusAPI.getUnavailableEmployeesByDate(date);
        console.log('API Response (Unavailable by Date):', response);
      }

      // API trả về mảng trực tiếp
      if (Array.isArray(response)) {
        setAvailabilityData(response);
      } else if (response.data && Array.isArray(response.data)) {
        setAvailabilityData(response.data);
      } else {
        setAvailabilityData([]);
      }
    } catch (err) {
      console.error('Error fetching employees by date:', err);
      setAvailabilityData([]);
      const errorMsg = type === 'available'
        ? 'Không thể tải dữ liệu nhân viên sẵn sàng'
        : 'Không thể tải dữ liệu nhân viên không sẵn sàng';
      showNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferredAvailability = async () => {
    try {
      setLoading(true);
      const response = await hrEmployeeStatusAPI.getPreferredAvailability();
      console.log('API Response (Preferred):', response);

      // API trả về mảng trực tiếp
      if (Array.isArray(response)) {
        setAvailabilityData(response);
      } else if (response.data && Array.isArray(response.data)) {
        setAvailabilityData(response.data);
      } else {
        setAvailabilityData([]);
      }
    } catch (err) {
      console.error('Error fetching preferred availability:', err);
      setAvailabilityData([]);
      showNotification('Không thể tải dữ liệu lịch ưu tiên', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecurringAvailability = async () => {
    try {
      setLoading(true);
      const response = await hrEmployeeStatusAPI.getRecurringAvailability();
      console.log('API Response (Recurring):', response);

      // API trả về mảng trực tiếp
      if (Array.isArray(response)) {
        setAvailabilityData(response);
      } else if (response.data && Array.isArray(response.data)) {
        setAvailabilityData(response.data);
      } else {
        setAvailabilityData([]);
      }
    } catch (err) {
      console.error('Error fetching recurring availability:', err);
      setAvailabilityData([]);
      showNotification('Không thể tải dữ liệu lịch lặp lại', 'error');
    } finally {
      setLoading(false);
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
        // Refresh list nếu đang xem nhân viên vừa tạo
        if (selectedEmployee === formData.employeeId.toString()) {
          fetchEmployeeAvailability(selectedEmployee);
        }
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

  // Lọc dữ liệu theo loại tình trạng
  const filteredAvailability = availabilityData.filter(item => {
    if (!filterType) return true;
    return item.availabilityType === filterType;
  });

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString.substring(0, 5); // Lấy HH:mm
  };

  // Get availability type label
  const getAvailabilityTypeLabel = (type) => {
    const labels = {
      'AVAILABLE': 'Sẵn sàng',
      'UNAVAILABLE': 'Không sẵn sàng',
      'BUSY': 'Bận',
      'PREFERRED': 'Ưu tiên',
      'RESTRICTED': 'Hạn chế'
    };
    return labels[type] || type;
  };

  // Get priority level label
  const getPriorityLabel = (level) => {
    const labels = {
      'LOW': 'Thấp',
      'NORMAL': 'Bình thường',
      'HIGH': 'Cao',
      'URGENT': 'Khẩn cấp'
    };
    return labels[level] || level;
  };

  // Handle date range toggle
  const handleDateRangeToggle = (e) => {
    const checked = e.target.checked;
    setUseDateRange(checked);

    if (checked && !startDate && !endDate) {
      // Set default date range (current month)
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(lastDay.toISOString().split('T')[0]);
    }
  };

  // Validate date range
  const validateDateRange = () => {
    if (!startDate || !endDate) {
      showNotification('Vui lòng chọn ngày bắt đầu và ngày kết thúc', 'error');
      return false;
    }

    if (new Date(endDate) < new Date(startDate)) {
      showNotification('Ngày kết thúc phải sau ngày bắt đầu', 'error');
      return false;
    }

    return true;
  };

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setAvailabilityData([]);
    setFilterType('');

    if (mode === 'date') {
      // Reset employee selection
      setSelectedEmployee('');
      setUseDateRange(false);
    } else if (mode === 'employee') {
      // Auto-select first employee if available
      if (employees.length > 0 && !selectedEmployee) {
        setSelectedEmployee(employees[0].employeeId.toString());
      }
    } else if (mode === 'preferred' || mode === 'recurring') {
      // Reset filters for preferred/recurring modes
      setSelectedEmployee('');
      setUseDateRange(false);
    }
  };

  if (loading && viewMode === 'employee' && !selectedEmployee) {
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
          <p className="page-subtitle">Xem lịch sẵn sàng làm việc của nhân viên</p>
        </div>
        <button className="btn-primary" onClick={handleOpenModal}>
          <FiPlus /> Tạo Tình Trạng Sẵn Sàng
        </button>
      </div>

      {/* View Mode Selector */}
      <div className="view-mode-selector">
        <button
          className={`view-mode-btn ${viewMode === 'employee' ? 'active' : ''}`}
          onClick={() => handleViewModeChange('employee')}
        >
          <FiUser /> Xem theo Nhân viên
        </button>
        <button
          className={`view-mode-btn ${viewMode === 'date' ? 'active' : ''}`}
          onClick={() => handleViewModeChange('date')}
        >
          <FiCalendar /> Xem theo Ngày
        </button>
        <button
          className={`view-mode-btn ${viewMode === 'preferred' ? 'active' : ''}`}
          onClick={() => handleViewModeChange('preferred')}
        >
          <FiCheckCircle /> Lịch Ưu tiên
        </button>
        <button
          className={`view-mode-btn ${viewMode === 'recurring' ? 'active' : ''}`}
          onClick={() => handleViewModeChange('recurring')}
        >
          <FiClock /> Lịch Lặp lại
        </button>
      </div>

      {/* Filter Section - Employee Mode */}
      {viewMode === 'employee' && (
        <div className="filter-section">
        <div className="filter-group">
          <label>
            <FiUser /> Chọn nhân viên:
          </label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="employee-select"
          >
            <option value="">-- Chọn nhân viên --</option>
            {employees.map((emp) => (
              <option key={emp.employeeId} value={emp.employeeId}>
                {emp.fullName} ({emp.employeeCode})
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Lọc theo loại:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="AVAILABLE">Sẵn sàng</option>
            <option value="UNAVAILABLE">Không sẵn sàng</option>
            <option value="BUSY">Bận</option>
          </select>
        </div>

          <div className="filter-group date-range-toggle">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={useDateRange}
                onChange={handleDateRangeToggle}
              />
              <FiCalendar /> Lọc theo khoảng thời gian
            </label>
          </div>
        </div>
      )}

      {/* Date Range Filter - Employee Mode */}
      {viewMode === 'employee' && useDateRange && (
        <div className="date-range-section">
          <div className="date-range-group">
            <div className="date-input-group">
              <label>Từ ngày:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="date-input"
              />
            </div>
            <div className="date-input-group">
              <label>Đến ngày:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="date-input"
              />
            </div>
            <div className="date-range-info">
              {startDate && endDate && (
                <span className="info-text">
                  <FiClock /> Hiển thị dữ liệu từ {formatDate(startDate)} đến {formatDate(endDate)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Date Filter - Date Mode */}
      {viewMode === 'date' && (
        <div className="date-filter-section">
          <div className="date-filter-group">
            <label>
              <FiCalendar /> Chọn ngày xem:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-input-large"
            />

            <div className="filter-group">
              <label>Loại tình trạng:</label>
              <select
                value={dateViewType}
                onChange={(e) => setDateViewType(e.target.value)}
                className="date-view-type-select"
              >
                <option value="available">Sẵn sàng</option>
                <option value="unavailable">Không sẵn sàng</option>
              </select>
            </div>

            <div className="date-info">
              <span className="info-text">
                <FiUser /> Hiển thị nhân viên {dateViewType === 'available' ? 'sẵn sàng' : 'không sẵn sàng'} ngày {formatDate(selectedDate)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner for Preferred/Recurring modes */}
      {viewMode === 'preferred' && (
        <div className="info-banner preferred">
          <FiCheckCircle size={20} />
          <div>
            <strong>Lịch Ưu tiên (Preferred Availability)</strong>
            <p>Hiển thị tất cả các lịch làm việc được đánh dấu ưu tiên của nhân viên</p>
          </div>
        </div>
      )}

      {viewMode === 'recurring' && (
        <div className="info-banner recurring">
          <FiClock size={20} />
          <div>
            <strong>Lịch Lặp lại (Recurring Availability)</strong>
            <p>Hiển thị tất cả các lịch làm việc có mẫu lặp lại (hàng ngày, hàng tuần, hàng tháng)</p>
          </div>
        </div>
      )}

      {/* Loading state for data */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : viewMode === 'employee' && !selectedEmployee ? (
        <div className="no-selection">
          <FiUser size={48} />
          <p>Vui lòng chọn nhân viên để xem tình trạng sẵn sàng</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="status-table">
            <thead>
              <tr>
                {(viewMode === 'date' || viewMode === 'preferred' || viewMode === 'recurring') && <th>Nhân viên</th>}
                <th>Ngày</th>
                <th>Giờ bắt đầu</th>
                <th>Giờ kết thúc</th>
                <th>Thời lượng (giờ)</th>
                <th>Ca làm việc</th>
                <th>Loại tình trạng</th>
                <th>Mức độ ưu tiên</th>
                {viewMode === 'recurring' && <th>Mẫu lặp lại</th>}
                {viewMode === 'recurring' && <th>Ngày kết thúc lặp</th>}
                <th>Lý do</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredAvailability.length > 0 ? (
                filteredAvailability.map((item) => (
                  <tr key={item.availabilityId}>
                    {(viewMode === 'date' || viewMode === 'preferred' || viewMode === 'recurring') && (
                      <td>
                        <div className="employee-name-cell">
                          <FiUser />
                          <span>{item.employeeName || 'N/A'}</span>
                        </div>
                      </td>
                    )}
                    <td>
                      <div className="date-cell">
                        <FiCalendar />
                        <span>{formatDate(item.availableDate)}</span>
                      </div>
                    </td>
                    <td>{formatTime(item.startTime)}</td>
                    <td>{formatTime(item.endTime)}</td>
                    <td>
                      <span className="duration-badge">
                        {item.durationHours?.toFixed(1) || 0}h
                      </span>
                    </td>
                    <td>
                      <span className={`shift-badge ${item.shiftInfo?.toLowerCase()}`}>
                        {item.shiftInfo || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={`availability-badge ${item.availabilityType?.toLowerCase()}`}>
                        {getAvailabilityTypeLabel(item.availabilityType)}
                      </span>
                    </td>
                    <td>
                      <span className={`priority-badge ${item.priorityLevel?.toLowerCase()}`}>
                        {getPriorityLabel(item.priorityLevel)}
                      </span>
                    </td>
                    {viewMode === 'recurring' && (
                      <>
                        <td>
                          <span className="recurring-badge">
                            {item.recurringPattern || 'NONE'}
                          </span>
                        </td>
                        <td>
                          {item.recurringEndDate ? formatDate(item.recurringEndDate) : '-'}
                        </td>
                      </>
                    )}
                    <td>
                      <div className="reason-cell">
                        {item.reason || '-'}
                      </div>
                    </td>
                    <td>
                      <div className="status-cell">
                        {item.isActive ? (
                          <span className="active-badge">
                            <FiCheckCircle /> Hoạt động
                          </span>
                        ) : (
                          <span className="inactive-badge">
                            <FiXCircle /> Không hoạt động
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={
                      viewMode === 'recurring' ? '12' :
                      (viewMode === 'date' || viewMode === 'preferred') ? '10' :
                      '9'
                    }
                    className="no-data"
                  >
                    <FiActivity size={32} />
                    <p>
                      {viewMode === 'date'
                        ? (dateViewType === 'available'
                            ? 'Không có nhân viên sẵn sàng trong ngày này'
                            : 'Không có nhân viên không sẵn sàng trong ngày này')
                        : viewMode === 'preferred'
                        ? 'Không có dữ liệu lịch ưu tiên'
                        : viewMode === 'recurring'
                        ? 'Không có dữ liệu lịch lặp lại'
                        : 'Không có dữ liệu tình trạng sẵn sàng'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

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

