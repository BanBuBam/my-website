import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientAuthAPI } from '../../services/api';
import './ChangePasswordPage.css';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
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
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('Mật khẩu mới phải khác mật khẩu hiện tại');
      return;
    }

    // Kiểm tra đã đăng nhập chưa
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Bạn cần đăng nhập để đổi mật khẩu');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Gọi API change password
      const response = await patientAuthAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      console.log('Đổi mật khẩu thành công:', response);

      setSuccess(true);

      // Hiển thị thông báo thành công
      alert(response.message || 'Đổi mật khẩu thành công!');

      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Redirect về trang chủ sau 2 giây
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error('Lỗi đổi mật khẩu:', error);
      setError(error.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <div className="change-password-form">
        <h2>Đổi mật khẩu</h2>
        <p className="form-description">
          Vui lòng nhập mật khẩu hiện tại và mật khẩu mới
        </p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            Đổi mật khẩu thành công! Đang chuyển về trang chủ...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              placeholder="Nhập mật khẩu hiện tại"
              value={formData.currentPassword}
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
            {loading ? 'Đang xử lý...' : success ? 'Đã đổi mật khẩu' : 'Đổi mật khẩu'}
          </button>

          <div className="form-footer">
            <a href="/" className="back-link">Quay lại trang chủ</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;

