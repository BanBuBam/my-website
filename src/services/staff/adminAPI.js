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
  // 1. Lấy tổng quan dashboard (Summary)
  getSummary: async () => {
    return apiCall('api/v1/dashboard/admin/summary', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 2. Lấy hiệu suất các khoa (Departments)
  getDepartments: async (page = 0, size = 20, status = null) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (status) params.append('status', status);

    return apiCall(`api/v1/dashboard/admin/departments?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 3. Lấy cảnh báo hệ thống (Alerts)
  getAlerts: async (page = 0, size = 20, alertType = null, severity = null) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (alertType) params.append('alertType', alertType);
    if (severity) params.append('severity', severity);

    return apiCall(`api/v1/dashboard/admin/alerts?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 4. Lấy tài nguyên (Resources)
  getResources: async (page = 0, size = 20, resourceType = null) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (resourceType) params.append('resourceType', resourceType);

    return apiCall(`api/v1/dashboard/admin/resources?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // 5. Lấy hoạt động gần đây (Activities)
  getActivities: async (page = 0, size = 20, activityType = null) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (activityType) params.append('activityType', activityType);

    return apiCall(`api/v1/dashboard/admin/activities?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Legacy - Lấy dashboard data cho Admin
  getDashboard: async () => {
    return apiCall('api/v1/dashboard/admin', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Legacy - Lấy thống kê dashboard
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

  // Lấy role theo ID
  getRoleById: async (id) => {
    return apiCall(`api/v1/roles/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy role theo tên
  getRoleByName: async (roleName) => {
    return apiCall(`api/v1/roles/name/${roleName}`, {
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

  // Cập nhật role
  updateRole: async (id, roleData) => {
    return apiCall(`api/v1/roles/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(roleData),
    });
  },

  // Xóa role
  deleteRole: async (id) => {
    return apiCall(`api/v1/roles/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Gán permissions cho role
  assignPermissionsToRole: async (roleId, permissionIds) => {
    return apiCall(`api/v1/roles/${roleId}/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify({ permissionIds }),
    });
  },

  // Lấy tất cả permissions trong hệ thống
  getAllPermissions: async () => {
    return apiCall('api/v1/permissions', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Xóa một permission khỏi role
  removePermissionFromRole: async (roleId, permissionId) => {
    return apiCall(`api/v1/roles/${roleId}/permissions/${permissionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Xóa tất cả permissions khỏi role
  removeAllPermissionsFromRole: async (roleId) => {
    return apiCall(`api/v1/roles/${roleId}/permissions`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
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

// API Quản lý Permissions
export const adminPermissionAPI = {
  // Lấy tất cả permissions (đã có trong adminRoleAPI.getAllPermissions, nhưng tạo riêng cho rõ ràng)
  getPermissions: async () => {
    return apiCall('api/v1/permissions', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy permission theo ID
  getPermissionById: async (id) => {
    return apiCall(`api/v1/permissions/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy permission theo tên
  getPermissionByName: async (permissionName) => {
    return apiCall(`api/v1/permissions/name/${permissionName}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo permission mới
  createPermission: async (permissionData) => {
    return apiCall('api/v1/permissions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(permissionData),
    });
  },

  // Cập nhật permission
  updatePermission: async (id, permissionData) => {
    return apiCall(`api/v1/permissions/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(permissionData),
    });
  },

  // Xóa permission
  deletePermission: async (id) => {
    return apiCall(`api/v1/permissions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Quản lý Sessions
export const adminSessionAPI = {
  // Lấy danh sách users đang online
  getOnlineUsers: async (hoursBack = 8) => {
    return apiCall(`api/v1/admin/sessions/online?hoursBack=${hoursBack}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy tất cả phiên đăng nhập đang active
  getActiveSessions: async () => {
    return apiCall('api/v1/admin/sessions/active', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy sessions theo username
  getSessionsByUsername: async (username) => {
    return apiCall(`api/v1/admin/sessions/user/${username}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Đóng một phiên đăng nhập cụ thể
  terminateSession: async (sessionId) => {
    return apiCall(`api/v1/admin/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Đóng tất cả phiên đăng nhập của một user
  terminateAllUserSessions: async (username) => {
    return apiCall(`api/v1/admin/sessions/user/${username}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy thống kê sessions
  getSessionStatistics: async (date = null) => {
    const url = date
      ? `api/v1/admin/sessions/statistics?date=${date}`
      : 'api/v1/admin/sessions/statistics';

    return apiCall(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Quản lý Audit Logs
export const adminAuditAPI = {
  // Tìm kiếm audit logs với nhiều điều kiện
  searchAuditLogs: async (searchParams, page = 0, size = 20) => {
    return apiCall(`api/v1/audit/search?page=${page}&size=${size}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchParams),
    });
  },

  // Lấy các hoạt động gần đây
  getRecentActivity: async (limit = 50, hours = 24) => {
    return apiCall(`api/v1/audit/recent?limit=${limit}&hours=${hours}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lịch sử hoạt động của một user
  getUserActivityHistory: async (username, startDate = null, endDate = null, page = 0, size = 20) => {
    let url = `api/v1/audit/user/${username}?page=${page}&size=${size}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;

    return apiCall(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lịch sử đăng nhập/đăng xuất
  getLoginHistory: async (params = {}) => {
    const { username, status, action, startDate, endDate, page = 0, size = 20 } = params;
    let url = `api/v1/audit/logins?page=${page}&size=${size}`;

    if (username) url += `&username=${username}`;
    if (status) url += `&status=${status}`;
    if (action) url += `&action=${action}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;

    return apiCall(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách các lần đăng nhập thất bại
  getFailedLoginAttempts: async (hours = 24, minAttempts = 3) => {
    return apiCall(`api/v1/audit/logins/failed?hours=${hours}&minAttempts=${minAttempts}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Thống kê tổng quan về audit logs
  getAuditStatistics: async (startDate = null, endDate = null) => {
    let url = 'api/v1/audit/statistics';
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

  // Dashboard tổng quan cho admin
  getAuditDashboard: async () => {
    return apiCall('api/v1/audit/dashboard', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Data Import
export const adminDataImportAPI = {
  // Import medicines from Excel
  importMedicines: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiCall('api/v1/admin/import/medicines', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        // Don't set Content-Type, browser will set it with boundary for multipart/form-data
      },
      body: formData,
    });
  },

  // Import services from Excel
  importServices: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiCall('api/v1/admin/import/services', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: formData,
    });
  },

  // Import medical supplies from Excel
  importSupplies: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiCall('api/v1/admin/import/supplies', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: formData,
    });
  },

  // Get import history
  getImportHistory: async (params = {}) => {
    const { page = 0, size = 10, type, startDate, endDate } = params;
    let url = `api/v1/admin/import/history?page=${page}&size=${size}`;

    if (type) url += `&type=${type}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;

    return apiCall(url, {
      method: 'GET',
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

// API Quản lý Tài khoản Nhân viên (Employee Account Management)
export const adminAccountAPI = {
  // Lấy tất cả tài khoản nhân viên
  getAccounts: async () => {
    console.log('Getting all employee accounts');
    try {
      const response = await apiCall('api/v1/employee-accounts', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
        },
      });
      console.log('getAccounts response:', response);
      return response;
    } catch (error) {
      console.error('getAccounts error:', error);
      throw error;
    }
  },

  // Lấy tài khoản với pagination
  getAccountsPage: async (page = 0, size = 10) => {
    console.log(`Getting employee accounts page ${page}, size ${size}`);
    try {
      const response = await apiCall(`api/v1/employee-accounts/page?page=${page}&size=${size}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
        },
      });
      console.log('getAccountsPage response:', response);
      return response;
    } catch (error) {
      console.error('getAccountsPage error:', error);
      throw error;
    }
  },

  // Lấy tài khoản theo ID
  getAccountById: async (id) => {
    console.log('Getting employee account by ID:', id);
    try {
      const response = await apiCall(`api/v1/employee-accounts/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
        },
      });
      console.log('getAccountById response:', response);
      return response;
    } catch (error) {
      console.error('getAccountById error:', error);
      throw error;
    }
  },

  // Tạo tài khoản cho nhân viên
  // API: POST /api/v1/employee-accounts
  // Permission: user.manage
  // Request body: { employeeId, username, password, isActive }
  createAccountForExistingEmployee: async (accountData) => {
    console.log('🔵 Creating account for existing employee');
    console.log('📦 Request data:', JSON.stringify(accountData, null, 2));

    // Validate required fields
    if (!accountData.employeeId || !accountData.username || !accountData.password) {
      throw new Error('Missing required fields: employeeId, username, password');
    }

    // Prepare request body theo đúng API specification
    const requestBody = {
      employeeId: parseInt(accountData.employeeId),
      username: accountData.username.trim(),
      password: accountData.password,
      isActive: accountData.isActive !== undefined ? accountData.isActive : true,
    };

    const endpoint = 'api/v1/employee-accounts';
    console.log('🌐 Endpoint:', endpoint);
    console.log('🔑 Access Token:', getAccessToken() ? 'Present' : 'Missing');
    console.log('📤 Final request body:', JSON.stringify(requestBody, null, 2));

    try {
      const response = await apiCall(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      console.log('✅ createAccountForExistingEmployee response:', response);
      return response;
    } catch (error) {
      console.error('❌ createAccountForExistingEmployee error:', error);
      throw error;
    }
  },

  // Cập nhật tài khoản
  updateAccount: async (employeeId, accountData) => {
    console.log('Updating employee account:', employeeId, accountData);
    try {
      const response = await apiCall(`api/v1/employee-accounts/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData),
      });
      console.log('updateAccount response:', response);
      return response;
    } catch (error) {
      console.error('updateAccount error:', error);
      throw error;
    }
  },

  // Xóa tài khoản
  deleteAccount: async (id) => {
    console.log('Deleting employee account:', id);
    try {
      const response = await apiCall(`api/v1/employee-accounts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
        },
      });
      console.log('deleteAccount response:', response);
      return response;
    } catch (error) {
      console.error('deleteAccount error:', error);
      throw error;
    }
  },

  // Kích hoạt tài khoản
  activateAccount: async (id) => {
    console.log('Activating employee account:', id);
    try {
      const response = await apiCall(`api/v1/employee-accounts/${id}/activate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
        },
      });
      console.log('activateAccount response:', response);
      return response;
    } catch (error) {
      console.error('activateAccount error:', error);
      throw error;
    }
  },

  // Vô hiệu hóa tài khoản
  deactivateAccount: async (id) => {
    console.log('Deactivating employee account:', id);
    try {
      const response = await apiCall(`api/v1/employee-accounts/${id}/deactivate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
        },
      });
      console.log('deactivateAccount response:', response);
      return response;
    } catch (error) {
      console.error('deactivateAccount error:', error);
      throw error;
    }
  },

  // Reset mật khẩu
  resetPassword: async (id, newPassword) => {
    console.log('Resetting password for account:', id);
    try {
      const response = await apiCall(`api/v1/employee-accounts/${id}/reset-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });
      console.log('resetPassword response:', response);
      return response;
    } catch (error) {
      console.error('resetPassword error:', error);
      throw error;
    }
  },
};

// ==================== Export Default ====================
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
  adminSupplierAPI,
  adminCabinetAPI,
  adminAccountAPI,
};
