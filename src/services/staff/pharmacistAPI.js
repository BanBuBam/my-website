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
  getDispensedPrescriptions: async (page = 0, size = 20) => {
    return apiCall(`api/v1/prescriptions/status/DISPENSED?page=${page}&size=${size}`, {
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

// ==================== Cabinet Management API ====================
export const pharmacistCabinetAPI = {
  // Tạo tủ mới (Create Cabinet)
  createCabinet: async (cabinetData) => {
    return apiCall('api/v1/cabinet-management', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cabinetData),
    });
  },

  // Cập nhật tủ (Update Cabinet)
  updateCabinet: async (cabinetId, cabinetData) => {
    return apiCall(`api/v1/cabinet-management/${cabinetId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cabinetData),
    });
  },

  // Lấy thông tin tủ theo ID (Get Cabinet by ID)
  getCabinetById: async (cabinetId) => {
    return apiCall(`api/v1/cabinet-management/${cabinetId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy tất cả tủ với phân trang (Get All Cabinets)
  getAllCabinets: async (page = 0, size = 20) => {
    return apiCall(`api/v1/cabinet-management?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy tủ theo khoa phòng (Get Cabinets by Department)
  getCabinetsByDepartment: async (departmentId) => {
    return apiCall(`api/v1/cabinet-management/department/${departmentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Gán người chịu trách nhiệm (Assign Responsible Employee)
  assignResponsibleEmployee: async (cabinetId, employeeId) => {
    return apiCall(`api/v1/cabinet-management/${cabinetId}/assign?employeeId=${employeeId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Khóa/Mở khóa tủ (Lock/Unlock Cabinet)
  lockUnlockCabinet: async (cabinetId, locked) => {
    return apiCall(`api/v1/cabinet-management/${cabinetId}/lock?lock=${locked}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Thiết lập mức đặt hàng lại (Set Reorder Levels)
  setReorderLevels: async (cabinetId, reorderData) => {
    return apiCall(`api/v1/cabinet-management/${cabinetId}/reorder-levels`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reorderData),
    });
  },

  // Ngừng hoạt động tủ (Deactivate Cabinet)
  deactivateCabinet: async (cabinetId, reason) => {
    return apiCall(`api/v1/cabinet-management/${cabinetId}/deactivate?reason=${encodeURIComponent(reason)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy lịch sử truy cập tủ (Get Cabinet Access Log)
  getCabinetAccessLog: async (cabinetId, startDate = null, endDate = null) => {
    let url = `api/v1/cabinet-management/${cabinetId}/access-log`;
    const params = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    return apiCall(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy cảnh báo của tủ (Get Cabinet Alerts)
  getCabinetAlerts: async (cabinetId) => {
    return apiCall(`api/v1/cabinet-management/${cabinetId}/alerts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo báo cáo tủ (Generate Cabinet Report)
  generateCabinetReport: async (cabinetId, reportType, startDate = null, endDate = null) => {
    let url = `api/v1/cabinet-management/${cabinetId}/report?reportType=${reportType}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;

    return apiCall(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy lịch trình bảo trì (Get Cabinet Maintenance)
  getCabinetMaintenance: async (cabinetId) => {
    return apiCall(`api/v1/cabinet-management/${cabinetId}/maintenance`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lên lịch bảo trì (Schedule Cabinet Maintenance)
  scheduleCabinetMaintenance: async (cabinetId, maintenanceType, scheduledDate, notes = '') => {
    let url = `api/v1/cabinet-management/${cabinetId}/schedule-maintenance?maintenanceType=${maintenanceType}&scheduledDate=${scheduledDate}`;
    if (notes) url += `&notes=${encodeURIComponent(notes)}`;

    return apiCall(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy tồn kho của tủ (Get Cabinet Inventory)
  // API: GET /api/v1/cabinet-inventory/{cabinetId}
  getCabinetInventory: async (cabinetId) => {
    return apiCall(`api/v1/cabinet-inventory/cabinet/${cabinetId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Cấp phát từ tủ thuốc (Dispense from Cabinet)
  // API: POST /api/v1/cabinet-inventory/dispense
  dispenseFromCabinet: async (dispenseData) => {
    return apiCall('api/v1/cabinet-inventory/dispense', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dispenseData),
    });
  },

  // Bổ sung tồn kho tủ (Restock Cabinet)
  // API: POST /api/v1/cabinet-inventory/cabinet/{cabinetId}/restock
  // Required Permission: cabinet.restock
  restockCabinet: async (cabinetId, restockData) => {
    return apiCall(`api/v1/cabinet-inventory/cabinet/${cabinetId}/restock`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(restockData),
    });
  },
};

// ==================== Department API ====================
export const pharmacistDepartmentAPI = {
  // Lấy danh sách khoa phòng
  getDepartments: async () => {
    return apiCall('api/v1/departments', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// ==================== Employee API ====================
export const pharmacistEmployeeAPI = {
  // Lấy danh sách nhân viên theo khoa phòng
  getEmployeesByDepartment: async (departmentId) => {
    return apiCall(`api/v1/employees/department/${departmentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// ==================== Patient API ====================
export const pharmacistPatientAPI = {
  // Tìm kiếm bệnh nhân
  searchPatient: async (searchTerm) => {
    return apiCall(`api/v1/patients/search?q=${encodeURIComponent(searchTerm)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy thông tin bệnh nhân
  getPatientById: async (patientId) => {
    return apiCall(`api/v1/patients/${patientId}`, {
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
  medicineAPI,
  pharmacistCabinetAPI,
  pharmacistDepartmentAPI,
  pharmacistEmployeeAPI,
  pharmacistPatientAPI,
};

