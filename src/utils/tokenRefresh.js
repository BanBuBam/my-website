import { patientAuthAPI } from '../services/api';

// Biến để lưu trạng thái đang refresh
let isRefreshing = false;
let refreshSubscribers = [];

// Hàm để subscribe các request đang chờ refresh token
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// Hàm để thông báo cho các request đang chờ khi refresh xong
const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Hàm refresh token
export const refreshAccessToken = async () => {
  if (isRefreshing) {
    // Nếu đang refresh, đợi cho đến khi refresh xong
    return new Promise((resolve) => {
      subscribeTokenRefresh((token) => {
        resolve(token);
      });
    });
  }

  isRefreshing = true;

  try {
    const response = await patientAuthAPI.refreshToken();
    const newAccessToken = response.data.accessToken;

    // Thông báo cho các request đang chờ
    onRefreshed(newAccessToken);

    isRefreshing = false;
    return newAccessToken;
  } catch (error) {
    isRefreshing = false;
    // Nếu refresh thất bại, xóa token và redirect về login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
    throw error;
  }
};

// Hàm kiểm tra token có hết hạn không
export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    // Decode JWT token (phần payload)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();

    // Kiểm tra nếu token sắp hết hạn trong vòng 5 phút
    return expirationTime - currentTime < 5 * 60 * 1000;
  } catch (error) {
    return true;
  }
};

// Hàm setup auto refresh token
export const setupTokenRefresh = () => {
  // Kiểm tra token mỗi 1 phút
  const intervalId = setInterval(async () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (accessToken && refreshToken && isTokenExpired(accessToken)) {
      console.log('Access token sắp hết hạn, đang refresh...');
      try {
        await refreshAccessToken();
        console.log('Refresh token thành công');
      } catch (error) {
        console.error('Lỗi refresh token:', error);
      }
    }
  }, 60000); // Kiểm tra mỗi 1 phút

  // Cleanup function
  return () => clearInterval(intervalId);
};

// Hàm refresh token thủ công (có thể gọi từ UI)
export const manualRefreshToken = async () => {
  try {
    const newAccessToken = await refreshAccessToken();
    console.log('Refresh token thành công');
    return newAccessToken;
  } catch (error) {
    console.error('Lỗi refresh token:', error);
    throw error;
  }
};

