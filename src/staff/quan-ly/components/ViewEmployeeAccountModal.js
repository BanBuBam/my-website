import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiShield, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import './ViewEmployeeAccountModal.css';
import { adminAccountAPI } from '../../../services/staff/adminAPI';

const ViewEmployeeAccountModal = ({ account, isOpen, onClose }) => {
  const [accountDetails, setAccountDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (account && isOpen) {
      fetchAccountDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, isOpen]);

  const fetchAccountDetails = async () => {
    try {
      setLoading(true);

      // Fetch account details
      const detailsResponse = await adminAccountAPI.getAccountById(account.id);
      if (detailsResponse && detailsResponse.data) {
        setAccountDetails(detailsResponse.data);
      }

      // Fetch roles (optional - already in account details)
      // const rolesResponse = await adminAccountAPI.getAccountRoles(account.id);
      // if (rolesResponse && rolesResponse.data) {
      //   setRoles(rolesResponse.data);
      // }
    } catch (error) {
      console.error('Error fetching account details:', error);
      // Use account data from props if API fails
      setAccountDetails(account);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAccountDetails(null);
    onClose();
  };

  if (!isOpen || !account) return null;

  const displayAccount = accountDetails || account;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content view-account-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            <div className="header-icon">
              <FiUser />
            </div>
            <div>
              <h2>{displayAccount.fullName || 'N/A'}</h2>
              <p className="employee-code">{displayAccount.employeeCode || 'N/A'}</p>
            </div>
          </div>
          <button className="close-button" onClick={handleClose}>
            <FiX />
          </button>
        </div>

        {loading ? (
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Đang tải thông tin...</p>
          </div>
        ) : (
          <div className="modal-body">
            {/* Account Status */}
            <div className="status-section">
              <div className={`status-card ${displayAccount.isActive && !displayAccount.locked ? 'active' : 'inactive'}`}>
                {displayAccount.isActive && !displayAccount.locked ? (
                  <>
                    <FiCheckCircle />
                    <span>Tài khoản đang hoạt động</span>
                  </>
                ) : displayAccount.locked ? (
                  <>
                    <FiXCircle />
                    <span>Tài khoản bị khóa</span>
                  </>
                ) : (
                  <>
                    <FiXCircle />
                    <span>Tài khoản bị vô hiệu hóa</span>
                  </>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="info-section">
              <h3>
                <FiUser />
                Thông tin cơ bản
              </h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Username:</label>
                  <span>{displayAccount.username || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Phòng ban:</label>
                  <span>{displayAccount.department || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Chuyên môn:</label>
                  <span>{displayAccount.specialization || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Đăng nhập cuối:</label>
                  <span>
                    {displayAccount.lastLogin 
                      ? new Date(displayAccount.lastLogin).toLocaleString('vi-VN')
                      : 'Chưa đăng nhập'}
                  </span>
                </div>
              </div>
            </div>

            {/* Roles & Permissions */}
            <div className="info-section">
              <h3>
                <FiShield />
                Vai trò & Quyền hạn
              </h3>
              
              <div className="roles-container">
                <label>Vai trò:</label>
                <div className="roles-list">
                  {(displayAccount.roles && displayAccount.roles.length > 0) ? (
                    displayAccount.roles.map((role, idx) => (
                      <span key={idx} className="role-badge">{role}</span>
                    ))
                  ) : (
                    <span className="no-data">Chưa có vai trò</span>
                  )}
                </div>
              </div>

              <div className="permissions-container">
                <label>Quyền hạn ({displayAccount.permissions?.length || 0}):</label>
                {displayAccount.permissions && displayAccount.permissions.length > 0 ? (
                  <div className="permissions-list">
                    {displayAccount.permissions.map((permission, idx) => (
                      <div key={idx} className="permission-item">
                        <FiCheckCircle />
                        <span>{permission}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">Chưa có quyền hạn cụ thể</p>
                )}
              </div>
            </div>

            {/* Account History */}
            <div className="info-section">
              <h3>
                <FiClock />
                Lịch sử tài khoản
              </h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Ngày tạo:</label>
                  <span>
                    {displayAccount.createdAt 
                      ? new Date(displayAccount.createdAt).toLocaleString('vi-VN')
                      : 'N/A'}
                  </span>
                </div>
                <div className="info-item">
                  <label>Cập nhật lần cuối:</label>
                  <span>
                    {displayAccount.updatedAt 
                      ? new Date(displayAccount.updatedAt).toLocaleString('vi-VN')
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn-close" onClick={handleClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployeeAccountModal;

