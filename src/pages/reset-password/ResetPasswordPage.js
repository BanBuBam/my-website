import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientAuthAPI } from '../../services/api';
import './ResetPasswordPage.css';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    token: '',
    newPassword: '',
    confirmPassword: '',
  });

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

    // Validation
    if (!formData.token || !formData.newPassword || !formData.confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Gọi API reset password
      const response = await patientAuthAPI.resetPassword({
        token: formData.token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
        passwordMatching: formData.newPassword === formData.confirmPassword,
      });

      console.log('Đổi mật khẩu thành công:', response);

      setSuccess(true);

      // Hiển thị thông báo thành công
      alert(response.message || 'Đổi mật khẩu thành công!');

      // Redirect về trang login sau 2 giây
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('Lỗi đổi mật khẩu:', error);
      setError(error.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-form">
        <h2>Đặt lại mật khẩu</h2>
        <p className="form-description">
          Nhập mã xác thực từ email và mật khẩu mới của bạn
        </p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            Đổi mật khẩu thành công! Đang chuyển về trang đăng nhập...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="token">Mã xác thực</label>
            <input
              type="text"
              id="token"
              name="token"
              placeholder="Nhập mã xác thực từ email"
              value={formData.token}
              onChange={handleChange}
              disabled={loading || success}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">Mật khẩu mới</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              value={formData.newPassword}
              onChange={handleChange}
              disabled={loading || success}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu mới"
              value={formData.confirmPassword}
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
            {loading ? 'Đang xử lý...' : success ? 'Đã đổi mật khẩu' : 'Đặt lại mật khẩu'}
          </button>

          <div className="form-footer">
            <a href="/login" className="back-link">Quay lại đăng nhập</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

