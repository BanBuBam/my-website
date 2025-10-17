// API cho Dược sĩ
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
const getAccessToken = () => localStorage.getItem('pharmacistAccessToken');
const getRefreshToken = () => localStorage.getItem('pharmacistRefreshToken');

// Hàm helper để lưu token
export const saveTokens = (accessToken, refreshToken) => {
  localStorage.setItem('pharmacistAccessToken', accessToken);
  localStorage.setItem('pharmacistRefreshToken', refreshToken);
};

// Hàm helper để xóa token
export const clearTokens = () => {
  localStorage.removeItem('pharmacistAccessToken');
  localStorage.removeItem('pharmacistRefreshToken');
};

// API Authentication cho Dược sĩ
export const pharmacistAuthAPI = {
  // Đăng nhập
  login: async (email, password) => {
    const response = await apiCall('api/v1/pharmacist/auth/login', {
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
    return apiCall('api/v1/pharmacist/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Dashboard
export const pharmacistDashboardAPI = {
  // Lấy thống kê dashboard
  getStatistics: async () => {
    return apiCall('api/v1/pharmacist/dashboard/statistics', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Quản lý tồn kho
export const pharmacistInventoryAPI = {
  // Lấy danh sách thuốc tồn kho
  getInventory: async () => {
    return apiCall('api/v1/pharmacist/inventory', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tìm kiếm thuốc
  searchMedicine: async (searchTerm) => {
    return apiCall(`api/v1/pharmacist/inventory/search?q=${encodeURIComponent(searchTerm)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết thuốc
  getMedicineDetail: async (medicineId) => {
    return apiCall(`api/v1/pharmacist/inventory/${medicineId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Nhập kho
export const pharmacistImportAPI = {
  // Tạo phiếu nhập kho
  createImport: async (importData) => {
    return apiCall('api/v1/pharmacist/imports', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(importData),
    });
  },

  // Lấy danh sách phiếu nhập kho
  getImports: async () => {
    return apiCall('api/v1/pharmacist/imports', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết phiếu nhập kho
  getImportDetail: async (importId) => {
    return apiCall(`api/v1/pharmacist/imports/${importId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Xuất kho
export const pharmacistExportAPI = {
  // Tạo phiếu xuất kho
  createExport: async (exportData) => {
    return apiCall('api/v1/pharmacist/exports', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(exportData),
    });
  },

  // Lấy danh sách phiếu xuất kho
  getExports: async () => {
    return apiCall('api/v1/pharmacist/exports', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết phiếu xuất kho
  getExportDetail: async (exportId) => {
    return apiCall(`api/v1/pharmacist/exports/${exportId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Cấp phát đơn thuốc
export const pharmacistPrescriptionAPI = {
  // Lấy danh sách đơn thuốc chờ cấp phát
  getPendingPrescriptions: async () => {
    return apiCall('api/v1/pharmacist/prescriptions/pending', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết đơn thuốc
  getPrescriptionDetail: async (prescriptionId) => {
    return apiCall(`api/v1/pharmacist/prescriptions/${prescriptionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Xác nhận cấp phát đơn thuốc
  dispensePrescription: async (prescriptionId, dispenseData) => {
    return apiCall(`api/v1/pharmacist/prescriptions/${prescriptionId}/dispense`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(dispenseData),
    });
  },
};

// API Quản lý nhà cung cấp
export const pharmacistSupplierAPI = {
  // Lấy danh sách nhà cung cấp
  getSuppliers: async () => {
    return apiCall('api/v1/pharmacist/suppliers', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo nhà cung cấp mới
  createSupplier: async (supplierData) => {
    return apiCall('api/v1/pharmacist/suppliers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(supplierData),
    });
  },

  // Cập nhật nhà cung cấp
  updateSupplier: async (supplierId, supplierData) => {
    return apiCall(`api/v1/pharmacist/suppliers/${supplierId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(supplierData),
    });
  },
};

// API Quản lý hạn sử dụng
export const pharmacistExpiryAPI = {
  // Lấy danh sách thuốc sắp hết hạn
  getExpiringMedicines: async (days = 30) => {
    return apiCall(`api/v1/pharmacist/expiry?days=${days}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

export default {
  pharmacistAuthAPI,
  pharmacistDashboardAPI,
  pharmacistInventoryAPI,
  pharmacistImportAPI,
  pharmacistExportAPI,
  pharmacistPrescriptionAPI,
  pharmacistSupplierAPI,
  pharmacistExpiryAPI,
};

