import React from 'react';
import { FiX } from 'react-icons/fi';
import './TimeOffRequestDetailModal.css';

const TimeOffRequestDetailModal = ({ isOpen, onClose, requestData }) => {
  if (!isOpen || !requestData) return null;

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: 'Chờ duyệt', color: '#ff9800' },
      APPROVED: { label: 'Đã duyệt', color: '#4caf50' },
      REJECTED: { label: 'Từ chối', color: '#f44336' },
      WITHDRAWN: { label: 'Đã rút lại', color: '#9e9e9e' },
      CANCELLED: { label: 'Đã hủy', color: '#9e9e9e' },
    };
    return statusMap[status] || { label: status, color: '#666' };
  };

  const getLeaveTypeLabel = (type) => {
    const typeMap = {
      ANNUAL_LEAVE: 'Nghỉ phép năm',
      SICK_LEAVE: 'Nghỉ ốm',
      PERSONAL_LEAVE: 'Nghỉ cá nhân',
      MATERNITY_LEAVE: 'Nghỉ thai sản',
      UNPAID_LEAVE: 'Nghỉ không lương',
      EMERGENCY_LEAVE: 'Nghỉ khẩn cấp',
    };
    return typeMap[type] || type;
  };

  const status = getStatusBadge(requestData.status);

  return (
    <div className="modalOverlay">
      <div className="modal">
        <div className="modalHeader">
          <h2>Chi Tiết Đơn Nghỉ Phép</h2>
          <button className="closeBtn" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <div className="modalContent">
          <div className="statusSection">
            <span
              className="statusBadge"
              style={{ backgroundColor: status.color }}
            >
              {status.label}
            </span>
          </div>

          <div className="infoGrid">
            <div className="infoItem">
              <label>Loại Nghỉ Phép</label>
              <p>{getLeaveTypeLabel(requestData.leaveType)}</p>
            </div>

            <div className="infoItem">
              <label>Tổng Số Ngày</label>
              <p>{requestData.totalDays?.toFixed(1)} ngày</p>
            </div>

            <div className="infoItem">
              <label>Ngày Bắt Đầu</label>
              <p>{new Date(requestData.startDate).toLocaleDateString('vi-VN')}</p>
            </div>

            <div className="infoItem">
              <label>Ngày Kết Thúc</label>
              <p>{new Date(requestData.endDate).toLocaleDateString('vi-VN')}</p>
            </div>

            <div className="infoItem">
              <label>Giờ Bắt Đầu</label>
              <p>{requestData.startTime?.substring(0, 5) || 'N/A'}</p>
            </div>

            <div className="infoItem">
              <label>Giờ Kết Thúc</label>
              <p>{requestData.endTime?.substring(0, 5) || 'N/A'}</p>
            </div>

            <div className="infoItem">
              <label>Nửa Ngày</label>
              <p>{requestData.isHalfDay ? 'Có' : 'Không'}</p>
            </div>

            <div className="infoItem">
              <label>Có Lương</label>
              <p>{requestData.isPaid ? 'Có' : 'Không'}</p>
            </div>
          </div>

          <div className="fullWidthItem">
            <label>Lý Do</label>
            <p className="reason">{requestData.reason}</p>
          </div>

          <div className="contactGrid">
            <div className="infoItem">
              <label>Số Điện Thoại Liên Hệ</label>
              <p>{requestData.contactDuringLeave}</p>
            </div>

            <div className="infoItem">
              <label>Số Điện Thoại Khẩn Cấp</label>
              <p>{requestData.emergencyContact || 'N/A'}</p>
            </div>
          </div>

          {requestData.approvalNote && (
            <div className="fullWidthItem">
              <label>Ghi Chú Phê Duyệt</label>
              <p className="note">{requestData.approvalNote}</p>
            </div>
          )}

          {requestData.rejectionReason && (
            <div className="fullWidthItem">
              <label>Lý Do Từ Chối</label>
              <p className="rejectionNote">{requestData.rejectionReason}</p>
            </div>
          )}

          {requestData.approvedBy && (
            <div className="infoItem">
              <label>Người Phê Duyệt</label>
              <p>{requestData.approvedBy}</p>
            </div>
          )}

          {requestData.approvedDate && (
            <div className="infoItem">
              <label>Ngày Phê Duyệt</label>
              <p>{new Date(requestData.approvedDate).toLocaleDateString('vi-VN')}</p>
            </div>
          )}

          {requestData.createdDate && (
            <div className="infoItem">
              <label>Ngày Tạo</label>
              <p>{new Date(requestData.createdDate).toLocaleDateString('vi-VN')}</p>
            </div>
          )}
        </div>

        <div className="modalFooter">
          <button className="closeActionBtn" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeOffRequestDetailModal;

