import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientAuthAPI } from '../../services/api';
import './CapNhatThongTin.css';

const CapNhatThongTin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // State để quản lý dữ liệu form
  const [formData, setFormData] = useState({
    phoneNumber: '',
    email: '',
    addressLine: '',
    wardId: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    occupation: '',
    maritalStatus: ''
  });

  // State để lưu thông tin không thể chỉnh sửa
  const [profileInfo, setProfileInfo] = useState({
    firstName: '',
    lastName: '',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    idCardNumber: '',
    patientCode: '',
    bloodType: '',
    allergies: ''
  });

  // Lấy thông tin profile khi component mount
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('accessToken');

      console.log('Checking token:', token ? 'Token exists' : 'No token');

      if (!token) {
        setError('Bạn cần đăng nhập để xem thông tin');
        setLoadingProfile(false);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }

      setLoadingProfile(true);
      setError('');

      try {
        console.log('Calling getProfile API...');
        const response = await patientAuthAPI.getProfile();
        console.log('Profile response:', response);

        if (response && response.data) {
          const data = response.data;

          // Set thông tin không thể chỉnh sửa
          setProfileInfo({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            fullName: data.fullName || '',
            dateOfBirth: data.dateOfBirth || '',
            gender: data.gender || '',
            idCardNumber: data.idCardNumber || '',
            patientCode: data.patientCode || '',
            bloodType: data.bloodType || '',
            allergies: data.allergies || ''
          });

          // Set thông tin có thể chỉnh sửa
          setFormData({
            phoneNumber: data.phoneNumber || '',
            email: data.email || '',
            addressLine: data.addressLine || '',
            wardId: data.wardId ? String(data.wardId) : '',
            emergencyContactName: data.emergencyContactName || '',
            emergencyContactPhone: data.emergencyContactPhone || '',
            occupation: data.occupation || '',
            maritalStatus: data.maritalStatus || ''
          });
        } else {
          setError('Không nhận được dữ liệu từ server');
        }
      } catch (error) {
        console.error('Lỗi lấy thông tin profile:', error);

        // Kiểm tra loại lỗi
        if (error.message === 'Failed to fetch') {
          setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc server có đang chạy không.');
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          setTimeout(() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            navigate('/login');
          }, 2000);
        } else {
          setError(error.message || 'Không thể lấy thông tin. Vui lòng thử lại.');
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Hàm xử lý thay đổi input
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    // Xóa error khi user bắt đầu nhập lại
    if (error) setError('');
    if (success) setSuccess(false);
  };

  // Hàm xử lý submit form
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validation
    if (!formData.phoneNumber || !formData.email || !formData.addressLine) {
      setError('Vui lòng nhập đầy đủ thông tin bắt buộc');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Gọi API cập nhật profile
      const response = await patientAuthAPI.updateProfile(formData);
      console.log('Cập nhật thành công:', response);

      setSuccess(true);
      alert(response.message || 'Cập nhật thông tin thành công!');

      // Reload lại thông tin sau khi cập nhật
      const updatedProfile = await patientAuthAPI.getProfile();
      if (updatedProfile.data) {
        const data = updatedProfile.data;
        setFormData({
          phoneNumber: data.phoneNumber || '',
          email: data.email || '',
          addressLine: data.addressLine || '',
          wardId: data.wardId || '',
          emergencyContactName: data.emergencyContactName || '',
          emergencyContactPhone: data.emergencyContactPhone || '',
          occupation: data.occupation || '',
          maritalStatus: data.maritalStatus || ''
        });
      }

    } catch (error) {
      console.error('Lỗi cập nhật thông tin:', error);
      setError(error.message || 'Cập nhật thông tin thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="cap-nhat-thong-tin-container">
        <div className="cap-nhat-thong-tin-content">
          <div className="loading-message">Đang tải thông tin...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="cap-nhat-thong-tin-container">
      <div className="cap-nhat-thong-tin-content">
        {/* Tiêu đề và phụ đề */}
        <div className="header-section">
          <h1>Thông tin người dùng</h1>
          <p>Cập nhật đầy đủ thông tin người dùng</p>
          {profileInfo.patientCode && (
            <p className="patient-code">Mã bệnh nhân: <strong>{profileInfo.patientCode}</strong></p>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            Cập nhật thông tin thành công!
          </div>
        )}

        {/* Form cập nhật thông tin */}
        <form onSubmit={handleSubmit} className="cap-nhat-form">
          <div className="form-columns">
            {/* Cột 1 - Thông tin cá nhân (chỉ đọc) */}
            <div className="column-1">
              <h3 className="section-title">Thông tin cá nhân</h3>

              <div className="form-group">
                <label htmlFor="firstName">Họ và tên đệm</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={profileInfo.firstName}
                  disabled
                  className="readonly-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Tên</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={profileInfo.lastName}
                  disabled
                  className="readonly-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="dateOfBirth">Ngày sinh</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={profileInfo.dateOfBirth}
                  disabled
                  className="readonly-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">Giới tính</label>
                <input
                  type="text"
                  id="gender"
                  name="gender"
                  value={profileInfo.gender === 'MALE' ? 'Nam' : profileInfo.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                  disabled
                  className="readonly-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="idCardNumber">CCCD/CMND</label>
                <input
                  type="text"
                  id="idCardNumber"
                  name="idCardNumber"
                  value={profileInfo.idCardNumber}
                  disabled
                  className="readonly-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bloodType">Nhóm máu</label>
                <input
                  type="text"
                  id="bloodType"
                  name="bloodType"
                  value={profileInfo.bloodType || 'Chưa cập nhật'}
                  disabled
                  className="readonly-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="allergies">Dị ứng</label>
                <textarea
                  id="allergies"
                  name="allergies"
                  value={profileInfo.allergies || 'Không có'}
                  disabled
                  className="readonly-input"
                  rows="3"
                />
              </div>
            </div>

            {/* Cột 2 - Thông tin có thể chỉnh sửa */}
            <div className="column-2">
              <h3 className="section-title">Thông tin liên hệ</h3>

              <div className="form-group">
                <label htmlFor="phoneNumber">Số điện thoại *</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="Nhập số điện thoại"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Nhập email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="addressLine">Địa chỉ cụ thể *</label>
                <textarea
                  id="addressLine"
                  name="addressLine"
                  placeholder="Nhập địa chỉ cụ thể (số nhà, đường...)"
                  value={formData.addressLine}
                  onChange={handleChange}
                  disabled={loading}
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="wardId">Mã phường/xã</label>
                <input
                  type="number"
                  id="wardId"
                  name="wardId"
                  placeholder="Nhập mã phường/xã"
                  value={formData.wardId}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <h3 className="section-title">Liên hệ khẩn cấp</h3>

              <div className="form-group">
                <label htmlFor="emergencyContactName">Tên người liên hệ</label>
                <input
                  type="text"
                  id="emergencyContactName"
                  name="emergencyContactName"
                  placeholder="Nhập tên người liên hệ khẩn cấp"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="emergencyContactPhone">Số điện thoại người liên hệ</label>
                <input
                  type="tel"
                  id="emergencyContactPhone"
                  name="emergencyContactPhone"
                  placeholder="Nhập số điện thoại người liên hệ"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <h3 className="section-title">Thông tin khác</h3>

              <div className="form-group">
                <label htmlFor="occupation">Nghề nghiệp</label>
                <input
                  type="text"
                  id="occupation"
                  name="occupation"
                  placeholder="Nhập nghề nghiệp"
                  value={formData.occupation}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="maritalStatus">Tình trạng hôn nhân</label>
                <select
                  id="maritalStatus"
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">Chọn tình trạng hôn nhân</option>
                  <option value="Single">Độc thân</option>
                  <option value="Married">Đã kết hôn</option>
                  <option value="Divorced">Ly hôn</option>
                  <option value="Widowed">Góa</option>
                </select>
              </div>
            </div>
          </div>

          {/* Nút cập nhật */}
          <div className="submit-section">
            <button type="submit" className="cap-nhat-btn" disabled={loading}>
              {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CapNhatThongTin;
