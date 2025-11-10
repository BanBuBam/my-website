import React from 'react';
import { FiEye, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import './TimeOffRequestCard.css';

const TimeOffRequestCard = ({
  request,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onWithdraw,
  showActions = true,
  userRole = 'employee',
}) => {
  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: 'Chờ duyệt', color: '#ff9800', bgColor: '#fff3e0' },
      APPROVED: { label: 'Đã duyệt', color: '#4caf50', bgColor: '#e8f5e9' },
      REJECTED: { label: 'Từ chối', color: '#f44336', bgColor: '#ffebee' },
      WITHDRAWN: { label: 'Đã rút lại', color: '#9e9e9e', bgColor: '#f5f5f5' },
      CANCELLED: { label: 'Đã hủy', color: '#9e9e9e', bgColor: '#f5f5f5' },
    };
    return statusMap[status] || { label: status, color: '#666', bgColor: '#f5f5f5' };
  };

  const getLeaveTypeLabel = (type) => {
    const typeMap = {
      ANNUAL_LEAVE: 'Nghỉ phép năm',
      SICK_LEAVE: 'Nghỉ ốm',
      PERSONAL_LEAVE: 'Nghỉ cá nhân',
      MATERNITY_LEAVE: 'Nghỉ thai sản',
      MATERNITY: 'Nghỉ thai sản',
      UNPAID_LEAVE: 'Nghỉ không lương',
      EMERGENCY_LEAVE: 'Nghỉ khẩn cấp',
      EMERGENCY: 'Nghỉ khẩn cấp',
      STUDY_LEAVE: 'Nghỉ học tập',
    };
    return typeMap[type] || type;
  };

  const status = getStatusBadge(request.status);
  const isPending = request.status === 'PENDING';
  const isApproved = request.status === 'APPROVED';

  // Support both requestType and leaveType
  const leaveType = request.requestType || request.leaveType;

  return (
    <div className="card">
      <div className="cardHeader">
        <div className="headerLeft">
          <h3 className="title">{getLeaveTypeLabel(leaveType)}</h3>
          <span
            className="statusBadge"
            style={{ color: status.color, backgroundColor: status.bgColor }}
          >
            {status.label}
          </span>
        </div>
        <div className="headerRight">
          <span className="days">{request.totalDays?.toFixed(1)} ngày</span>
        </div>
      </div>

      <div className="cardBody">
        <div className="infoRow">
          <span className="label">Từ ngày:</span>
          <span className="value">
            {new Date(request.startDate).toLocaleDateString('vi-VN')}
          </span>
        </div>

        <div className="infoRow">
          <span className="label">Đến ngày:</span>
          <span className="value">
            {new Date(request.endDate).toLocaleDateString('vi-VN')}
          </span>
        </div>

        <div className="infoRow">
          <span className="label">Lý do:</span>
          <span className="value">{request.reason}</span>
        </div>

        {request.isHalfDay && (
          <div className="infoRow">
            <span className="label">Loại:</span>
            <span className="value">Nửa ngày</span>
          </div>
        )}

        {(request.isPaidLeave === false || request.isPaid === false) && (
          <div className="infoRow">
            <span className="label">Lương:</span>
            <span className="value">Không lương</span>
          </div>
        )}

        {request.employeeName && (
          <div className="infoRow">
            <span className="label">Nhân viên:</span>
            <span className="value">{request.employeeName}</span>
          </div>
        )}
      </div>

      {showActions && (
        <div className="cardFooter">
          <div className="actionButtons">
            <button
              className="viewBtn"
              onClick={() => onView?.(request)}
              title="Xem chi tiết"
            >
              <FiEye size={16} />
            </button>

            {isPending && userRole === 'employee' && (
              <>
                <button
                  className="editBtn"
                  onClick={() => onEdit?.(request)}
                  title="Chỉnh sửa"
                >
                  <FiEdit2 size={16} />
                </button>
                <button
                  className="deleteBtn"
                  onClick={() => onDelete?.(request.requestId || request.id)}
                  title="Xóa"
                >
                  <FiTrash2 size={16} />
                </button>
              </>
            )}

            {isPending && userRole === 'hr' && (
              <>
                <button
                  className="approveBtn"
                  onClick={() => onApprove?.(request)}
                  title="Phê duyệt"
                >
                  <FiCheck size={16} />
                </button>
                <button
                  className="rejectBtn"
                  onClick={() => onReject?.(request)}
                  title="Từ chối"
                >
                  <FiX size={16} />
                </button>
              </>
            )}

            {isApproved && userRole === 'employee' && (
              <button
                className="withdrawBtn"
                onClick={() => onWithdraw?.(request.requestId || request.id)}
                title="Rút lại"
              >
                Rút lại
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeOffRequestCard;

