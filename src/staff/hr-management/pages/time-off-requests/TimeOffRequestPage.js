import React, { useState, useEffect } from 'react';
import './TimeOffRequestPage.css';
import { hrTimeOffAPI, hrEmployeeAPI } from '../../../../services/staff/hrAPI';
import { FiPlus, FiFilter, FiCalendar, FiClock, FiSearch, FiCheckCircle, FiX, FiLayers } from 'react-icons/fi';
import AddTimeOffRequestModal from '../../components/AddTimeOffRequestModal';
import EditTimeOffRequestModal from '../../components/EditTimeOffRequestModal';
import TimeOffRequestDetailModal from '../../components/TimeOffRequestDetailModal';
import TimeOffRequestCard from '../../components/TimeOffRequestCard';

const TimeOffRequestPage = () => {
  const [allRequests, setAllRequests] = useState([]); // Lưu tất cả đơn để tính số lượng
  const [requests, setRequests] = useState([]); // Đơn hiển thị theo tab
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filterLeaveType, setFilterLeaveType] = useState('');
  const [filterDateRange, setFilterDateRange] = useState({ start: '', end: '' });
  const [useServerDateFilter, setUseServerDateFilter] = useState(false); // Sử dụng API filter hay client filter
  const [currentLeavesCount, setCurrentLeavesCount] = useState(0); // Số lượng đơn đang nghỉ từ API
  const [upcomingLeavesCount, setUpcomingLeavesCount] = useState(0); // Số lượng đơn sắp tới từ API

  // State cho chức năng xem nhân viên đang nghỉ theo ngày
  const [selectedDate, setSelectedDate] = useState('');
  const [employeesOnLeave, setEmployeesOnLeave] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employeeDetails, setEmployeeDetails] = useState({}); // Lưu thông tin chi tiết nhân viên

  // State cho chức năng hiển thị số ngày nghỉ phép
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [leaveBalanceByType, setLeaveBalanceByType] = useState({});
  const [loadingBalance, setLoadingBalance] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // User info from localStorage
  const [userRole] = useState('hr'); // 'employee' or 'hr'
  const [employeeId] = useState(() => {
    try {
      const empAccountId = localStorage.getItem('employeeAccountId');
      return empAccountId ? parseInt(empAccountId) : 1;
    } catch (e) {
      return 1;
    }
  });

  // Load tất cả dữ liệu một lần khi component mount
  useEffect(() => {
    fetchAllRequests();
    fetchCurrentLeavesCount(); // Lấy số lượng đơn đang nghỉ
    fetchUpcomingLeavesCount(); // Lấy số lượng đơn sắp tới
  }, []);

  // Lọc dữ liệu theo tab khi activeTab thay đổi
  useEffect(() => {
    filterRequestsByTab();
  }, [activeTab, allRequests]);

  // Khi thay đổi date range filter, nếu bật server filter thì gọi API
  useEffect(() => {
    if (useServerDateFilter && filterDateRange.start && filterDateRange.end) {
      fetchRequestsByDateRange();
    } else if (!useServerDateFilter) {
      fetchAllRequests();
    }
  }, [useServerDateFilter, filterDateRange.start, filterDateRange.end]);

  const fetchAllRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await hrTimeOffAPI.getTimeOffRequests();
      console.log('Fetch all requests response:', response);

      let data = [];
      // API trả về mảng trực tiếp hoặc object với data property
      if (Array.isArray(response)) {
        data = response;
      } else if (response.success && response.data) {
        data = response.data;
      } else if (response.data && Array.isArray(response.data)) {
        data = response.data;
      }

      setAllRequests(data);
      setRequests(data); // Mặc định hiển thị tất cả
    } catch (err) {
      setError('Lỗi khi tải dữ liệu: ' + err.message);
      console.error('Error fetching requests:', err);
      setAllRequests([]);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentLeavesCount = async () => {
    try {
      const response = await hrTimeOffAPI.getCurrentLeaves();
      console.log('Current leaves count response:', response);

      let data = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (response.success && response.data) {
        data = response.data;
      } else if (response.data && Array.isArray(response.data)) {
        data = response.data;
      }

      setCurrentLeavesCount(data.length);
    } catch (err) {
      console.error('Error fetching current leaves count:', err);
      setCurrentLeavesCount(0);
    }
  };

  const fetchUpcomingLeavesCount = async () => {
    try {
      const response = await hrTimeOffAPI.getUpcomingLeaves();
      console.log('Upcoming leaves count response:', response);

      let data = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (response.success && response.data) {
        data = response.data;
      } else if (response.data && Array.isArray(response.data)) {
        data = response.data;
      }

      setUpcomingLeavesCount(data.length);
    } catch (err) {
      console.error('Error fetching upcoming leaves count:', err);
      setUpcomingLeavesCount(0);
    }
  };

  const fetchEmployeesOnLeave = async (date) => {
    if (!date) {
      setEmployeesOnLeave([]);
      setEmployeeDetails({});
      return;
    }

    setLoadingEmployees(true);
    try {
      const response = await hrTimeOffAPI.getEmployeesOnLeave(date);
      console.log('Employees on leave response:', response);

      let data = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (response.success && response.data) {
        data = response.data;
      } else if (response.data && Array.isArray(response.data)) {
        data = response.data;
      }

      setEmployeesOnLeave(data);

      // Lấy thông tin chi tiết cho từng nhân viên
      const details = {};
      for (const employeeId of data) {
        try {
          const empResponse = await hrEmployeeAPI.getEmployeeById(employeeId);
          console.log('Employee details for ID', employeeId, ':', empResponse);

          // Xử lý response có thể có cấu trúc khác nhau
          let empData = null;
          if (empResponse.success && empResponse.data) {
            empData = empResponse.data;
          } else if (empResponse.data) {
            empData = empResponse.data;
          } else {
            empData = empResponse;
          }

          details[employeeId] = empData;
        } catch (err) {
          console.error('Error fetching employee details for ID', employeeId, ':', err);
          details[employeeId] = null;
        }
      }
      setEmployeeDetails(details);
    } catch (err) {
      console.error('Error fetching employees on leave:', err);
      setEmployeesOnLeave([]);
      setEmployeeDetails({});
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Fetch tổng số ngày nghỉ phép
  const fetchLeaveBalance = async (empId, year) => {
    if (!empId || !year) {
      setLeaveBalance(null);
      return;
    }

    setLoadingBalance(true);
    try {
      const response = await hrTimeOffAPI.getEmployeeLeaveBalance(empId, year);
      console.log('Leave balance response:', response);

      let balance = null;
      if (response.success && response.data !== undefined) {
        balance = response.data;
      } else if (response.data !== undefined) {
        balance = response.data;
      } else if (typeof response === 'number') {
        balance = response;
      }

      setLeaveBalance(balance);
    } catch (err) {
      console.error('Error fetching leave balance:', err);
      setLeaveBalance(null);
    } finally {
      setLoadingBalance(false);
    }
  };

  // Fetch số ngày nghỉ phép theo từng loại
  const fetchLeaveBalanceByType = async (empId, year) => {
    if (!empId || !year) {
      setLeaveBalanceByType({});
      return;
    }

    const leaveTypes = [
      'ANNUAL_LEAVE',
      'SICK_LEAVE',
      'MATERNITY',
      'PATERNITY',
      'PERSONAL_LEAVE',
      'STUDY_LEAVE',
      'EMERGENCY',
      'BEREAVEMENT'
    ];

    const balances = {};
    for (const type of leaveTypes) {
      try {
        const response = await hrTimeOffAPI.getEmployeeLeaveBalanceByType(empId, year, type);
        console.log(`Leave balance for ${type}:`, response);

        let balance = null;
        if (response.success && response.data !== undefined) {
          balance = response.data;
        } else if (response.data !== undefined) {
          balance = response.data;
        } else if (typeof response === 'number') {
          balance = response;
        }

        balances[type] = balance;
      } catch (err) {
        console.error(`Error fetching leave balance for ${type}:`, err);
        balances[type] = null;
      }
    }

    setLeaveBalanceByType(balances);
  };

  // Fetch cả tổng và chi tiết khi thay đổi nhân viên hoặc năm
  const handleFetchLeaveBalances = () => {
    if (selectedEmployeeId && selectedYear) {
      fetchLeaveBalance(selectedEmployeeId, selectedYear);
      fetchLeaveBalanceByType(selectedEmployeeId, selectedYear);
    }
  };

  const fetchRequestsByDateRange = async () => {
    if (!filterDateRange.start || !filterDateRange.end) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await hrTimeOffAPI.getTimeOffRequestsByDateRange(
        employeeId,
        filterDateRange.start,
        filterDateRange.end
      );
      console.log('Fetch requests by date range response:', response);

      let data = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (response.success && response.data) {
        data = response.data;
      } else if (response.data && Array.isArray(response.data)) {
        data = response.data;
      }

      setAllRequests(data);
      setRequests(data);
    } catch (err) {
      setError('Lỗi khi tải dữ liệu theo khoảng thời gian: ' + err.message);
      console.error('Error fetching requests by date range:', err);
      setAllRequests([]);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const filterRequestsByTab = async () => {
    if (activeTab === 'current') {
      // Gọi API riêng cho tab "Đang nghỉ"
      setLoading(true);
      try {
        const response = await hrTimeOffAPI.getCurrentLeaves();
        console.log('Current leaves response:', response);

        let data = [];
        if (Array.isArray(response)) {
          data = response;
        } else if (response.success && response.data) {
          data = response.data;
        } else if (response.data && Array.isArray(response.data)) {
          data = response.data;
        }

        setRequests(data);
      } catch (err) {
        console.error('Error fetching current leaves:', err);
        setRequests([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (activeTab === 'upcoming') {
      // Gọi API riêng cho tab "Sắp tới"
      setLoading(true);
      try {
        const response = await hrTimeOffAPI.getUpcomingLeaves();
        console.log('Upcoming leaves response:', response);

        let data = [];
        if (Array.isArray(response)) {
          data = response;
        } else if (response.success && response.data) {
          data = response.data;
        } else if (response.data && Array.isArray(response.data)) {
          data = response.data;
        }

        setRequests(data);
      } catch (err) {
        console.error('Error fetching upcoming leaves:', err);
        setRequests([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Logic cũ cho các tab khác
    if (!allRequests || allRequests.length === 0) {
      setRequests([]);
      return;
    }

    let filtered = [];

    switch (activeTab) {
      case 'pending':
        filtered = allRequests.filter(r => r.status === 'PENDING');
        break;
      case 'approved':
        filtered = allRequests.filter(r => r.status === 'APPROVED');
        break;
      default:
        filtered = allRequests;
    }

    setRequests(filtered);
  };

  const handleApprove = async (request) => {
    const note = prompt('Nhập ghi chú phê duyệt (tùy chọn):');
    if (note !== null) {
      try {
        const requestId = request.requestId || request.id;
        const response = await hrTimeOffAPI.approveTimeOffRequest(requestId, note);
        console.log('Approve response:', response);
        alert('Phê duyệt thành công');
        fetchAllRequests(); // Reload tất cả dữ liệu
        fetchCurrentLeavesCount(); // Reload số lượng đơn đang nghỉ
        fetchUpcomingLeavesCount(); // Reload số lượng đơn sắp tới
      } catch (err) {
        alert('Lỗi khi phê duyệt: ' + err.message);
      }
    }
  };

  const handleReject = async (request) => {
    const reason = prompt('Nhập lý do từ chối:');
    if (reason) {
      try {
        const requestId = request.requestId || request.id;
        const response = await hrTimeOffAPI.rejectTimeOffRequest(requestId, reason);
        console.log('Reject response:', response);
        alert('Từ chối thành công');
        fetchAllRequests(); // Reload tất cả dữ liệu
        fetchCurrentLeavesCount(); // Reload số lượng đơn đang nghỉ
        fetchUpcomingLeavesCount(); // Reload số lượng đơn sắp tới
      } catch (err) {
        alert('Lỗi khi từ chối: ' + err.message);
      }
    }
  };

  const handleWithdraw = async (requestId) => {
    if (window.confirm('Bạn có chắc chắn muốn rút lại đơn này?')) {
      try {
        const response = await hrTimeOffAPI.withdrawTimeOffRequest(requestId);
        console.log('Withdraw response:', response);
        alert('Rút lại thành công');
        fetchAllRequests(); // Reload tất cả dữ liệu
        fetchCurrentLeavesCount(); // Reload số lượng đơn đang nghỉ
        fetchUpcomingLeavesCount(); // Reload số lượng đơn sắp tới
      } catch (err) {
        alert('Lỗi khi rút lại: ' + err.message);
      }
    }
  };

  const handleDelete = async (requestId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn này?')) {
      try {
        const response = await hrTimeOffAPI.deleteTimeOffRequest(requestId);
        console.log('Delete response:', response);
        alert('Xóa thành công');
        fetchAllRequests(); // Reload tất cả dữ liệu
        fetchCurrentLeavesCount(); // Reload số lượng đơn đang nghỉ
        fetchUpcomingLeavesCount(); // Reload số lượng đơn sắp tới
      } catch (err) {
        alert('Lỗi khi xóa: ' + err.message);
      }
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(req => {
    let match = true;

    if (filterLeaveType) {
      const reqType = req.requestType || req.leaveType;
      // Hỗ trợ cả tên cũ và mới của các loại nghỉ phép
      const normalizedReqType = reqType === 'MATERNITY' ? 'MATERNITY_LEAVE' :
                                 reqType === 'EMERGENCY' ? 'EMERGENCY_LEAVE' : reqType;
      const normalizedFilterType = filterLeaveType === 'MATERNITY' ? 'MATERNITY_LEAVE' :
                                    filterLeaveType === 'EMERGENCY' ? 'EMERGENCY_LEAVE' : filterLeaveType;
      match = match && normalizedReqType === normalizedFilterType;
    }

    // Client-side date filter chỉ áp dụng khi KHÔNG dùng server filter
    // (vì server filter đã lọc rồi)
    if (!useServerDateFilter) {
      if (filterDateRange.start) {
        match = match && new Date(req.startDate) >= new Date(filterDateRange.start);
      }

      if (filterDateRange.end) {
        match = match && new Date(req.endDate) <= new Date(filterDateRange.end);
      }
    }

    return match;
  });

  // Tính số lượng từ allRequests (không thay đổi khi chuyển tab)
  const statusCounts = {
    all: allRequests.length,
    pending: allRequests.filter(r => r.status === 'PENDING').length,
    approved: allRequests.filter(r => r.status === 'APPROVED').length,
    current: currentLeavesCount, // Sử dụng số lượng từ API
    upcoming: upcomingLeavesCount, // Sử dụng số lượng từ API
  };

  if (loading) {
    return (
      <div className="time-off-request-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="time-off-request-page">
      <div className="page-header">
        <div>
          <h1>Quản Lý Nghỉ Phép</h1>
          <p className="page-subtitle">Quản lý đơn xin nghỉ phép của nhân viên</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <FiPlus /> Tạo Đơn Mới
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="content-wrapper">
        <div className="main-content">
          <div className="status-tabs">
            {[
              { id: 'all', label: 'Tất Cả', count: statusCounts.all },
              { id: 'pending', label: 'Chờ Duyệt', count: statusCounts.pending },
              { id: 'approved', label: 'Đã Duyệt', count: statusCounts.approved },
              { id: 'current', label: 'Đang Nghỉ', count: statusCounts.current },
              { id: 'upcoming', label: 'Sắp Tới', count: statusCounts.upcoming },
            ].map(tab => (
              <button
                key={tab.id}
                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label} <span className="count">{tab.count}</span>
              </button>
            ))}
          </div>

          {/* FILTER SECTION - New design matching InventoryTransactionsPage */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '1.5rem',
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
              width: '200px',
              height: '200px',
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
              marginBottom: '1rem',
              position: 'relative',
              zIndex: 1
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  padding: '0.6rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FiFilter size={18} style={{ color: '#fff' }} />
                </div>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: '#fff'
                }}>
                  Bộ lọc đơn xin nghỉ
                </h3>
              </div>

              {/* Filter Status Badge */}
              {(filterLeaveType || useServerDateFilter) && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: '#28a745',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <FiCheckCircle size={14} />
                  <span>Đang lọc</span>
                </div>
              )}
            </div>

            {/* Filter Content Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              position: 'relative',
              zIndex: 1
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', alignItems: 'end' }}>
                {/* Leave Type Filter */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                    <FiLayers size={14} style={{ color: '#667eea' }} />
                    Loại nghỉ phép
                  </label>
                  <select
                    value={filterLeaveType}
                    onChange={(e) => setFilterLeaveType(e.target.value)}
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
                    <option value="">-- Tất cả loại nghỉ --</option>
                    <option value="ANNUAL_LEAVE">Nghỉ phép năm</option>
                    <option value="SICK_LEAVE">Nghỉ ốm</option>
                    <option value="PERSONAL_LEAVE">Nghỉ cá nhân</option>
                    <option value="MATERNITY_LEAVE">Nghỉ thai sản</option>
                    <option value="UNPAID_LEAVE">Nghỉ không lương</option>
                    <option value="EMERGENCY_LEAVE">Nghỉ khẩn cấp</option>
                    <option value="STUDY_LEAVE">Nghỉ học tập</option>
                  </select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                    <input
                      type="checkbox"
                      checked={useServerDateFilter}
                      onChange={(e) => setUseServerDateFilter(e.target.checked)}
                      style={{ marginRight: '0.25rem' }}
                    />
                    <FiCalendar size={14} style={{ color: '#667eea' }} />
                    Lọc theo thời gian
                  </label>
                  {useServerDateFilter ? (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="date"
                        value={filterDateRange.start}
                        onChange={(e) => setFilterDateRange({ ...filterDateRange, start: e.target.value })}
                        style={{
                          flex: 1,
                          padding: '0.75rem 0.5rem',
                          border: '2px solid #e2e8f0',
                          borderRadius: '10px',
                          fontSize: '0.9rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <span style={{ color: '#718096' }}>→</span>
                      <input
                        type="date"
                        value={filterDateRange.end}
                        onChange={(e) => setFilterDateRange({ ...filterDateRange, end: e.target.value })}
                        style={{
                          flex: 1,
                          padding: '0.75rem 0.5rem',
                          border: '2px solid #e2e8f0',
                          borderRadius: '10px',
                          fontSize: '0.9rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{
                      padding: '0.75rem 1rem',
                      border: '2px dashed #e2e8f0',
                      borderRadius: '10px',
                      color: '#a0aec0',
                      fontSize: '0.9rem',
                      textAlign: 'center'
                    }}>
                      Bật checkbox để lọc theo ngày
                    </div>
                  )}
                </div>

                {/* Reset Button */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: 'transparent' }}>
                    Actions
                  </label>
                  <button
                    onClick={() => {
                      setFilterLeaveType('');
                      setFilterDateRange({ start: '', end: '' });
                      setUseServerDateFilter(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1rem',
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
            </div>
          </div>

          {/* Section xem nhân viên đang nghỉ theo ngày */}
          <div className="employees-on-leave-section">
            <h3>Xem nhân viên đang nghỉ theo ngày</h3>
            <div className="date-picker-row">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  fetchEmployeesOnLeave(e.target.value);
                }}
                className="filter-date"
              />
              {loadingEmployees && <span className="loading-text">Đang tải...</span>}
            </div>
            {employeesOnLeave.length > 0 && (
              <div className="employees-list">
                <p className="employees-count">
                  Có <strong>{employeesOnLeave.length}</strong> nhân viên đang nghỉ vào ngày {selectedDate}
                </p>
                <div className="employee-ids">
                  {employeesOnLeave.map((employeeId, index) => {
                    const employee = employeeDetails[employeeId];
                    let displayName = `ID: ${employeeId}`;

                    if (employee) {
                      // Lấy tên từ person object hoặc trực tiếp từ employee
                      const firstName = employee.person?.firstName || employee.firstName || '';
                      const lastName = employee.person?.lastName || employee.lastName || '';

                      if (firstName || lastName) {
                        displayName = `${lastName} ${firstName}`.trim();
                      }
                    }

                    return (
                      <span key={index} className="employee-id-badge">
                        {displayName}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            {selectedDate && !loadingEmployees && employeesOnLeave.length === 0 && (
              <p className="no-employees">Không có nhân viên nào đang nghỉ vào ngày này</p>
            )}
          </div>

          {/* Section hiển thị số ngày nghỉ phép của nhân viên */}
          <div className="leave-balance-section">
            <h3>Thống kê số ngày nghỉ phép của nhân viên</h3>
            <div className="balance-controls">
              <input
                type="number"
                placeholder="Nhập ID nhân viên"
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="employee-id-input"
              />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="year-select"
              >
                {[2023, 2024, 2025, 2026, 2027].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <button
                className="btn-search-balance"
                onClick={handleFetchLeaveBalances}
                disabled={!selectedEmployeeId || loadingBalance}
              >
                {loadingBalance ? 'Đang tải...' : 'Xem thống kê'}
              </button>
            </div>

            {leaveBalance !== null && (
              <div className="balance-results">
                <div className="total-balance-card">
                  <div className="balance-header">
                    <h4>Tổng số ngày nghỉ phép năm {selectedYear}</h4>
                  </div>
                  <div className="balance-value">
                    <span className="balance-number">{leaveBalance}</span>
                    <span className="balance-unit">ngày</span>
                  </div>
                </div>

                <div className="balance-by-type">
                  <h4>Chi tiết theo loại nghỉ phép</h4>
                  <div className="balance-type-grid">
                    {[
                      { type: 'ANNUAL_LEAVE', label: 'Nghỉ phép năm', icon: '📅' },
                      { type: 'SICK_LEAVE', label: 'Nghỉ ốm', icon: '🤒' },
                      { type: 'MATERNITY', label: 'Nghỉ thai sản', icon: '🤱' },
                      { type: 'PATERNITY', label: 'Nghỉ chăm con', icon: '👨‍👧' },
                      { type: 'PERSONAL_LEAVE', label: 'Nghỉ cá nhân', icon: '🏠' },
                      { type: 'STUDY_LEAVE', label: 'Nghỉ học tập', icon: '📚' },
                      { type: 'EMERGENCY', label: 'Nghỉ khẩn cấp', icon: '🚨' },
                      { type: 'BEREAVEMENT', label: 'Nghỉ tang', icon: '🕊️' },
                    ].map(({ type, label, icon }) => (
                      <div key={type} className="balance-type-card">
                        <div className="type-icon">{icon}</div>
                        <div className="type-info">
                          <div className="type-label">{label}</div>
                          <div className="type-value">
                            {leaveBalanceByType[type] !== null && leaveBalanceByType[type] !== undefined
                              ? `${leaveBalanceByType[type]} ngày`
                              : 'Đang tải...'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="requests-list">
            {filteredRequests.length > 0 ? (
              filteredRequests.map(request => (
                <TimeOffRequestCard
                  key={request.requestId || request.id}
                  request={request}
                  onView={() => {
                    setSelectedRequest(request);
                    setShowDetailModal(true);
                  }}
                  onEdit={() => {
                    setSelectedRequest(request);
                    setShowEditModal(true);
                  }}
                  onDelete={handleDelete}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onWithdraw={handleWithdraw}
                  userRole={userRole}
                  showActions={true}
                />
              ))
            ) : (
              <div className="no-data">
                <p>Không có đơn nghỉ phép nào</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddTimeOffRequestModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchAllRequests}
        employeeId={employeeId}
      />

      <EditTimeOffRequestModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={fetchAllRequests}
        requestData={selectedRequest}
      />

      <TimeOffRequestDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        requestData={selectedRequest}
      />
    </div>
  );
};

export default TimeOffRequestPage;

