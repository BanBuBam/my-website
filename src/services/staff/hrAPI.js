// API cho Quản lý Nhân sự / HR Management
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
    console.log('API Call:', url, config);
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
      console.error('API Error Response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        errorData
      });

      // Handle specific error codes
      if (response.status === 401 || response.status === 403) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('API Success Response:', data);
    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Hàm helper để lấy token
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

// API Authentication cho HR
export const hrAuthAPI = {
  // Đăng nhập
  login: async (email, password) => {
    const response = await apiCall('api/v1/hr/auth/login', {
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
    return apiCall('api/v1/hr/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Dashboard
export const hrDashboardAPI = {
  // Lấy dashboard data
  getDashboard: async () => {
    return apiCall('api/v1/hr/dashboard', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy thống kê
  getStatistics: async () => {
    return apiCall('api/v1/hr/dashboard/statistics', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Quản lý Nhân viên (Employee Management)
export const hrEmployeeAPI = {
  // Lấy danh sách nhân viên
  getEmployees: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`api/v1/employees${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy thông tin chi tiết nhân viên
  getEmployeeById: async (id) => {
    return apiCall(`api/v1/employees/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo nhân viên mới
  createEmployee: async (employeeData) => {
    console.log('Creating employee with data:', employeeData);
    console.log('Using token:', getAccessToken());
    return apiCall('api/v1/employees', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(employeeData),
    });
  },

  // Cập nhật thông tin nhân viên
  updateEmployee: async (id, employeeData) => {
    console.log('Updating employee with ID:', id);
    console.log('Update data:', employeeData);
    console.log('Using token:', getAccessToken());
    return apiCall(`api/v1/employees/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(employeeData),
    });
  },

  // Xóa nhân viên
  deleteEmployee: async (id) => {
    console.log('Deleting employee with ID:', id);
    console.log('Using token:', getAccessToken());
    return apiCall(`api/v1/employees/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy thống kê nhân viên
  getEmployeeStats: async () => {
    return apiCall('api/v1/employees/stats/all', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Vô hiệu hóa tài khoản nhân viên
  deactivateEmployee: async (id) => {
    console.log('Deactivating employee with ID:', id);
    return apiCall(`api/v1/employees/${id}/deactivate`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Kích hoạt lại tài khoản nhân viên
  activateEmployee: async (id) => {
    console.log('Activating employee with ID:', id);
    return apiCall(`api/v1/employees/${id}/activate`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tìm kiếm nhân viên theo tên
  searchByName: async (name) => {
    return apiCall(`api/v1/employees/name/${encodeURIComponent(name)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tìm kiếm nhân viên theo mã nhân viên
  searchByCode: async (code) => {
    return apiCall(`api/v1/employees/code/${encodeURIComponent(code)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tìm kiếm nhân viên theo phòng ban
  searchByDepartment: async (departmentId) => {
    return apiCall(`api/v1/employees/department/${departmentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tìm kiếm nhân viên theo vai trò
  searchByRole: async (roleType) => {
    return apiCall(`api/v1/employees/role/${encodeURIComponent(roleType)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tìm kiếm nâng cao với nhiều tiêu chí
  advancedSearch: async (searchParams) => {
    const params = new URLSearchParams();

    if (searchParams.name) params.append('name', searchParams.name);
    if (searchParams.code) params.append('code', searchParams.code);
    if (searchParams.departmentId) params.append('departmentId', searchParams.departmentId);
    if (searchParams.roleType) params.append('roleType', searchParams.roleType);
    if (searchParams.email) params.append('email', searchParams.email);
    if (searchParams.phone) params.append('phone', searchParams.phone);
    if (searchParams.isActive !== undefined) params.append('isActive', searchParams.isActive);

    return apiCall(`api/v1/hr/employees/search?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Quản lý Tài khoản Nhân viên (Employee Account Management)
export const hrAccountAPI = {
  // Lấy danh sách tài khoản
  getAccounts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`api/v1/hr/accounts${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo tài khoản cho nhân viên
  createAccount: async (accountData) => {
    return apiCall('api/v1/hr/accounts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(accountData),
    });
  },

  // Cập nhật tài khoản
  updateAccount: async (id, accountData) => {
    return apiCall(`api/v1/hr/accounts/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(accountData),
    });
  },

  // Khóa/Mở khóa tài khoản
  toggleAccountStatus: async (id) => {
    return apiCall(`api/v1/hr/accounts/${id}/toggle-status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Reset mật khẩu
  resetPassword: async (id) => {
    return apiCall(`api/v1/hr/accounts/${id}/reset-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Lịch làm việc Bác sĩ (Doctor Schedule)
export const hrDoctorScheduleAPI = {
  // Lấy lịch làm việc bác sĩ
  getDoctorSchedules: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`api/v1/doctor-schedules${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo lịch làm việc cho bác sĩ
  createDoctorSchedule: async (scheduleData) => {
    console.log('Creating doctor schedule with data:', scheduleData);
    return apiCall('api/v1/doctor-schedules', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(scheduleData),
    });
  },

  // Cập nhật lịch làm việc
  updateDoctorSchedule: async (id, scheduleData) => {
    return apiCall(`api/v1/doctor-schedules/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(scheduleData),
    });
  },

  // Xóa lịch làm việc
  deleteDoctorSchedule: async (id) => {
    return apiCall(`api/v1/doctor-schedules/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Lịch ca làm việc Nhân viên (Employee Work Shift)
export const hrEmployeeScheduleAPI = {
  // Lấy lịch ca làm việc
  getEmployeeSchedules: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`api/v1/hr/employee-schedules${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo lịch ca làm việc
  createEmployeeSchedule: async (scheduleData) => {
    return apiCall('api/v1/hr/employee-schedules', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(scheduleData),
    });
  },

  // Cập nhật lịch ca làm việc
  updateEmployeeSchedule: async (id, scheduleData) => {
    return apiCall(`api/v1/hr/employee-schedules/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(scheduleData),
    });
  },

  // Xóa lịch ca làm việc
  deleteEmployeeSchedule: async (id) => {
    return apiCall(`api/v1/hr/employee-schedules/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Quản lý Ca làm việc (Work Shift Management)
export const hrWorkShiftAPI = {
  // Lấy danh sách ca làm việc
  getWorkShifts: async () => {
    return apiCall('api/v1/hr/work-shifts', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo ca làm việc mới
  createWorkShift: async (shiftData) => {
    return apiCall('api/v1/hr/work-shifts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(shiftData),
    });
  },

  // Cập nhật ca làm việc
  updateWorkShift: async (id, shiftData) => {
    return apiCall(`api/v1/hr/work-shifts/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(shiftData),
    });
  },

  // Xóa ca làm việc
  deleteWorkShift: async (id) => {
    return apiCall(`api/v1/hr/work-shifts/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Tình trạng Sẵn sàng Nhân viên (Employee Status)
export const hrEmployeeStatusAPI = {
  // Lấy tình trạng nhân viên
  getEmployeeStatus: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`api/v1/hr/employee-status${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Cập nhật tình trạng nhân viên
  updateEmployeeStatus: async (id, statusData) => {
    return apiCall(`api/v1/hr/employee-status/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(statusData),
    });
  },
};

// API Nghỉ phép (Time Off Request)
export const hrTimeOffAPI = {
  // Lấy danh sách đơn nghỉ phép
  getTimeOffRequests: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`api/v1/hr/time-off-requests${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết đơn nghỉ phép
  getTimeOffRequestById: async (id) => {
    return apiCall(`api/v1/hr/time-off-requests/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Phê duyệt đơn nghỉ phép
  approveTimeOffRequest: async (id, note = '') => {
    return apiCall(`api/v1/hr/time-off-requests/${id}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify({ note }),
    });
  },

  // Từ chối đơn nghỉ phép
  rejectTimeOffRequest: async (id, reason) => {
    return apiCall(`api/v1/hr/time-off-requests/${id}/reject`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify({ reason }),
    });
  },
};

