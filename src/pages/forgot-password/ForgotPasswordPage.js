import React, { useState } from 'react';
import { patientAuthAPI } from '../../services/api';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [email, setEmail] = useState('');

  // Hàm xử lý thay đổi input
  const handleChange = (e) => {
    setEmail(e.target.value);
    // Xóa error khi user bắt đầu nhập lại
    if (error) setError('');
    if (success) setSuccess(false);
  };

  // Hàm xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Gọi API forgot password
      const response = await patientAuthAPI.forgotPassword({ email });

      console.log('Gửi yêu cầu thành công:', response);

      setSuccess(true);
      setSuccessMessage(response.message || 'Đã gửi link đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư.');

    } catch (error) {
      console.error('Lỗi gửi yêu cầu:', error);
      setError(error.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-form">
        <h2>Quên mật khẩu</h2>
        <p className="form-description">
          Nhập email của bạn để nhận link đặt lại mật khẩu
        </p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={handleChange}
              disabled={loading || success}
              required
            />
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading || success}
          >
            {loading ? 'Đang gửi...' : success ? 'Đã gửi' : 'Gửi yêu cầu'}
          </button>

          <div className="form-footer">
            <a href="/login" className="back-link">Quay lại đăng nhập</a>
            <span className="separator">|</span>
            <a href="/register" className="register-link">Đăng ký tài khoản</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

