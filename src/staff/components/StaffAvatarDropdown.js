import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { staffAuthAPI, staffEmployeeAPI } from '../../services/api';
import './StaffAvatarDropdown.css';

const StaffAvatarDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load user info from localStorage
    const storedUserInfo = localStorage.getItem('staffUserInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleViewProfile = async () => {
    setIsOpen(false);
    setShowProfileModal(true);
    setLoadingProfile(true);

    try {
      const employeeAccountId = localStorage.getItem('staffUserInfo');
      const parsedInfo = JSON.parse(employeeAccountId);
      const accountId = parsedInfo.employeeAccountId || parsedInfo.id;

      // Get employeeAccountId from login response
      const storedData = localStorage.getItem('staffUserInfo');
      const userData = JSON.parse(storedData);
      
      // The employeeAccountId should be stored separately during login
      const empAccountId = localStorage.getItem('employeeAccountId');
      
      if (empAccountId) {
        const response = await staffEmployeeAPI.getEmployeeAccount(empAccountId);
        if (response && response.data) {
          setProfileData(response.data);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      alert('Không thể tải thông tin cá nhân');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      return;
    }

    try {
      await staffAuthAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all staff data from localStorage
      localStorage.removeItem('staffAccessToken');
      localStorage.removeItem('staffRefreshToken');
      localStorage.removeItem('staffUserInfo');
      localStorage.removeItem('employeeAccountId');
      
      // Redirect to login
      navigate('/staff/login');
    }
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setProfileData(null);
  };

  if (!userInfo) {
    return null;
  }

  return (
    <>
      <div className="staff-avatar-dropdown" ref={dropdownRef}>
        <div className="avatar-trigger" onClick={() => setIsOpen(!isOpen)}>
          <div className="avatar-circle">
            {userInfo.fullName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-info-text">
            <span className="user-name">{userInfo.fullName}</span>
            <span className="user-role">{userInfo.roles?.[0] || 'Staff'}</span>
          </div>
          <FiChevronDown className={`dropdown-icon ${isOpen ? 'open' : ''}`} />
        </div>

        {isOpen && (
          <div className="dropdown-menu">
            <button className="dropdown-item" onClick={handleViewProfile}>
              <FiUser />
              <span>Thông tin cá nhân</span>
            </button>
            <div className="dropdown-divider"></div>
            <button className="dropdown-item logout" onClick={handleLogout}>
              <FiLogOut />
              <span>Đăng xuất</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={closeProfileModal}>
          <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thông tin cá nhân</h2>
              <button className="close-btn" onClick={closeProfileModal}>×</button>
            </div>

            {loadingProfile ? (
              <div className="modal-loading">Đang tải thông tin...</div>
            ) : profileData ? (
              <div className="modal-body">
                <div className="profile-section">
                  <div className="profile-avatar-large">
                    {profileData.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <h3>{profileData.fullName}</h3>
                  <p className="profile-role">{profileData.roles?.join(', ')}</p>
                </div>

                <div className="profile-info-grid">
                  <div className="info-item">
                    <span className="label">Mã nhân viên:</span>
                    <span className="value">{profileData.employeeCode}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Tên đăng nhập:</span>
                    <span className="value">{profileData.username}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Khoa:</span>
                    <span className="value">{profileData.department || 'N/A'}</span>
                  </div>
                  {profileData.specialization && (
                    <div className="info-item">
                      <span className="label">Chuyên khoa:</span>
                      <span className="value">{profileData.specialization}</span>
                    </div>
                  )}
                  <div className="info-item">
                    <span className="label">Trạng thái:</span>
                    <span className="value">
                      {profileData.isActive ? (
                        <span className="status-badge active">Hoạt động</span>
                      ) : (
                        <span className="status-badge inactive">Không hoạt động</span>
                      )}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Tài khoản:</span>
                    <span className="value">
                      {profileData.locked ? (
                        <span className="status-badge locked">Đã khóa</span>
                      ) : (
                        <span className="status-badge unlocked">Bình thường</span>
                      )}
                    </span>
                  </div>
                  {profileData.lastLogin && (
                    <div className="info-item full-width">
                      <span className="label">Đăng nhập lần cuối:</span>
                      <span className="value">
                        {new Date(profileData.lastLogin).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>

                {profileData.permissions && profileData.permissions.length > 0 && (
                  <div className="permissions-section">
                    <h4>Quyền hạn ({profileData.permissions.length})</h4>
                    <div className="permissions-grid">
                      {profileData.permissions.slice(0, 20).map((permission, index) => (
                        <span key={index} className="permission-badge">
                          {permission}
                        </span>
                      ))}
                      {profileData.permissions.length > 20 && (
                        <span className="permission-badge more">
                          +{profileData.permissions.length - 20} quyền khác
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="modal-body">
                <p>Không thể tải thông tin cá nhân</p>
              </div>
            )}

            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeProfileModal}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StaffAvatarDropdown;

