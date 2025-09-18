// src/components/LoginForm.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './LoginPage.css'; // Import file CSS

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Hàm xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    // Xóa error khi user bắt đầu nhập lại
    if (error) setError('');
  };

  // Hàm xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation cơ bản
    if (!formData.username || !formData.password) {
      setError('Vui lòng nhập đầy đủ username và password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Gọi API đăng nhập
      const response = await authAPI.login(formData.username, formData.password);

      // Xử lý khi đăng nhập thành công
      console.log('Đăng nhập thành công:', response);

      // Lưu token vào localStorage (nếu API trả về token)
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }

      // Lưu thông tin user (nếu có)
      if (response.user) {
        localStorage.setItem('userInfo', JSON.stringify(response.user));
      }

      alert('Đăng nhập thành công!');

      // Redirect về trang chủ sau khi đăng nhập thành công
      navigate('/');

    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      setError(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Sign In</h2>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Enter your Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Enter your Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;