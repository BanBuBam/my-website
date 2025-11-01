import React, { useState, useEffect } from 'react';
import './TimeOffRequestPage.css';
import { hrTimeOffAPI } from '../../../../services/staff/hrAPI';
import { FiCheck, FiX, FiEye, FiFilter } from 'react-icons/fi';

const TimeOffRequestPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await hrTimeOffAPI.getTimeOffRequests();
      if (response.success) {
        setRequests(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching time off requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn phê duyệt đơn nghỉ phép này?')) {
      try {
        await hrTimeOffAPI.approveTimeOffRequest(id);
        fetchRequests();
      } catch (err) {
        alert('Lỗi khi phê duyệt: ' + err.message);
      }
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Nhập lý do từ chối:');
    if (reason) {
      try {
        await hrTimeOffAPI.rejectTimeOffRequest(id, reason);
        fetchRequests();
      } catch (err) {
        alert('Lỗi khi từ chối: ' + err.message);
      }
    }
  };

  const filteredRequests = requests.filter(req =>
    !filterStatus || req.status === filterStatus
  );

  const statusCounts = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
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
          <h1>Nghỉ phép</h1>
          <p className="page-subtitle">Quản lý đơn xin nghỉ phép của nhân viên</p>
        </div>
      </div>

      <div className="status-summary">
        <div className="summary-card pending">
          <h3>{statusCounts.pending}</h3>
          <p>Chờ duyệt</p>
        </div>
        <div className="summary-card approved">
          <h3>{statusCounts.approved}</h3>
          <p>Đã duyệt</p>
        </div>
        <div className="summary-card rejected">
          <h3>{statusCounts.rejected}</h3>
          <p>Từ chối</p>
        </div>
      </div>

      <div className="filter-section">
        <FiFilter />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="rejected">Từ chối</option>
        </select>
      </div>

      <div className="table-container">
        <table className="request-table">
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Phòng ban</th>
              <th>Loại nghỉ phép</th>
              <th>Từ ngày</th>
              <th>Đến ngày</th>
              <th>Số ngày</th>
              <th>Lý do</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.employeeName || 'N/A'}</td>
                  <td>{request.department || 'N/A'}</td>
                  <td>{request.leaveType || 'N/A'}</td>
                  <td>
                    {request.startDate
                      ? new Date(request.startDate).toLocaleDateString('vi-VN')
                      : 'N/A'}
                  </td>
                  <td>
                    {request.endDate
                      ? new Date(request.endDate).toLocaleDateString('vi-VN')
                      : 'N/A'}
                  </td>
                  <td>{request.days || 0} ngày</td>
                  <td>
                    <div className="reason-cell" title={request.reason}>
                      {request.reason || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${request.status}`}>
                      {request.status === 'pending' && 'Chờ duyệt'}
                      {request.status === 'approved' && 'Đã duyệt'}
                      {request.status === 'rejected' && 'Từ chối'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {request.status === 'pending' && (
                        <>
                          <button
                            className="btn-icon btn-approve"
                            onClick={() => handleApprove(request.id)}
                            title="Phê duyệt"
                          >
                            <FiCheck />
                          </button>
                          <button
                            className="btn-icon btn-reject"
                            onClick={() => handleReject(request.id)}
                            title="Từ chối"
                          >
                            <FiX />
                          </button>
                        </>
                      )}
                      <button className="btn-icon btn-view" title="Xem chi tiết">
                        <FiEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-data">
                  Không có đơn nghỉ phép nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimeOffRequestPage;

