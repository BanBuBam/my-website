// API cho Bác sĩ
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

// API Authentication cho Bác sĩ
export const doctorAuthAPI = {
  // Đăng nhập
  login: async (email, password) => {
    const response = await apiCall('api/v1/doctor/auth/login', {
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
    return apiCall('api/v1/doctor/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Dashboard
export const doctorDashboardAPI = {
  // Lấy dashboard data
  getDashboard: async () => {
    return apiCall('api/v1/dashboard/doctor', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy thống kê dashboard (legacy)
  getStatistics: async () => {
    return apiCall('api/v1/doctor/dashboard/statistics', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Khám bệnh
export const doctorExaminationAPI = {
  // Lấy danh sách bệnh nhân chờ khám
  getWaitingPatients: async () => {
    return apiCall('api/v1/doctor/examinations/waiting', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy thông tin bệnh nhân
  getPatientInfo: async (patientId) => {
    return apiCall(`api/v1/doctor/examinations/patient/${patientId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo phiếu khám bệnh
  createExamination: async (examinationData) => {
    return apiCall('api/v1/doctor/examinations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(examinationData),
    });
  },

  // Cập nhật phiếu khám bệnh
  updateExamination: async (examinationId, examinationData) => {
    return apiCall(`api/v1/doctor/examinations/${examinationId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(examinationData),
    });
  },
};

// API Bệnh nhân nội trú
export const doctorInpatientAPI = {
  // Lấy danh sách bệnh nhân nội trú
  getInpatients: async () => {
    return apiCall('api/v1/doctor/inpatients', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết bệnh nhân nội trú
  getInpatientDetail: async (inpatientId) => {
    return apiCall(`api/v1/doctor/inpatients/${inpatientId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Cập nhật thông tin bệnh nhân nội trú
  updateInpatient: async (inpatientId, data) => {
    return apiCall(`api/v1/doctor/inpatients/${inpatientId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(data),
    });
  },
};

// API Kết quả xét nghiệm
export const doctorLabResultAPI = {
  // Lấy danh sách kết quả xét nghiệm
  getLabResults: async (patientId) => {
    return apiCall(`api/v1/doctor/lab-results/patient/${patientId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết kết quả xét nghiệm
  getLabResultDetail: async (labResultId) => {
    return apiCall(`api/v1/doctor/lab-results/${labResultId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Đơn thuốc
export const doctorPrescriptionAPI = {
  // Tạo đơn thuốc
  createPrescription: async (prescriptionData) => {
    return apiCall('api/v1/doctor/prescriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(prescriptionData),
    });
  },

  // Lấy danh sách đơn thuốc
  getPrescriptions: async (patientId) => {
    return apiCall(`api/v1/doctor/prescriptions/patient/${patientId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Lịch hẹn
export const doctorBookingAPI = {
  // Lấy danh sách lịch hẹn
  getBookings: async (params = {}) => {
    const queryParams = new URLSearchParams();

    // Thêm các tham số query nếu có
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.size !== undefined) queryParams.append('size', params.size);
    if (params.status) queryParams.append('status', params.status);
    if (params.bookingSource) queryParams.append('bookingSource', params.bookingSource);
    if (params.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params.toDate) queryParams.append('toDate', params.toDate);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `api/v1/doctor/bookings?${queryString}`
      : 'api/v1/doctor/bookings';

    return apiCall(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết lịch hẹn
  getBookingDetail: async (bookingId) => {
    return apiCall(`api/v1/doctor/bookings/${bookingId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

export default {
  doctorAuthAPI,
  doctorDashboardAPI,
  doctorExaminationAPI,
  doctorInpatientAPI,
  doctorLabResultAPI,
  doctorPrescriptionAPI,
  doctorBookingAPI,
};

