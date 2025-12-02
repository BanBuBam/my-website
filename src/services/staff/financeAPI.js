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
    const response = await apiCall('api/v1/auth/login', {
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
    return apiCall('api/v1/auth/logout', {
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
// export const financeInvoiceAPI = {
//   // Lấy danh sách hóa đơn
//   getInvoices: async (params) => {
//     const queryString = new URLSearchParams(params).toString();
//     return apiCall(`api/v1/invoices?${queryString}`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${getAccessToken()}`,
//       },
//     });
//   },
//
//   // Lấy chi tiết hóa đơn
//   getInvoiceDetail: async (invoiceId) => {
//     return apiCall(`api/v1/invoices/${invoiceId}`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${getAccessToken()}`,
//       },
//     });
//   },
//
//   // Tạo hóa đơn
//   createInvoice: async (invoiceData) => {
//     return apiCall('api/v1/invoices', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${getAccessToken()}`,
//       },
//       body: JSON.stringify(invoiceData),
//     });
//   },
//
//   // Cập nhật hóa đơn
//   updateInvoice: async (invoiceId, invoiceData) => {
//     return apiCall(`api/v1/finance/invoices/${invoiceId}`, {
//       method: 'PUT',
//       headers: {
//         'Authorization': `Bearer ${getAccessToken()}`,
//       },
//       body: JSON.stringify(invoiceData),
//     });
//   },
// };

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

// API Quản lý Encounters (Thanh toán ngoại trú)
export const financeEncounterAPI = {
  // Lấy danh sách encounters
  getEncounters: async (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.size !== undefined) queryParams.append('size', params.size);
    if (params.sort) {
      params.sort.forEach(s => queryParams.append('sort', s));
    }
    if (params.status) queryParams.append('status', params.status);
    if (params.patientName) queryParams.append('patientName', params.patientName);
    if (params.patientCode) queryParams.append('patientCode', params.patientCode);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    return apiCall(`api/v1/encounters?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết encounter
  getEncounterDetail: async (encounterId) => {
    return apiCall(`api/v1/encounters/${encounterId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Tạo hóa đơn từ encounter
export const financeInvoiceGenerationAPI = {
  // Tạo hóa đơn từ encounter
  generateInvoice: async (invoiceData) => {
    return apiCall('api/v1/payments/generate-invoice', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(invoiceData),
    });
  },
};

// API Quản lý hóa đơn
export const financeInvoiceAPI = {
  // Tìm kiếm hóa đơn với bộ lọc
  searchInvoices: async (filters) => {
    const params = new URLSearchParams();

    if (filters.patientId) params.append('patientId', filters.patientId);
    if (filters.status) params.append('status', filters.status);
    if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);
    if (filters.page !== undefined) params.append('page', filters.page);
    if (filters.size !== undefined) params.append('size', filters.size);
    if (filters.sort) params.append('sort', filters.sort);

    return apiCall(`api/v1/invoices/search?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết hóa đơn theo ID
  getInvoiceById: async (invoiceId) => {
    return apiCall(`api/v1/invoices/${invoiceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy hóa đơn theo encounter ID
  getInvoiceByEncounterId: async (encounterId) => {
    return apiCall(`api/v1/payments/invoice/encounter/${encounterId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách items của hóa đơn
  getInvoiceItems: async (invoiceId) => {
    return apiCall(`api/v1/invoice-items/invoice/${invoiceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách hoàn tiền theo invoice ID
  getRefundsByInvoiceId: async (invoiceId) => {
    return apiCall(`api/v1/transactions/invoice/${invoiceId}/refunds`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách giao dịch theo invoice ID
  getTransactionsByInvoiceId: async (invoiceId) => {
    return apiCall(`api/v1/transactions/invoice/${invoiceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Giao dịch thanh toán
export const financeTransactionAPI = {
  // Thanh toán hóa đơn
  processPayment: async (paymentData) => {
    return apiCall('api/v1/transactions/process-payment', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(paymentData),
    });
  },

  // Đặt cọc (Advance Payment)
  advancePayment: async (patientId, amount, paymentMethod) => {
    const params = new URLSearchParams({
      patientId: patientId,
      amount: amount,
      paymentMethod: paymentMethod,
    });

    return apiCall(`api/v1/transactions/advance-payment?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Sử dụng tiền tạm ứng
  useAdvanceDeposit: async (patientId, invoiceId, amount) => {
    const params = new URLSearchParams({
      patientId: patientId,
      invoiceId: invoiceId,
      amount: amount,
    });

    return apiCall(`api/v1/deposits/use?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Quản lý điều trị nội trú (cho cashier)
export const financeInpatientAPI = {
  // Lấy danh sách điều trị nội trú đang hoạt động
  getActiveInpatientStays: async () => {
    return apiCall('api/v1/inpatient/stays/active', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết điều trị nội trú
  getInpatientStayDetail: async (inpatientStayId) => {
    return apiCall(`api/v1/inpatient/stays/${inpatientStayId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy số dư tạm ứng của bệnh nhân
  getAdvanceBalance: async (patientId) => {
    return apiCall(`api/v1/transactions/patient/${patientId}/advance-balance`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo hóa đơn nội trú
  generateInpatientInvoice: async (invoiceData) => {
    return apiCall('api/v1/payments/generate-invoice', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(invoiceData),
    });
  },

  // Thanh toán hóa đơn nội trú
  processInpatientPayment: async (paymentData) => {
    return apiCall('api/v1/transactions/process-payment', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(paymentData),
    });
  },

  // Hoàn tiền
  processRefund: async (refundData) => {
    return apiCall('api/v1/transactions/process-refund', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(refundData),
    });
  },

  // Lấy danh sách giao dịch theo inpatient stay ID
  getTransactionsByStayId: async (stayId, transactionType = null) => {
    let url = `api/v1/deposits/inpatient-stay/${stayId}/transactions`;
    if (transactionType) {
      url += `?transactionType=${transactionType}`;
    }
    return apiCall(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy hóa đơn theo inpatient stay ID
  getInvoiceByStayId: async (stayId) => {
    return apiCall(`api/v1/invoices/${stayId}`, {
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
  financeEncounterAPI,
  financeInvoiceGenerationAPI,
  financeTransactionAPI,
  financeInpatientAPI,
};

