// API cho Quản lý / Admin
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

// API Authentication cho Admin
export const adminAuthAPI = {
  // Đăng nhập
  login: async (email, password) => {
    const response = await apiCall('api/v1/admin/auth/login', {
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
    return apiCall('api/v1/admin/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Dashboard
export const adminDashboardAPI = {
  // Lấy dashboard data
  getDashboard: async () => {
    return apiCall('api/v1/dashboard/manager', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy thống kê dashboard (legacy)
  getStatistics: async () => {
    return apiCall('api/v1/admin/dashboard/statistics', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Quản lý nhân viên
export const adminStaffAPI = {
  // Lấy danh sách nhân viên
  getStaffList: async (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`api/v1/admin/staff?${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết nhân viên
  getStaffDetail: async (staffId) => {
    return apiCall(`api/v1/admin/staff/${staffId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo nhân viên mới
  createStaff: async (staffData) => {
    return apiCall('api/v1/admin/staff', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(staffData),
    });
  },

  // Cập nhật nhân viên
  updateStaff: async (staffId, staffData) => {
    return apiCall(`api/v1/admin/staff/${staffId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(staffData),
    });
  },

  // Xóa nhân viên
  deleteStaff: async (staffId) => {
    return apiCall(`api/v1/admin/staff/${staffId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Quản lý phòng ban
export const adminDepartmentAPI = {
  // Lấy danh sách phòng ban
  getDepartments: async () => {
    return apiCall('api/v1/admin/departments', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo phòng ban mới
  createDepartment: async (departmentData) => {
    return apiCall('api/v1/admin/departments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(departmentData),
    });
  },

  // Cập nhật phòng ban
  updateDepartment: async (departmentId, departmentData) => {
    return apiCall(`api/v1/admin/departments/${departmentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(departmentData),
    });
  },
};

// API Quản lý dịch vụ
export const adminServiceAPI = {
  // Lấy danh sách dịch vụ
  getServices: async () => {
    return apiCall('api/v1/admin/services', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo dịch vụ mới
  createService: async (serviceData) => {
    return apiCall('api/v1/admin/services', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(serviceData),
    });
  },

  // Cập nhật dịch vụ
  updateService: async (serviceId, serviceData) => {
    return apiCall(`api/v1/admin/services/${serviceId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(serviceData),
    });
  },
};

// API Báo cáo hệ thống
export const adminReportAPI = {
  // Lấy báo cáo tổng quan
  getOverviewReport: async (startDate, endDate) => {
    return apiCall(`api/v1/admin/reports/overview?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy báo cáo hoạt động
  getActivityReport: async (startDate, endDate) => {
    return apiCall(`api/v1/admin/reports/activity?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

export default {
  adminAuthAPI,
  adminDashboardAPI,
  adminStaffAPI,
  adminDepartmentAPI,
  adminServiceAPI,
  adminReportAPI,
};

