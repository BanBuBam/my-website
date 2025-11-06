// API cho Quản lý Nhân sự / HR Management
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
    console.log('API Call:', url, config);
    const response = await fetch(url, config);

    if (!response.ok) {
      // Thử parse response text trước
      const responseText = await response.text();
      console.error('❌ Raw error response:', responseText);

      let errorData = {};
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        console.error('❌ Cannot parse error response as JSON');
      }

      // Lấy error message chi tiết từ backend
      let errorMessage = errorData.message || errorData.error || errorData.errorMessage || `HTTP error! status: ${response.status}`;

      // Nếu có errors array (validation errors)
      if (errorData.errors && Array.isArray(errorData.errors)) {
        errorMessage = errorData.errors.join(', ');
      }

      // Nếu có detail field
      if (errorData.detail) {
        errorMessage = errorData.detail;
      }

      // Nếu có path (Spring Boot error format)
      if (errorData.path) {
        console.error('❌ Error path:', errorData.path);
      }

      // Nếu có timestamp
      if (errorData.timestamp) {
        console.error('❌ Error timestamp:', errorData.timestamp);
      }

      console.error('❌ API Error Response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        errorData,
        errorMessage,
        rawResponse: responseText
      });

      // Handle specific error codes
      if (response.status === 401 || response.status === 403) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }

      if (response.status === 400) {
        throw new Error(`Dữ liệu không hợp lệ: ${errorMessage}`);
      }

      if (response.status === 500) {
        // Nếu có thông tin chi tiết từ backend
        if (errorData.message && errorData.message !== 'An unexpected error occurred') {
          throw new Error(`Lỗi server: ${errorData.message}`);
        }
        throw new Error(`Lỗi server: ${errorMessage}. Vui lòng kiểm tra: Employee ID có tồn tại? Username đã được sử dụng?`);
      }

      throw new Error(errorMessage);
    }

    // Check if response has content before parsing JSON
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');

    // If no content or content-length is 0, return success without parsing JSON
    if (contentLength === '0' || !contentType || !contentType.includes('application/json')) {
      console.log('API Success Response: No JSON content (DELETE success)');
      return { success: true, status: response.status };
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
  // 2.1 GET - Lấy tất cả tài khoản nhân viên
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

  // 2.2 GET - Lấy tài khoản với pagination
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

  // 2.3 GET - Lấy tài khoản theo ID
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

  // 2.4.1 POST - Tạo tài khoản cho nhân viên đã có
  createAccountForExistingEmployee: async (accountData) => {
    console.log('🔵 Creating account for existing employee');
    console.log('📦 Request data:', JSON.stringify(accountData, null, 2));
    console.log('📦 Data structure:', {
      employeeId: accountData.employeeId,
      employeeIdType: typeof accountData.employeeId,
      username: accountData.username,
      password: accountData.password ? '***' : undefined,
      roles: accountData.roles,
      rolesLength: accountData.roles?.length
    });

    const endpoint = 'api/v1/employee-accounts';
    const fullUrl = `${BASE_URL}${endpoint}`;

    console.log('🌐 Full URL:', fullUrl);
    console.log('🔑 Access Token:', getAccessToken() ? 'Present' : 'Missing');
    console.log('📤 Request body:', JSON.stringify(accountData));

    try {
      const response = await apiCall(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData),
      });
      console.log('✅ createAccountForExistingEmployee response:', response);
      return response;
    } catch (error) {
      console.error('❌ createAccountForExistingEmployee error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  },

  // 2.4.2 POST - Tạo nhân viên mới VÀ tài khoản
  createEmployeeWithAccount: async (employeeData) => {
    console.log('Creating new employee with account:', employeeData);
    try {
      const response = await apiCall('api/v1/employees/with-account', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });
      console.log('createEmployeeWithAccount response:', response);
      return response;
    } catch (error) {
      console.error('createEmployeeWithAccount error:', error);
      throw error;
    }
  },

  // 2.5 PUT - Cập nhật tài khoản theo employeeId
  updateAccount: async (employeeId, accountData) => {
    const endpoint = `api/v1/employee-accounts/${employeeId}`;
    const fullUrl = `${BASE_URL}${endpoint}`;

    console.log('🔄 Updating account...');
    console.log('🌐 Full URL:', fullUrl);
    console.log('🔑 Employee ID:', employeeId);
    console.log('📤 Request body:', JSON.stringify(accountData));
    console.log('🔐 Access Token:', getAccessToken() ? 'Present' : 'Missing');

    try {
      const response = await apiCall(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData),
      });
      console.log('✅ updateAccount response:', response);
      return response;
    } catch (error) {
      console.error('❌ updateAccount error:', error);
      throw error;
    }
  },

  // 2.6 DELETE - Xóa tài khoản theo employeeId
  deleteAccount: async (employeeId) => {
    console.log('Deleting account for employeeId:', employeeId);
    try {
      const response = await apiCall(`api/v1/employee-accounts/${employeeId}`, {
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

  // 2.7 POST - Kích hoạt tài khoản
  activateAccount: async (employeeId) => {
    console.log('Activating account for employeeId:', employeeId);
    try {
      const response = await apiCall(`api/v1/employee-accounts/${employeeId}/activate`, {
        method: 'POST',
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

  // 2.8 POST - Vô hiệu hóa tài khoản
  deactivateAccount: async (employeeId) => {
    console.log('Deactivating account for employeeId:', employeeId);
    try {
      const response = await apiCall(`api/v1/employee-accounts/${employeeId}/deactivate`, {
        method: 'POST',
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

  // 2.9 POST - Reset mật khẩu
  resetPassword: async (employeeId, newPassword) => {
    console.log('Resetting password for employeeId:', employeeId);
    try {
      const response = await apiCall(`api/v1/employee-accounts/${employeeId}/reset-password?newPassword=${encodeURIComponent(newPassword)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
        },
      });
      console.log('resetPassword response:', response);
      return response;
    } catch (error) {
      console.error('resetPassword error:', error);
      throw error;
    }
  },

  // 2.10 GET - Lấy roles của tài khoản theo employeeId
  getAccountRoles: async (employeeId) => {
    console.log('Getting roles for employeeId:', employeeId);
    try {
      const response = await apiCall(`api/v1/employee-accounts/${employeeId}/roles`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
        },
      });
      console.log('getAccountRoles response:', response);
      return response;
    } catch (error) {
      console.error('getAccountRoles error:', error);
      throw error;
    }
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
    console.log('JSON stringified:', JSON.stringify(scheduleData, null, 2));

    try {
      const response = await apiCall('api/v1/doctor-schedules', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });
      console.log('createDoctorSchedule API response:', response);
      return response;
    } catch (error) {
      console.error('createDoctorSchedule API error:', error);
      throw error;
    }
  },

  // Cập nhật lịch làm việc
  updateDoctorSchedule: async (id, scheduleData) => {
    console.log('Updating doctor schedule with ID:', id);
    console.log('Update data:', scheduleData);
    console.log('JSON stringified:', JSON.stringify(scheduleData, null, 2));

    try {
      const response = await apiCall(`api/v1/doctor-schedules/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });
      console.log('updateDoctorSchedule API response:', response);
      return response;
    } catch (error) {
      console.error('updateDoctorSchedule API error:', error);
      throw error;
    }
  },

  // Xóa lịch làm việc
  deleteDoctorSchedule: async (id) => {
    console.log('Deleting doctor schedule with ID:', id);

    try {
      const response = await apiCall(`api/v1/doctor-schedules/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
        },
      });
      console.log('deleteDoctorSchedule API response:', response);
      return response;
    } catch (error) {
      console.error('deleteDoctorSchedule API error:', error);
      throw error;
    }
  },

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

  // Lấy lịch làm việc theo ID
  getScheduleById: async (scheduleId) => {
    return apiCall(`api/v1/doctor-schedules/${scheduleId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy lịch làm việc theo ID bác sĩ
  getSchedulesByDoctor: async (doctorId) => {
    return apiCall(`api/v1/doctor-schedules/doctor/${doctorId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy lịch làm việc theo ID bác sĩ và ngày
  getScheduleByDoctorAndDate: async (doctorId, date) => {
    return apiCall(`api/v1/doctor-schedules/doctor/${doctorId}/date/${date}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy lịch làm việc theo ID bác sĩ và khoảng thời gian
  getSchedulesByDateRange: async (doctorId, startDate, endDate) => {
    return apiCall(`api/v1/doctor-schedules/doctor/${doctorId}/date-range?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy lịch làm việc hôm nay của bác sĩ
  getTodaySchedule: async (doctorId) => {
    return apiCall(`api/v1/doctor-schedules/doctor/${doctorId}/today`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy lịch làm việc sắp tới của bác sĩ
  getUpcomingSchedules: async (doctorId) => {
    return apiCall(`api/v1/doctor-schedules/doctor/${doctorId}/upcoming`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy lịch làm việc của phòng khám trong 1 ngày
  getSchedulesByClinicAndDate: async (clinicId, date) => {
    return apiCall(`api/v1/doctor-schedules/clinic/${clinicId}/date/${date}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy slot còn trống trong ngày
  getAvailableSlots: async (doctorId, date) => {
    return apiCall(`api/v1/doctor-schedules/doctor/${doctorId}/available-slots?date=${date}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy slot còn trống trong khoảng thời gian
  getAvailableSlotsInRange: async (doctorId, startDateTime, endDateTime) => {
    return apiCall(`api/v1/doctor-schedules/doctor/${doctorId}/available-slots/range?startDateTime=${startDateTime}&endDateTime=${endDateTime}`, {
      method: 'GET',
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
    return apiCall(`api/v1/employee-schedules${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo lịch ca làm việc
  createEmployeeSchedule: async (scheduleData) => {
    console.log('Creating employee schedule with data:', scheduleData);
    console.log('JSON stringified:', JSON.stringify(scheduleData, null, 2));

    try {
      const response = await apiCall('api/v1/employee-schedules', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });
      console.log('createEmployeeSchedule API response:', response);
      return response;
    } catch (error) {
      console.error('createEmployeeSchedule API error:', error);
      throw error;
    }
  },

  // Cập nhật lịch ca làm việc
  updateEmployeeSchedule: async (id, scheduleData) => {
    return apiCall(`api/v1/employee-schedules/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(scheduleData),
    });
  },

  // Xóa lịch ca làm việc
  deleteEmployeeSchedule: async (id) => {
    return apiCall(`api/v1/employee-schedules/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Xác nhận lịch làm việc
  confirmSchedule: async (id) => {
    return apiCall(`api/v1/employee-schedules/${id}/confirm`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Check-in
  checkIn: async (id) => {
    return apiCall(`api/v1/employee-schedules/${id}/check-in`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Bắt đầu nghỉ giải lao
  startBreak: async (id) => {
    return apiCall(`api/v1/employee-schedules/${id}/start-break`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Kết thúc nghỉ giải lao
  endBreak: async (id) => {
    return apiCall(`api/v1/employee-schedules/${id}/end-break`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Check-out
  checkOut: async (id) => {
    return apiCall(`api/v1/employee-schedules/${id}/check-out`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy lịch làm việc theo nhân viên và ngày
  getScheduleByEmployeeAndDate: async (employeeId, date) => {
    return apiCall(`api/v1/employee-schedules/employee/${employeeId}/date/${date}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy lịch làm việc theo nhân viên và khoảng thời gian
  getScheduleByEmployeeAndDateRange: async (employeeId, startDate, endDate) => {
    return apiCall(`api/v1/employee-schedules/employee/${employeeId}/date-range?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy lịch làm việc hôm nay theo nhân viên
  getTodayScheduleByEmployee: async (employeeId) => {
    return apiCall(`api/v1/employee-schedules/employee/${employeeId}/today`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy lịch làm việc theo ca và ngày
  getScheduleByShiftAndDate: async (shiftId, date) => {
    return apiCall(`api/v1/employee-schedules/shift/${shiftId}/date/${date}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy lịch làm đang có theo id nhân viên
  getActiveScheduleByEmployee: async (employeeId) => {
    return apiCall(`api/v1/employee-schedules/employee/${employeeId}/active`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy lịch overtime của nhân viên theo id
  getOvertimeScheduleByEmployee: async (employeeId) => {
    return apiCall(`api/v1/employee-schedules/employee/${employeeId}/overtime`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tính giờ làm việc trong tháng của nhân viên
  getEmployeeWorkHoursByMonth: async (employeeId, year, month) => {
    return apiCall(`api/v1/employee-schedules/employee/${employeeId}/work-hours/${year}/${month}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tính giờ tăng ca theo tháng của nhân viên
  getEmployeeOvertimeHoursByMonth: async (employeeId, year, month) => {
    return apiCall(`api/v1/employee-schedules/employee/${employeeId}/overtime-hours/${year}/${month}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy lịch làm đang có theo id nhân viên
  getActiveScheduleByEmployee: async (employeeId) => {
    return apiCall(`api/v1/employee-schedules/employee/${employeeId}/active`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy lịch overtime của nhân viên theo id
  getOvertimeScheduleByEmployee: async (employeeId) => {
    return apiCall(`api/v1/employee-schedules/employee/${employeeId}/overtime`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tính giờ làm việc trong tháng của nhân viên
  getEmployeeWorkHours: async (employeeId, year, month) => {
    return apiCall(`api/v1/employee-schedules/employee/${employeeId}/work-hours/${year}/${month}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tính giờ tăng ca theo tháng của nhân viên
  getEmployeeOvertimeHours: async (employeeId, year, month) => {
    return apiCall(`api/v1/employee-schedules/employee/${employeeId}/overtime-hours/${year}/${month}`, {
      method: 'GET',
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
    return apiCall('api/v1/work-shifts', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết ca làm việc theo ID
  getWorkShiftById: async (id) => {
    return apiCall(`api/v1/work-shifts/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy ca làm việc theo mã ca
  getWorkShiftByCode: async (code) => {
    return apiCall(`api/v1/work-shifts/code/${code}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy ca làm việc đang active
  getActiveWorkShifts: async () => {
    return apiCall('api/v1/work-shifts/active', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy ca làm việc theo department
  getWorkShiftsByDepartment: async (departmentId) => {
    return apiCall(`api/v1/work-shifts/department/${departmentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy ca làm việc theo shift type
  getWorkShiftsByType: async (shiftType) => {
    return apiCall(`api/v1/work-shifts/type/${shiftType}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy ca làm việc hiện tại
  getCurrentWorkShifts: async () => {
    return apiCall('api/v1/work-shifts/current', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy ca làm việc cuối tuần
  getWeekendWorkShifts: async () => {
    return apiCall('api/v1/work-shifts/weekend', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy ca làm việc ngày lễ
  getHolidayWorkShifts: async () => {
    return apiCall('api/v1/work-shifts/holiday', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo ca làm việc mới
  createWorkShift: async (shiftData) => {
    return apiCall('api/v1/work-shifts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(shiftData),
    });
  },

  // Cập nhật ca làm việc
  updateWorkShift: async (id, shiftData) => {
    return apiCall(`api/v1/work-shifts/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(shiftData),
    });
  },

  // Xóa ca làm việc
  deleteWorkShift: async (id) => {
    return apiCall(`api/v1/work-shifts/${id}`, {
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
  // ===== CREATE OPERATIONS =====
  // Tạo đơn nghỉ phép mới
  createTimeOffRequest: async (data) => {
    return apiCall('api/v1/time-off-requests', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },

  // ===== UPDATE OPERATIONS =====
  // Cập nhật đơn nghỉ phép
  updateTimeOffRequest: async (id, data) => {
    return apiCall(`api/v1/time-off-requests/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },

  // ===== DELETE OPERATIONS =====
  // Xóa đơn nghỉ phép
  deleteTimeOffRequest: async (id) => {
    return apiCall(`api/v1/time-off-requests/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // ===== RETRIEVE OPERATIONS =====
  // Lấy danh sách đơn nghỉ phép
  getTimeOffRequests: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`api/v1/time-off-requests${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết đơn nghỉ phép
  getTimeOffRequestById: async (id) => {
    return apiCall(`api/v1/time-off-requests/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy đơn nghỉ phép theo nhân viên
  getTimeOffRequestsByEmployee: async (employeeId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`api/v1/time-off-requests/employee/${employeeId}${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy đơn nghỉ phép theo khoảng thời gian
  getTimeOffRequestsByDateRange: async (employeeId, startDate, endDate) => {
    const params = new URLSearchParams({
      startDate,
      endDate,
    }).toString();
    return apiCall(`api/v1/time-off-requests/employee/${employeeId}/date-range?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy đơn nghỉ phép theo trạng thái
  getTimeOffRequestsByStatus: async (status, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`api/v1/time-off-requests/status/${status}${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách đơn chờ duyệt
  getPendingRequests: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`api/v1/time-off-requests/pending${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách đơn đã duyệt
  getApprovedRequests: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`api/v1/time-off-requests/approved${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách nghỉ phép hiện tại
  getCurrentLeaves: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`api/v1/time-off-requests/current${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách nghỉ phép sắp tới
  getUpcomingLeaves: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`api/v1/time-off-requests/upcoming${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // ===== ACTION OPERATIONS =====
  // Phê duyệt đơn nghỉ phép
  approveTimeOffRequest: async (id, note = '') => {
    return apiCall(`api/v1/time-off-requests/${id}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ note }),
    });
  },

  // Từ chối đơn nghỉ phép
  rejectTimeOffRequest: async (id, reason) => {
    return apiCall(`api/v1/time-off-requests/${id}/reject`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });
  },

  // Rút lại đơn nghỉ phép
  withdrawTimeOffRequest: async (id) => {
    return apiCall(`api/v1/time-off-requests/${id}/withdraw`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // ===== LEAVE BALANCE OPERATIONS =====
  // Lấy số ngày nghỉ còn lại
  getLeaveBalance: async (employeeId, year) => {
    return apiCall(`api/v1/time-off-requests/employee/${employeeId}/balance/${year}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy số ngày nghỉ theo loại
  getLeaveBalanceByType: async (employeeId, year, type) => {
    return apiCall(`api/v1/time-off-requests/employee/${employeeId}/balance/${year}/type/${type}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách nhân viên đang nghỉ phép
  getEmployeesOnLeave: async (date) => {
    const params = new URLSearchParams({ date }).toString();
    return apiCall(`api/v1/time-off-requests/employees-on-leave?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

