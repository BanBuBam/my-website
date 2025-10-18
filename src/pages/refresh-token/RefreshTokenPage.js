import React, { useState } from 'react';
import { manualRefreshToken } from '../../utils/tokenRefresh';
import './RefreshTokenPage.css';

const RefreshTokenPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  // Hàm xử lý refresh token
  const handleRefreshToken = async () => {
    // Kiểm tra có refresh token không
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      setError('Không tìm thấy refresh token. Vui lòng đăng nhập lại.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await manualRefreshToken();
      setSuccess(true);
      setMessage('Làm mới token thành công!');
    } catch (error) {
      console.error('Lỗi refresh token:', error);
      setError(error.message || 'Làm mới token thất bại. Vui lòng đăng nhập lại.');
    } finally {
      setLoading(false);
    }
  };

  // Lấy thông tin token hiện tại
  const getTokenInfo = () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!accessToken || !refreshToken) {
      return null;
    }

    try {
      // Decode access token
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const expirationTime = new Date(payload.exp * 1000);
      const currentTime = new Date();
      const timeRemaining = expirationTime - currentTime;

      return {
        expirationTime: expirationTime.toLocaleString('vi-VN'),
        timeRemaining: Math.floor(timeRemaining / 1000 / 60), // phút
        isExpired: timeRemaining < 0,
      };
    } catch (error) {
      return null;
    }
  };

  const tokenInfo = getTokenInfo();

  return (
    <div className="refresh-token-container">
      <div className="refresh-token-card">
        <h2>Làm mới Token</h2>
        <p className="description">
          Sử dụng tính năng này để làm mới access token khi cần thiết
        </p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {message}
          </div>
        )}

        {tokenInfo ? (
          <div className="token-info">
            <h3>Thông tin Token hiện tại</h3>
            <div className="info-item">
              <span className="label">Thời gian hết hạn:</span>
              <span className="value">{tokenInfo.expirationTime}</span>
            </div>
            <div className="info-item">
              <span className="label">Thời gian còn lại:</span>
              <span className={`value ${tokenInfo.isExpired ? 'expired' : ''}`}>
                {tokenInfo.isExpired 
                  ? 'Đã hết hạn' 
                  : `${tokenInfo.timeRemaining} phút`}
              </span>
            </div>
          </div>
        ) : (
          <div className="no-token-message">
            Không tìm thấy token. Vui lòng đăng nhập.
          </div>
        )}

        <button
          onClick={handleRefreshToken}
          className="refresh-btn"
          disabled={loading || !tokenInfo}
        >
          {loading ? 'Đang làm mới...' : 'Làm mới Token'}
        </button>

        <div className="note">
          <strong>Lưu ý:</strong> Token sẽ tự động làm mới khi sắp hết hạn. 
          Bạn chỉ cần sử dụng tính năng này khi muốn làm mới thủ công.
        </div>

        <div className="back-link-container">
          <a href="/" className="back-link">Quay lại trang chủ</a>
        </div>
      </div>
    </div>
  );
};

export default RefreshTokenPage;

