import React, { useState, useEffect } from 'react';
import './TimeOffRequestPage.css';
import { hrTimeOffAPI } from '../../../../services/staff/hrAPI';
import { FiPlus, FiFilter, FiSearch } from 'react-icons/fi';
import AddTimeOffRequestModal from '../../components/AddTimeOffRequestModal';
import EditTimeOffRequestModal from '../../components/EditTimeOffRequestModal';
import TimeOffRequestDetailModal from '../../components/TimeOffRequestDetailModal';
import TimeOffRequestCard from '../../components/TimeOffRequestCard';
import LeaveBalanceWidget from '../../components/LeaveBalanceWidget';

const TimeOffRequestPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLeaveType, setFilterLeaveType] = useState('');
  const [filterDateRange, setFilterDateRange] = useState({ start: '', end: '' });

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

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      let response;

      switch (activeTab) {
        case 'pending':
          response = await hrTimeOffAPI.getPendingRequests();
          break;
        case 'approved':
          response = await hrTimeOffAPI.getApprovedRequests();
          break;
        case 'current':
          response = await hrTimeOffAPI.getCurrentLeaves();
          break;
        case 'upcoming':
          response = await hrTimeOffAPI.getUpcomingLeaves();
          break;
        default:
          response = await hrTimeOffAPI.getTimeOffRequests();
      }

      if (response.success) {
        setRequests(response.data || []);
      } else {
        setError(response.error || 'Lỗi khi tải dữ liệu');
      }
    } catch (err) {
      setError('Lỗi khi tải dữ liệu: ' + err.message);
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request) => {
    const note = prompt('Nhập ghi chú phê duyệt (tùy chọn):');
    if (note !== null) {
      try {
        const response = await hrTimeOffAPI.approveTimeOffRequest(request.id, note);
        if (response.success) {
          alert('Phê duyệt thành công');
          fetchRequests();
        } else {
          alert('Lỗi: ' + response.error);
        }
      } catch (err) {
        alert('Lỗi khi phê duyệt: ' + err.message);
      }
    }
  };

  const handleReject = async (request) => {
    const reason = prompt('Nhập lý do từ chối:');
    if (reason) {
      try {
        const response = await hrTimeOffAPI.rejectTimeOffRequest(request.id, reason);
        if (response.success) {
          alert('Từ chối thành công');
          fetchRequests();
        } else {
          alert('Lỗi: ' + response.error);
        }
      } catch (err) {
        alert('Lỗi khi từ chối: ' + err.message);
      }
    }
  };

  const handleWithdraw = async (requestId) => {
    if (window.confirm('Bạn có chắc chắn muốn rút lại đơn này?')) {
      try {
        const response = await hrTimeOffAPI.withdrawTimeOffRequest(requestId);
        if (response.success) {
          alert('Rút lại thành công');
          fetchRequests();
        } else {
          alert('Lỗi: ' + response.error);
        }
      } catch (err) {
        alert('Lỗi khi rút lại: ' + err.message);
      }
    }
  };

  const handleDelete = async (requestId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn này?')) {
      try {
        const response = await hrTimeOffAPI.deleteTimeOffRequest(requestId);
        if (response.success) {
          alert('Xóa thành công');
          fetchRequests();
        } else {
          alert('Lỗi: ' + response.error);
        }
      } catch (err) {
        alert('Lỗi khi xóa: ' + err.message);
      }
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(req => {
    let match = true;

    if (searchTerm) {
      match = match && (
        req.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.employeeName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterLeaveType) {
      match = match && req.leaveType === filterLeaveType;
    }

    if (filterDateRange.start) {
      match = match && new Date(req.startDate) >= new Date(filterDateRange.start);
    }

    if (filterDateRange.end) {
      match = match && new Date(req.endDate) <= new Date(filterDateRange.end);
    }

    return match;
  });

  const statusCounts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'PENDING').length,
    approved: requests.filter(r => r.status === 'APPROVED').length,
    current: requests.filter(r => r.status === 'APPROVED' && new Date(r.startDate) <= new Date() && new Date(r.endDate) >= new Date()).length,
    upcoming: requests.filter(r => r.status === 'APPROVED' && new Date(r.startDate) > new Date()).length,
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

          <div className="filter-section">
            <div className="search-box">
              <FiSearch />
              <input
                type="text"
                placeholder="Tìm kiếm theo lý do hoặc tên nhân viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-controls">
              <select
                value={filterLeaveType}
                onChange={(e) => setFilterLeaveType(e.target.value)}
                className="filter-select"
              >
                <option value="">Tất cả loại nghỉ</option>
                <option value="ANNUAL_LEAVE">Nghỉ phép năm</option>
                <option value="SICK_LEAVE">Nghỉ ốm</option>
                <option value="PERSONAL_LEAVE">Nghỉ cá nhân</option>
                <option value="MATERNITY_LEAVE">Nghỉ thai sản</option>
                <option value="UNPAID_LEAVE">Nghỉ không lương</option>
                <option value="EMERGENCY_LEAVE">Nghỉ khẩn cấp</option>
              </select>

              <input
                type="date"
                value={filterDateRange.start}
                onChange={(e) => setFilterDateRange({ ...filterDateRange, start: e.target.value })}
                className="filter-date"
                placeholder="Từ ngày"
              />

              <input
                type="date"
                value={filterDateRange.end}
                onChange={(e) => setFilterDateRange({ ...filterDateRange, end: e.target.value })}
                className="filter-date"
                placeholder="Đến ngày"
              />

              <button
                className="btn-reset"
                onClick={() => {
                  setSearchTerm('');
                  setFilterLeaveType('');
                  setFilterDateRange({ start: '', end: '' });
                }}
              >
                Xóa Bộ Lọc
              </button>
            </div>
          </div>

          <div className="requests-list">
            {filteredRequests.length > 0 ? (
              filteredRequests.map(request => (
                <TimeOffRequestCard
                  key={request.id}
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

        <div className="sidebar">
          <LeaveBalanceWidget employeeId={employeeId} year={new Date().getFullYear()} />
        </div>
      </div>

      {/* Modals */}
      <AddTimeOffRequestModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchRequests}
        employeeId={employeeId}
      />

      <EditTimeOffRequestModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={fetchRequests}
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

