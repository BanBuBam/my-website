// API cho Bác sĩ
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

// API Authentication cho Bác sĩ
export const doctorAuthAPI = {
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
export const doctorDashboardAPI = {
  // Lấy dashboard data
  getDashboard: async () => {
    return apiCall('api/v1/dashboard/doctor', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy thống kê dashboard (legacy)
  getStatistics: async () => {
    return apiCall('api/v1/doctor/dashboard/statistics', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Khám bệnh
export const doctorExaminationAPI = {
  // Lấy danh sách bệnh nhân chờ khám
  getWaitingPatients: async () => {
    return apiCall('api/v1/doctor/examinations/waiting', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy thông tin bệnh nhân
  getPatientInfo: async (patientId) => {
    return apiCall(`api/v1/doctor/examinations/patient/${patientId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo phiếu khám bệnh
  createExamination: async (examinationData) => {
    return apiCall('api/v1/doctor/examinations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(examinationData),
    });
  },

  // Cập nhật phiếu khám bệnh
  updateExamination: async (examinationId, examinationData) => {
    return apiCall(`api/v1/doctor/examinations/${examinationId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(examinationData),
    });
  },
};

// API Bệnh nhân nội trú
export const doctorInpatientAPI = {
  // Lấy danh sách bệnh nhân nội trú
  getInpatients: async () => {
    return apiCall('api/v1/doctor/inpatients', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết bệnh nhân nội trú
  getInpatientDetail: async (inpatientId) => {
    return apiCall(`api/v1/doctor/inpatients/${inpatientId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Cập nhật thông tin bệnh nhân nội trú
  updateInpatient: async (inpatientId, data) => {
    return apiCall(`api/v1/doctor/inpatients/${inpatientId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(data),
    });
  },
};

// API Kết quả xét nghiệm
export const doctorLabResultAPI = {
  // Lấy danh sách kết quả xét nghiệm
  getLabResults: async (patientId) => {
    return apiCall(`api/v1/doctor/lab-results/patient/${patientId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết kết quả xét nghiệm
  getLabResultDetail: async (labResultId) => {
    return apiCall(`api/v1/doctor/lab-results/${labResultId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Đơn thuốc
export const doctorPrescriptionAPI = {
  // Tạo đơn thuốc
  // createPrescription: async (prescriptionData) => {
  //   return apiCall('api/v1/doctor/prescriptions', {
  //     method: 'POST',
  //     headers: {
  //       'Authorization': `Bearer ${getAccessToken()}`,
  //     },
  //     body: JSON.stringify(prescriptionData),
  //   });
  // },

  // Lấy danh sách đơn thuốc
  getPrescriptions: async (patientId) => {
    return apiCall(`api/v1/doctor/prescriptions/patient/${patientId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Lịch hẹn
export const doctorBookingAPI = {
  // Lấy danh sách lịch hẹn
  getBookings: async (params = {}) => {
    const queryParams = new URLSearchParams();

    // Thêm các tham số query nếu có
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.size !== undefined) queryParams.append('size', params.size);
    if (params.status) queryParams.append('status', params.status);
    if (params.bookingSource) queryParams.append('bookingSource', params.bookingSource);
    if (params.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params.toDate) queryParams.append('toDate', params.toDate);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `api/v1/doctor/bookings?${queryString}`
      : 'api/v1/doctor/bookings';

    return apiCall(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết lịch hẹn
  getBookingDetail: async (bookingId) => {
    return apiCall(`api/v1/doctor/bookings/${bookingId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

export const doctorBedAPI = {
  
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

// API Emergency Encounter
export const doctorEmergencyAPI = {
  // Lấy danh sách cấp cứu chờ phân loại (triage)
  getWaitingTriageEncounters: async () => {
    return apiCall('api/v1/emergency/encounters/waiting-triage', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

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

  // Lấy danh sách emergency encounter theo doctor
  getEmergencyEncountersByDoctor: async (doctorId) => {
    return apiCall(`api/v1/emergency/encounters/doctor/${doctorId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
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

  // Tạo chỉ định xét nghiệm cấp cứu
  createDiagnosticOrder: async (diagnosticOrderData) => {
    return apiCall('api/v1/emergency/diagnostic-orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(diagnosticOrderData),
    });
  },

  // Thêm vital signs cho encounter
  addVitalSigns: async (encounterId, vitalSignsData) => {
    return apiCall(`api/v1/encounters/${encounterId}/vitals`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(vitalSignsData),
    });
  },

  // Lấy danh sách vital signs của encounter
  getVitalSigns: async (encounterId) => {
    return apiCall(`api/v1/encounters/${encounterId}/vitals`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Phân công điều dưỡng cho emergency encounter
  assignNurse: async (emergencyEncounterId, nurseId) => {
    return apiCall(`api/v1/emergency/encounters/${emergencyEncounterId}/assign-nurse?nurseId=${nurseId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Phân công bác sĩ cho emergency encounter
  assignDoctor: async (emergencyEncounterId, doctorId) => {
    return apiCall(`api/v1/emergency/encounters/${emergencyEncounterId}/assign-doctor?doctorId=${doctorId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Diagnostic Orders (cho Bác sĩ)
export const doctorDiagnosticOrderAPI = {
  // Lấy danh sách chỉ định xét nghiệm chờ xử lý
  getPendingDiagnosticOrders: async () => {
    return apiCall('api/v1/emergency/diagnostic-orders/pending', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách chỉ định xét nghiệm theo encounter
  getDiagnosticOrdersByEncounter: async (encounterId) => {
    return apiCall(`api/v1/emergency/diagnostic-orders/encounter/${encounterId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách chỉ định xét nghiệm theo bác sĩ
  getDiagnosticOrdersByDoctor: async (doctorId) => {
    return apiCall(`api/v1/emergency/diagnostic-orders/doctor/${doctorId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết chỉ định xét nghiệm
  getDiagnosticOrderDetail: async (orderId) => {
    return apiCall(`api/v1/emergency/diagnostic-orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Xác nhận kết quả xét nghiệm
  confirmDiagnosticOrder: async (orderId, orderData) => {
    return apiCall(`api/v1/emergency/diagnostic-orders/${orderId}/confirm`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
  },

  // Cập nhật trạng thái điều trị của emergency encounter
  updateEmergencyStatus: async (emergencyEncounterId, status) => {
    return apiCall(`api/v1/emergency/encounters/${emergencyEncounterId}/status?status=${status}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Xuất viện đơn giản
  dischargeSimple: async (emergencyEncounterId) => {
    return apiCall(`api/v1/emergency/encounters/${emergencyEncounterId}/discharge`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Xuất viện có đơn thuốc
  dischargeWithPrescription: async (emergencyEncounterId, dischargeData) => {
    return apiCall(`api/v1/emergency/encounters/${emergencyEncounterId}/discharge`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dischargeData),
    });
  },

  // Nhập viện nội trú
  admitInpatient: async (emergencyEncounterId, admissionData) => {
    return apiCall(`api/v1/emergency/encounters/${emergencyEncounterId}/admit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(admissionData),
    });
  },

  // Chuyển viện đơn giản
  transferSimple: async (emergencyEncounterId) => {
    return apiCall(`api/v1/emergency/encounters/${emergencyEncounterId}/transfer`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Chuyển viện có giấy
  transferWithDocument: async (emergencyEncounterId, transferData) => {
    return apiCall(`api/v1/emergency/encounters/${emergencyEncounterId}/transfer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transferData),
    });
  },

  // Kích hoạt protocol
  activateProtocol: async (protocolData) => {
    return apiCall('api/v1/emergency/protocols/activate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(protocolData),
    });
  },

  // Lấy danh sách protocol theo patient
  getProtocolsByPatient: async (patientId) => {
    return apiCall(`api/v1/emergency/protocols/patient/${patientId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết protocol
  getProtocolDetail: async (protocolId) => {
    return apiCall(`api/v1/emergency/protocols/${protocolId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy protocols theo department
  getProtocolsByDepartment: async (departmentId) => {
    return apiCall(`api/v1/emergency/protocols/department/${departmentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy tất cả protocols đang active
  getActiveProtocols: async () => {
    return apiCall('api/v1/emergency/protocols/active', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Gửi cảnh báo protocol
  sendProtocolAlert: async (protocolId, alertMessage) => {
    return apiCall(`api/v1/emergency/protocols/${protocolId}/alert?alertMessage=${encodeURIComponent(alertMessage)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy quy trình protocol
  getProtocolProcedures: async (protocolType) => {
    return apiCall(`api/v1/emergency/protocols/procedures/${protocolType}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy đội phản ứng
  getResponseTeam: async (protocolType, departmentId) => {
    return apiCall(`api/v1/emergency/protocols/response-team/${protocolType}?departmentId=${departmentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Giải quyết protocol
  resolveProtocol: async (protocolId, resolutionNotes) => {
    return apiCall(`api/v1/emergency/protocols/${protocolId}/resolve?resolutionNotes=${encodeURIComponent(resolutionNotes)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Encounter (thông thường)
export const doctorEncounterAPI = {
  // Lấy danh sách encounter theo doctor
  getEncountersByDoctor: async (doctorId) => {
    return apiCall(`api/v1/encounters/doctor/${doctorId}`, {
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

  // Lấy encounter status
  getEncounterStatus: async (encounterId) => {
    return apiCall(`api/v1/encounters/${encounterId}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Thêm vital signs cho encounter
  addVitalSigns: async (encounterId, vitalSignsData) => {
    return apiCall(`api/v1/encounters/${encounterId}/vitals`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(vitalSignsData),
    });
  },

  // Lấy danh sách vital signs của encounter
  getVitalSigns: async (encounterId) => {
    return apiCall(`api/v1/encounters/${encounterId}/vitals`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo clinical note (y lệnh) cho encounter
  createClinicalNote: async (encounterId, noteData) => {
    return apiCall(`api/v1/encounters/${encounterId}/notes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(noteData),
    });
  },

  // Lấy danh sách clinical notes của encounter
  getClinicalNotes: async (encounterId) => {
    return apiCall(`api/v1/encounters/${encounterId}/notes`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Cập nhật clinical note
  updateClinicalNote: async (noteId, noteData) => {
    return apiCall(`api/v1/notes/${noteId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(noteData),
    });
  },

  // Ký clinical note
  signClinicalNote: async (noteId) => {
    return apiCall(`api/v1/notes/${noteId}/sign`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Export clinical note as PDF
  exportClinicalNotePDF: async (clinicalNoteId) => {
    const response = await fetch(`/api/v1/notes/${clinicalNoteId}/export-medical-record-pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Không thể xuất PDF');
    }

    return response.blob();
  },

  // Tạo prescription cho encounter
  createPrescription: async (encounterId, prescriptionData) => {
    return apiCall(`api/v1/encounters/${encounterId}/prescriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(prescriptionData),
    });
  },

  // Lấy danh sách prescriptions của encounter
  getPrescriptions: async (encounterId) => {
    return apiCall(`api/v1/encounters/${encounterId}/prescriptions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách medical tests
  getMedicalTests: async () => {
    return apiCall('api/v1/medical-tests', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo lab test order cho encounter
  createLabTestOrder: async (encounterId, orderData) => {
    return apiCall(`api/v1/encounters/${encounterId}/lab-orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(orderData),
    });
  },

  // Lấy danh sách lab test orders của encounter
  getLabTestOrders: async (encounterId) => {
    return apiCall(`api/v1/encounters/${encounterId}/lab-orders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết prescription
  getPrescriptionDetail: async (prescriptionId) => {
    return apiCall(`api/v1/prescriptions/${prescriptionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Ký đơn thuốc
  signPrescription: async (prescriptionId) => {
    return apiCall(`api/v1/prescriptions/${prescriptionId}/sign`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Thay thế đơn thuốc (Replace Prescription)
  // Per Vietnamese legal requirements - SIGNED prescriptions cannot be cancelled, only replaced
  replacePrescription: async (prescriptionId, replacementReason, prescriptionData) => {
    return apiCall(`api/v1/prescriptions/${prescriptionId}/replace?replacementReason=${encodeURIComponent(replacementReason)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prescriptionData),
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

  // Lấy danh sách prescriptions của encounter
  // getPrescriptions: async (encounterId) => {
  //   return apiCall(`api/v1/encounters/${encounterId}/prescriptions`, {
  //     method: 'GET',
  //     headers: {
  //       'Authorization': `Bearer ${getAccessToken()}`,
  //     },
  //   });
  // },

  // Tạo imaging order cho encounter
  createImagingOrder: async (encounterId, orderData) => {
    return apiCall(`api/v1/encounters/${encounterId}/imaging-orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(orderData),
    });
  },

  // Lấy danh sách imaging orders của encounter
  getImagingOrders: async (encounterId) => {
    return apiCall(`api/v1/encounters/${encounterId}/imaging-orders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết imaging order
  getImagingOrderDetail: async (imagingOrderId) => {
    return apiCall(`api/v1/imaging-orders/${imagingOrderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Schedule imaging exam
  scheduleImagingExam: async (imagingOrderId, scheduleData) => {
    const params = new URLSearchParams({
      scheduledDatetime: scheduleData.scheduledDatetime,
      scheduledRoom: scheduleData.scheduledRoom,
      estimatedDurationMinutes: scheduleData.estimatedDurationMinutes
    });

    return apiCall(`api/v1/imaging-orders/${imagingOrderId}/schedule?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Get radiologists (department 6, role DOCTOR)
  getRadiologists: async () => {
    return apiCall('api/v1/employees/department/6/role/DOCTOR', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Start imaging exam
  startImagingExam: async (orderId, radiologistId) => {
    return apiCall(`api/v1/imaging-orders/${orderId}/start-exam?radiologistId=${radiologistId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      // body: JSON.stringify({ radiologistId }),
    });
  },

  // Complete imaging exam
  completeImagingExam: async (imagingOrderId) => {
    return apiCall(`api/v1/imaging-orders/${imagingOrderId}/complete-exam`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Report imaging results
  reportImagingResults: async (imagingOrderId, reportData) => {
    return apiCall(`api/v1/imaging-orders/${imagingOrderId}/report`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(reportData),
    });
  },
};

// API ICD Diseases
export const icdDiseaseAPI = {
  // Lấy danh sách ICD diseases
  getICDDiseases: async (keyword = '', page = 0, size = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    // Thêm keyword nếu có
    if (keyword && keyword.trim() !== '') {
      params.append('keyword', keyword.trim());
    }

    return apiCall(`api/v1/icd-diseases?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Services
export const serviceAPI = {
  // Lấy danh sách services với pagination và tìm kiếm
  getServices: async (keyword = '', page = 0, size = 100, sort = []) => {
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

    return apiCall(`api/services?${params.toString()}`, {
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

  // Lấy tất cả medicines (không phân trang)
  getAllMedicines: async () => {
    return apiCall('api/v1/medicines/all', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Departments
export const departmentAPI = {
  // Lấy danh sách departments
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
};

// API Hospitals
export const hospitalAPI = {
  // Lấy danh sách bệnh viện
  getHospitals: async () => {
    return apiCall('api/v1/hospitals', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Employees
export const employeeAPI = {
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
    return employeeAPI.getEmployeesByRole('NURSE', page, size);
  },

  // Lấy danh sách bác sĩ
  getDoctors: async (page = 0, size = 100) => {
    return employeeAPI.getEmployeesByRole('DOCTOR', page, size);
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

// API Inpatient Treatment (Điều trị nội trú)
export const doctorInpatientTreatmentAPI = {
  // Lấy danh sách điều trị nội trú đang hoạt động
  getActiveInpatientStays: async () => {
    return apiCall('api/v1/inpatient/stays/active', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết điều trị nội trú
  getInpatientStayDetail: async (inpatientStayId) => {
    return apiCall(`api/v1/inpatient/stays/${inpatientStayId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách đơn thuốc theo encounter
  getPrescriptionsByEncounter: async (encounterId) => {
    return apiCall(`api/v1/encounters/${encounterId}/prescriptions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo lượt thuốc điều trị nội trú
  createInpatientMedication: async (medicationData) => {
    return apiCall('api/v1/inpatient/medications', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(medicationData),
    });
  },

  // Tạo kế hoạch xuất viện
  createDischargePlanning: async (inpatientStayId, dischargePlanData) => {
    return apiCall(`api/v1/inpatient/stays/${inpatientStayId}/discharge-planning`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dischargePlanData),
    });
  },
};

// API Admission Requests (Yêu cầu nhập viện)
export const admissionRequestAPI = {
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
  
  // HÀM MỚI ĐỂ GỌI ENCOUNTER
  getFinishedOutpatientEncounters: async () => {
    return apiCall('api/v1/encounters/finished-outpatient', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Patient List
export const patientListAPI = {
  // Tìm kiếm bệnh nhân với phân trang
  searchPatients: async (params = {}) => {
    const queryParams = new URLSearchParams();

    // Thêm các tham số query nếu có
    if (params.name) queryParams.append('name', params.name);
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.size !== undefined) queryParams.append('size', params.size);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `api/v1/patient/admin?${queryString}`
      : 'api/v1/patient/admin';

    return apiCall(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách bệnh nhân active
  getActivePatients: async (page = 0, size = 100) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    return apiCall(`api/v1/patient/admin/active?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tìm kiếm bệnh nhân theo tên (cho emergency)
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

// API Medication Orders
export const medicationOrderAPI = {
  // Tạo nhóm y lệnh (Medication Order Group)
  createMedicationOrderGroup: async (orderGroupData) => {
    return apiCall('api/v1/medication-order-groups', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(orderGroupData),
    });
  },

  // Tạo y lệnh lẻ (Single Medication Order)
  createSingleMedicationOrder: async (orderData) => {
    return apiCall('api/v1/medication-orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(orderData),
    });
  },

  // Xác nhận nhóm y lệnh (Confirm Medication Order Group)
  confirmMedicationOrderGroup: async (groupId) => {
    return apiCall(`api/v1/medication-order-groups/${groupId}/confirm`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách nhóm y lệnh theo inpatient stay
  getMedicationOrderGroupsByInpatientStay: async (inpatientStayId) => {
    return apiCall(`api/v1/medication-order-groups/inpatient-stays/${inpatientStayId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết y lệnh
  getMedicationOrderDetail: async (orderId) => {
    return apiCall(`api/v1/medication-orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạm dừng y lệnh (Hold)
  holdMedicationOrder: async (orderId, holdData) => {
    return apiCall(`api/v1/medication-orders/${orderId}/hold?reason=${holdData.holdReason}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(holdData),
    });
  },

  // Tiếp tục y lệnh (Resume)
  resumeMedicationOrder: async (orderId, resumeData) => {
    return apiCall(`api/v1/medication-orders/${orderId}/resume`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(resumeData),
    });
  },

  // Ngừng y lệnh (Discontinue)
  discontinueMedicationOrder: async (orderId, discontinueData) => {
    return apiCall(`api/v1/medication-orders/${orderId}/discontinue`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(discontinueData),
    });
  },
  
  //lấy danh sách nhóm y lệnh.
  getMedicationOrderGroupsByStay: async (inpatientStayId) => {
    return apiCall(`api/v1/medication-order-groups/inpatient-stays/${inpatientStayId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Emergency Consultations (Hội chẩn)
export const doctorConsultationAPI = {
  // Lấy danh sách hội chẩn của bác sĩ
  getConsultationsByDoctor: async (doctorId) => {
    return apiCall(`api/v1/emergency-consultations/doctor/${doctorId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy danh sách hội chẩn chưa tạo booking
  getConsultationsWithoutBooking: async () => {
    return apiCall('api/v1/emergency-consultations/without-booking', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo hội chẩn mới
  createConsultation: async (consultationData) => {
    return apiCall('api/v1/emergency-consultations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(consultationData),
    });
  },

  // Lấy chi tiết hội chẩn
  getConsultationDetail: async (consultationId) => {
    return apiCall(`api/v1/emergency-consultations/${consultationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

export const doctorDischargePlanningAPI = {
  // Lấy thông tin discharge planning theo inpatient stay ID
  getDischargePlanningByStay: async (inpatientStayId) => {
    return apiCall(`api/v1/inpatient/stays/${inpatientStayId}/discharge-planning`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
  
  // Lấy chi tiết discharge planning theo discharge plan ID
  getDischargePlanningDetail: async (dischargePlanId) => {
    return apiCall(`api/v1/inpatient/discharge-planning/${dischargePlanId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
  
  // Tạo mới discharge planning cho inpatient stay
  createDischargePlanning: async (inpatientStayId, planData) => {
    return apiCall(`api/v1/inpatient/stays/${inpatientStayId}/discharge-planning`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(planData),
    });
  },
  
  // Cập nhật discharge planning
  updateDischargePlanning: async (dischargePlanId, planData) => {
    return apiCall(`api/v1/inpatient/discharge-planning/${dischargePlanId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(planData),
    });
  },
  
  // Phê duyệt discharge planning (Thường bác sĩ sẽ dùng nút này)
  approveDischargePlanning: async (dischargePlanId) => {
    return apiCall(`api/v1/inpatient/discharge-planning/${dischargePlanId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
  
  // Thực hiện xuất viện
  executeDischarge: async (stayId, dischargeData) => {
    return apiCall(`api/v1/inpatient/stays/${stayId}/discharge`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dischargeData),
    });
  },
  
  // === HÀM MỚI: Đặt lệnh xuất viện ===
  orderDischarge: async (stayId, reason) => {
    // Lưu ý: Tôi gửi reason dưới dạng query param cho an toàn với request POST đơn giản
    // Nếu backend nhận JSON body { "reason": "..." } thì sửa lại body bên dưới
    return apiCall(`api/v1/inpatient/stays/${stayId}/order-discharge?reason=${encodeURIComponent(reason)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        // 'Content-Type': 'application/json' // Bật dòng này nếu gửi body
      },
      // body: JSON.stringify({ reason }) // Dùng dòng này nếu backend nhận JSON
    });
  },
  
  // === HÀM MỚI: Hủy lệnh xuất viện ===
  cancelDischargeOrder: async (stayId, reason) => {
    return apiCall(`api/v1/inpatient/stays/${stayId}/cancel-discharge-order?reason=${encodeURIComponent(reason)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

// API Follow-up (Tái khám)
export const doctorFollowUpAPI = {
  // Lấy danh sách tái khám của bác sĩ
  getFollowUpsByDoctor: async (doctorId) => {
    return apiCall(`api/v1/doctors/${doctorId}/follow-up`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Lấy chi tiết tái khám
  getFollowUpDetail: async (appointmentId) => {
    return apiCall(`api/v1/follow-up/${appointmentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },

  // Tạo lịch tái khám cho encounter
  createFollowUpForEncounter: async (encounterId, followUpData) => {
    return apiCall(`api/v1/encounters/${encounterId}/follow-up`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(followUpData),
    });
  },

  // Lấy danh sách lịch tái khám của encounter
  getFollowUpsByEncounter: async (encounterId) => {
    return apiCall(`api/v1/encounters/${encounterId}/follow-up`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
  },
};

export default {
  doctorAuthAPI,
  doctorDashboardAPI,
  doctorExaminationAPI,
  doctorInpatientAPI,
  doctorLabResultAPI,
  doctorPrescriptionAPI,
  doctorBookingAPI,
  doctorEmergencyAPI,
  doctorEncounterAPI,
  icdDiseaseAPI,
  serviceAPI,
  medicineAPI,
  departmentAPI,
  hospitalAPI,
  employeeAPI,
  doctorInpatientTreatmentAPI,
  admissionRequestAPI,
  patientListAPI,
  medicationOrderAPI,
  doctorConsultationAPI,
  doctorDischargePlanningAPI,
  doctorBedAPI,
  doctorDiagnosticOrderAPI,
  doctorFollowUpAPI,
};

