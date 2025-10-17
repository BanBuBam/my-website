import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientAuthAPI } from '../../services/api';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'MALE',
    idCardNumber: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    addressLine: '',
    wardId: '',
    nationId: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    photoUrl: '',
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

    // Validation cơ bản
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Vui lòng nhập đầy đủ các trường bắt buộc');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Chuẩn bị dữ liệu gửi lên API
      const registerData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        idCardNumber: formData.idCardNumber,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        addressLine: formData.addressLine,
        wardId: formData.wardId ? parseInt(formData.wardId) : 1,
        nationId: formData.nationId ? parseInt(formData.nationId) : 1,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        photoUrl: formData.photoUrl || '',
        passwordMatching: formData.password === formData.confirmPassword,
      };

      // Gọi API đăng ký
      const response = await patientAuthAPI.register(registerData);

      // Xử lý khi đăng ký thành công
      console.log('Đăng ký thành công:', response);

      alert(response.data?.message || 'Đăng ký thành công! Vui lòng đăng nhập.');

      // Redirect về trang đăng nhập
      navigate('/login');

    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      setError(error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page-container">
      <div className="register-form-wrapper">
        <div className="register-header">
          <h1>Đăng ký tài khoản</h1>
          <p>Vui lòng điền đầy đủ thông tin để tạo tài khoản</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Thông tin cá nhân */}
            <div className="form-section full-width">
              <h3>Thông tin cá nhân</h3>
            </div>

            <div className="form-group">
              <label htmlFor="firstName" className="required">Họ và tên đệm</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="Ví dụ: Nguyễn Văn"
                value={formData.firstName}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="required">Tên</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Ví dụ: An"
                value={formData.lastName}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dateOfBirth" className="required">Ngày sinh</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender" className="required">Giới tính</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={loading}
                required
              >
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="idCardNumber" className="required">Số CMND/CCCD</label>
              <input
                type="text"
                id="idCardNumber"
                name="idCardNumber"
                placeholder="Số CMND/CCCD"
                value={formData.idCardNumber}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber" className="required">Số điện thoại</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                placeholder="Số điện thoại"
                value={formData.phoneNumber}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            {/* Thông tin địa chỉ */}
            <div className="form-section full-width">
              <h3>Địa chỉ</h3>
            </div>

            <div className="form-group full-width">
              <label htmlFor="addressLine">Địa chỉ chi tiết</label>
              <input
                type="text"
                id="addressLine"
                name="addressLine"
                placeholder="Số nhà, tên đường"
                value={formData.addressLine}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="wardId">Mã phường/xã</label>
              <input
                type="number"
                id="wardId"
                name="wardId"
                placeholder="Mã phường/xã"
                value={formData.wardId}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="nationId">Mã quốc gia</label>
              <input
                type="number"
                id="nationId"
                name="nationId"
                placeholder="Mã quốc gia (mặc định: 1)"
                value={formData.nationId}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {/* Thông tin liên hệ khẩn cấp */}
            <div className="form-section full-width">
              <h3>Liên hệ khẩn cấp</h3>
            </div>

            <div className="form-group">
              <label htmlFor="emergencyContactName">Tên người liên hệ</label>
              <input
                type="text"
                id="emergencyContactName"
                name="emergencyContactName"
                placeholder="Tên người liên hệ khẩn cấp"
                value={formData.emergencyContactName}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="emergencyContactPhone">Số điện thoại liên hệ</label>
              <input
                type="tel"
                id="emergencyContactPhone"
                name="emergencyContactPhone"
                placeholder="Số điện thoại khẩn cấp"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                disabled={loading}
              />
            </div>




            {/* Thông tin tài khoản */}
            <div className="form-section full-width">
              <h3>Thông tin tài khoản</h3>
            </div>

            <div className="form-group full-width">
              <label htmlFor="email" className="required">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="required">Mật khẩu</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="required">Xác nhận mật khẩu</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="photoUrl">URL ảnh đại diện</label>
              <input
                type="url"
                id="photoUrl"
                name="photoUrl"
                placeholder="https://example.com/photo.jpg"
                value={formData.photoUrl}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
            <p className="login-link">
              Đã có tài khoản? <a href="/login">Đăng nhập ngay</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
