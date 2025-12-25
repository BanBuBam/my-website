import React, { useState, useEffect } from 'react';
import './ViewRoleDetailModal.css';
import { FiX, FiShield, FiUsers, FiClock, FiKey } from 'react-icons/fi';
import { adminRoleAPI } from '../../../services/staff/adminAPI';

const ViewRoleDetailModal = ({ isOpen, onClose, roleId }) => {
  const [roleDetail, setRoleDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && roleId) {
      fetchRoleDetail();
    }
  }, [isOpen, roleId]);

  const fetchRoleDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminRoleAPI.getRoleById(roleId);
      
      if (response && response.data) {
        setRoleDetail(response.data);
      }
    } catch (err) {
      console.error('Error fetching role detail:', err);
      setError(err.message || 'Không thể tải thông tin role');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    const date = new Date(dateTimeString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-minute'
    });
  };

  const getRoleDisplayName = (roleName) => {
    const roleMap = {
      'ROLE_ADMIN': 'Quản trị viên',
      'ROLE_DOCTOR': 'Bác sĩ',
      'ROLE_NURSE': 'Điều dưỡng',
      'ROLE_RECEPTIONIST': 'Lễ tân',
      'ROLE_PHARMACIST': 'Dược sĩ',
      'ROLE_ACCOUNTANT': 'Kế toán',
      'ROLE_LAB_TECHNICIAN': 'Kỹ thuật viên',
      'ROLE_HR': 'Nhân sự',
    };
    return roleMap[roleName] || roleName;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content view-role-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2><FiShield /> Chi tiết Role</h2>
          <button className="btn-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Đang tải thông tin role...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && roleDetail && (
            <div className="role-detail-content">
              {/* Role Info */}
              <div className="detail-section">
                <h3>Thông tin Role</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>ID:</label>
                    <span>{roleDetail.roleId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Tên Role:</label>
                    <span className="role-name-badge">
                      {getRoleDisplayName(roleDetail.roleName)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Mã Role:</label>
                    <span className="role-code">{roleDetail.roleName}</span>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="detail-section">
                <h3><FiKey /> Danh sách Quyền ({roleDetail.permissions?.length || 0})</h3>
                {roleDetail.permissions && roleDetail.permissions.length > 0 ? (
                  <div className="permissions-list">
                    {roleDetail.permissions.map((permission) => (
                      <div key={permission.permissionId} className="permission-card">
                        <div className="permission-info">
                          <span className="permission-id">#{permission.permissionId}</span>
                          <span className="permission-name">{permission.permissionName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">Không có quyền nào</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewRoleDetailModal;

