import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientAuthAPI } from '../../services/api';
import './UserInfo.css';

const UserInfo = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    // Kiểm tra xem user đã đăng nhập chưa
    const token = localStorage.getItem('accessToken');
    const userInfo = localStorage.getItem('userInfo');

    if (token && userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing user info:', error);
        // Xóa dữ liệu lỗi
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userInfo');
      }
    }
  }, []);

  // Đóng modal khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModal]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Gọi API đăng xuất
      await patientAuthAPI.logout();

      // Xóa thông tin đăng nhập
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
      setUser(null);
      setIsLoggedIn(false);
      setShowModal(false);

      // Trigger event để cập nhật Header
      window.dispatchEvent(new Event('loginStatusChanged'));

      // Redirect về trang đăng nhập
      navigate('/login');
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
      // Vẫn xóa token và redirect dù API lỗi
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
      setUser(null);
      setIsLoggedIn(false);
      setShowModal(false);

      // Trigger event để cập nhật Header
      window.dispatchEvent(new Event('loginStatusChanged'));

      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handleProfileClick = () => {
    setShowModal(false);
    navigate('/cap-nhat-thong-tin');
  };

  // Lấy chữ cái đầu của tên để làm avatar
  const getInitials = () => {
    const name = user?.fullName || user?.username || user?.email || 'U';
    return name.charAt(0).toUpperCase();
  };

  if (!isLoggedIn) {
    return (
      <div className="user-info">
        <button onClick={handleLogin} className="login-btn">
          Đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div className="user-info" ref={modalRef}>
      <div className="user-avatar-wrapper" onClick={toggleModal}>
        <div className="user-avatar">
          {getInitials()}
        </div>
      </div>

      {showModal && (
        <div className="user-modal">
          <div className="user-modal-header">
            <div className="user-avatar-large">
              {getInitials()}
            </div>
            <div className="user-modal-info">
              <h3>{user?.fullName || user?.username || 'User'}</h3>
              <p>{user?.email || ''}</p>
            </div>
          </div>
          <div className="user-modal-menu">
            <button onClick={handleProfileClick} className="modal-menu-item">
              Thông tin cá nhân
            </button>
            <button
              onClick={handleLogout}
              className="modal-menu-item logout-item"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfo;
