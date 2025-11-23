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

  // Lấy danh sách đơn thuốc đã ký (SIGNED)
  getSignedPrescriptions: async (page = 0, size = 20) => {
    return apiCall(`api/v1/prescriptions/status/SIGNED?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách đơn thuốc đã cấp phát (DISPENSED)
  getDispensedPrescriptions: async (page = 0, size = 20) => {
    return apiCall(`api/v1/prescriptions/status/DISPENSED?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách đơn thuốc đã cấp phát (DISPENSED)
  // getDispensedPrescriptions: async (page = 0, size = 20) => {
  //   return apiCall(`api/v1/prescriptions/status/DISPENSED?page=${page}&size=${size}`, {
  //     method: 'GET',
  //     headers: {
  //       'Authorization': `Bearer ${getAccessToken()}`,
  //     },
  //   });
  // },

  // Lấy chi tiết đơn thuốc
  getPrescriptionDetail: async (prescriptionId) => {
    return apiCall(`api/v1/pharmacist/prescriptions/${prescriptionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Xác nhận cấp phát đơn thuốc (với data)
  dispensePrescriptionWithData: async (prescriptionId, dispenseData) => {
    return apiCall(`api/v1/pharmacist/prescriptions/${prescriptionId}/dispense`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(dispenseData),
    });
  },

  // Cấp phát đơn thuốc (chuyển trạng thái SIGNED → DISPENSED)
  dispensePrescription: async (prescriptionId) => {
    return apiCall(`api/v1/prescriptions/${prescriptionId}/dispense`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Trả thuốc (Return Medication)
  // Process medication return with proper audit trail
  // API: POST /api/v1/prescriptions/{prescriptionId}/items/{itemId}/return
  returnMedicationItem: async (prescriptionId, itemId, quantity, reason) => {
    const url = `${BASE_URL}api/v1/prescriptions/${prescriptionId}/items/${itemId}/return?quantity=${quantity}&reason=${encodeURIComponent(reason)}`;

    console.log('Return medication API call:', {
      url,
      prescriptionId,
      itemId,
      quantity,
      reason
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Return medication response status:', response.status);
      console.log('Return medication response ok:', response.ok);

      // Try to parse JSON response
      const contentType = response.headers.get('content-type');
      let data = null;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('Return medication response data:', data);
      } else {
        const text = await response.text();
        console.log('Return medication response text:', text);
        data = { message: text };
      }

      // Check if response is successful
      if (!response.ok) {
        throw new Error(data?.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Return medication API error:', error);
      throw error;
    }
  },

  // Lấy lịch sử trả thuốc của đơn thuốc (Get Return History)
  // API: GET /api/v1/prescriptions/{prescriptionId}/return-history
  getReturnHistory: async (prescriptionId) => {
    return apiCall(`api/v1/prescriptions/${prescriptionId}/return-history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy lịch sử thay thế đơn thuốc (Get Replacement Chain)
  getReplacementChain: async (prescriptionId) => {
    return apiCall(`api/v1/prescriptions/${prescriptionId}/replacement-chain`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Quản lý nhà cung cấp
export const pharmacistSupplierAPI = {
  // Lấy danh sách nhà cung cấp
  getSuppliers: async () => {
    return apiCall('api/v1/suppliers', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo nhà cung cấp mới
  createSupplier: async (supplierData) => {
    return apiCall('api/v1/suppliers', {
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

// API Medicines
export const medicineAPI = {
  // Lấy danh sách medicines
  // getMedicines: async (page = 0, size = 100, sort = ['medicineName,asc']) => {
  getMedicines: async (page = 0, size = 100, sort = ['medicineName,asc']) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (sort && sort.length > 0) {
      sort.forEach(s => params.append('sort', s));
    }

    // return apiCall(`api/v1/medicines?${params.toString()}`, {
    return apiCall(`api/v1/medicines`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Medication Order Groups
export const medicationOrderGroupAPI = {
  // Lấy danh sách nhóm y lệnh chờ xác minh
  getPendingVerificationGroups: async () => {
    return apiCall('api/v1/medication-order-groups/pending-verification', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết nhóm y lệnh
  getGroupDetail: async (groupId) => {
    return apiCall(`api/v1/medication-order-groups/${groupId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Phê duyệt nhóm y lệnh
  verifyMedicationOrderGroup: async (groupId, notes) => {
    return apiCall(`api/v1/medication-order-groups/${groupId}/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify({ notes }),
    });
  },

  // Từ chối/Hủy nhóm y lệnh
  cancelMedicationOrderGroup: async (groupId, reason) => {
    return apiCall(`api/v1/medication-order-groups/${groupId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify({ reason }),
    });
  },

  // Chuẩn bị nhóm y lệnh
  prepareMedicationOrderGroup: async (groupId, notes) => {
    return apiCall(`api/v1/medication-order-groups/${groupId}/prepare`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify({ notes }),
    });
  },

  // Tạm dừng nhóm y lệnh
  discontinueMedicationOrderGroup: async (groupId, reason) => {
    return apiCall(`api/v1/medication-order-groups/${groupId}/discontinue`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify({ reason }),
    });
  },

  // Xuất kho nhóm y lệnh
  dispenseMedicationOrderGroup: async (groupId, nurseId, notes) => {
    const params = new URLSearchParams();
    params.append('nurseId', nurseId);
    if (notes) {
      params.append('notes', notes);
    }

    return apiCall(`api/v1/medication-order-groups/${groupId}/dispense?${params.toString()}`, {
      method: 'POST',
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
  medicineAPI,
  medicationOrderGroupAPI,
};

