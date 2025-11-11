// API cho Điều dưỡng
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

// API Authentication cho Điều dưỡng
export const nurseAuthAPI = {
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
export const nurseDashboardAPI = {
  // Lấy dashboard data
  getDashboard: async () => {
    return apiCall('api/v1/dashboard/nurse', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy thống kê dashboard (legacy)
  getStatistics: async () => {
    return apiCall('api/v1/nurse/dashboard/statistics', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Chăm sóc bệnh nhân
export const nursePatientCareAPI = {
  // Lấy danh sách bệnh nhân cần chăm sóc
  getPatients: async () => {
    return apiCall('api/v1/nurse/patients', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy thông tin bệnh nhân
  getPatientDetail: async (patientId) => {
    return apiCall(`api/v1/nurse/patients/${patientId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Cập nhật thông tin chăm sóc
  updateCareRecord: async (patientId, careData) => {
    return apiCall(`api/v1/nurse/patients/${patientId}/care`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(careData),
    });
  },
};

// API Theo dõi sinh hiệu
export const nurseVitalSignsAPI = {
  // Thêm sinh hiệu
  addVitalSigns: async (patientId, vitalSignsData) => {
    return apiCall(`api/v1/nurse/patients/${patientId}/vital-signs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(vitalSignsData),
    });
  },

  // Lấy lịch sử sinh hiệu
  getVitalSignsHistory: async (patientId) => {
    return apiCall(`api/v1/nurse/patients/${patientId}/vital-signs`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Quản lý thuốc và Medication Management
export const nurseMedicationAPI = {
  // Lấy danh sách thuốc cần cấp phát
  getMedicationSchedule: async () => {
    return apiCall('api/v1/nurse/medications/schedule', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Xác nhận đã cấp phát thuốc
  confirmMedication: async (medicationId) => {
    return apiCall(`api/v1/nurse/medications/${medicationId}/confirm`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách medication đang chờ thực hiện
  getPendingMedications: async () => {
    return apiCall('api/v1/inpatient/medications/nurse/pending', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Thực hiện medication (administer)
  administerMedication: async (administrationId, administrationData) => {
    return apiCall(`api/v1/inpatient/medications/${administrationId}/administer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(administrationData),
    });
  },

  // Từ chối medication (refuse)
  refuseMedication: async (administrationId, reason) => {
    return apiCall(`api/v1/inpatient/medications/${administrationId}/refuse?reason=${encodeURIComponent(reason)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Bỏ lỡ medication (miss)
  missMedication: async (administrationId, reason) => {
    return apiCall(`api/v1/inpatient/medications/${administrationId}/miss?reason=${encodeURIComponent(reason)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Quản lý yêu cầu nhập viện (Admission Requests)
export const nurseAdmissionRequestAPI = {
  // Lấy danh sách yêu cầu đã xác nhận (APPROVED)
  getApprovedRequests: async () => {
    // return apiCall('api/v1/admission-requests/status/APPROVED', {
    return apiCall('api/v1/admission-requests/approved-waiting-bed', {
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

  // Lấy danh sách yêu cầu chờ lâu
  getLongWaitingRequests: async () => {
    return apiCall('api/v1/admission-requests/long-waiting', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
  
  //Get Detail request
  getAdmissionRequestDetail: async (admissionRequestId) => {
    return apiCall(`api/v1/admission-requests/${admissionRequestId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
  
  // HÀM MỚI: Gán giường cho yêu cầu
  assignBedToRequest: async (admissionRequestId, bedId) => {
    return apiCall(`api/v1/admission-requests/${admissionRequestId}/assign-bed/${bedId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Hoàn thành yêu cầu nhập viện
  completeAdmissionRequest: async (admissionRequestId) => {
    return apiCall(`api/v1/admission-requests/${admissionRequestId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API quản lý điều trị nội trú
export const nurseInpatientStayAPI = {
  // Lấy danh sách điều trị nội trú đang hoạt động
  getActiveStays: async () => {
    return apiCall('api/v1/inpatient/stays/active', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết điều trị nội trú
  getStayDetail: async (inpatientStayId) => {
    return apiCall(`api/v1/inpatient/stays/${inpatientStayId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy workflow steps cho lượt điều trị nội trú
  getWorkflowSteps: async (inpatientStayId) => {
    return apiCall(`api/v1/inpatient/workflow/stay/${inpatientStayId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy workflow progress cho lượt điều trị nội trú
  getWorkflowProgress: async (inpatientStayId) => {
    return apiCall(`api/v1/inpatient/workflow/stay/${inpatientStayId}/progress`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách nursing notes cho lượt điều trị nội trú
  getNursingNotes: async (inpatientStayId) => {
    return apiCall(`api/v1/inpatient/nursing-notes/stays/${inpatientStayId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo nursing note mới
  createNursingNote: async (inpatientStayId, noteData) => {
    return apiCall(`api/v1/inpatient/nursing-notes/stays/${inpatientStayId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });
  },

  // Khởi tạo workflow cho lượt điều trị nội trú
  initializeWorkflow: async (inpatientStayId) => {
    return apiCall(`api/v1/inpatient/workflow/initialize/${inpatientStayId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết workflow step
  getWorkflowStepDetail: async (workflowStepId) => {
    return apiCall(`api/v1/inpatient/workflow/steps/${workflowStepId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Bắt đầu workflow step
  startWorkflowStep: async (workflowStepId) => {
    return apiCall(`api/v1/inpatient/workflow/steps/${workflowStepId}/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Hoàn thành workflow step
  completeWorkflowStep: async (workflowStepId) => {
    return apiCall(`api/v1/inpatient/workflow/steps/${workflowStepId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Bỏ qua workflow step
  skipWorkflowStep: async (workflowStepId, reason) => {
    return apiCall(`api/v1/inpatient/workflow/steps/${workflowStepId}/skip?reason=${encodeURIComponent(reason)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
  
  // === HÀM MỚI CẦN THÊM ===
  getTodayMedications: async (inpatientStayId) => {
    return apiCall(`api/v1/inpatient/medications/stays/${inpatientStayId}/today`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

export const nurseSafetyAssessmentAPI = {
  /**
   * Lấy danh sách đánh giá an toàn theo lượt điều trị
   */
  getAssessmentsByStay: async (inpatientStayId) => {
    return apiCall(`api/v1/patient-safety-assessments/stay/${inpatientStayId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
  
  /**
   * Tạo một đánh giá an toàn mới
   */
  createAssessment: async (assessmentData) => {
    // assessmentData phải chứa: inpatientStayId, assessmentType, assessmentDate, v.v.
    return apiCall('api/v1/patient-safety-assessments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(assessmentData),
    });
  },
  
};

export const nurseBedAPI = {

  getAllAvailableBeds: async () => {
    return apiCall('api/v1/bed-management/available', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
  /**
   * Lấy danh sách tất cả các khoa
   */
  getDepartments: async () => {
    return apiCall('api/v1/departments', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
  
  /**
   * LÀM VIỆC DỰA TRÊN GIẢ ĐỊNH:
   * API này trả về TẤT CẢ giường trong một khoa, không chỉ giường "available".
   */
  getBedsByDepartment: async (departmentId) => {
    // LƯU Ý: Tôi đang sử dụng API "available" mà bạn cung cấp,
    // nhưng giả định nó trả về tất cả giường.
    return apiCall(`api/v1/bed-management/available/department/${departmentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
  
  /**
   * API này bạn KHÔNG cung cấp, nhưng nó là cần thiết
   * để lấy chi tiết bệnh nhân + y lệnh khi click vào giường.
   * Đây là API ví dụ.
   */
  getBedDetails: async (bedId) => {
    // API này không tồn tại trong danh sách của bạn,
    // tôi thêm vào để logic modal hoạt động
    console.warn("Đang gọi API giả: getBedDetails. Cần API thật.");
    // return apiCall(`api/v1/bed-management/bed/${bedId}/details`, { ... });
    return new Promise(resolve => setTimeout(() => resolve({
      data: {
        patient: {
          id: 'BN-789', name: 'Bệnh nhân (API)', age: 45, gender: 'Nam',
          diagnosis: 'Viêm ruột thừa', admissionDate: '14/06/2025',
        },
        orders: [
          { id: 1, medicine: 'Kháng sinh X', dosage: '500mg x 2 lần/ngày', doctor: 'BS. Trần Văn C', timestamp: '11:00 15/06/2023' }
        ]
      }
    }), 500));
  }
};

export default {
  nurseAuthAPI,
  nurseDashboardAPI,
  nursePatientCareAPI,
  nurseVitalSignsAPI,
  nurseMedicationAPI,
  nurseAdmissionRequestAPI,
  nurseBedAPI,
  nurseInpatientStayAPI,
  nurseSafetyAssessmentAPI
};

