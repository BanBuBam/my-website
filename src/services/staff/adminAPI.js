// API cho Quản lý / Admin
const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://100.99.181.59:8081/';

// Hàm helper để gọi API
const apiCall = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;

  // Chỉ thêm Content-Type nếu có body
  const defaultHeaders = {};
  if (options.body) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
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

const getAccessToken = () => localStorage.getItem('hrAccessToken');
const getRefreshToken = () => localStorage.getItem('hrRefreshToken');

// Hàm helper để lưu token
export const saveTokens = (accessToken, refreshToken) => {
  localStorage.setItem('hrAccessToken', accessToken);
  localStorage.setItem('hrRefreshToken', refreshToken);
};

// Hàm helper để xóa token
export const clearTokens = () => {
  localStorage.removeItem('hrAccessToken');
  localStorage.removeItem('hrRefreshToken');
};

// API Authentication cho Admin
export const adminAuthAPI = {
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
export const adminDashboardAPI = {
  // Lấy dashboard data cho Admin
  getDashboard: async () => {
    return apiCall('api/v1/dashboard/admin', {
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
export const adminEmployeeAPI = {
  // Lấy danh sách nhân viên
  getEmployees: async (name = '', page = 0, size = 10, additionalParams = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...additionalParams,
    });

    // Thêm name nếu có
    if (name && name.trim() !== '') {
      params.append('name', name.trim());
    }

    return apiCall(`api/v1/employees?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách nhân viên theo khoa phòng (Get Employees by Department)
  // API: GET /api/v1/employees/department/{departmentId}
  getEmployeesByDepartment: async (departmentId) => {
    // Validate departmentId is a valid number
    const deptId = parseInt(departmentId, 10);
    if (isNaN(deptId)) {
      throw new Error(`Invalid departmentId: ${departmentId}`);
    }

    return apiCall(`api/v1/employees/department/${deptId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Legacy API - Lấy danh sách nhân viên (admin endpoint)
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
  createEmployee: async (employeeData) => {
    return apiCall('api/v1/employees', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employeeData),
    });
  },

  // Legacy API - Tạo nhân viên mới
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
  getDepartments: async (name = '', page = 0, size = 10) => {
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

// API Quản lý phòng khám
export const adminClinicAPI = {
  // Lấy danh sách phòng khám
  getClinics: async (keyword = '', page = 0, size = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    // Thêm keyword nếu có
    if (keyword && keyword.trim() !== '') {
      params.append('keyword', keyword.trim());
    }

    return apiCall(`api/v1/clinics?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách bác sĩ theo phòng khám
  getDoctorsByClinic: async (clinicId) => {
    return apiCall(`api/v1/clinics/${clinicId}/doctors`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Quản lý lịch làm việc bác sĩ
export const adminDoctorScheduleAPI = {
  // Lấy danh sách bác sĩ theo role
  getDoctorsByRole: async (role = 'DOCTOR', page = 0, size = 100) => {
    return apiCall(`api/v1/employees/role/${role}?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo lịch làm việc bác sĩ
  createDoctorSchedule: async (scheduleData) => {
    return apiCall('api/v1/doctor-schedules', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scheduleData),
    });
  },

  // Lấy danh sách lịch làm việc bác sĩ
  getDoctorSchedules: async (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const endpoint = queryString ? `api/v1/doctor-schedules?${queryString}` : 'api/v1/doctor-schedules';
    return apiCall(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách lịch làm việc theo bác sĩ
  getDoctorSchedulesByDoctor: async (doctorId) => {
    return apiCall(`api/v1/doctor-schedules/doctor/${doctorId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
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

// API Quản lý Role và Permission
export const adminRoleAPI = {
  // Lấy tất cả các role
  getRoles: async () => {
    return apiCall('api/v1/roles', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy permissions của một role
  getRolePermissions: async (roleId) => {
    return apiCall(`api/v1/roles/${roleId}/permissions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo role mới
  createRole: async (roleData) => {
    return apiCall('api/v1/roles', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(roleData),
    });
  },

  // Cấp quyền cho employee
  grantPermission: async (employeeId, permissionData) => {
    return apiCall(`api/v1/employees/${employeeId}/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(permissionData),
    });
  },

  // Loại bỏ quyền của employee
  revokePermission: async (employeeId, permissionId) => {
    return apiCall(`api/v1/employees/${employeeId}/permissions/${permissionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Quản lý yêu cầu nhập viện (Admission Requests)
export const adminAdmissionRequestAPI = {
  // Tạo yêu cầu nhập viện
  createAdmissionRequest: async (requestData) => {
    return apiCall('api/v1/admission-requests', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(requestData),
    });
  },
  
  getAllRequests: async (page = 0, size = 10) => {
    // Lưu ý: Backend Spring Boot thường dùng query params: ?page=0&size=10
    return apiCall(`api/v1/admission-requests?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách yêu cầu chờ xác nhận
  getPendingRequests: async () => {
    return apiCall('api/v1/admission-requests/pending', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách yêu cầu cấp cứu
  getEmergencyRequests: async () => {
    return apiCall('api/v1/admission-requests/emergency', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách yêu cầu ưu tiên cao
  getHighPriorityRequests: async () => {
    return apiCall('api/v1/admission-requests/high-priority', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy yêu cầu theo encounter ID
  getRequestByEncounter: async (encounterId) => {
    return apiCall(`api/v1/admission-requests/encounter/${encounterId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Phê duyệt yêu cầu nhập viện
  approveRequest: async (admissionRequestId, approvalNotes) => {
    const params = new URLSearchParams();
    if (approvalNotes) params.append('approvalNotes', approvalNotes);

    return apiCall(`api/v1/admission-requests/${admissionRequestId}/approve?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Từ chối yêu cầu nhập viện
  rejectRequest: async (admissionRequestId, rejectionNotes) => {
    const params = new URLSearchParams();
    if (rejectionNotes) params.append('rejectionNotes', rejectionNotes);

    return apiCall(`api/v1/admission-requests/${admissionRequestId}/reject?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
  
  // === ADDED: LẤY CHI TIẾT YÊU CẦU ===
  getRequestDetail: async (admissionRequestId) => {
    return apiCall(`api/v1/admission-requests/${admissionRequestId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
  
  // === ADDED: CẬP NHẬT YÊU CẦU ===
  updateRequest: async (admissionRequestId, data) => {
    return apiCall(`api/v1/admission-requests/${admissionRequestId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
  },
};

export default {
  adminAuthAPI,
  adminDashboardAPI,
  adminEmployeeAPI,
  adminStaffAPI: adminEmployeeAPI, // Alias for backward compatibility
  adminDepartmentAPI,
  adminClinicAPI,
  adminDoctorScheduleAPI,
  adminServiceAPI,
  adminReportAPI,
  adminRoleAPI,
  adminAdmissionRequestAPI,
};

// ==================== API Quản lý Nhà cung cấp (Supplier Management) ====================

export const adminSupplierAPI = {
  // 1. Tạo nhà cung cấp mới (Create Supplier)
  // POST /api/v1/suppliers
  createSupplier: async (supplierData) => {
    return apiCall('api/v1/suppliers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(supplierData),
    });
  },

  // 2. Cập nhật nhà cung cấp (Update Supplier)
  // PUT /api/v1/suppliers/{supplierId}
  updateSupplier: async (supplierId, supplierData) => {
    return apiCall(`api/v1/suppliers/${supplierId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(supplierData),
    });
  },

  // 3. Lấy thông tin chi tiết nhà cung cấp (Get Supplier by ID)
  // GET /api/v1/suppliers/{supplierId}
  getSupplierById: async (supplierId) => {
    return apiCall(`api/v1/suppliers/${supplierId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 4. Lấy danh sách tất cả nhà cung cấp (Get All Suppliers - Paginated)
  // GET /api/v1/suppliers?searchTerm={optional}&page={page}&size={size}
  getAllSuppliers: async (searchTerm = '', page = 0, size = 20) => {
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

  // 5. Tìm kiếm nhà cung cấp (Search Suppliers) - DEPRECATED, sử dụng getAllSuppliers thay thế
  // GET /api/v1/suppliers/search?searchTerm={searchTerm} - DEPRECATED
  searchSuppliers: async (searchTerm, page = 0, size = 20) => {
    // Chuyển sang sử dụng API mới
    return adminSupplierAPI.getAllSuppliers(searchTerm, page, size);
  },

  // 6. Xóa nhà cung cấp (Soft Delete Supplier)
  // DELETE /api/v1/suppliers/{supplierId}
  deleteSupplier: async (supplierId) => {
    return apiCall(`api/v1/suppliers/${supplierId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 7. Khôi phục nhà cung cấp đã xóa (Restore Supplier)
  // PUT /api/v1/suppliers/{supplierId}/restore
  restoreSupplier: async (supplierId) => {
    return apiCall(`api/v1/suppliers/${supplierId}/restore`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 8. Lấy danh sách nhà cung cấp đã xóa (Get Deleted Suppliers)
  // GET /api/v1/suppliers/deleted?page={page}&size={size}
  getDeletedSuppliers: async (page = 0, size = 10) => {
    return apiCall(`api/v1/suppliers/deleted?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 9. Lấy danh sách nhà cung cấp đang hoạt động (Get Active Suppliers)
  // GET /api/v1/suppliers/active?page={page}&size={size}
  getActiveSuppliers: async (page = 0, size = 10) => {
    return apiCall(`api/v1/suppliers/active?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 10. Lấy thống kê nhà cung cấp (Get Supplier Statistics)
  // GET /api/v1/suppliers/stats/soft-delete
  getSupplierStats: async () => {
    return apiCall('api/v1/suppliers/stats/soft-delete', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// ==================== Cabinet Management API ====================
export const adminCabinetAPI = {
  // Tạo tủ mới (Create Cabinet)
  // API: POST /api/v1/cabinet-management
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
  // API: PUT /api/v1/cabinet-management/{cabinetId}
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
  // API: GET /api/v1/cabinet-management/{cabinetId}
  getCabinetById: async (cabinetId) => {
    return apiCall(`api/v1/cabinet-management/${cabinetId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy tất cả tủ với phân trang (Get All Cabinets)
  // API: GET /api/v1/cabinet-management?page={page}&size={size}
  getAllCabinets: async (page = 0, size = 20) => {
    return apiCall(`api/v1/cabinet-management?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy tủ theo khoa phòng (Get Cabinets by Department)
  // API: GET /api/v1/cabinet-management/department/{departmentId}
  getCabinetsByDepartment: async (departmentId) => {
    return apiCall(`api/v1/cabinet-management/department/${departmentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Gán người chịu trách nhiệm (Assign Responsible Employee)
  // API: POST /api/v1/cabinet-management/{cabinetId}/assign?employeeId={employeeId}
  assignResponsibleEmployee: async (cabinetId, employeeId) => {
    return apiCall(`api/v1/cabinet-management/${cabinetId}/assign?employeeId=${employeeId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Khóa/Mở khóa tủ (Lock/Unlock Cabinet)
  // API: POST /api/v1/cabinet-management/{cabinetId}/lock?lock={lock}
  // Note: Backend expects parameter name "lock" (not "locked")
  lockUnlockCabinet: async (cabinetId, locked) => {
    return apiCall(`api/v1/cabinet-management/${cabinetId}/lock?lock=${locked}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Thiết lập mức đặt hàng lại (Set Reorder Levels)
  // API: POST /api/v1/cabinet-management/{cabinetId}/reorder-levels
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
  // API: POST /api/v1/cabinet-management/{cabinetId}/deactivate?reason={reason}
  deactivateCabinet: async (cabinetId, reason) => {
    return apiCall(`api/v1/cabinet-management/${cabinetId}/deactivate?reason=${encodeURIComponent(reason)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy lịch sử truy cập tủ (Get Cabinet Access Log)
  // API: GET /api/v1/cabinet-management/{cabinetId}/access-log?startDate={startDate}&endDate={endDate}
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
  // API: GET /api/v1/cabinet-management/{cabinetId}/alerts
  getCabinetAlerts: async (cabinetId) => {
    return apiCall(`api/v1/cabinet-management/${cabinetId}/alerts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo báo cáo tủ (Generate Cabinet Report)
  // API: GET /api/v1/cabinet-management/{cabinetId}/report?reportType={reportType}&startDate={startDate}&endDate={endDate}
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
  // API: GET /api/v1/cabinet-management/{cabinetId}/maintenance
  getCabinetMaintenance: async (cabinetId) => {
    return apiCall(`api/v1/cabinet-management/${cabinetId}/maintenance`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lên lịch bảo trì (Schedule Cabinet Maintenance)
  // API: POST /api/v1/cabinet-management/{cabinetId}/schedule-maintenance?maintenanceType={maintenanceType}&scheduledDate={scheduledDate}&notes={notes}
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

  // Kiểm tra trạng thái khóa của tủ (Check Cabinet Lock Status)
  // API: GET /api/v1/cabinet-management/{cabinetId}/lock-status
  // Returns: { isLocked: boolean, lastModifiedDate: string, lastModifiedBy: string }
  getCabinetLockStatus: async (cabinetId) => {
    return apiCall(`api/v1/cabinet-management/${cabinetId}/lock-status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách tủ đang khóa (Get Locked Cabinets Only)
  // API: GET /api/v1/cabinet-management/locked?page={page}&size={size}
  getLockedCabinets: async (page = 0, size = 20) => {
    return apiCall(`api/v1/cabinet-management/locked?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy tồn kho của tủ (Get Cabinet Inventory)
  // API: GET /api/v1/cabinet-inventory/cabinet/{cabinetId}
  // Required Permission: cabinet.view
  // Returns: { cabinetId, cabinetLocation, items[], totalItems, utilizationPercent }
  getCabinetInventory: async (cabinetId) => {
    return apiCall(`api/v1/cabinet-inventory/cabinet/${cabinetId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};
