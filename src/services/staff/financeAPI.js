// API cho Kế toán / Tài chính
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

// Hàm helper để lấy token
const getAccessToken = () => localStorage.getItem('financeAccessToken');
const getRefreshToken = () => localStorage.getItem('financeRefreshToken');

// Hàm helper để lưu token
export const saveTokens = (accessToken, refreshToken) => {
  localStorage.setItem('financeAccessToken', accessToken);
  localStorage.setItem('financeRefreshToken', refreshToken);
};

// Hàm helper để xóa token
export const clearTokens = () => {
  localStorage.removeItem('financeAccessToken');
  localStorage.removeItem('financeRefreshToken');
};

// API Authentication cho Kế toán
export const financeAuthAPI = {
  // Đăng nhập
  login: async (email, password) => {
    const response = await apiCall('api/v1/finance/auth/login', {
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
    return apiCall('api/v1/finance/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Dashboard
export const financeDashboardAPI = {
  // Lấy thống kê dashboard
  getStatistics: async () => {
    return apiCall('api/v1/finance/dashboard/statistics', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Quản lý hóa đơn
export const financeInvoiceAPI = {
  // Lấy danh sách hóa đơn
  getInvoices: async (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`api/v1/finance/invoices?${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết hóa đơn
  getInvoiceDetail: async (invoiceId) => {
    return apiCall(`api/v1/finance/invoices/${invoiceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo hóa đơn
  createInvoice: async (invoiceData) => {
    return apiCall('api/v1/finance/invoices', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(invoiceData),
    });
  },

  // Cập nhật hóa đơn
  updateInvoice: async (invoiceId, invoiceData) => {
    return apiCall(`api/v1/finance/invoices/${invoiceId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(invoiceData),
    });
  },
};

// API Thanh toán
export const financePaymentAPI = {
  // Lấy danh sách thanh toán
  getPayments: async (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`api/v1/finance/payments?${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Xử lý thanh toán
  processPayment: async (paymentData) => {
    return apiCall('api/v1/finance/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(paymentData),
    });
  },

  // Xác nhận thanh toán
  confirmPayment: async (paymentId) => {
    return apiCall(`api/v1/finance/payments/${paymentId}/confirm`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Báo cáo tài chính
export const financeReportAPI = {
  // Lấy báo cáo doanh thu
  getRevenueReport: async (startDate, endDate) => {
    return apiCall(`api/v1/finance/reports/revenue?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy báo cáo chi phí
  getExpenseReport: async (startDate, endDate) => {
    return apiCall(`api/v1/finance/reports/expense?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy báo cáo tổng hợp
  getSummaryReport: async (startDate, endDate) => {
    return apiCall(`api/v1/finance/reports/summary?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

export default {
  financeAuthAPI,
  financeDashboardAPI,
  financeInvoiceAPI,
  financePaymentAPI,
  financeReportAPI,
};

