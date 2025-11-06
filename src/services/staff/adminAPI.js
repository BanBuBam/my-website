// API cho Quản lý / Admin
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
  getEmployees: async (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const endpoint = queryString ? `api/v1/employees?${queryString}` : 'api/v1/employees';
    return apiCall(endpoint, {
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
  getDepartments: async () => {
    return apiCall('api/v1/departments', {
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
  getClinics: async () => {
    return apiCall('api/clinics', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách bác sĩ theo phòng khám
  getDoctorsByClinic: async (clinicId) => {
    return apiCall(`api/clinics/${clinicId}/doctors`, {
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

