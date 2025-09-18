// API service để gọi các endpoint
const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://26.29.198.229:8081/';

// Hàm helper để gọi API
const apiCall = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Kiểm tra nếu response không thành công
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Trả về dữ liệu JSON
    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// API functions
export const authAPI = {
  // Đăng nhập
  login: async (username, password) => {
    return apiCall('api/v1/patient/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
      }),
    });
  },

  // Đăng ký (nếu cần)
  register: async (userData) => {
    return apiCall('auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Đăng xuất (nếu cần)
  logout: async () => {
    return apiCall('auth/logout', {
      method: 'POST',
    });
  },
};

// Các API khác có thể thêm vào đây
export const userAPI = {
  // Lấy thông tin người dùng
  getProfile: async (token) => {
    return apiCall('user/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Cập nhật thông tin người dùng
  updateProfile: async (userData, token) => {
    return apiCall('user/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
  },
};

export const appointmentAPI = {
  // Đặt lịch khám
  createAppointment: async (appointmentData, token) => {
    return apiCall('appointments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(appointmentData),
    });
  },

  // Lấy danh sách lịch khám
  getAppointments: async (token) => {
    return apiCall('appointments', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};

export const bookingAPI = {
  // Lấy danh sách lịch sử khám chữa bệnh
  getPatientBookings: async (token) => {
    return apiCall('api/v1/patient/bookings', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Lấy chi tiết lần khám
  getBookingDetail: async (bookingId, token) => {
    return apiCall(`api/v1/patient/bookings/${bookingId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};

export const invoiceAPI = {
  // Lấy hóa đơn của bệnh nhân
  getPatientInvoices: async (patientId, token) => {
    return apiCall(`invoices/patient/${patientId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Tìm kiếm hóa đơn
  searchInvoices: async (searchTerm, token) => {
    return apiCall(`invoices/search?q=${encodeURIComponent(searchTerm)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};

export default {
  authAPI,
  userAPI,
  appointmentAPI,
  bookingAPI,
  invoiceAPI,
};
