// src/pages/login/LoginPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientAuthAPI } from '../../services/api';
import './LoginPage.css'; // Import file CSS

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
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
    if (!formData.email || !formData.password) {
      setError('Vui lòng nhập đầy đủ email và password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Gọi API đăng nhập
      const response = await patientAuthAPI.login(formData.email, formData.password);

      // Xử lý khi đăng nhập thành công
      console.log('Đăng nhập thành công:', response);

      // Token đã được lưu tự động trong patientAuthAPI.login
      // Lưu thêm thông tin user nếu cần
      if (response.data) {
        localStorage.setItem('userInfo', JSON.stringify(response.data));
      }

      // Trigger event để cập nhật Header
      window.dispatchEvent(new Event('loginStatusChanged'));

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
            <label htmlFor="email">Enter your Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={formData.email}
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

          <div className="form-footer">
            <a href="/forgot-password" className="forgot-link">Quên mật khẩu?</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;