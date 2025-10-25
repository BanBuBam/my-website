// API service để gọi các endpoint
const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://100.99.181.59:8081/';

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

// Hàm helper để lấy token từ localStorage
export const getAccessToken = () => localStorage.getItem('accessToken');
export const getRefreshToken = () => localStorage.getItem('refreshToken');

// Hàm helper để lưu token vào localStorage
export const saveTokens = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

// Hàm helper để xóa token khỏi localStorage
export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// API functions cho bệnh nhân
export const patientAuthAPI = {
  // Đăng nhập bệnh nhân
  login: async (email, password) => {
    const response = await apiCall('api/v1/patient/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    });

    // Lưu token vào localStorage nếu đăng nhập thành công
    if (response.data && response.data.accessToken && response.data.refreshToken) {
      saveTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  },

  // Đăng ký bệnh nhân
  register: async (userData) => {
    return apiCall('api/v1/patient/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Đăng xuất bệnh nhân
  logout: async () => {
    clearTokens();
    return apiCall('api/v1/patient/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Đổi mật khẩu
  resetPassword: async (resetData) => {
    return apiCall('api/v1/patient/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(resetData),
    });
  },

  // Quên mật khẩu
  forgotPassword: async (emailData) => {
    return apiCall('api/v1/patient/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  },

  // Đổi mật khẩu (khi đã đăng nhập)
  changePassword: async (passwordData) => {
    return apiCall('api/v1/patient/auth/change-password', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(passwordData),
    });
  },

  // Refresh token
  refreshToken: async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('Không tìm thấy refresh token');
    }

    const response = await apiCall('api/v1/patient/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    // Lưu accessToken mới
    if (response.data && response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }

    return response;
  },

  // Lấy thông tin profile bệnh nhân
  getProfile: async () => {
    return apiCall('api/v1/patient/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Cập nhật thông tin profile bệnh nhân
  updateProfile: async (profileData) => {
    return apiCall('api/v1/patient/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(profileData),
    });
  },

  // Lấy thông tin y tế bệnh nhân
  getMedicalInfo: async () => {
    return apiCall('api/v1/patient/medical-info', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API cho bệnh nhân
export const patientAPI = {
  // Lấy thông tin bệnh nhân
  getProfile: async () => {
    return apiCall('api/v1/patient/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Cập nhật thông tin bệnh nhân
  updateProfile: async (userData) => {
    return apiCall('api/v1/patient/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(userData),
    });
  },
};

export const appointmentAPI = {
  // Đặt lịch khám
  createAppointment: async (appointmentData) => {
    return apiCall('api/v1/patient/appointments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(appointmentData),
    });
  },

  // Lấy danh sách lịch khám
  getAppointments: async () => {
    return apiCall('api/v1/patient/appointments', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

export const bookingAPI = {
  // Lấy danh sách lịch sử khám chữa bệnh với phân trang
  getPatientBookings: async (page = 0, size = 10) => {
    return apiCall(`api/v1/patient/bookings?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết lần khám
  getBookingDetail: async (bookingId) => {
    return apiCall(`api/v1/patient/bookings/${bookingId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách khoa
  getDepartments: async () => {
    return apiCall('api/v1/patient/bookings/departments', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách bác sĩ theo khoa và ngày
  getDoctorsByDepartment: async (departmentId, date) => {
    return apiCall(`api/v1/patient/bookings/departments/${departmentId}/doctors?date=${date}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo lịch hẹn khám
  createBooking: async (bookingData) => {
    return apiCall('api/v1/patient/bookings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(bookingData),
    });
  },

  // Hủy lịch hẹn khám
  cancelBooking: async (bookingId, reason) => {
    return apiCall(`api/v1/patient/bookings/${bookingId}/cancel?reason=${encodeURIComponent(reason)}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

export const invoiceAPI = {
  // Lấy hóa đơn của bệnh nhân
  getPatientInvoices: async () => {
    return apiCall('api/v1/patient/invoices', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tìm kiếm hóa đơn
  searchInvoices: async (searchTerm) => {
    return apiCall(`api/v1/patient/invoices/search?q=${encodeURIComponent(searchTerm)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// Staff Authentication API
export const staffAuthAPI = {
  login: async (username, password) => {
    return apiCall('api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
  },

  logout: async () => {
    const token = localStorage.getItem('staffAccessToken');
    return apiCall('api/v1/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};

// Staff Employee API
export const staffEmployeeAPI = {
  getEmployeeAccount: async (employeeAccountId) => {
    const token = localStorage.getItem('staffAccessToken');
    return apiCall(`api/v1/employee-accounts/${employeeAccountId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};

export default {
  patientAuthAPI,
  patientAPI,
  appointmentAPI,
  bookingAPI,
  invoiceAPI,
  staffAuthAPI,
  staffEmployeeAPI,
};
