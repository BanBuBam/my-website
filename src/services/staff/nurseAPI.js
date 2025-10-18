// API cho Điều dưỡng
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

// Hàm helper để lấy token
const getAccessToken = () => localStorage.getItem('nurseAccessToken');
const getRefreshToken = () => localStorage.getItem('nurseRefreshToken');

// Hàm helper để lưu token
export const saveTokens = (accessToken, refreshToken) => {
  localStorage.setItem('nurseAccessToken', accessToken);
  localStorage.setItem('nurseRefreshToken', refreshToken);
};

// Hàm helper để xóa token
export const clearTokens = () => {
  localStorage.removeItem('nurseAccessToken');
  localStorage.removeItem('nurseRefreshToken');
};

// API Authentication cho Điều dưỡng
export const nurseAuthAPI = {
  // Đăng nhập
  login: async (email, password) => {
    const response = await apiCall('api/v1/nurse/auth/login', {
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
    return apiCall('api/v1/nurse/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Dashboard
export const nurseDashboardAPI = {
  // Lấy thống kê dashboard
  getStatistics: async () => {
    return apiCall('api/v1/nurse/dashboard/statistics', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Chăm sóc bệnh nhân
export const nursePatientCareAPI = {
  // Lấy danh sách bệnh nhân cần chăm sóc
  getPatients: async () => {
    return apiCall('api/v1/nurse/patients', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy thông tin bệnh nhân
  getPatientDetail: async (patientId) => {
    return apiCall(`api/v1/nurse/patients/${patientId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Cập nhật thông tin chăm sóc
  updateCareRecord: async (patientId, careData) => {
    return apiCall(`api/v1/nurse/patients/${patientId}/care`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(careData),
    });
  },
};

// API Theo dõi sinh hiệu
export const nurseVitalSignsAPI = {
  // Thêm sinh hiệu
  addVitalSigns: async (patientId, vitalSignsData) => {
    return apiCall(`api/v1/nurse/patients/${patientId}/vital-signs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(vitalSignsData),
    });
  },

  // Lấy lịch sử sinh hiệu
  getVitalSignsHistory: async (patientId) => {
    return apiCall(`api/v1/nurse/patients/${patientId}/vital-signs`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Quản lý thuốc
export const nurseMedicationAPI = {
  // Lấy danh sách thuốc cần cấp phát
  getMedicationSchedule: async () => {
    return apiCall('api/v1/nurse/medications/schedule', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Xác nhận đã cấp phát thuốc
  confirmMedication: async (medicationId) => {
    return apiCall(`api/v1/nurse/medications/${medicationId}/confirm`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

export default {
  nurseAuthAPI,
  nurseDashboardAPI,
  nursePatientCareAPI,
  nurseVitalSignsAPI,
  nurseMedicationAPI,
};

