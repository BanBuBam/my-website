// API cho Lễ tân
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

// Hàm helper để lấy token (sử dụng staffAccessToken từ login chung)
const getAccessToken = () => localStorage.getItem('staffAccessToken');
const getRefreshToken = () => localStorage.getItem('staffRefreshToken');

// Hàm helper để lưu token
export const saveTokens = (accessToken, refreshToken) => {
  localStorage.setItem('staffAccessToken', accessToken);
  localStorage.setItem('staffRefreshToken', refreshToken);
};

// Hàm helper để xóa token
export const clearTokens = () => {
  localStorage.removeItem('staffAccessToken');
  localStorage.removeItem('staffRefreshToken');
};

// API Authentication cho Lễ tân
export const receptionistAuthAPI = {
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
export const receptionistDashboardAPI = {
  // Lấy thống kê dashboard
  getDashboard: async () => {
    return apiCall('api/v1/dashboard/receptionist', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy thống kê dashboard (legacy)
  getStatistics: async () => {
    return apiCall('api/v1/receptionist/dashboard/statistics', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Tiếp nhận bệnh nhân
export const receptionistPatientAPI = {
  // Tìm kiếm bệnh nhân
  searchPatient: async (searchTerm) => {
    return apiCall(`api/v1/receptionist/patients/search?q=${encodeURIComponent(searchTerm)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy thông tin bệnh nhân
  getPatientDetail: async (patientId) => {
    return apiCall(`api/v1/receptionist/patients/${patientId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Đăng ký bệnh nhân mới
  registerPatient: async (patientData) => {
    return apiCall('api/v1/receptionist/patients', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(patientData),
    });
  },

  // Cập nhật thông tin bệnh nhân
  updatePatient: async (patientId, patientData) => {
    return apiCall(`api/v1/receptionist/patients/${patientId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(patientData),
    });
  },
};

// API Quản lý lịch hẹn
export const receptionistAppointmentAPI = {
  // Lấy danh sách lịch hẹn
  getAppointments: async (date) => {
    return apiCall(`api/v1/receptionist/appointments?date=${date}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo lịch hẹn
  createAppointment: async (appointmentData) => {
    return apiCall('api/v1/receptionist/appointments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(appointmentData),
    });
  },

  // Cập nhật lịch hẹn
  updateAppointment: async (appointmentId, appointmentData) => {
    return apiCall(`api/v1/receptionist/appointments/${appointmentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(appointmentData),
    });
  },

  // Hủy lịch hẹn
  cancelAppointment: async (appointmentId) => {
    return apiCall(`api/v1/receptionist/appointments/${appointmentId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Tra cứu
export const receptionistLookupAPI = {
  // Tra cứu lịch sử khám
  getMedicalHistory: async (patientId) => {
    return apiCall(`api/v1/receptionist/patients/${patientId}/medical-history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tra cứu hóa đơn
  getInvoices: async (patientId) => {
    return apiCall(`api/v1/receptionist/patients/${patientId}/invoices`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Quản lý Booking
export const receptionistBookingAPI = {
  // Tìm kiếm booking theo keyword
  searchBookings: async (keyword, page = 0, size = 20) => {
    const params = new URLSearchParams({
      keyword: keyword,
      page: page.toString(),
      size: size.toString()
    });
    return apiCall(`api/v1/bookings/search?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách booking đang chờ
  getPendingBookings: async (page = 0, size = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    return apiCall(`api/v1/bookings/pending?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách booking đã xác nhận
  getConfirmedBookings: async (page = 0, size = 20) => {
    const params = new URLSearchParams({
      status: 'CONFIRMED',
      page: page.toString(),
      size: size.toString()
    });
    return apiCall(`api/v1/bookings?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết booking
  getBookingDetail: async (bookingId) => {
    return apiCall(`api/v1/bookings/${bookingId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Xác nhận booking
  confirmBooking: async (bookingId) => {
    return apiCall(`api/v1/bookings/${bookingId}/confirm`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy encounter từ booking
  getEncounterByBooking: async (bookingId) => {
    return apiCall(`api/v1/encounters/booking/${bookingId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Check-in bệnh nhân
  checkInPatient: async (encounterId) => {
    return apiCall(`api/v1/encounters/${encounterId}/checkin`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Discharge encounter
  dischargeEncounter: async (encounterId, disposition = '') => {
    const params = new URLSearchParams({
      disposition: disposition
    });
    return apiCall(`api/v1/encounters/${encounterId}/discharge?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Cancel encounter
  cancelEncounter: async (encounterId, reason = '') => {
    const params = new URLSearchParams({
      reason: reason
    });
    return apiCall(`api/v1/encounters/${encounterId}/cancel?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Quản lý Emergency
export const receptionistEmergencyAPI = {
  // Lấy danh sách cấp cứu đang hoạt động
  getActiveEmergencies: async () => {
    return apiCall('api/v1/emergency/encounters/active', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết cấp cứu
  getEmergencyDetail: async (emergencyEncounterId) => {
    return apiCall(`api/v1/emergency/encounters/${emergencyEncounterId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo yêu cầu cấp cứu mới (direct - không cần encounter trước)
  createEmergency: async (emergencyData) => {
    return apiCall('api/v1/emergency/encounters/direct', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(emergencyData),
    });
  },

  // Tạo emergency từ encounter có sẵn
  createEmergencyFromEncounter: async (emergencyData) => {
    return apiCall('api/v1/emergency/encounters', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emergencyData),
    });
  },
};

// API Quản lý Encounters
export const receptionistEncounterAPI = {
  // Lấy danh sách encounters với pagination
  getEncounters: async (page = 0, size = 20, sort = []) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    sort.forEach(s => params.append('sort', s));
    
    return apiCall(`api/v1/encounters?${params.toString()}`, {
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

// API Quản lý Payment
export const receptionistPaymentAPI = {
  // Tạo invoice cho encounter
  generateInvoice: async (invoiceData) => {
    return apiCall('api/v1/payments/generate-invoice', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(invoiceData),
    });
  },

  // Lấy invoice theo encounter ID
  getInvoiceByEncounter: async (encounterId) => {
    return apiCall(`api/v1/invoices/encounter/${encounterId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết invoice
  getInvoiceDetail: async (invoiceId) => {
    return apiCall(`api/v1/invoices/${invoiceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách items của invoice
  getInvoiceItems: async (invoiceId) => {
    return apiCall(`api/v1/invoice-items/invoice/${invoiceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Patient Search
export const receptionistPatientSearchAPI = {
  // Tìm kiếm bệnh nhân theo tên
  searchPatientsByName: async (name, page = 0, size = 10) => {
    const params = new URLSearchParams({
      name: name,
      page: page.toString(),
      size: size.toString(),
    });
    return apiCall(`api/v1/patient/admin/search?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Department
export const receptionistDepartmentAPI = {
  // Lấy danh sách departments
  getDepartments: async () => {
    return apiCall('api/v1/departments', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Employee
export const receptionistEmployeeAPI = {
  // Lấy danh sách nhân viên theo role
  getEmployeesByRole: async (role, page = 0, size = 100) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    return apiCall(`api/v1/employees/role/${role}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách điều dưỡng
  getNurses: async (page = 0, size = 100) => {
    return receptionistEmployeeAPI.getEmployeesByRole('NURSE', page, size);
  },

  // Lấy danh sách bác sĩ
  getDoctors: async (page = 0, size = 100) => {
    return receptionistEmployeeAPI.getEmployeesByRole('DOCTOR', page, size);
  },

  // Lấy danh sách bác sĩ theo khoa
  getDoctorsByDepartment: async (departmentId) => {
    return apiCall(`api/v1/employees/department/${departmentId}/role/DOCTOR`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

export default {
  receptionistAuthAPI,
  receptionistDashboardAPI,
  receptionistPatientAPI,
  receptionistAppointmentAPI,
  receptionistLookupAPI,
  receptionistBookingAPI,
  receptionistEmergencyAPI,
  receptionistEncounterAPI,
  receptionistPaymentAPI,
  receptionistPatientSearchAPI,
  receptionistDepartmentAPI,
  receptionistEmployeeAPI,
};

