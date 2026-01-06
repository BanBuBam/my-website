// API cho Kỹ thuật viên (Lab Technician)
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
const getAccessToken = () => localStorage.getItem('labtechAccessToken');
const getRefreshToken = () => localStorage.getItem('labtechRefreshToken');

// Hàm helper để lưu token
export const saveTokens = (accessToken, refreshToken) => {
  localStorage.setItem('labtechAccessToken', accessToken);
  localStorage.setItem('labtechRefreshToken', refreshToken);
};

// Hàm helper để xóa token
export const clearTokens = () => {
  localStorage.removeItem('labtechAccessToken');
  localStorage.removeItem('labtechRefreshToken');
};

// API Dashboard
export const labTechnicianDashboardAPI = {
  // Lấy dashboard data
  getDashboard: async () => {
    return apiCall('api/v1/dashboard/lab/summary', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Yêu cầu xét nghiệm
export const labTechnicianOrderAPI = {
  // Lấy danh sách yêu cầu xét nghiệm của encounter
  getLabTestOrders: async (encounterId) => {
    return apiCall(`api/v1/encounters/${encounterId}/lab-orders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Collect specimen cho lab test order
  collectSpecimen: async (labTestOrderId) => {
    return apiCall(`api/v1/lab-orders/${labTestOrderId}/collect-specimen`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Receive specimen cho lab test order
  receiveSpecimen: async (labTestOrderId) => {
    return apiCall(`api/v1/lab-orders/${labTestOrderId}/receive-specimen`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Reject specimen cho lab test order
  rejectSpecimen: async (labTestOrderId, rejectionReason) => {
    return apiCall(`api/v1/lab-orders/${labTestOrderId}/reject-specimen`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify({ rejectionReason }),
    });
  },

  // Approve lab test order
  approveLabOrder: async (labTestOrderId) => {
    return apiCall(`api/v1/lab-orders/${labTestOrderId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Kết quả xét nghiệm
export const labTechnicianResultAPI = {
  // Lấy danh sách lab results đang chờ nhập
  getPendingLabResults: async () => {
    return apiCall('api/v1/lab-results/pending', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách lab results chờ xác nhận
  getPendingVerificationResults: async () => {
    return apiCall('api/v1/lab-results/pending-verification', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Thêm kết quả cho lab result
  enterLabResult: async (labResultId, resultData) => {
    return apiCall(`api/v1/lab-results/${labResultId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(resultData),
    });
  },

  // Verify lab result
  verifyLabResult: async (labResultId) => {
    return apiCall(`api/v1/lab-results/${labResultId}/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Diagnostic Orders (Emergency)
export const labTechnicianDiagnosticAPI = {
  // Lấy danh sách diagnostic orders đang chờ xác nhận
  getPendingDiagnosticOrders: async () => {
    return apiCall('api/v1/emergency/diagnostic-orders/pending', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết diagnostic order
  getDiagnosticOrderDetail: async (orderId) => {
    return apiCall(`api/v1/emergency/diagnostic-orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tìm diagnostic orders theo encounter ID
  getDiagnosticOrdersByEncounter: async (emergencyEncounterId) => {
    return apiCall(`api/v1/emergency/diagnostic-orders/encounter/${emergencyEncounterId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy tất cả diagnostic orders với pagination
  getAllDiagnosticOrders: async (page = 0, size = 20, sort = ['orderedAt,desc']) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    // Add sort parameters
    if (sort && sort.length > 0) {
      sort.forEach(s => params.append('sort', s));
    }

    return apiCall(`api/v1/emergency/diagnostic-orders?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tiếp nhận chỉ định xét nghiệm
  acceptDiagnosticOrder: async (orderId, orderData) => {
    return apiCall(`api/v1/emergency/diagnostic-orders/${orderId}/accept`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
  },

  // Bắt đầu thực hiện xét nghiệm
  startDiagnosticOrder: async (orderId, orderData) => {
    return apiCall(`api/v1/emergency/diagnostic-orders/${orderId}/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
  },

  // Hoàn thành xét nghiệm
  completeDiagnosticOrder: async (orderId, orderData) => {
    return apiCall(`api/v1/emergency/diagnostic-orders/${orderId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
  },

  // Báo cáo kết quả xét nghiệm
  reportDiagnosticOrder: async (orderId, results, interpretation, orderData) => {
    const params = new URLSearchParams({
      results: results,
      interpretation: interpretation,
    });

    return apiCall(`api/v1/emergency/diagnostic-orders/${orderId}/report?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
  },
};

// API Imaging Orders (Chẩn đoán hình ảnh)
export const labTechnicianImagingAPI = {
  // Lấy danh sách imaging orders chờ xử lý
  getPendingImagingOrders: async () => {
    return apiCall('api/v1/imaging-orders/pending', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách imaging orders đã lên lịch
  getScheduledImagingOrders: async () => {
    return apiCall('api/v1/imaging-orders/scheduled', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách imaging orders chờ báo cáo
  getWaitingForReportOrders: async () => {
    return apiCall('api/v1/imaging-orders/waiting-for-report', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Xác nhận imaging order
  confirmImagingOrder: async (orderId, confirmationData) => {
    return apiCall(`api/v1/imaging-orders/${orderId}/confirm`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(confirmationData),
    });
  },

  // Nhập kết quả imaging
  enterImagingResults: async (orderId, resultsData) => {
    return apiCall(`api/v1/imaging-orders/${orderId}/results`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resultsData),
    });
  },
};

export default {
  labTechnicianDashboardAPI,
  labTechnicianOrderAPI,
  labTechnicianResultAPI,
  labTechnicianDiagnosticAPI,
  labTechnicianImagingAPI,
};

