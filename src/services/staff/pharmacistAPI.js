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

// Hàm helper để lấy employeeId từ employeeAccountId trong localStorage
const getEmployeeId = () => {
  const employeeAccountId = localStorage.getItem('employeeAccountId');
  return employeeAccountId ? parseInt(employeeAccountId) : null;
};

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

// API Quản lý tồn kho (Inventory Lookup)
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
    return apiCall(`/api/v1/inventory-lookup/medicines/search?name=${encodeURIComponent(searchTerm)}`, {
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

  // Lấy danh sách hàng sắp hết (Low Stock)
  getLowStockItems: async () => {
    return apiCall('api/v1/inventory-lookup/low-stock', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách hàng hết hạn/cận date (Expired)
  getExpiredItems: async (daysAhead = 30) => {
    return apiCall(`api/v1/inventory-lookup/expired?daysAhead=${daysAhead}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tìm kiếm theo Barcode
  searchByBarcode: async (barcode) => {
    return apiCall(`api/v1/inventory-lookup/search/barcode?barcode=${barcode}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tìm kiếm vật tư theo tên
  searchMaterialsByName: async (name, limit = 20) => {
    return apiCall(`api/v1/inventory-lookup/materials/search?name=${encodeURIComponent(name)}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết tồn kho vật tư
  getMaterialStockDetails: async (materialId) => {
    return apiCall(`api/v1/inventory-lookup/materials/${materialId}/stock`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy tồn kho theo tủ (Cabinet)
  getStockByCabinet: async (cabinetId) => {
    return apiCall(`api/v1/inventory-lookup/cabinets/${cabinetId}/stock`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy tồn kho theo Khoa phòng (Department)
  getStockByDepartment: async (departmentId) => {
    return apiCall(`api/v1/inventory-lookup/departments/${departmentId}/stock`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy tổng quan tồn kho (Summary)
  getStockSummary: async () => {
    return apiCall('api/v1/inventory-lookup/summary', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy định giá tồn kho (Valuation)
  getStockValuation: async () => {
    return apiCall('api/v1/inventory-lookup/valuation', {
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
  returnMedicationItem: async (prescriptionId, itemId, quantity, reason) => {
    const url = `${BASE_URL}api/v1/prescriptions/${prescriptionId}/items/${itemId}/return?quantity=${quantity}&reason=${encodeURIComponent(reason)}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
          'Content-Type': 'application/json',
        },
      });

      const contentType = response.headers.get('content-type');
      let data = null;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }

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
  getSuppliers: async (searchTerm = '', page = 0, size = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    // Thêm searchTerm nếu có
    if (searchTerm && searchTerm.trim() !== '') {
      params.append('searchTerm', searchTerm.trim());
    }

    return apiCall(`api/v1/suppliers?${params.toString()}`, {
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
  getMedicines: async (keyword = '', page = 0, size = 20, sort = ['medicineName,asc']) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    // Thêm keyword nếu có
    if (keyword && keyword.trim() !== '') {
      params.append('keyword', keyword.trim());
    }

    if (sort && sort.length > 0) {
      sort.forEach(s => params.append('sort', s));
    }

    return apiCall(`api/v1/medicines?${params.toString()}`, {
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
  getCabinetInventory: async (cabinetId) => {
    return apiCall(`api/v1/cabinet-inventory/cabinet/${cabinetId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Cấp phát từ tủ thuốc (Dispense from Cabinet)
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

// ==================== Medication Order Group API ====================
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
    return apiCall(`api/v1/medication-order-groups/${groupId}/cancel?reason=${reason}`, {
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
    return apiCall(`api/v1/medication-order-groups/${groupId}/discontinue?reason=${reason}`, {
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

// ==================== Department API ====================
export const pharmacistDepartmentAPI = {
  // Lấy danh sách khoa phòng
  getDepartments: async (name = '', page = 0, size = 30) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    // Thêm name nếu có
    if (name && name.trim() !== '') {
      params.append('name', name.trim());
    }

    return apiCall(`api/v1/departments?${params.toString()}`, {
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

// ==================== Inventory Movement API ====================
export const pharmacistInventoryMovementAPI = {
  // Record Inventory Movement
  recordMovement: async (movementData) => {
    return apiCall('api/v1/inventory-movements', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(movementData),
    });
  },

  // Reverse Movement
  reverseMovement: async (movementId, reason) => {
    return apiCall(`api/v1/inventory-movements/${movementId}/reverse`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });
  },

  // Get Movement by ID
  getMovementById: async (movementId) => {
    return apiCall(`api/v1/inventory-movements/${movementId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Get Movement History for Stock
  getMovementHistoryForStock: async (stockId, page = 0, size = 20) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    return apiCall(`api/v1/inventory-movements/stock/${stockId}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Get Movements by Date Range
  getMovementsByDateRange: async (startDate, endDate, page = 0, size = 20) => {
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
      page: page.toString(),
      size: size.toString(),
    });

    return apiCall(`api/v1/inventory-movements/date-range?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Get Movements by Reference
  getMovementsByReference: async (referenceType, referenceId, page = 0, size = 20) => {
    const queryParams = new URLSearchParams({
      referenceType,
      referenceId: referenceId.toString(),
      page: page.toString(),
      size: size.toString(),
    });

    return apiCall(`api/v1/inventory-movements/reference?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Get Movements by Patient
  getMovementsByPatient: async (patientId, page = 0, size = 20) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    return apiCall(`api/v1/inventory-movements/patient/${patientId}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Get Movements by Employee
  getMovementsByEmployee: async (employeeId, page = 0, size = 20) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    return apiCall(`api/v1/inventory-movements/employee/${employeeId}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Get Movements by Cabinet
  getMovementsByCabinet: async (cabinetId, page = 0, size = 20) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    return apiCall(`api/v1/inventory-movements/cabinet/${cabinetId}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Get Recent Movements
  getRecentMovements: async (days = 7) => {
    const queryParams = new URLSearchParams({
      days: days.toString(),
    });

    return apiCall(`api/v1/inventory-movements/recent?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Get Movements by Type
  getMovementsByType: async (movementType, page = 0, size = 20) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    return apiCall(`api/v1/inventory-movements/type/${movementType}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Get Reversible Movements
  getReversibleMovements: async (page = 0, size = 20) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    return apiCall(`api/v1/inventory-movements/reversible?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Get High Value Movements
  getHighValueMovements: async (threshold, page = 0, size = 20) => {
    const queryParams = new URLSearchParams({
      threshold: threshold.toString(),
      page: page.toString(),
      size: size.toString(),
    });

    return apiCall(`api/v1/inventory-movements/high-value?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Get Movement Statistics
  getMovementStatistics: async (startDate, endDate) => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    return apiCall(`api/v1/inventory-movements/statistics?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Get Daily Movement Summary
  getDailyMovementSummary: async (startDate, endDate) => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    return apiCall(`api/v1/inventory-movements/daily-summary?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// ==================== Stock Alert API ====================
export const pharmacistStockAlertAPI = {
  // 9.1. Get Alert by ID
  getAlertById: async (alertId) => {
    return apiCall(`api/v1/stock-alerts/${alertId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 9.2. Get Active Alerts
  getActiveAlerts: async () => {
    return apiCall('api/v1/stock-alerts/active', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 9.3. Get Unacknowledged Alerts
  getUnacknowledgedAlerts: async () => {
    return apiCall('api/v1/stock-alerts/unacknowledged', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 9.4. Get Critical Alerts
  getCriticalAlerts: async () => {
    return apiCall('api/v1/stock-alerts/critical', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 9.5. Get Alerts Requiring Immediate Action
  getImmediateActionAlerts: async () => {
    return apiCall('api/v1/stock-alerts/immediate-action', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 9.6. Get Quantity-Related Alerts
  getQuantityRelatedAlerts: async () => {
    return apiCall('api/v1/stock-alerts/quantity-related', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 9.7. Get Expiry-Related Alerts
  getExpiryRelatedAlerts: async () => {
    return apiCall('api/v1/stock-alerts/expiry-related', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 9.8. Get Overdue Alerts
  getOverdueAlerts: async () => {
    return apiCall('api/v1/stock-alerts/overdue', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 9.9. Get Alerts by Type
  getAlertsByType: async (alertType) => {
    return apiCall(`api/v1/stock-alerts/type/${alertType}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 9.10. Get Alerts by Severity
  getAlertsBySeverity: async (severity) => {
    return apiCall(`api/v1/stock-alerts/severity/${severity}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 9.11. Get Alerts by Stock
  getAlertsByStock: async (stockId) => {
    return apiCall(`api/v1/stock-alerts/stock/${stockId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 9.12. Get Alerts by Cabinet
  getAlertsByCabinet: async (cabinetId) => {
    return apiCall(`api/v1/stock-alerts/cabinet/${cabinetId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 9.13. Get Recent Alerts
  getRecentAlerts: async (hours = 24) => {
    return apiCall(`api/v1/stock-alerts/recent?hours=${hours}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 9.14. Search Alerts
  searchAlerts: async (searchTerm) => {
    return apiCall(`api/v1/stock-alerts/search?searchTerm=${encodeURIComponent(searchTerm)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 9.15. Get Alert Statistics
  getAlertStatistics: async () => {
    return apiCall('api/v1/stock-alerts/statistics', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 9.16. Get Alert Dashboard
  getAlertDashboard: async () => {
    return apiCall('api/v1/stock-alerts/dashboard', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 9.17. Acknowledge Alert (Ghi nhận cảnh báo đơn)
  // POST /api/v1/stock-alerts/acknowledge
  acknowledgeAlert: async (alertId, notes, actionTaken) => {
    const employeeId = getEmployeeId();
    return apiCall('api/v1/stock-alerts/acknowledge', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        alertId,
        employeeId,
        notes,
        actionTaken
      }),
    });
  },

  // 9.18. Resolve Alert (Xử lý xong cảnh báo đơn)
  // POST /api/v1/stock-alerts/resolve
  resolveAlert: async (alertId, resolutionNotes) => {
    const employeeId = getEmployeeId();
    return apiCall('api/v1/stock-alerts/resolve', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        alertId,
        employeeId,
        resolutionNotes
      }),
    });
  },

  // 9.19. Acknowledge Multiple Alerts (Ghi nhận nhiều cảnh báo)
  // POST /api/v1/stock-alerts/acknowledge-multiple?notes={notes}
  acknowledgeMultipleAlerts: async (alertIds, notes) => {
    const employeeId = getEmployeeId();
    return apiCall(`api/v1/stock-alerts/acknowledge-multiple?notes=${encodeURIComponent(notes)}&employeeId=${employeeId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alertIds),
    });
  },

  // 9.20. Resolve Multiple Alerts (Xử lý xong nhiều cảnh báo)
  // POST /api/v1/stock-alerts/resolve-multiple?notes={notes}
  resolveMultipleAlerts: async (alertIds, notes) => {
    const employeeId = getEmployeeId();
    return apiCall(`api/v1/stock-alerts/resolve-multiple?notes=${encodeURIComponent(notes)}&employeeId=${employeeId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alertIds),
    });
  },
};

// ==================== Drug Interaction API ====================
export const pharmacistInteractionAPI = {
  // 1. Lấy chi tiết tương tác theo ID
  // GET /api/v1/drug-interactions/{interactionId}
  getInteractionById: async (interactionId) => {
    return apiCall(`api/v1/drug-interactions/${interactionId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 2. Lấy tất cả tương tác đang hoạt động
  // GET /api/v1/drug-interactions/active
  getAllActiveInteractions: async () => {
    return apiCall('api/v1/drug-interactions/active', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 3. Lấy tương tác theo mức độ nghiêm trọng
  // GET /api/v1/drug-interactions/severity/{severityLevel}
  getInteractionsBySeverity: async (severityLevel) => {
    return apiCall(`api/v1/drug-interactions/severity/${severityLevel}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 4. Lấy tương tác liên quan đến một thuốc cụ thể
  // GET /api/v1/drug-interactions/medicine/{medicineId}
  getInteractionsByMedicine: async (medicineId) => {
    return apiCall(`api/v1/drug-interactions/medicine/${medicineId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 5. Tìm kiếm tương tác
  // GET /api/v1/drug-interactions/search?searchTerm=...
  searchInteractions: async (searchTerm) => {
    return apiCall(`api/v1/drug-interactions/search?searchTerm=${encodeURIComponent(searchTerm)}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 6. Xóa tương tác
  // DELETE /api/v1/drug-interactions/{interactionId}
  deleteInteraction: async (interactionId) => {
    return apiCall(`api/v1/drug-interactions/${interactionId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },
  // POST /api/v1/drug-interactions/check
  checkInteractions: async (medicineIds, patientId = null) => {
    const body = {
      medicineIds: medicineIds,
      patientId: patientId
    };
    return apiCall('api/v1/drug-interactions/check', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
      body: JSON.stringify(body),
    });
  },
  // 8. Tạo mới tương tác thuốc
  // POST /api/v1/drug-interactions
  createInteraction: async (data) => {
    return apiCall('api/v1/drug-interactions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
      body: JSON.stringify(data),
    });
  },

  // 9. Cập nhật tương tác thuốc
  // PUT /api/v1/drug-interactions/{interactionId}
  updateInteraction: async (interactionId, data) => {
    return apiCall(`api/v1/drug-interactions/${interactionId}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
      body: JSON.stringify(data),
    });
  },
  // 10. Kiểm tra an toàn nhanh (Quick Safety Check)
  // POST /api/v1/drug-interactions/safety-check
  quickSafetyCheck: async (medicineIds) => {
    return apiCall('api/v1/drug-interactions/safety-check', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
      body: JSON.stringify(medicineIds),
    });
  },

  // 11. Kiểm tra tương tác giữa 2 thuốc cụ thể
  // GET /api/v1/drug-interactions/check-between
  checkInteractionBetween: async (id1, id2) => {
    return apiCall(`api/v1/drug-interactions/check-between?medicine1Id=${id1}&medicine2Id=${id2}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 12. Lấy các tương tác Chống chỉ định từ danh sách
  // POST /api/v1/drug-interactions/contraindicated
  getContraindicatedInteractions: async (medicineIds) => {
    return apiCall('api/v1/drug-interactions/contraindicated', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
      body: JSON.stringify(medicineIds),
    });
  },

  // 13. Lấy các tương tác Nghiêm trọng (Major) từ danh sách
  // POST /api/v1/drug-interactions/major
  getMajorInteractions: async (medicineIds) => {
    return apiCall('api/v1/drug-interactions/major', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
      body: JSON.stringify(medicineIds),
    });
  },
  // 14. Lấy thống kê tổng quan
  // GET /api/v1/drug-interactions/statistics
  getInteractionStatistics: async () => {
    return apiCall('api/v1/drug-interactions/statistics', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 15. Lấy số lượng theo mức độ nghiêm trọng
  // GET /api/v1/drug-interactions/count-by-severity
  getInteractionCountBySeverity: async () => {
    return apiCall('api/v1/drug-interactions/count-by-severity', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 16. Lấy các tương tác gần đây
  // GET /api/v1/drug-interactions/recent?limit=...
  getRecentInteractions: async (limit = 10) => {
    return apiCall(`api/v1/drug-interactions/recent?limit=${limit}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 17. Import tương tác hàng loạt
  // POST /api/v1/drug-interactions/bulk-import
  bulkImportInteractions: async (data) => {
    return apiCall('api/v1/drug-interactions/bulk-import', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
      body: JSON.stringify(data),
    });
  },

  // 18. Khôi phục tương tác đã xóa
  // PUT /api/v1/drug-interactions/{interactionId}/restore
  restoreInteraction: async (interactionId) => {
    return apiCall(`api/v1/drug-interactions/${interactionId}/restore`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 19. Lấy danh sách tương tác đã xóa
  // GET /api/v1/drug-interactions/deleted?page=...&size=...
  getDeletedInteractions: async (page = 0, size = 10) => {
    return apiCall(`api/v1/drug-interactions/deleted?page=${page}&size=${size}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 20. Lấy danh sách tương tác đang hoạt động (Phân trang)
  // GET /api/v1/drug-interactions/active/paginated?page=...&size=...
  getActiveInteractionsPaginated: async (page = 0, size = 10) => {
    return apiCall(`api/v1/drug-interactions/active/paginated?page=${page}&size=${size}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 21. Lấy thống kê Soft Delete
  // GET /api/v1/drug-interactions/stats/soft-delete
  getSoftDeleteStatistics: async () => {
    return apiCall('api/v1/drug-interactions/stats/soft-delete', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },
};

// ==================== [NEW] Medical Supply API ====================
export const pharmacistMedicalSupplyAPI = {
  // 0. Lấy danh sách tất cả Medical Supplies (có phân trang)
  // GET /api/v1/medical-supplies?page=0&size=10&status=&type=&priority=
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.size !== undefined) queryParams.append('size', params.size);
    if (params.status) queryParams.append('status', params.status);
    if (params.type) queryParams.append('type', params.type);
    if (params.priority) queryParams.append('priority', params.priority);

    const queryString = queryParams.toString();
    const url = queryString ? `api/v1/medical-supplies?${queryString}` : 'api/v1/medical-supplies';

    return apiCall(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 1. Lấy chi tiết đơn vật tư theo ID
  // GET /api/v1/medical-supplies/{prescriptionId}
  getPrescriptionById: async (prescriptionId) => {
    return apiCall(`api/v1/medical-supplies/${prescriptionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 2. Lấy danh sách đơn vật tư theo Bệnh nhân
  // GET /api/v1/medical-supplies/patient/{patientId}
  getPrescriptionsByPatient: async (patientId) => {
    return apiCall(`api/v1/medical-supplies/patient/${patientId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 3. Lấy danh sách đơn vật tư theo Lượt khám (Encounter)
  // GET /api/v1/medical-supplies/encounter/{encounterId}
  getPrescriptionsByEncounter: async (encounterId) => {
    return apiCall(`api/v1/medical-supplies/encounter/${encounterId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 4. Tìm kiếm vật tư y tế
  // GET /api/v1/medical-supplies/search?query=...&limit=...
  searchSupplies: async (query, limit = 20) => {
    const params = new URLSearchParams({
      query: query,
      limit: limit.toString()
    });
    
    return apiCall(`api/v1/medical-supplies/search?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 5. Lấy danh sách danh mục vật tư
  // GET /api/v1/medical-supplies/categories
  getCategories: async () => {
    return apiCall('api/v1/medical-supplies/categories', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 6. Lấy vật tư theo danh mục
  // GET /api/v1/medical-supplies/category/{category}
  getSuppliesByCategory: async (category) => {
    return apiCall(`api/v1/medical-supplies/category/${encodeURIComponent(category)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
  // 7. Duyệt đơn vật tư
  // POST /api/v1/medical-supplies/{prescriptionId}/approve
  approvePrescription: async (prescriptionId) => {
    return apiCall(`api/v1/medical-supplies/${prescriptionId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 8. Từ chối đơn vật tư
  // POST /api/v1/medical-supplies/{prescriptionId}/reject?reason=...
  rejectPrescription: async (prescriptionId, reason) => {
    // Encode reason để đảm bảo URL hợp lệ (xử lý ký tự đặc biệt, khoảng trắng)
    const params = new URLSearchParams({ reason });
    return apiCall(`api/v1/medical-supplies/${prescriptionId}/reject?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
  // 9. Cấp phát vật tư (Dispense)
  // POST /api/v1/medical-supplies/{prescriptionId}/dispense?notes=...
  dispensePrescription: async (prescriptionId, notes = '') => {
    const params = new URLSearchParams();
    if (notes) params.append('notes', notes);
    
    return apiCall(`api/v1/medical-supplies/${prescriptionId}/dispense?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 10. Hủy đơn vật tư (Cancel)
  // POST /api/v1/medical-supplies/{prescriptionId}/cancel?reason=...
  cancelPrescription: async (prescriptionId, reason) => {
    const params = new URLSearchParams({ reason });
    return apiCall(`api/v1/medical-supplies/${prescriptionId}/cancel?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
  // 11. Xem trạng thái tồn kho chi tiết của vật tư
  // GET /api/v1/medical-supplies/{supplyId}/stock
  getSupplyStockStatus: async (supplyId) => {
    return apiCall(`api/v1/medical-supplies/${supplyId}/stock`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 12. Xem lịch sử đơn vật tư
  // GET /api/v1/medical-supplies/history?patientId=...&startDate=...
  getPrescriptionHistory: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.patientId) params.append('patientId', filters.patientId);
    if (filters.doctorId) params.append('doctorId', filters.doctorId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    return apiCall(`api/v1/medical-supplies/history?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 13. Lấy danh sách vật tư thường dùng
  // GET /api/v1/medical-supplies/frequent?limit=...
  getFrequentlyUsedSupplies: async (limit = 10) => {
    return apiCall(`api/v1/medical-supplies/frequent?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 14. Lấy thống kê sử dụng vật tư
  // GET /api/v1/medical-supplies/statistics?startDate=...
  getSupplyStatistics: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.departmentId) params.append('departmentId', filters.departmentId);

    return apiCall(`api/v1/medical-supplies/statistics?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
  // 15. Lấy danh sách Vật tư đã xóa (Thùng rác)
  // GET /api/v1/medical-supplies/materials/deleted
  getDeletedMaterials: async (page = 0, size = 20, sort = "materialName,asc") => {
    const params = new URLSearchParams({ page, size, sort });
    return apiCall(`api/v1/medical-supplies/materials/deleted?${params.toString()}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 16. Lấy danh sách Vật tư đang hoạt động
  // GET /api/v1/medical-supplies/materials/active
  getActiveMaterials: async (page = 0, size = 20) => {
    const params = new URLSearchParams({ page, size });
    return apiCall(`api/v1/medical-supplies/materials/active?${params.toString()}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 17. Lấy danh sách Thuốc đã xóa (Thùng rác)
  // GET /api/v1/medical-supplies/medicines/deleted
  getDeletedMedicines: async (page = 0, size = 20) => {
    const params = new URLSearchParams({ page, size });
    return apiCall(`api/v1/medical-supplies/medicines/deleted?${params.toString()}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 18. Lấy danh sách Thuốc đang hoạt động
  // GET /api/v1/medical-supplies/medicines/active
  getActiveMedicines: async (page = 0, size = 20) => {
    const params = new URLSearchParams({ page, size });
    return apiCall(`api/v1/medical-supplies/medicines/active?${params.toString()}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 19. Lấy thống kê Soft Delete
  // GET /api/v1/medical-supplies/stats/soft-delete
  getSoftDeleteStatistics: async () => {
    return apiCall('api/v1/medical-supplies/stats/soft-delete', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },
  // 20. Khôi phục Vật tư đã xóa
  // PUT /api/v1/medical-supplies/materials/{id}/restore
  restoreMaterial: async (id) => {
    return apiCall(`api/v1/medical-supplies/materials/${id}/restore`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 21. Khôi phục Thuốc đã xóa
  // PUT /api/v1/medical-supplies/medicines/{id}/restore
  restoreMedicine: async (id) => {
    return apiCall(`api/v1/medical-supplies/medicines/${id}/restore`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },
};
export const goodsIssueAPI = {
  // 1. Tạo phiếu xuất kho mới
  // POST /api/v1/goods-issues
  create: async (data) => {
    return apiCall('api/v1/goods-issues', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
      body: JSON.stringify(data),
    });
  },

  // 2. Lấy chi tiết phiếu xuất kho
  // GET /api/v1/goods-issues/{id}
  getById: async (id) => {
    return apiCall(`api/v1/goods-issues/${id}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 3. Lấy danh sách phiếu xuất kho
  // GET /api/v1/goods-issues
  getAll: async () => {
    return apiCall('api/v1/goods-issues', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 4. Cập nhật phiếu xuất kho (chỉ DRAFT)
  // PUT /api/v1/goods-issues/{id}
  update: async (id, data) => {
    return apiCall(`api/v1/goods-issues/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
      body: JSON.stringify(data),
    });
  },

  // 5. Xóa phiếu xuất kho (chỉ DRAFT)
  // DELETE /api/v1/goods-issues/{id}
  delete: async (id) => {
    return apiCall(`api/v1/goods-issues/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 6. Duyệt phiếu xuất kho (DRAFT → APPROVED)
  // POST /api/v1/goods-issues/{id}/approve
  approve: async (id) => {
    return apiCall(`api/v1/goods-issues/${id}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 7. Hoàn thành phiếu xuất kho (APPROVED → COMPLETED)
  // POST /api/v1/goods-issues/{id}/complete
  complete: async (id) => {
    return apiCall(`api/v1/goods-issues/${id}/complete`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 8. Hủy phiếu xuất kho (any status → CANCELLED)
  // POST /api/v1/goods-issues/{id}/cancel
  cancel: async (id) => {
    return apiCall(`api/v1/goods-issues/${id}/cancel`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 9. Lọc theo Status
  // GET /api/v1/goods-issues/status/{status}
  getByStatus: async (status) => {
    return apiCall(`api/v1/goods-issues/status/${status}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 10. Lọc theo Type
  // GET /api/v1/goods-issues/type/{issueType}
  getByType: async (issueType) => {
    return apiCall(`api/v1/goods-issues/type/${issueType}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 11. Lọc theo Department
  // GET /api/v1/goods-issues/department/{departmentId}
  getByDepartment: async (departmentId) => {
    return apiCall(`api/v1/goods-issues/department/${departmentId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 12. Lọc theo Patient
  // GET /api/v1/goods-issues/patient/{patientId}
  getByPatient: async (patientId) => {
    return apiCall(`api/v1/goods-issues/patient/${patientId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 13. Lọc theo Date Range
  // GET /api/v1/goods-issues/date-range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
  getByDateRange: async (startDate, endDate) => {
    return apiCall(`api/v1/goods-issues/date-range?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 14. Tìm kiếm phiếu xuất kho
  // GET /api/v1/goods-issues/search?keyword=...
  search: async (keyword) => {
    return apiCall(`api/v1/goods-issues/search?keyword=${encodeURIComponent(keyword)}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 15. Thống kê phiếu xuất kho
  // GET /api/v1/goods-issues/statistics?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
  getStatistics: async (startDate, endDate) => {
    return apiCall(`api/v1/goods-issues/statistics?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 16. Lấy phiếu đang chờ duyệt
  // GET /api/v1/goods-issues/pending-approval?hours=24
  getPendingApproval: async (hours = 24) => {
    return apiCall(`api/v1/goods-issues/pending-approval?hours=${hours}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 17. Lấy phiếu đang chờ hoàn thành
  // GET /api/v1/goods-issues/pending-completion?hours=24
  getPendingCompletion: async (hours = 24) => {
    return apiCall(`api/v1/goods-issues/pending-completion?hours=${hours}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },
};

// =============================================
// STOCK TAKING API - Kiểm kê hàng tồn kho (20 endpoints)
// =============================================
export const stockTakingAPI = {
  // 14.1. Tạo phiếu kiểm kê mới (DRAFT status)
  // POST /api/v1/stock-takings
  create: async (data) => {
    return apiCall('api/v1/stock-takings', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getAccessToken()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // 14.2. Lấy chi tiết phiếu kiểm kê
  // GET /api/v1/stock-takings/{id}
  getById: async (id) => {
    return apiCall(`api/v1/stock-takings/${id}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 14.3. Lấy danh sách phiếu kiểm kê
  // GET /api/v1/stock-takings
  getAll: async () => {
    return apiCall('api/v1/stock-takings', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 14.4. Cập nhật phiếu kiểm kê (DRAFT only)
  // PUT /api/v1/stock-takings/{id}
  update: async (id, data) => {
    return apiCall(`api/v1/stock-takings/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${getAccessToken()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // 14.5. Xóa phiếu kiểm kê (DRAFT only - soft delete)
  // DELETE /api/v1/stock-takings/{id}
  delete: async (id) => {
    return apiCall(`api/v1/stock-takings/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 14.6. Bắt đầu kiểm kê (DRAFT → IN_PROGRESS)
  // POST /api/v1/stock-takings/{id}/start
  start: async (id) => {
    return apiCall(`api/v1/stock-takings/${id}/start`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 14.7. Hoàn thành kiểm kê (IN_PROGRESS → COMPLETED)
  // POST /api/v1/stock-takings/{id}/complete
  complete: async (id) => {
    return apiCall(`api/v1/stock-takings/${id}/complete`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 14.8. Áp dụng điều chỉnh (COMPLETED → create InventoryMovements)
  // POST /api/v1/stock-takings/{id}/apply-adjustments
  applyAdjustments: async (id) => {
    return apiCall(`api/v1/stock-takings/${id}/apply-adjustments`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 14.9. Hủy phiếu kiểm kê (any status → CANCELLED)
  // POST /api/v1/stock-takings/{id}/cancel
  cancel: async (id) => {
    return apiCall(`api/v1/stock-takings/${id}/cancel`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 14.10. Lấy danh sách theo trạng thái
  // GET /api/v1/stock-takings/status/{status}
  getByStatus: async (status) => {
    return apiCall(`api/v1/stock-takings/status/${status}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 14.11. Lấy danh sách theo loại
  // GET /api/v1/stock-takings/type/{type}
  getByType: async (type) => {
    return apiCall(`api/v1/stock-takings/type/${type}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 14.12. Lấy danh sách theo tủ thuốc
  // GET /api/v1/stock-takings/cabinet/{cabinetId}
  getByCabinet: async (cabinetId) => {
    return apiCall(`api/v1/stock-takings/cabinet/${cabinetId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 14.13. Lấy danh sách theo khoảng thời gian
  // GET /api/v1/stock-takings/date-range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
  getByDateRange: async (startDate, endDate) => {
    return apiCall(`api/v1/stock-takings/date-range?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 14.14. Lấy danh sách kiểm kê gần đây
  // GET /api/v1/stock-takings/recent?days={days}
  getRecent: async (days = 30) => {
    return apiCall(`api/v1/stock-takings/recent?days=${days}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 14.15. Tìm kiếm phiếu kiểm kê
  // GET /api/v1/stock-takings/search?keyword={keyword}
  search: async (keyword) => {
    return apiCall(`api/v1/stock-takings/search?keyword=${encodeURIComponent(keyword)}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 14.16. Lấy danh sách có chênh lệch
  // GET /api/v1/stock-takings/with-variance
  getWithVariance: async () => {
    return apiCall('api/v1/stock-takings/with-variance', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 14.17. Lấy danh sách chờ điều chỉnh
  // GET /api/v1/stock-takings/pending-adjustments
  getPendingAdjustments: async () => {
    return apiCall('api/v1/stock-takings/pending-adjustments', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 14.18. Thống kê kiểm kê
  // GET /api/v1/stock-takings/statistics?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
  getStatistics: async (startDate, endDate) => {
    return apiCall(`api/v1/stock-takings/statistics?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 14.19. Phân tích chênh lệch
  // GET /api/v1/stock-takings/{id}/variance-analysis
  getVarianceAnalysis: async (id) => {
    return apiCall(`api/v1/stock-takings/${id}/variance-analysis`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
    });
  },

  // 14.20. Lấy danh sách quá hạn
  // GET /api/v1/stock-takings/overdue?days={days}
  getOverdue: async (days = 7) => {
    return apiCall(`api/v1/stock-takings/overdue?days=${days}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${getAccessToken()}` },
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
  medicationOrderGroupAPI,
  pharmacistDepartmentAPI,
  pharmacistEmployeeAPI,
  pharmacistPatientAPI,
  pharmacistInventoryMovementAPI,
  pharmacistStockAlertAPI,
  pharmacistInteractionAPI,
  pharmacistMedicalSupplyAPI,
  goodsIssueAPI,
  stockTakingAPI,
};