import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserInfo.css';

const UserInfo = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Kiểm tra xem user đã đăng nhập chưa
    const token = localStorage.getItem('authToken');
    const userInfo = localStorage.getItem('userInfo');
    
    if (token && userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing user info:', error);
        // Xóa dữ liệu lỗi
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
      }
    }
  }, []);

  const handleLogout = () => {
    // Xóa thông tin đăng nhập
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    setUser(null);
    setIsLoggedIn(false);
    
    // Redirect về trang đăng nhập
    navigate('/login');
  };

  const handleLogin = () => {
    navigate('/login');
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
    <div className="user-info">
      <div className="user-details">
        <span className="user-name">
          Xin chào, {user?.fullName || user?.username || 'User'}
        </span>
        <button onClick={handleLogout} className="logout-btn">
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default UserInfo;
