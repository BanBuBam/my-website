// API cho Lễ tân
const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://100.96.182.10:8081/';

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
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Hàm helper để lấy token (sử dụng staffAccessToken từ login chung)
const getAccessToken = () => localStorage.getItem('staffAccessToken');
const getRefreshToken = () => localStorage.getItem('staffRefreshToken');

// Hàm helper để lưu token
export const saveTokens = (accessToken, refreshToken) => {
  localStorage.setItem('staffAccessToken', accessToken);
  localStorage.setItem('staffRefreshToken', refreshToken);
};

// Hàm helper để xóa token
export const clearTokens = () => {
  localStorage.removeItem('staffAccessToken');
  localStorage.removeItem('staffRefreshToken');
};

// API Authentication cho Lễ tân
export const receptionistAuthAPI = {
  // Đăng nhập
  login: async (email, password) => {
    const response = await apiCall('api/v1/receptionist/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.data && response.data.accessToken && response.data.refreshToken) {
      saveTokens(response.data.accessToken, response.data.refreshToken);
    }
    
    return response;
  },

  // Đăng xuất
  logout: async () => {
    clearTokens();
    return apiCall('api/v1/receptionist/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Dashboard
export const receptionistDashboardAPI = {
  // Lấy thống kê dashboard
  getDashboard: async () => {
    return apiCall('api/v1/dashboard/receptionist', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy thống kê dashboard (legacy)
  getStatistics: async () => {
    return apiCall('api/v1/receptionist/dashboard/statistics', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Tiếp nhận bệnh nhân
export const receptionistPatientAPI = {
  // Tìm kiếm bệnh nhân
  searchPatient: async (searchTerm) => {
    return apiCall(`api/v1/receptionist/patients/search?q=${encodeURIComponent(searchTerm)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy thông tin bệnh nhân
  getPatientDetail: async (patientId) => {
    return apiCall(`api/v1/receptionist/patients/${patientId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Đăng ký bệnh nhân mới
  registerPatient: async (patientData) => {
    return apiCall('api/v1/receptionist/patients', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(patientData),
    });
  },

  // Cập nhật thông tin bệnh nhân
  updatePatient: async (patientId, patientData) => {
    return apiCall(`api/v1/receptionist/patients/${patientId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(patientData),
    });
  },
};

// API Quản lý lịch hẹn
export const receptionistAppointmentAPI = {
  // Lấy danh sách lịch hẹn
  getAppointments: async (date) => {
    return apiCall(`api/v1/receptionist/appointments?date=${date}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo lịch hẹn
  createAppointment: async (appointmentData) => {
    return apiCall('api/v1/receptionist/appointments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(appointmentData),
    });
  },

  // Cập nhật lịch hẹn
  updateAppointment: async (appointmentId, appointmentData) => {
    return apiCall(`api/v1/receptionist/appointments/${appointmentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(appointmentData),
    });
  },

  // Hủy lịch hẹn
  cancelAppointment: async (appointmentId) => {
    return apiCall(`api/v1/receptionist/appointments/${appointmentId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Tra cứu
export const receptionistLookupAPI = {
  // Tra cứu lịch sử khám
  getMedicalHistory: async (patientId) => {
    return apiCall(`api/v1/receptionist/patients/${patientId}/medical-history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tra cứu hóa đơn
  getInvoices: async (patientId) => {
    return apiCall(`api/v1/receptionist/patients/${patientId}/invoices`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

export default {
  receptionistAuthAPI,
  receptionistDashboardAPI,
  receptionistPatientAPI,
  receptionistAppointmentAPI,
  receptionistLookupAPI,
};

