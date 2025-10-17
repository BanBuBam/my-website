# API Services Documentation

## Cấu trúc API

### 1. API cho Bệnh nhân (`api.js`)
- **Base URL**: `http://100.99.181.59:8081/`
- **Token Storage**: `accessToken`, `refreshToken` trong localStorage

#### Modules:
- `patientAuthAPI`: Đăng nhập, đăng ký, đăng xuất
- `patientAPI`: Quản lý thông tin bệnh nhân
- `appointmentAPI`: Đặt lịch khám
- `bookingAPI`: Lịch sử khám chữa bệnh
- `invoiceAPI`: Hóa đơn

### 2. API cho Nhân viên (`staff/`)

#### 2.1 Bác sĩ (`doctorAPI.js`)
- **Token Storage**: `doctorAccessToken`, `doctorRefreshToken`
- **Modules**:
  - `doctorAuthAPI`: Đăng nhập, đăng xuất
  - `doctorDashboardAPI`: Thống kê dashboard
  - `doctorExaminationAPI`: Khám bệnh
  - `doctorInpatientAPI`: Bệnh nhân nội trú
  - `doctorLabResultAPI`: Kết quả xét nghiệm
  - `doctorPrescriptionAPI`: Đơn thuốc

#### 2.2 Điều dưỡng (`nurseAPI.js`)
- **Token Storage**: `nurseAccessToken`, `nurseRefreshToken`
- **Modules**:
  - `nurseAuthAPI`: Đăng nhập, đăng xuất
  - `nurseDashboardAPI`: Thống kê dashboard
  - `nursePatientCareAPI`: Chăm sóc bệnh nhân
  - `nurseVitalSignsAPI`: Theo dõi sinh hiệu
  - `nurseMedicationAPI`: Quản lý thuốc

#### 2.3 Lễ tân (`receptionistAPI.js`)
- **Token Storage**: `receptionistAccessToken`, `receptionistRefreshToken`
- **Modules**:
  - `receptionistAuthAPI`: Đăng nhập, đăng xuất
  - `receptionistDashboardAPI`: Thống kê dashboard
  - `receptionistPatientAPI`: Tiếp nhận bệnh nhân
  - `receptionistAppointmentAPI`: Quản lý lịch hẹn
  - `receptionistLookupAPI`: Tra cứu

#### 2.4 Dược sĩ (`pharmacistAPI.js`)
- **Token Storage**: `pharmacistAccessToken`, `pharmacistRefreshToken`
- **Modules**:
  - `pharmacistAuthAPI`: Đăng nhập, đăng xuất
  - `pharmacistDashboardAPI`: Thống kê dashboard
  - `pharmacistInventoryAPI`: Quản lý tồn kho
  - `pharmacistImportAPI`: Nhập kho
  - `pharmacistExportAPI`: Xuất kho
  - `pharmacistPrescriptionAPI`: Cấp phát đơn thuốc
  - `pharmacistSupplierAPI`: Quản lý nhà cung cấp
  - `pharmacistExpiryAPI`: Quản lý hạn sử dụng

#### 2.5 Kế toán (`financeAPI.js`)
- **Token Storage**: `financeAccessToken`, `financeRefreshToken`
- **Modules**:
  - `financeAuthAPI`: Đăng nhập, đăng xuất
  - `financeDashboardAPI`: Thống kê dashboard
  - `financeInvoiceAPI`: Quản lý hóa đơn
  - `financePaymentAPI`: Thanh toán
  - `financeReportAPI`: Báo cáo tài chính

#### 2.6 Quản lý (`adminAPI.js`)
- **Token Storage**: `adminAccessToken`, `adminRefreshToken`
- **Modules**:
  - `adminAuthAPI`: Đăng nhập, đăng xuất
  - `adminDashboardAPI`: Thống kê dashboard
  - `adminStaffAPI`: Quản lý nhân viên
  - `adminDepartmentAPI`: Quản lý phòng ban
  - `adminServiceAPI`: Quản lý dịch vụ
  - `adminReportAPI`: Báo cáo hệ thống

## Cách sử dụng

### 1. Import API

```javascript
// Bệnh nhân
import { patientAuthAPI, patientAPI } from '../services/api';

// Nhân viên
import { doctorAuthAPI, doctorExaminationAPI } from '../services/staff/doctorAPI';
import { nurseAuthAPI, nursePatientCareAPI } from '../services/staff/nurseAPI';
import { receptionistAuthAPI, receptionistPatientAPI } from '../services/staff/receptionistAPI';
import { pharmacistAuthAPI, pharmacistInventoryAPI } from '../services/staff/pharmacistAPI';
import { financeAuthAPI, financeInvoiceAPI } from '../services/staff/financeAPI';
import { adminAuthAPI, adminStaffAPI } from '../services/staff/adminAPI';
```

### 2. Đăng nhập

```javascript
// Bệnh nhân
const response = await patientAuthAPI.login('email@example.com', 'password');
// Token tự động lưu vào localStorage

// Bác sĩ
const response = await doctorAuthAPI.login('doctor@example.com', 'password');
// Token tự động lưu vào localStorage với key: doctorAccessToken, doctorRefreshToken
```

### 3. Gọi API với token

```javascript
// Token tự động được thêm vào header, không cần truyền thủ công
const patients = await doctorExaminationAPI.getWaitingPatients();
const profile = await patientAPI.getProfile();
```

### 4. Đăng xuất

```javascript
// Bệnh nhân
await patientAuthAPI.logout();
// Token tự động xóa khỏi localStorage

// Bác sĩ
await doctorAuthAPI.logout();
// Token tự động xóa khỏi localStorage
```

## Lưu ý

1. **Token tự động**: Tất cả API đều tự động lưu và sử dụng token từ localStorage
2. **Error handling**: Tất cả API đều throw error khi có lỗi, cần wrap trong try-catch
3. **Token riêng biệt**: Mỗi loại nhân viên có token riêng để tránh xung đột
4. **Base URL**: Có thể thay đổi bằng biến môi trường `REACT_APP_BASE_URL`

## Ví dụ đầy đủ

```javascript
import React, { useState } from 'react';
import { patientAuthAPI } from '../services/api';

const LoginExample = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await patientAuthAPI.login(email, password);
      console.log('Login successful:', response);
      // Token đã được lưu tự động
      // Chuyển hướng đến trang chủ
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // JSX here
  );
};
```

