import React, { useState, useEffect } from 'react';
import '../shared/SchedulePage.css';
import { hrEmployeeScheduleAPI, hrWorkShiftAPI, hrEmployeeAPI } from '../../../../services/staff/hrAPI';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiX, FiCheck, FiClock, FiCoffee, FiLogOut, FiSearch, FiFilter, FiChevronDown, FiChevronUp, FiLayers, FiCheckCircle, FiUsers } from 'react-icons/fi';

const EmployeeSchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [workShifts, setWorkShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [employeeSearchCode, setEmployeeSearchCode] = useState('');
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    shiftId: '',
    scheduleDate: '',
    plannedStartTime: '',
    plannedEndTime: '',
    assignmentType: 'REGULAR',
    isOvertime: false,
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Search/Filter states
  const [showSearchFilter, setShowSearchFilter] = useState(false);
  const [searchType, setSearchType] = useState('all'); // all, employee-date, employee-range, employee-today, shift-date, employee-active, employee-overtime, employee-work-hours, employee-overtime-hours
  const [searchParams, setSearchParams] = useState({
    employeeId: '',
    date: '',
    startDate: '',
    endDate: '',
    shiftId: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });
  const [searchRole, setSearchRole] = useState('');
  const [searchEmployees, setSearchEmployees] = useState([]);
  const [filteredSearchEmployees, setFilteredSearchEmployees] = useState([]);
  const [searchEmployeeCode, setSearchEmployeeCode] = useState('');
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [workHoursData, setWorkHoursData] = useState(null);

  // Danh sách các role
  const roles = [
    { value: 'DOCTOR', label: 'Bác sĩ' },
    { value: 'NURSE', label: 'Điều dưỡng' },
    { value: 'RECEPTIONIST', label: 'Lễ tân' },
    { value: 'PHARMACIST', label: 'Dược sĩ' },
    { value: 'FINANCE', label: 'Kế toán' },
    { value: 'ADMIN', label: 'Quản lý' },
    { value: 'HR', label: 'Nhân sự' },
    { value: 'TECHNICIAN', label: 'Kỹ thuật viên' },
    { value: 'CLEANER', label: 'Nhân viên vệ sinh' },
    { value: 'SECURITY', label: 'Bảo vệ' },
  ];

  useEffect(() => {
    fetchSchedules();
    fetchWorkShifts();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await hrEmployeeScheduleAPI.getEmployeeSchedules();
      console.log('Schedules response:', response);
      if (response.success) {
        setSchedules(response.data || []);
      } else if (Array.isArray(response)) {
        setSchedules(response);
      }
    } catch (err) {
      console.error('Error fetching employee schedules:', err);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setWorkHoursData(null); // Reset work hours data
      let response = null;

      if (searchType === 'all') {
        response = await hrEmployeeScheduleAPI.getEmployeeSchedules();
      } else if (searchType === 'employee-date') {
        if (!searchParams.employeeId || !searchParams.date) {
          alert('Vui lòng chọn nhân viên và ngày');
          setLoading(false);
          return;
        }
        response = await hrEmployeeScheduleAPI.getScheduleByEmployeeAndDate(
          searchParams.employeeId,
          searchParams.date
        );
      } else if (searchType === 'employee-range') {
        if (!searchParams.employeeId || !searchParams.startDate || !searchParams.endDate) {
          alert('Vui lòng chọn nhân viên và khoảng thời gian');
          setLoading(false);
          return;
        }
        response = await hrEmployeeScheduleAPI.getScheduleByEmployeeAndDateRange(
          searchParams.employeeId,
          searchParams.startDate,
          searchParams.endDate
        );
      } else if (searchType === 'employee-today') {
        if (!searchParams.employeeId) {
          alert('Vui lòng chọn nhân viên');
          setLoading(false);
          return;
        }
        response = await hrEmployeeScheduleAPI.getTodayScheduleByEmployee(searchParams.employeeId);
      } else if (searchType === 'shift-date') {
        if (!searchParams.shiftId || !searchParams.date) {
          alert('Vui lòng chọn ca làm việc và ngày');
          setLoading(false);
          return;
        }
        response = await hrEmployeeScheduleAPI.getScheduleByShiftAndDate(
          searchParams.shiftId,
          searchParams.date
        );
      } else if (searchType === 'employee-active') {
        if (!searchParams.employeeId) {
          alert('Vui lòng chọn nhân viên');
          setLoading(false);
          return;
        }
        response = await hrEmployeeScheduleAPI.getActiveScheduleByEmployee(searchParams.employeeId);
      } else if (searchType === 'employee-overtime') {
        if (!searchParams.employeeId) {
          alert('Vui lòng chọn nhân viên');
          setLoading(false);
          return;
        }
        response = await hrEmployeeScheduleAPI.getOvertimeScheduleByEmployee(searchParams.employeeId);
      } else if (searchType === 'employee-work-hours') {
        if (!searchParams.employeeId || !searchParams.year || !searchParams.month) {
          alert('Vui lòng chọn nhân viên, năm và tháng');
          setLoading(false);
          return;
        }
        response = await hrEmployeeScheduleAPI.getEmployeeWorkHoursByMonth(
          searchParams.employeeId,
          searchParams.year,
          searchParams.month
        );
        // This returns work hours data, not schedules
        console.log('Work hours response:', response);
        setWorkHoursData(response);
        setSchedules([]);
        setLoading(false);
        return;
      } else if (searchType === 'employee-overtime-hours') {
        if (!searchParams.employeeId || !searchParams.year || !searchParams.month) {
          alert('Vui lòng chọn nhân viên, năm và tháng');
          setLoading(false);
          return;
        }
        response = await hrEmployeeScheduleAPI.getEmployeeOvertimeHoursByMonth(
          searchParams.employeeId,
          searchParams.year,
          searchParams.month
        );
        // This returns overtime hours data, not schedules
        console.log('Overtime hours response:', response);
        setWorkHoursData(response);
        setSchedules([]);
        setLoading(false);
        return;
      }

      console.log('Search response:', response);

      if (Array.isArray(response)) {
        setSchedules(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        setSchedules(response.data);
      } else if (response && response.success && response.data) {
        setSchedules(response.data);
      } else {
        setSchedules([]);
      }
    } catch (err) {
      console.error('Error searching schedules:', err);
      alert('Có lỗi xảy ra khi tìm kiếm');
      setSchedules([]);
      setWorkHoursData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSearch = () => {
    setSearchType('all');
    setSearchParams({
      employeeId: '',
      date: '',
      startDate: '',
      endDate: '',
      shiftId: '',
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    });
    setSearchRole('');
    setSearchEmployeeCode('');
    setSearchEmployees([]);
    setFilteredSearchEmployees([]);
    setWorkHoursData(null);
    fetchSchedules();
  };

  const fetchWorkShifts = async () => {
    try {
      const response = await hrWorkShiftAPI.getWorkShifts();
      console.log('Work shifts response:', response);
      if (response.success) {
        setWorkShifts(response.data || []);
      } else if (Array.isArray(response)) {
        setWorkShifts(response);
      }
    } catch (err) {
      console.error('Error fetching work shifts:', err);
      setWorkShifts([]);
    }
  };

  const fetchEmployeesByRole = async (role) => {
    if (!role) {
      setEmployees([]);
      setFilteredEmployees([]);
      return;
    }

    try {
      setLoadingEmployees(true);
      const response = await hrEmployeeAPI.searchByRole(role);
      console.log('Employees by role response:', response);

      let employeeList = [];

      // API trả về có cấu trúc: { message, status, data: { content: [...], pageable, ... }, code }
      if (response && response.data && response.data.content && Array.isArray(response.data.content)) {
        employeeList = response.data.content;
      }
      // Fallback: Kiểm tra nếu response là mảng trực tiếp
      else if (Array.isArray(response)) {
        employeeList = response;
      }
      // Fallback: Kiểm tra nếu data là mảng
      else if (response && response.data && Array.isArray(response.data)) {
        employeeList = response.data;
      }

      console.log('Employee list:', employeeList);
      console.log('Employee count:', employeeList.length);

      setEmployees(employeeList);
      setFilteredEmployees(employeeList);
    } catch (err) {
      console.error('Error fetching employees by role:', err);
      setEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setEmployeeSearchCode('');
    setFormData({ ...formData, employeeId: '' });
    fetchEmployeesByRole(role);
  };

  const handleEmployeeSearchChange = (searchCode) => {
    setEmployeeSearchCode(searchCode);

    if (!searchCode.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    // Lọc nhân viên theo mã hoặc tên
    const filtered = employees.filter(emp =>
      emp.employeeCode?.toLowerCase().includes(searchCode.toLowerCase()) ||
      emp.fullName?.toLowerCase().includes(searchCode.toLowerCase())
    );
    setFilteredEmployees(filtered);
  };

  // Search filter functions
  const fetchSearchEmployeesByRole = async (role) => {
    if (!role) {
      setSearchEmployees([]);
      setFilteredSearchEmployees([]);
      return;
    }

    try {
      setLoadingSearch(true);
      const response = await hrEmployeeAPI.searchByRole(role);

      let employeeList = [];
      if (response && response.data && response.data.content && Array.isArray(response.data.content)) {
        employeeList = response.data.content;
      } else if (Array.isArray(response)) {
        employeeList = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        employeeList = response.data;
      }

      setSearchEmployees(employeeList);
      setFilteredSearchEmployees(employeeList);
    } catch (err) {
      console.error('Error fetching search employees by role:', err);
      setSearchEmployees([]);
      setFilteredSearchEmployees([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleSearchRoleChange = (role) => {
    setSearchRole(role);
    setSearchEmployeeCode('');
    setSearchParams({ ...searchParams, employeeId: '' });
    fetchSearchEmployeesByRole(role);
  };

  const handleSearchEmployeeCodeChange = (searchCode) => {
    setSearchEmployeeCode(searchCode);

    if (!searchCode.trim()) {
      setFilteredSearchEmployees(searchEmployees);
      return;
    }

    const filtered = searchEmployees.filter(emp =>
      emp.employeeCode?.toLowerCase().includes(searchCode.toLowerCase()) ||
      emp.fullName?.toLowerCase().includes(searchCode.toLowerCase())
    );
    setFilteredSearchEmployees(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch ca làm việc này?')) {
      try {
        await hrEmployeeScheduleAPI.deleteEmployeeSchedule(id);
        alert('Xóa lịch ca làm việc thành công!');
        fetchSchedules();
      } catch (err) {
        alert('Lỗi khi xóa lịch ca làm việc: ' + err.message);
      }
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
    setFormData({
      employeeId: '',
      shiftId: '',
      scheduleDate: '',
      plannedStartTime: '',
      plannedEndTime: '',
      assignmentType: 'REGULAR',
      isOvertime: false,
      notes: ''
    });
    setSelectedShift(null);
    setSelectedRole('');
    setEmployeeSearchCode('');
    setEmployees([]);
    setFilteredEmployees([]);
    setErrors({});
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      employeeId: '',
      shiftId: '',
      scheduleDate: '',
      plannedStartTime: '',
      plannedEndTime: '',
      assignmentType: 'REGULAR',
      isOvertime: false,
      notes: ''
    });
    setSelectedShift(null);
    setSelectedRole('');
    setEmployeeSearchCode('');
    setEmployees([]);
    setFilteredEmployees([]);
    setErrors({});
  };

  const handleShiftChange = (shiftId) => {
    const shift = workShifts.find(s => s.shiftId === parseInt(shiftId));
    setSelectedShift(shift);
    setFormData(prev => ({
      ...prev,
      shiftId: shiftId
    }));

    // Tự động điền thời gian nếu đã chọn ngày
    if (formData.scheduleDate && shift) {
      const date = formData.scheduleDate;
      setFormData(prev => ({
        ...prev,
        plannedStartTime: `${date}T${shift.startTime}`,
        plannedEndTime: `${date}T${shift.endTime}`
      }));
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      scheduleDate: date
    }));

    // Tự động điền thời gian nếu đã chọn shift
    if (selectedShift && date) {
      setFormData(prev => ({
        ...prev,
        plannedStartTime: `${date}T${selectedShift.startTime}`,
        plannedEndTime: `${date}T${selectedShift.endTime}`
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedRole) {
      newErrors.role = 'Vui lòng chọn vai trò nhân viên';
    }
    if (!formData.employeeId) {
      newErrors.employeeId = 'Vui lòng chọn nhân viên';
    }
    if (!formData.shiftId) {
      newErrors.shiftId = 'Vui lòng chọn ca làm việc';
    }
    if (!formData.scheduleDate) {
      newErrors.scheduleDate = 'Vui lòng chọn ngày làm việc';
    }
    if (!formData.plannedStartTime) {
      newErrors.plannedStartTime = 'Vui lòng nhập giờ bắt đầu';
    }
    if (!formData.plannedEndTime) {
      newErrors.plannedEndTime = 'Vui lòng nhập giờ kết thúc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const submitData = {
        employeeId: parseInt(formData.employeeId),
        shiftId: parseInt(formData.shiftId),
        scheduleDate: formData.scheduleDate,
        plannedStartTime: formData.plannedStartTime,
        plannedEndTime: formData.plannedEndTime,
        assignmentType: formData.assignmentType,
        isOvertime: formData.isOvertime,
        notes: formData.notes || null
      };

      console.log('Submitting schedule data:', submitData);

      const response = await hrEmployeeScheduleAPI.createEmployeeSchedule(submitData);
      console.log('Create schedule response:', response);

      alert('Tạo lịch ca làm việc thành công!');
      handleCloseModal();
      fetchSchedules();
    } catch (err) {
      console.error('Error creating schedule:', err);
      alert('Lỗi khi tạo lịch ca làm việc: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'SCHEDULED': 'Đã xếp lịch',
      'CONFIRMED': 'Đã xác nhận',
      'IN_PROGRESS': 'Đang làm việc',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy',
      'NO_SHOW': 'Vắng mặt'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const classMap = {
      'SCHEDULED': 'status-scheduled',
      'CONFIRMED': 'status-confirmed',
      'IN_PROGRESS': 'status-in-progress',
      'COMPLETED': 'status-completed',
      'CANCELLED': 'status-cancelled',
      'NO_SHOW': 'status-no-show'
    };
    return classMap[status] || 'status-default';
  };

  const getAttendanceStatusText = (status) => {
    const statusMap = {
      'PENDING': 'Chờ xử lý',
      'ON_TIME': 'Đúng giờ',
      'LATE': 'Đi muộn',
      'EARLY_LEAVE': 'Về sớm',
      'ABSENT': 'Vắng mặt'
    };
    return statusMap[status] || status;
  };

  const getAttendanceStatusClass = (status) => {
    const classMap = {
      'PENDING': 'badge-info',
      'ON_TIME': 'badge-success',
      'LATE': 'badge-warning',
      'EARLY_LEAVE': 'badge-warning',
      'ABSENT': 'badge-danger'
    };
    return classMap[status] || 'badge-info';
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
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-primary" onClick={handleOpenModal}>
            <FiPlus /> Thêm Lịch ca làm việc
          </button>
        </div>
      </div>

      {/* Modern Search Filter Section */}
      <div style={{
        background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 10px 40px rgba(14, 165, 233, 0.3)',
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: showSearchFilter ? '1.5rem' : 0,
            position: 'relative',
            zIndex: 1,
            cursor: 'pointer'
          }}
          onClick={() => setShowSearchFilter(!showSearchFilter)}
        >
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
                Bộ lọc tìm kiếm
              </h3>
              <p style={{
                margin: 0,
                fontSize: '0.85rem',
                color: 'rgba(255, 255, 255, 0.9)',
                marginTop: '0.25rem'
              }}>
                Click để {showSearchFilter ? 'thu gọn' : 'mở rộng'} bộ lọc
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Filter Status Badge */}
            {schedules.length > 0 && (searchType !== 'all' || searchParams.employeeId || searchParams.date || searchParams.shiftId) && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                color: '#28a745',
                padding: '0.5rem 1rem',
                borderRadius: '25px',
                fontSize: '0.9rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}>
                <FiCheckCircle size={16} />
                <span>Đang lọc ({schedules.length} kết quả)</span>
              </div>
            )}

            {/* Toggle Button */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              padding: '0.5rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {showSearchFilter ? <FiChevronUp size={20} style={{ color: '#fff' }} /> : <FiChevronDown size={20} style={{ color: '#fff' }} />}
            </div>
          </div>
        </div>

        {/* Filter Content Card */}
        {showSearchFilter && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            position: 'relative',
            zIndex: 1
          }}>
            {/* Filter Options Section */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                paddingBottom: '0.75rem',
                borderBottom: '2px solid #f0f0f0'
              }}>
                <FiLayers size={18} style={{ color: '#0ea5e9' }} />
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#2d3748' }}>
                  Tùy chọn lọc
                </h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {/* Loại tìm kiếm */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                    <FiSearch size={14} style={{ color: '#0ea5e9' }} />
                    Loại tìm kiếm <span style={{ color: '#e53e3e' }}>*</span>
                  </label>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
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
                    <option value="all">Tất cả lịch làm việc</option>
                    <option value="employee-date">Theo nhân viên và ngày</option>
                    <option value="employee-range">Theo nhân viên và khoảng thời gian</option>
                    <option value="employee-today">Lịch hôm nay của nhân viên</option>
                    <option value="employee-active">Lịch đang hoạt động của nhân viên</option>
                    <option value="employee-overtime">Lịch tăng ca của nhân viên</option>
                    <option value="shift-date">Theo ca làm việc và ngày</option>
                    <option value="employee-work-hours">Tổng giờ làm việc theo tháng</option>
                    <option value="employee-overtime-hours">Tổng giờ tăng ca theo tháng</option>
                  </select>
                </div>

                {/* Filters cho employee-based searches */}
                {(searchType === 'employee-date' || searchType === 'employee-range' || searchType === 'employee-today' ||
                  searchType === 'employee-active' || searchType === 'employee-overtime' ||
                  searchType === 'employee-work-hours' || searchType === 'employee-overtime-hours') && (
                  <>
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                        <FiUsers size={14} style={{ color: '#0ea5e9' }} />
                        Vai trò nhân viên <span style={{ color: '#e53e3e' }}>*</span>
                      </label>
                      <select
                        value={searchRole}
                        onChange={(e) => handleSearchRoleChange(e.target.value)}
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
                        <option value="">-- Chọn vai trò --</option>
                        {roles.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {searchRole && (
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                          <FiSearch size={14} style={{ color: '#0ea5e9' }} />
                          Tìm kiếm nhân viên
                        </label>
                        <input
                          type="text"
                          value={searchEmployeeCode}
                          onChange={(e) => handleSearchEmployeeCodeChange(e.target.value)}
                          placeholder="Nhập mã hoặc tên..."
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

                    {searchRole && (
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                          <FiUsers size={14} style={{ color: '#0ea5e9' }} />
                          Nhân viên <span style={{ color: '#e53e3e' }}>*</span>
                        </label>
                        <select
                          value={searchParams.employeeId}
                          onChange={(e) => setSearchParams({ ...searchParams, employeeId: e.target.value })}
                          disabled={loadingSearch || filteredSearchEmployees.length === 0}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: '2px solid #e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.95rem',
                            backgroundColor: '#fff',
                            cursor: (loadingSearch || filteredSearchEmployees.length === 0) ? 'not-allowed' : 'pointer',
                            opacity: (loadingSearch || filteredSearchEmployees.length === 0) ? 0.6 : 1,
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        >
                          <option value="">
                            {loadingSearch
                              ? '-- Đang tải...'
                              : filteredSearchEmployees.length === 0
                                ? '-- Không có nhân viên --'
                                : '-- Chọn nhân viên --'}
                          </option>
                          {filteredSearchEmployees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.fullName} - {emp.employeeCode}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}

                {/* Date filters */}
                {searchType === 'employee-date' && (
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                      <FiCalendar size={14} style={{ color: '#0ea5e9' }} />
                      Ngày <span style={{ color: '#e53e3e' }}>*</span>
                    </label>
                    <input
                      type="date"
                      value={searchParams.date}
                      onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
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

                {searchType === 'employee-range' && (
                  <>
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                        <FiCalendar size={14} style={{ color: '#0ea5e9' }} />
                        Từ ngày <span style={{ color: '#e53e3e' }}>*</span>
                      </label>
                      <input
                        type="date"
                        value={searchParams.startDate}
                        onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })}
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
                        <FiCalendar size={14} style={{ color: '#0ea5e9' }} />
                        Đến ngày <span style={{ color: '#e53e3e' }}>*</span>
                      </label>
                      <input
                        type="date"
                        value={searchParams.endDate}
                        onChange={(e) => setSearchParams({ ...searchParams, endDate: e.target.value })}
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

                {/* Year/Month filters for work hours */}
                {(searchType === 'employee-work-hours' || searchType === 'employee-overtime-hours') && (
                  <>
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                        <FiCalendar size={14} style={{ color: '#0ea5e9' }} />
                        Năm <span style={{ color: '#e53e3e' }}>*</span>
                      </label>
                      <input
                        type="number"
                        value={searchParams.year}
                        onChange={(e) => setSearchParams({ ...searchParams, year: parseInt(e.target.value) })}
                        min="2020"
                        max="2100"
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
                        <FiCalendar size={14} style={{ color: '#0ea5e9' }} />
                        Tháng <span style={{ color: '#e53e3e' }}>*</span>
                      </label>
                      <select
                        value={searchParams.month}
                        onChange={(e) => setSearchParams({ ...searchParams, month: parseInt(e.target.value) })}
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
                        <option value="1">Tháng 1</option>
                        <option value="2">Tháng 2</option>
                        <option value="3">Tháng 3</option>
                        <option value="4">Tháng 4</option>
                        <option value="5">Tháng 5</option>
                        <option value="6">Tháng 6</option>
                        <option value="7">Tháng 7</option>
                        <option value="8">Tháng 8</option>
                        <option value="9">Tháng 9</option>
                        <option value="10">Tháng 10</option>
                        <option value="11">Tháng 11</option>
                        <option value="12">Tháng 12</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Shift-based search */}
                {searchType === 'shift-date' && (
                  <>
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                        <FiClock size={14} style={{ color: '#0ea5e9' }} />
                        Ca làm việc <span style={{ color: '#e53e3e' }}>*</span>
                      </label>
                      <select
                        value={searchParams.shiftId}
                        onChange={(e) => setSearchParams({ ...searchParams, shiftId: e.target.value })}
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
                        <option value="">-- Chọn ca làm việc --</option>
                        {workShifts.map((shift) => (
                          <option key={shift.shiftId} value={shift.shiftId}>
                            {shift.shiftName} ({shift.startTime} - {shift.endTime})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                        <FiCalendar size={14} style={{ color: '#0ea5e9' }} />
                        Ngày <span style={{ color: '#e53e3e' }}>*</span>
                      </label>
                      <input
                        type="date"
                        value={searchParams.date}
                        onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
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

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              paddingTop: '1rem',
              borderTop: '2px solid #f0f0f0'
            }}>
              <button
                onClick={handleSearch}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: loading ? '#6c757d' : 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                <FiSearch size={16} />
                {loading ? 'Đang tìm...' : 'Áp dụng bộ lọc'}
              </button>
              <button
                onClick={handleResetSearch}
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
                Xóa bộ lọc
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Work Hours Summary Card */}
      {workHoursData && (
        <div className="work-hours-card">
          <div className="work-hours-header">
            <FiClock size={24} />
            <h3>
              {searchType === 'employee-work-hours' ? 'Tổng giờ làm việc' : 'Tổng giờ tăng ca'}
              {' - Tháng '}{searchParams.month}/{searchParams.year}
            </h3>
          </div>
          <div className="work-hours-content">
            {workHoursData.data ? (
              <div className="work-hours-grid">
                <div className="work-hours-item">
                  <label>Nhân viên</label>
                  <div className="work-hours-value">
                    <strong>{workHoursData.data.employeeName || 'N/A'}</strong>
                    <small>ID: {workHoursData.data.employeeId || searchParams.employeeId}</small>
                  </div>
                </div>
                <div className="work-hours-item">
                  <label>Tổng giờ</label>
                  <div className="work-hours-value highlight">
                    <strong>{workHoursData.data.totalHours || workHoursData.data.totalWorkHours || workHoursData.data.totalOvertimeHours || 0}</strong>
                    <small>giờ</small>
                  </div>
                </div>
                {workHoursData.data.totalDays && (
                  <div className="work-hours-item">
                    <label>Số ngày làm việc</label>
                    <div className="work-hours-value">
                      <strong>{workHoursData.data.totalDays}</strong>
                      <small>ngày</small>
                    </div>
                  </div>
                )}
                {workHoursData.data.averageHoursPerDay && (
                  <div className="work-hours-item">
                    <label>Trung bình/ngày</label>
                    <div className="work-hours-value">
                      <strong>{workHoursData.data.averageHoursPerDay.toFixed(2)}</strong>
                      <small>giờ/ngày</small>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="work-hours-raw">
                <pre>{JSON.stringify(workHoursData, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="table-container">
        <h3>Danh sách Lịch ca làm việc ({schedules.length})</h3>
        <div className="table-wrapper">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nhân viên</th>
                <th>Ca làm việc</th>
                <th>Ngày</th>
                <th>Giờ kế hoạch</th>
                <th>Giờ thực tế</th>
                <th>Trạng thái</th>
                <th>Chấm công</th>
                <th>Giờ làm</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {schedules.length > 0 ? (
                schedules.map((schedule) => (
                  <tr key={schedule.scheduleId}>
                    <td>{schedule.scheduleId}</td>
                    <td>
                      <div className="doctor-info">
                        <strong>{schedule.employeeName || `ID: ${schedule.employeeId}`}</strong>
                        <small>ID: {schedule.employeeId}</small>
                      </div>
                    </td>
                    <td>
                      <div className="doctor-info">
                        <strong>{schedule.shiftName || `ID: ${schedule.shiftId}`}</strong>
                        <small>{schedule.shiftCode || 'N/A'}</small>
                      </div>
                    </td>
                    <td>
                      <span className="date-badge">
                        {schedule.scheduleDate ? new Date(schedule.scheduleDate).toLocaleDateString('vi-VN') : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div className="time-range">
                        <FiClock />
                        <span>
                          {schedule.plannedStartTime ? new Date(schedule.plannedStartTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          {' - '}
                          {schedule.plannedEndTime ? new Date(schedule.plannedEndTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td>
                      {schedule.actualStartTime ? (
                        <div className="time-range">
                          <FiClock />
                          <span>
                            {new Date(schedule.actualStartTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {schedule.actualEndTime ? new Date(schedule.actualEndTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '...'}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#6c757d', fontStyle: 'italic' }}>Chưa check-in</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(schedule.status)}`}>
                        {getStatusText(schedule.status)}
                      </span>
                    </td>
                    <td>
                      {schedule.attendanceStatus && (
                        <span className={`badge ${getAttendanceStatusClass(schedule.attendanceStatus)}`}>
                          {getAttendanceStatusText(schedule.attendanceStatus)}
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ textAlign: 'center' }}>
                        <div><strong>{schedule.actualWorkHours?.toFixed(2) || '0.00'}h</strong></div>
                        <small style={{ color: '#6c757d' }}>/ {schedule.plannedWorkHours || 0}h</small>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(schedule.scheduleId)}
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
                    <p>Chưa có lịch ca làm việc nào</p>
                    <small>Sử dụng bộ lọc để tìm kiếm hoặc thêm lịch mới</small>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal tạo lịch ca làm việc */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Tạo Lịch ca làm việc mới</h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Chọn vai trò */}
                <div className="form-group">
                  <label htmlFor="role">
                    Vai trò nhân viên <span className="required">*</span>
                  </label>
                  <select
                    id="role"
                    value={selectedRole}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className={errors.role ? 'error' : ''}
                  >
                    <option value="">-- Chọn vai trò --</option>
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  {errors.role && <span className="error-message">{errors.role}</span>}
                </div>

                {/* Tìm kiếm nhân viên theo mã */}
                {selectedRole && (
                  <div className="form-group">
                    <label htmlFor="employeeSearch">
                      Tìm kiếm nhân viên (theo mã hoặc tên)
                    </label>
                    <input
                      type="text"
                      id="employeeSearch"
                      value={employeeSearchCode}
                      onChange={(e) => handleEmployeeSearchChange(e.target.value)}
                      placeholder="Nhập mã nhân viên hoặc tên để tìm kiếm..."
                    />
                    {loadingEmployees && (
                      <div className="loading-inline">
                        <div className="inline-spinner"></div>
                        <span>Đang tải danh sách nhân viên...</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Chọn nhân viên */}
                {selectedRole && (
                  <div className="form-group">
                    <label htmlFor="employeeId">
                      Nhân viên <span className="required">*</span>
                    </label>
                    <select
                      id="employeeId"
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      className={errors.employeeId ? 'error' : ''}
                      disabled={loadingEmployees || filteredEmployees.length === 0}
                    >
                      <option value="">
                        {loadingEmployees
                          ? '-- Đang tải...'
                          : filteredEmployees.length === 0
                            ? '-- Không có nhân viên nào --'
                            : '-- Chọn nhân viên --'}
                      </option>
                      {filteredEmployees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.fullName} - {emp.employeeCode} {emp.departmentName ? `(${emp.departmentName})` : ''}
                        </option>
                      ))}
                    </select>
                    {errors.employeeId && <span className="error-message">{errors.employeeId}</span>}
                    {filteredEmployees.length > 0 && (
                      <small className="form-hint">
                        Tìm thấy {filteredEmployees.length} nhân viên
                      </small>
                    )}
                  </div>
                )}

                {/* Chọn ca làm việc */}
                <div className="form-group">
                  <label htmlFor="shiftId">
                    Ca làm việc <span className="required">*</span>
                  </label>
                  <select
                    id="shiftId"
                    value={formData.shiftId}
                    onChange={(e) => handleShiftChange(e.target.value)}
                    className={errors.shiftId ? 'error' : ''}
                  >
                    <option value="">-- Chọn ca làm việc --</option>
                    {workShifts.map((shift) => (
                      <option key={shift.shiftId} value={shift.shiftId}>
                        {shift.shiftName} ({shift.startTime} - {shift.endTime})
                      </option>
                    ))}
                  </select>
                  {errors.shiftId && <span className="error-message">{errors.shiftId}</span>}

                  {/* Hiển thị thông tin ca làm việc đã chọn */}
                  {selectedShift && (
                    <div className="shift-info">
                      <p><strong>Mã ca:</strong> {selectedShift.shiftCode}</p>
                      <p><strong>Loại ca:</strong> {selectedShift.shiftType}</p>
                      <p><strong>Thời gian:</strong> {selectedShift.startTime} - {selectedShift.endTime}</p>
                      <p><strong>Thời lượng:</strong> {selectedShift.durationHours} giờ</p>
                      <p><strong>Nghỉ giải lao:</strong> {selectedShift.breakDurationMinutes} phút</p>
                      {selectedShift.description && <p><strong>Mô tả:</strong> {selectedShift.description}</p>}
                    </div>
                  )}
                </div>

                {/* Chọn ngày */}
                <div className="form-group">
                  <label htmlFor="scheduleDate">
                    Ngày làm việc <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    id="scheduleDate"
                    value={formData.scheduleDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className={errors.scheduleDate ? 'error' : ''}
                  />
                  {errors.scheduleDate && <span className="error-message">{errors.scheduleDate}</span>}
                </div>

                {/* Giờ bắt đầu */}
                <div className="form-group">
                  <label htmlFor="plannedStartTime">
                    Giờ bắt đầu <span className="required">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="plannedStartTime"
                    value={formData.plannedStartTime}
                    onChange={(e) => setFormData({ ...formData, plannedStartTime: e.target.value })}
                    className={errors.plannedStartTime ? 'error' : ''}
                  />
                  {errors.plannedStartTime && <span className="error-message">{errors.plannedStartTime}</span>}
                </div>

                {/* Giờ kết thúc */}
                <div className="form-group">
                  <label htmlFor="plannedEndTime">
                    Giờ kết thúc <span className="required">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="plannedEndTime"
                    value={formData.plannedEndTime}
                    onChange={(e) => setFormData({ ...formData, plannedEndTime: e.target.value })}
                    className={errors.plannedEndTime ? 'error' : ''}
                  />
                  {errors.plannedEndTime && <span className="error-message">{errors.plannedEndTime}</span>}
                </div>

                {/* Loại phân công */}
                <div className="form-group">
                  <label htmlFor="assignmentType">Loại phân công</label>
                  <select
                    id="assignmentType"
                    value={formData.assignmentType}
                    onChange={(e) => setFormData({ ...formData, assignmentType: e.target.value })}
                  >
                    <option value="REGULAR">Thường xuyên</option>
                    <option value="TEMPORARY">Tạm thời</option>
                    <option value="REPLACEMENT">Thay thế</option>
                    <option value="EMERGENCY">Khẩn cấp</option>
                  </select>
                </div>

                {/* Làm thêm giờ */}
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isOvertime}
                      onChange={(e) => setFormData({ ...formData, isOvertime: e.target.checked })}
                    />
                    <span>Làm thêm giờ</span>
                  </label>
                </div>

                {/* Ghi chú */}
                <div className="form-group">
                  <label htmlFor="notes">Ghi chú</label>
                  <textarea
                    id="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Nhập ghi chú (nếu có)"
                  />
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
                  {submitting ? 'Đang tạo...' : 'Tạo lịch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeSchedulePage;

