# 🏥 HƯỚNG DẪN API LUỒNG NỘI TRÚ - TỪ KÊ ĐƠN THUỐC ĐẾN XUẤT VIỆN

**Hospital Management System - Spring Boot 3.3.5**
**Ngày tạo:** 2025-11-20
**Server:** http://100.96.182.10:8081
**Database:** PostgreSQL 15

---

## 📋 MỤC LỤC

1. [Tổng quan luồng nghiệp vụ](#1-tổng-quan-luồng-nghiệp-vụ)
2. [Phân quyền và Roles](#2-phân-quyền-và-roles)
3. [BƯỚC 1: Nhập viện (Admission)](#3-bước-1-nhập-viện-admission)
4. [BƯỚC 2: Bác sĩ kê đơn thuốc](#4-bước-2-bác-sĩ-kê-đơn-thuốc)
5. [BƯỚC 3: Dược sĩ kiểm tra và chuẩn bị](#5-bước-3-dược-sĩ-kiểm-tra-và-chuẩn-bị)
6. [BƯỚC 4: Dược sĩ xuất kho và bàn giao](#6-bước-4-dược-sĩ-xuất-kho-và-bàn-giao)
7. [BƯỚC 5: Điều dưỡng cấp phát thuốc](#7-bước-5-điều-dưỡng-cấp-phát-thuốc)
8. [BƯỚC 6: Theo dõi và quản lý](#8-bước-6-theo-dõi-và-quản-lý)
9. [BƯỚC 7: Xuất viện (Discharge)](#9-bước-7-xuất-viện-discharge)
10. [Các API hỗ trợ khác](#10-các-api-hỗ-trợ-khác)

---

## 1. TỔNG QUAN LUỒNG NGHIỆP VỤ

### 1.1. Sơ đồ luồng

```
┌─────────────────────────────────────────────────────────────────────┐
│                        LUỒNG NỘI TRÚ HOÀN CHỈNH                     │
└─────────────────────────────────────────────────────────────────────┘

1. NHẬP VIỆN (ADMISSION)
   └─> Doctor/Admin: POST /api/v1/inpatient/encounters/{encounterId}/admit
       ├─> Chuyển từ ngoại trú sang nội trú
       ├─> Phân giường tự động hoặc chỉ định
       └─> Khởi tạo workflow tracking

2. KÊ ĐƠN THUỐC (MEDICATION ORDER)
   └─> Doctor: POST /api/v1/medication-order-groups
       ├─> Tạo nhóm Y lệnh (batch ordering)
       ├─> Kê nhiều thuốc cùng lúc
       ├─> Status: DRAFT → ORDERED (sau khi confirm)
       └─> Kiểm tra tương tác thuốc tự động

3. KIỂM TRA & DUYỆT (VERIFICATION)
   └─> Pharmacist: POST /api/v1/medication-order-groups/{groupId}/verify
       ├─> Kiểm tra liều lượng, chống chỉ định
       ├─> Kiểm tra tương tác thuốc
       ├─> Status: ORDERED → VERIFIED
       └─> Ghi chú kiểm tra

4. CHUẨN BỊ THUỐC (PREPARATION)
   └─> Pharmacist: POST /api/v1/medication-order-groups/{groupId}/prepare
       ├─> Chuẩn bị unit-dose
       ├─> Đóng gói theo liều
       ├─> Status: VERIFIED → PREPARED
       └─> Ghi chú chuẩn bị

5. XUẤT KHO & BÀN GIAO (DISPENSING)
   └─> Pharmacist: POST /api/v1/medication-order-groups/{groupId}/dispense
       ├─> Tạo phiếu xuất kho (GoodsIssue)
       ├─> Trừ inventory tự động
       ├─> Bàn giao cho điều dưỡng
       ├─> Status: PREPARED → DISPENSED
       └─> Ghi nhận người nhận (nurseId)

6. CẤP PHÁT THUỐC (ADMINISTRATION)
   └─> Nurse: POST /api/v1/inpatient/medications/{administrationId}/administer
       ├─> Quét barcode (5 Rights verification)
       ├─> Ghi nhận phản ứng bệnh nhân
       ├─> Status: DISPENSED → ADMINISTERED
       └─> Ghi chú cấp phát

7. XUẤT VIỆN (DISCHARGE)
   └─> Doctor: POST /api/v1/inpatient/stays/{stayId}/discharge
       ├─> Ngừng tất cả Y lệnh đang active
       ├─> Giải phóng giường
       ├─> Tạo đơn thuốc mang về (nếu có)
       └─> Status: ACTIVE → DISCHARGED
```

### 1.2. Các trạng thái (Status) quan trọng

#### InpatientStay Status
- `ACTIVE` - Đang điều trị
- `DISCHARGED` - Đã xuất viện
- `TRANSFERRED` - Đã chuyển viện

#### MedicationOrderGroup Status
- `DRAFT` - Nháp (chưa xác nhận)
- `ORDERED` - Đã kê đơn (chờ duyệt)
- `VERIFIED` - Đã kiểm tra (chờ chuẩn bị)
- `PREPARED` - Đã chuẩn bị (chờ xuất kho)
- `DISPENSED` - Đã xuất kho (chờ cấp phát)
- `COMPLETED` - Hoàn thành
- `CANCELLED` - Đã hủy
- `DISCONTINUED` - Đã ngừng

#### MedicationOrder Status
- `ORDERED` - Đã kê đơn
- `VERIFIED` - Đã duyệt
- `READY` - Sẵn sàng
- `ADMINISTERED` - Đã thực hiện
- `HELD` - Tạm dừng
- `DISCONTINUED` - Ngừng
- `REFUSED` - Bệnh nhân từ chối
- `MISSED` - Bỏ lỡ

---

## 2. PHÂN QUYỀN VÀ ROLES

### 2.1. Bảng phân quyền tổng hợp

| Permission | Mô tả | DOCTOR | PHARMACIST | NURSE | ADMIN |
|------------|-------|--------|------------|-------|-------|
| `inpatient.admit` | Nhập viện | ✅ | ❌ | ❌ | ✅ |
| `inpatient.view` | Xem thông tin nội trú | ✅ | ✅ | ✅ | ✅ |
| `inpatient.discharge` | Xuất viện | ✅ | ❌ | ❌ | ✅ |
| `medication.order.create` | Tạo Y lệnh | ✅ | ❌ | ❌ | ✅ |
| `medication.order.view` | Xem Y lệnh | ✅ | ✅ | ✅ | ✅ |
| `medication.order.verify` | Kiểm tra Y lệnh | ❌ | ✅ | ❌ | ✅ |
| `medication.order.prepare` | Chuẩn bị thuốc | ❌ | ✅ | ❌ | ✅ |
| `medication.order.dispense` | Xuất kho thuốc | ❌ | ✅ | ❌ | ✅ |
| `medication.administer` | Cấp phát thuốc | ❌ | ❌ | ✅ | ✅ |
| `medication.view` | Xem thông tin thuốc | ✅ | ✅ | ✅ | ✅ |
| `bed.transfer` | Chuyển giường | ✅ | ❌ | ✅ | ✅ |
| `bed.manage` | Quản lý giường | ❌ | ❌ | ✅ | ✅ |

### 2.2. Tài khoản test

```json
// DOCTOR
{
  "username": "doctor3",
  "password": "Password123!"
}

// PHARMACIST
{
  "username": "pharmacist1",
  "password": "Password123!"
}

// NURSE
{
  "username": "nurse1",
  "password": "Password123!"
}

// ADMIN
{
  "username": "admin1",
  "password": "Password123!"
}
```

### 2.3. Cách lấy JWT Token

**Endpoint:** `POST /api/v1/auth/login`

**Request:** ⚠️ **QUAN TRỌNG: Phải có field `platform`**
```json
{
  "username": "doctor3",
  "password": "Password123!",
  "platform": "WEB"
}
```

**Request Fields:**

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `username` | String | ✅ | Tên đăng nhập |
| `password` | String | ✅ | Mật khẩu |
| `platform` | String | ✅ | Nền tảng: `WEB`, `MOBILE`, hoặc `TABLET` |

**Response:**
```json
{
  "status": "OK",
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400000,
    "claims": {
      "employeeId": 106,
      "fullName": "Dr. John Doe",
      "roles": ["DOCTOR"]
    }
  }
}
```

**Sử dụng token:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

---

## 3. BƯỚC 1: NHẬP VIỆN (ADMISSION)

### 3.1. API: Nhập viện bệnh nhân

**Endpoint:** `POST /api/v1/inpatient/encounters/{encounterId}/admit`

**Permission:** `inpatient.admit`

**Role:** DOCTOR, ADMIN

**Mô tả:** Chuyển bệnh nhân từ ngoại trú sang nội trú, phân giường tự động hoặc theo chỉ định

**Path Parameters:**
- `encounterId` (Integer, required) - ID của encounter ngoại trú

**Request Body:**
```json
{
  "admissionDate": "2025-11-20T10:00:00",
  "admissionDiagnosis": "Viêm phổi nặng, cần theo dõi và điều trị nội trú",
  "admissionType": "URGENT",
  "attendingDoctorId": 5,
  "preferredBedId": 12,
  "preferredRoomType": "Standard",
  "specialRequirements": "Cần theo dõi sát, oxygen hỗ trợ",
  "admissionNotes": "Bệnh nhân có tiền sử hen suyễn"
}
```

**Request Fields:**

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `admissionDate` | DateTime | ✅ | Ngày giờ nhập viện (ISO 8601) |
| `admissionDiagnosis` | String | ✅ | Chẩn đoán nhập viện |
| `admissionType` | Enum | ✅ | Loại nhập viện: `EMERGENCY`, `PLANNED`, `URGENT` |
| `attendingDoctorId` | Integer | ✅ | ID bác sĩ điều trị chính |
| `preferredBedId` | Integer | ❌ | ID giường mong muốn (nếu không có sẽ tự động phân) |
| `preferredRoomType` | String | ❌ | Loại phòng: `Standard`, `VIP`, `ICU` |
| `specialRequirements` | String | ❌ | Yêu cầu đặc biệt |
| `admissionNotes` | String | ❌ | Ghi chú nhập viện |

**Response:**
```json
{
  "status": "OK",
  "message": "Patient admitted successfully",
  "data": {
    "stayId": 123,
    "encounterId": 456,
    "patientId": 789,
    "patientName": "Nguyễn Văn A",
    "admissionDate": "2025-11-20T10:00:00",
    "admissionDiagnosis": "Viêm phổi nặng, cần theo dõi và điều trị nội trú",
    "admissionType": "URGENT",
    "bedId": 12,
    "bedNumber": "B-201",
    "roomNumber": "201",
    "departmentId": 3,
    "departmentName": "Khoa Nội",
    "attendingDoctorId": 5,
    "attendingDoctorName": "BS. Trần Thị B",
    "status": "ACTIVE",
    "isActive": true,
    "isDischarged": false,
    "createdAt": "2025-11-20T10:00:00",
    "createdBy": "doctor3"
  }
}
```

**Lưu ý:**
- Encounter phải ở trạng thái `ACTIVE` và chưa có inpatient stay
- Nếu không chỉ định `preferredBedId`, hệ thống sẽ tự động tìm giường trống phù hợp
- Giường được chọn phải ở trạng thái `AVAILABLE`
- Bác sĩ điều trị phải thuộc khoa có giường được phân

---

## 4. BƯỚC 2: BÁC SĨ KÊ ĐƠN THUỐC

### 4.1. API: Tạo nhóm Y lệnh (Batch Ordering)

**Endpoint:** `POST /api/v1/medication-order-groups`

**Permission:** `medication.order.create`

**Role:** DOCTOR

**Mô tả:** Bác sĩ kê nhiều thuốc cùng lúc cho bệnh nhân nội trú

**Request Body:**
```json
{
  "encounterId": 456,
  "inpatientStayId": 123,
  "patientId": 789,
  "priority": "ROUTINE",
  "isStat": false,
  "orderNotes": "Điều trị viêm phổi, theo dõi sát",
  "medications": [
    {
      "medicineId": 101,
      "dosage": "500mg",
      "route": "IV",
      "frequency": "Q8H",
      "durationDays": 7,
      "quantityOrdered": 21,
      "isPrn": false,
      "isStat": false,
      "specialInstructions": "Truyền chậm trong 30 phút. Kiểm tra phản ứng dị ứng trước khi truyền"
    },
    {
      "medicineId": 102,
      "dosage": "10mg",
      "route": "ORAL",
      "frequency": "BID",
      "durationDays": 5,
      "quantityOrdered": 10,
      "isPrn": false,
      "isStat": false,
      "specialInstructions": "Uống sau ăn. Theo dõi huyết áp"
    }
  ]
}
```

**Request Fields:**

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `encounterId` | Integer | ✅ | ID encounter |
| `inpatientStayId` | Integer | ✅ | ID đợt nội trú |
| `patientId` | Integer | ✅ | ID bệnh nhân |
| `priority` | Enum | ✅ | Độ ưu tiên: `ROUTINE`, `URGENT`, `STAT` |
| `isStat` | Boolean | ❌ | Cấp cứu (mặc định: false) |
| `orderNotes` | String | ❌ | Ghi chú chung cho nhóm Y lệnh |
| `medications` | Array | ✅ | Danh sách thuốc (tối thiểu 1) |

**Medication Item Fields:**

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `medicineId` | Integer | ✅ | ID thuốc |
| `dosage` | String | ✅ | Liều lượng (VD: "500mg", "2 viên") |
| `route` | String | ✅ | Đường dùng: `ORAL`, `IV`, `IM`, `SC`, `TOPICAL`, `INHALATION`, `RECTAL`, `SUBLINGUAL`, `TRANSDERMAL`, `OTHER` ⚠️ **Phải dùng giá trị đầy đủ, KHÔNG dùng viết tắt như "PO"** |
| `frequency` | String | ✅ | Tần suất: `QD`, `BID`, `TID`, `QID`, `Q4H`, `Q6H`, `Q8H`, `Q12H`, `PRN` |
| `durationDays` | Integer | ✅ | Số ngày điều trị |
| `quantityOrdered` | Integer | ❌ | Tổng số lượng (optional, hệ thống tự tính) |
| `isPrn` | Boolean | ❌ | Dùng khi cần (mặc định: false) |
| `isStat` | Boolean | ❌ | Cấp cứu (mặc định: false) |
| `specialInstructions` | String | ❌ | Hướng dẫn đặc biệt cho thuốc này |

**Response:**
```json
{
  "status": "OK",
  "message": "Medication order group created successfully",
  "data": {
    "groupId": 501,
    "encounterId": 456,
    "inpatientStayId": 123,
    "patientId": 789,
    "patientName": "Nguyễn Văn A",
    "orderingDoctorId": 5,
    "orderingDoctorName": "BS. Trần Thị B",
    "orderDate": "2025-11-20T10:30:00",
    "priority": "ROUTINE",
    "status": "DRAFT",
    "medicationCount": 2,
    "medications": [
      {
        "orderId": 1001,
        "medicineId": 101,
        "medicineName": "Ceftriaxone 1g",
        "dosage": "500mg",
        "route": "IV",
        "frequency": "Q8H",
        "durationDays": 7,
        "quantityOrdered": 21,
        "status": "ORDERED",
        "isPrn": false,
        "isStat": false
      },
      {
        "orderId": 1002,
        "medicineId": 102,
        "medicineName": "Amlodipine 10mg",
        "dosage": "10mg",
        "route": "ORAL",
        "frequency": "BID",
        "durationDays": 5,
        "quantityOrdered": 10,
        "status": "ORDERED",
        "isPrn": false,
        "isStat": false
      }
    ],
    "createdAt": "2025-11-20T10:30:00",
    "createdBy": "doctor3"
  }
}
```

### 4.2. API: Xác nhận nhóm Y lệnh (Confirm)

**Endpoint:** `POST /api/v1/medication-order-groups/{groupId}/confirm`

**Permission:** `medication.order.create`

**Role:** DOCTOR

**Mô tả:** Xác nhận nhóm Y lệnh từ DRAFT → ORDERED

**Path Parameters:**
- `groupId` (Integer, required) - ID nhóm Y lệnh

**Request Body:** Không cần

**Response:**
```json
{
  "status": "OK",
  "message": "Medication order group confirmed successfully",
  "data": {
    "groupId": 501,
    "status": "ORDERED",
    "orderDate": "2025-11-20T10:30:00",
    "confirmedAt": "2025-11-20T10:35:00",
    "confirmedBy": "doctor3"
  }
}
```

### 4.3. API: Tạo Y lệnh đơn lẻ

**Endpoint:** `POST /api/v1/medication-orders`

**Permission:** `medication.order`

**Role:** DOCTOR

**Mô tả:** Tạo một Y lệnh riêng lẻ (không thuộc nhóm)

**Request Body:**
```json
{
  "encounterId": 456,
  "inpatientStayId": 123,
  "patientId": 789,
  "medicineId": 103,
  "dosage": "1000mg",
  "route": "IV",
  "frequency": "Q12H",
  "orderType": "INPATIENT",
  "durationDays": 3,
  "scheduledDatetime": "2025-11-20T14:00:00",
  "priority": "URGENT",
  "isPrn": false,
  "isStat": false,
  "quantityOrdered": 6,
  "specialInstructions": "Truyền chậm trong 1 giờ. Theo dõi chức năng thận"
}
```

**Response:**
```json
{
  "status": "OK",
  "message": "Medication order created successfully",
  "data": {
    "orderId": 1003,
    "encounterId": 456,
    "inpatientStayId": 123,
    "patientId": 789,
    "medicineId": 103,
    "medicineName": "Vancomycin 1g",
    "dosage": "1000mg",
    "route": "IV",
    "frequency": "Q12H",
    "status": "ORDERED",
    "orderingDoctorId": 5,
    "orderingDoctorName": "BS. Trần Thị B",
    "orderDate": "2025-11-20T10:40:00",
    "scheduledDatetime": "2025-11-20T14:00:00",
    "priority": "URGENT",
    "createdAt": "2025-11-20T10:40:00"
  }
}
```

---

## 5. BƯỚC 3: DƯỢC SĨ KIỂM TRA VÀ CHUẨN BỊ

### 5.1. API: Xem danh sách Y lệnh chờ kiểm tra

**Endpoint:** `GET /api/v1/medication-order-groups/pending-verification`

**Permission:** `medication.order.view`

**Role:** PHARMACIST

**Mô tả:** Lấy danh sách các nhóm Y lệnh đang chờ dược sĩ kiểm tra

**Query Parameters:**
- `page` (Integer, optional, default: 0) - Số trang
- `size` (Integer, optional, default: 20) - Số bản ghi mỗi trang

**Response:**
```json
{
  "status": "OK",
  "message": "Pending verification groups retrieved successfully",
  "data": {
    "content": [
      {
        "groupId": 501,
        "patientName": "Nguyễn Văn A",
        "orderingDoctorName": "BS. Trần Thị B",
        "orderDate": "2025-11-20T10:30:00",
        "medicationCount": 2,
        "priority": "ROUTINE",
        "status": "ORDERED"
      }
    ],
    "totalElements": 15,
    "totalPages": 1,
    "currentPage": 0,
    "pageSize": 20
  }
}
```


### 5.2. API: Kiểm tra và duyệt nhóm Y lệnh

**Endpoint:** `POST /api/v1/medication-order-groups/{groupId}/verify`

**Permission:** `medication.order.verify`

**Role:** PHARMACIST

**Mô tả:** Dược sĩ kiểm tra và duyệt nhóm Y lệnh (ORDERED → VERIFIED)

**Path Parameters:**
- `groupId` (Integer, required) - ID nhóm Y lệnh

**Request Body:**
```json
{
  "verificationNotes": "Đã kiểm tra liều lượng, không có tương tác thuốc. Phù hợp với chẩn đoán.",
  "adjustments": []
}
```

**Response:**
```json
{
  "status": "OK",
  "message": "Medication order group verified successfully",
  "data": {
    "groupId": 501,
    "status": "VERIFIED",
    "verifiedByPharmacistId": 8,
    "verifiedByPharmacistName": "DS. Lê Văn C",
    "verificationDate": "2025-11-20T11:00:00",
    "verificationNotes": "Đã kiểm tra liều lượng, không có tương tác thuốc. Phù hợp với chẩn đoán."
  }
}
```

**Lưu ý:**
- Dược sĩ phải kiểm tra:
  - Liều lượng phù hợp với cân nặng, tuổi
  - Chống chỉ định
  - Tương tác thuốc
  - Đường dùng phù hợp
- Nếu phát hiện vấn đề, dược sĩ có thể từ chối và yêu cầu bác sĩ điều chỉnh

### 5.3. API: Chuẩn bị thuốc

**Endpoint:** `POST /api/v1/medication-order-groups/{groupId}/prepare`

**Permission:** `medication.order.prepare`

**Role:** PHARMACIST

**Mô tả:** Dược sĩ chuẩn bị thuốc theo unit-dose (VERIFIED → PREPARED)

**Path Parameters:**
- `groupId` (Integer, required) - ID nhóm Y lệnh

**Request Body:**
```json
{
  "preparationNotes": "Đã chuẩn bị đủ 21 liều Ceftriaxone 500mg IV và 10 viên Amlodipine 10mg PO. Đóng gói theo ngày.",
  "batchNumbers": [
    {
      "medicineId": 101,
      "batchNumber": "CEFT-2025-001",
      "expiryDate": "2026-12-31"
    },
    {
      "medicineId": 102,
      "batchNumber": "AMLO-2025-045",
      "expiryDate": "2027-06-30"
    }
  ]
}
```

**Response:**
```json
{
  "status": "OK",
  "message": "Medication order group prepared successfully",
  "data": {
    "groupId": 501,
    "status": "PREPARED",
    "preparedByPharmacistId": 8,
    "preparedByPharmacistName": "DS. Lê Văn C",
    "preparationDate": "2025-11-20T11:30:00",
    "preparationNotes": "Đã chuẩn bị đủ 21 liều Ceftriaxone 500mg IV và 10 viên Amlodipine 10mg PO. Đóng gói theo ngày."
  }
}
```

---

## 6. BƯỚC 4: DƯỢC SĨ XUẤT KHO VÀ BÀN GIAO

### 6.1. API: Xuất kho và bàn giao cho điều dưỡng

**Endpoint:** `POST /api/v1/medication-order-groups/{groupId}/dispense?nurseId={nurseId}&notes={notes}`

**Permission:** `medication.order.dispense`

**Role:** PHARMACIST

**Mô tả:** Xuất thuốc từ kho, tạo phiếu xuất, bàn giao cho điều dưỡng (PREPARED → DISPENSED)

**Path Parameters:**
- `groupId` (Integer, required) - ID nhóm Y lệnh

**Query Parameters:** ⚠️ **QUAN TRỌNG: Các tham số này là QUERY PARAMETERS, KHÔNG phải JSON body**

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| `nurseId` | Integer | ✅ | ID điều dưỡng nhận thuốc |
| `notes` | String | ❌ | Ghi chú bàn giao |

**Request Body:** KHÔNG CẦN (API này sử dụng query parameters)

**Ví dụ cURL:**
```bash
curl -X POST "http://100.96.182.10:8081/api/v1/medication-order-groups/12/dispense?nurseId=110&notes=Dispensed%20to%20nurse" \
  -H "Authorization: Bearer {pharmacist_token}"
```

**Response:**
```json
{
  "status": "OK",
  "message": "Medication order group dispensed successfully",
  "data": {
    "groupId": 501,
    "status": "DISPENSED",
    "dispensedByPharmacistId": 8,
    "dispensedByPharmacistName": "DS. Lê Văn C",
    "dispensingDate": "2025-11-20T12:00:00",
    "receivedByNurseId": 12,
    "receivedByNurseName": "ĐD. Nguyễn Thị D",
    "goodsIssueId": 789,
    "goodsIssueCode": "GI-2025-11-20-001",
    "dispensingNotes": "Đã bàn giao đầy đủ thuốc cho điều dưỡng Nguyễn Thị D. Hướng dẫn cách pha truyền Ceftriaxone.",
    "inventoryDeducted": true,
    "medications": [
      {
        "orderId": 1001,
        "medicineName": "Ceftriaxone 1g",
        "quantityDispensed": 21,
        "unitPrice": 25000,
        "totalPrice": 525000
      },
      {
        "orderId": 1002,
        "medicineName": "Amlodipine 10mg",
        "quantityDispensed": 10,
        "unitPrice": 5000,
        "totalPrice": 50000
      }
    ],
    "totalAmount": 575000
  }
}
```

**Lưu ý:**
- Khi `createGoodsIssue = true`, hệ thống tự động:
  - Tạo phiếu xuất kho (GoodsIssue)
  - Trừ số lượng trong inventory
  - Ghi nhận chi phí vào encounter
- Điều dưỡng nhận thuốc phải thuộc khoa đang điều trị bệnh nhân

### 6.2. API: Xem danh sách thuốc đã chuẩn bị (chờ xuất kho)

**Endpoint:** `GET /api/v1/medication-order-groups/ready-for-dispensing`

**Permission:** `medication.order.view`

**Role:** PHARMACIST

**Query Parameters:**
- `page` (Integer, optional, default: 0)
- `size` (Integer, optional, default: 20)

**Response:**
```json
{
  "status": "OK",
  "message": "Ready for dispensing groups retrieved successfully",
  "data": {
    "content": [
      {
        "groupId": 501,
        "patientName": "Nguyễn Văn A",
        "departmentName": "Khoa Nội",
        "preparedDate": "2025-11-20T11:30:00",
        "medicationCount": 2,
        "status": "PREPARED"
      }
    ],
    "totalElements": 8,
    "totalPages": 1
  }
}
```

---

## 7. BƯỚC 5: ĐIỀU DƯỠNG CẤP PHÁT THUỐC

### 7.1. API: Xem lịch thuốc hôm nay của bệnh nhân

**Endpoint:** `GET /api/v1/inpatient/medications/stays/{stayId}/today`

**Permission:** `medication.view`

**Role:** NURSE, DOCTOR, PHARMACIST

**Path Parameters:**
- `stayId` (Integer, required) - ID đợt nội trú

**Response:**
```json
{
  "status": "OK",
  "message": "Today's medications retrieved successfully",
  "data": [
    {
      "administrationId": 2001,
      "orderId": 1001,
      "medicineId": 101,
      "medicineName": "Ceftriaxone 1g",
      "dosage": "500mg",
      "route": "IV",
      "scheduledTime": "2025-11-20T14:00:00",
      "status": "PENDING",
      "isPrn": false,
      "isStat": false,
      "patientName": "Nguyễn Văn A",
      "bedNumber": "B-201",
      "administrationInstructions": "Truyền chậm trong 30 phút",
      "isOverdue": false
    },
    {
      "administrationId": 2002,
      "orderId": 1001,
      "medicineId": 101,
      "medicineName": "Ceftriaxone 1g",
      "dosage": "500mg",
      "route": "IV",
      "scheduledTime": "2025-11-20T22:00:00",
      "status": "PENDING",
      "isPrn": false,
      "isStat": false,
      "patientName": "Nguyễn Văn A",
      "bedNumber": "B-201",
      "administrationInstructions": "Truyền chậm trong 30 phút",
      "isOverdue": false
    },
    {
      "administrationId": 2003,
      "orderId": 1002,
      "medicineId": 102,
      "medicineName": "Amlodipine 10mg",
      "dosage": "10mg",
      "route": "PO",
      "scheduledTime": "2025-11-20T08:00:00",
      "status": "ADMINISTERED",
      "isPrn": false,
      "isStat": false,
      "administeredByNurseId": 12,
      "administeredByNurseName": "ĐD. Nguyễn Thị D",
      "administrationTime": "2025-11-20T08:05:00",
      "isOverdue": false
    }
  ]
}
```

### 7.2. API: Cấp phát thuốc cho bệnh nhân

**Endpoint:** `POST /api/v1/inpatient/medications/{administrationId}/administer`

**Permission:** `medication.administer`

**Role:** NURSE

**Mô tả:** Ghi nhận việc cấp phát thuốc cho bệnh nhân (5 Rights verification)

**Path Parameters:**
- `administrationId` (Integer, required) - ID lịch cấp phát

**Request Body:**
```json
{
  "administrationTime": "2025-11-20T14:05:00",
  "actualDosage": "500mg",
  "administrationMethod": "IV infusion",
  "administrationNotes": "Bệnh nhân dung nạp tốt, không có phản ứng bất thường",
  "vitalSigns": {
    "bloodPressure": "120/80",
    "heartRate": 78,
    "temperature": 37.2,
    "respiratoryRate": 18
  },
  "patientResponse": "GOOD",
  "adverseReaction": null,
  "barcodeScanned": true,
  "witnessNurseId": null
}
```

**Request Fields:**

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `administrationTime` | DateTime | ✅ | Thời gian thực tế cấp phát |
| `actualDosage` | String | ❌ | Liều lượng thực tế (nếu khác Y lệnh) |
| `administrationMethod` | String | ❌ | Phương pháp cấp phát |
| `administrationNotes` | String | ❌ | Ghi chú |
| `vitalSigns` | Object | ❌ | Sinh hiệu trước khi cấp phát |
| `patientResponse` | Enum | ❌ | Phản ứng: `GOOD`, `MILD`, `MODERATE`, `SEVERE` |
| `adverseReaction` | String | ❌ | Mô tả phản ứng bất thường (nếu có) |
| `barcodeScanned` | Boolean | ❌ | Đã quét barcode (5 Rights) |
| `witnessNurseId` | Integer | ❌ | ID điều dưỡng chứng kiến (thuốc nguy hiểm) |

**Response:**
```json
{
  "status": "OK",
  "message": "Medication administered successfully",
  "data": {
    "administrationId": 2001,
    "orderId": 1001,
    "medicineId": 101,
    "medicineName": "Ceftriaxone 1g",
    "dosage": "500mg",
    "route": "IV",
    "scheduledTime": "2025-11-20T14:00:00",
    "administrationTime": "2025-11-20T14:05:00",
    "status": "ADMINISTERED",
    "administeredByNurseId": 12,
    "administeredByNurseName": "ĐD. Nguyễn Thị D",
    "patientResponse": "GOOD",
    "barcodeScanned": true,
    "administrationNotes": "Bệnh nhân dung nạp tốt, không có phản ứng bất thường"
  }
}
```

**5 Rights Verification:**
1. ✅ Right Patient - Quét barcode bệnh nhân
2. ✅ Right Medication - Quét barcode thuốc
3. ✅ Right Dose - Kiểm tra liều lượng
4. ✅ Right Route - Kiểm tra đường dùng
5. ✅ Right Time - Kiểm tra thời gian

### 7.3. API: Ghi nhận bệnh nhân từ chối thuốc

**Endpoint:** `POST /api/v1/inpatient/medications/{administrationId}/refuse`

**Permission:** `medication.administer`

**Role:** NURSE

**Path Parameters:**
- `administrationId` (Integer, required) - ID lịch cấp phát

**Query Parameters:**
- `reason` (String, required) - Lý do từ chối

**Request Example:**
```
POST /api/v1/inpatient/medications/2001/refuse?reason=Bệnh nhân buồn nôn, không thể uống thuốc
```

**Response:**
```json
{
  "status": "OK",
  "message": "Medication marked as refused",
  "data": {
    "administrationId": 2001,
    "status": "REFUSED",
    "refusedByNurseId": 12,
    "refusedTime": "2025-11-20T14:00:00",
    "refusalReason": "Bệnh nhân buồn nôn, không thể uống thuốc"
  }
}
```

### 7.4. API: Ghi nhận bỏ lỡ liều thuốc

**Endpoint:** `POST /api/v1/inpatient/medications/{administrationId}/miss`

**Permission:** `medication.administer`

**Role:** NURSE

**Path Parameters:**
- `administrationId` (Integer, required) - ID lịch cấp phát

**Query Parameters:**
- `reason` (String, required) - Lý do bỏ lỡ

**Request Example:**
```
POST /api/v1/inpatient/medications/2001/miss?reason=Bệnh nhân đi chụp X-quang, không có mặt
```

**Response:**
```json
{
  "status": "OK",
  "message": "Medication marked as missed",
  "data": {
    "administrationId": 2001,
    "status": "MISSED",
    "missedTime": "2025-11-20T14:00:00",
    "missedReason": "Bệnh nhân đi chụp X-quang, không có mặt"
  }
}
```

### 7.5. API: Xem thuốc quá hạn (Overdue)

**Endpoint:** `GET /api/v1/inpatient/medications/overdue`

**Permission:** `medication.view`

**Role:** NURSE, DOCTOR, PHARMACIST

**Mô tả:** Lấy danh sách các liều thuốc đã quá giờ cấp phát

**Response:**
```json
{
  "status": "OK",
  "message": "Overdue medications retrieved successfully",
  "data": [
    {
      "administrationId": 2005,
      "patientName": "Trần Văn B",
      "bedNumber": "B-203",
      "medicineName": "Insulin Regular",
      "dosage": "10 units",
      "route": "SC",
      "scheduledTime": "2025-11-20T12:00:00",
      "status": "PENDING",
      "isOverdue": true,
      "overdueMinutes": 125
    }
  ]
}
```

### 7.6. API: Xem thuốc đang chờ của điều dưỡng

**Endpoint:** `GET /api/v1/inpatient/medications/nurse/pending`

**Permission:** `medication.view`

**Role:** NURSE

**Mô tả:** Lấy danh sách thuốc đang chờ cấp phát của điều dưỡng hiện tại

**Response:**
```json
{
  "status": "OK",
  "message": "Pending medications retrieved successfully",
  "data": [
    {
      "administrationId": 2001,
      "patientName": "Nguyễn Văn A",
      "bedNumber": "B-201",
      "medicineName": "Ceftriaxone 1g",
      "dosage": "500mg",
      "route": "IV",
      "scheduledTime": "2025-11-20T14:00:00",
      "status": "PENDING",
      "isPrn": false,
      "priority": "ROUTINE"
    }
  ]
}
```

---

## 8. BƯỚC 6: THEO DÕI VÀ QUẢN LÝ

### 8.1. API: Xem chi tiết Y lệnh

**Endpoint:** `GET /api/v1/medication-orders/{orderId}`

**Permission:** `medication.view`

**Role:** DOCTOR, NURSE, PHARMACIST

**Path Parameters:**
- `orderId` (Integer, required) - ID Y lệnh

**Response:**
```json
{
  "status": "OK",
  "message": "Medication order retrieved successfully",
  "data": {
    "orderId": 1001,
    "encounterId": 456,
    "inpatientStayId": 123,
    "patientId": 789,
    "patientName": "Nguyễn Văn A",
    "medicineId": 101,
    "medicineName": "Ceftriaxone 1g",
    "dosage": "500mg",
    "route": "IV",
    "frequency": "Q8H",
    "orderType": "INPATIENT",
    "status": "ADMINISTERED",
    "priority": "ROUTINE",
    "durationDays": 7,
    "quantityOrdered": 21,
    "quantityDispensed": 21,
    "quantityAdministered": 15,
    "orderingDoctorId": 5,
    "orderingDoctorName": "BS. Trần Thị B",
    "orderDate": "2025-11-20T10:30:00",
    "verifiedByPharmacistId": 8,
    "verifiedByPharmacistName": "DS. Lê Văn C",
    "verificationDate": "2025-11-20T11:00:00",
    "dispensedByPharmacistId": 8,
    "dispensingDate": "2025-11-20T12:00:00",
    "administrationHistory": [
      {
        "administrationId": 2001,
        "scheduledTime": "2025-11-20T14:00:00",
        "administrationTime": "2025-11-20T14:05:00",
        "status": "ADMINISTERED",
        "administeredByNurseName": "ĐD. Nguyễn Thị D"
      }
    ],
    "unitPrice": 25000,
    "totalPrice": 525000,
    "isPrn": false,
    "isStat": false,
    "createdAt": "2025-11-20T10:30:00",
    "updatedAt": "2025-11-20T14:05:00"
  }
}
```

### 8.2. API: Tạm dừng Y lệnh (Hold)

**Endpoint:** `POST /api/v1/medication-orders/{orderId}/hold`

**Permission:** `medication.order`

**Role:** DOCTOR

**Path Parameters:**
- `orderId` (Integer, required) - ID Y lệnh

**Request Body:**
```json
{
  "holdReason": "Bệnh nhân có phản ứng dị ứng nhẹ, tạm dừng để theo dõi",
  "holdUntil": "2025-11-21T08:00:00"
}
```

**Response:**
```json
{
  "status": "OK",
  "message": "Medication order held successfully",
  "data": {
    "orderId": 1001,
    "status": "HELD",
    "holdReason": "Bệnh nhân có phản ứng dị ứng nhẹ, tạm dừng để theo dõi",
    "holdUntil": "2025-11-21T08:00:00",
    "heldByDoctorId": 5,
    "heldAt": "2025-11-20T15:00:00"
  }
}
```

### 8.3. API: Tiếp tục Y lệnh (Resume)

**Endpoint:** `POST /api/v1/medication-orders/{orderId}/resume`

**Permission:** `medication.order`

**Role:** DOCTOR

**Path Parameters:**
- `orderId` (Integer, required) - ID Y lệnh

**Request Body:**
```json
{
  "resumeNotes": "Bệnh nhân đã hết phản ứng dị ứng, tiếp tục điều trị"
}
```

**Response:**
```json
{
  "status": "OK",
  "message": "Medication order resumed successfully",
  "data": {
    "orderId": 1001,
    "status": "ORDERED",
    "resumedByDoctorId": 5,
    "resumedAt": "2025-11-21T08:00:00",
    "resumeNotes": "Bệnh nhân đã hết phản ứng dị ứng, tiếp tục điều trị"
  }
}
```

### 8.4. API: Ngừng Y lệnh (Discontinue)

**Endpoint:** `POST /api/v1/medication-orders/{orderId}/discontinue`

**Permission:** `medication.order`

**Role:** DOCTOR

**Path Parameters:**
- `orderId` (Integer, required) - ID Y lệnh

**Request Body:**
```json
{
  "discontinueReason": "Bệnh nhân đã hết triệu chứng, không cần tiếp tục điều trị",
  "discontinueDate": "2025-11-22T08:00:00"
}
```

**Response:**
```json
{
  "status": "OK",
  "message": "Medication order discontinued successfully",
  "data": {
    "orderId": 1001,
    "status": "DISCONTINUED",
    "discontinueReason": "Bệnh nhân đã hết triệu chứng, không cần tiếp tục điều trị",
    "discontinuedByDoctorId": 5,
    "discontinuedAt": "2025-11-22T08:00:00"
  }
}
```

### 8.5. API: Xem lịch sử Y lệnh của bệnh nhân

**Endpoint:** `GET /api/v1/medication-orders/patient/{patientId}`

**Permission:** `medication.view`

**Role:** DOCTOR, NURSE, PHARMACIST

**Path Parameters:**
- `patientId` (Integer, required) - ID bệnh nhân

**Query Parameters:**
- `page` (Integer, optional, default: 0)
- `size` (Integer, optional, default: 20)
- `status` (String, optional) - Lọc theo trạng thái

**Response:**
```json
{
  "status": "OK",
  "message": "Patient medication orders retrieved successfully",
  "data": {
    "content": [
      {
        "orderId": 1001,
        "medicineName": "Ceftriaxone 1g",
        "dosage": "500mg",
        "route": "IV",
        "frequency": "Q8H",
        "status": "ADMINISTERED",
        "orderDate": "2025-11-20T10:30:00",
        "orderingDoctorName": "BS. Trần Thị B"
      }
    ],
    "totalElements": 25,
    "totalPages": 2
  }
}
```

---

## 9. BƯỚC 7: XUẤT VIỆN (DISCHARGE)

### 9.1. API: Lập kế hoạch xuất viện (Discharge Planning)

**Endpoint:** `POST /api/v1/inpatient/stays/{stayId}/discharge-planning`

**Permission:** `discharge.planning`

**Role:** DOCTOR

**Mô tả:** Lập kế hoạch xuất viện chi tiết trước khi xuất viện chính thức

**Path Parameters:**
- `stayId` (Integer, required) - ID đợt nội trú

**Request Body:**
```json
{
  "expectedDischargeDate": "2025-11-25T10:00:00",
  "dischargeDiagnosis": "Viêm phổi đã khỏi, tình trạng ổn định",
  "dischargeInstructions": "Nghỉ ngơi tại nhà, uống thuốc theo đơn, tránh lạnh",
  "followUpInstructions": "Tái khám tại phòng khám Nội sau 1 tuần",
  "followUpDate": "2025-12-02T09:00:00",
  "medicationsAtDischarge": "Amlodipine 10mg x 30 viên, uống 1 viên mỗi sáng",
  "dischargeDestination": "HOME",
  "transportationArrangements": "Gia đình đón",
  "homeHealthServices": null,
  "equipmentNeeded": null,
  "specialInstructions": "Theo dõi huyết áp hàng ngày"
}
```

**Response:**
```json
{
  "status": "CREATED",
  "message": "Discharge planning created successfully",
  "data": {
    "dischargePlanningId": 901,
    "inpatientStayId": 123,
    "expectedDischargeDate": "2025-11-25T10:00:00",
    "status": "PENDING",
    "createdByEmployeeId": 5,
    "createdByEmployeeName": "BS. Trần Thị B",
    "createdAt": "2025-11-24T14:00:00"
  }
}
```

### 9.1a. API: Cập nhật kế hoạch xuất viện

**Endpoint:** `PUT /api/v1/inpatient/discharge-planning/{planId}`

**Permission:** `discharge.planning`

**Role:** DOCTOR

**Path Parameters:**
- `planId` (Integer, required) - ID kế hoạch xuất viện

**Request Body:** (Giống như tạo mới)

**Response:**
```json
{
  "status": "OK",
  "message": "Discharge planning updated successfully",
  "data": {
    "dischargePlanningId": 901,
    "status": "PENDING",
    "updatedAt": "2025-11-24T15:00:00"
  }
}
```

### 9.1b. API: Phê duyệt kế hoạch xuất viện

**Endpoint:** `POST /api/v1/inpatient/discharge-planning/{planId}/approve`

**Permission:** `discharge.planning`

**Role:** DOCTOR, ADMIN

**Mô tả:** Phê duyệt kế hoạch xuất viện để thực hiện

**Path Parameters:**
- `planId` (Integer, required) - ID kế hoạch xuất viện

**Response:**
```json
{
  "status": "OK",
  "message": "Discharge planning approved successfully",
  "data": {
    "dischargePlanningId": 901,
    "status": "APPROVED",
    "approvedByEmployeeId": 10,
    "approvedByEmployeeName": "BS. Nguyễn Văn C",
    "approvedAt": "2025-11-24T16:00:00"
  }
}
```

### 9.1c. API: Xem kế hoạch xuất viện theo Stay

**Endpoint:** `GET /api/v1/inpatient/stays/{stayId}/discharge-planning`

**Permission:** `discharge.view`

**Role:** DOCTOR, NURSE, ADMIN

**Path Parameters:**
- `stayId` (Integer, required) - ID đợt nội trú

**Response:**
```json
{
  "status": "OK",
  "message": "Discharge planning retrieved successfully",
  "data": {
    "dischargePlanningId": 901,
    "inpatientStayId": 123,
    "expectedDischargeDate": "2025-11-25T10:00:00",
    "dischargeDiagnosis": "Viêm phổi đã khỏi",
    "status": "APPROVED"
  }
}
```

### 9.1d. API: Xem chi tiết kế hoạch xuất viện

**Endpoint:** `GET /api/v1/inpatient/discharge-planning/{planId}`

**Permission:** `discharge.view`

**Role:** DOCTOR, NURSE, ADMIN

**Path Parameters:**
- `planId` (Integer, required) - ID kế hoạch xuất viện

**Response:**
```json
{
  "status": "OK",
  "message": "Discharge planning details retrieved successfully",
  "data": {
    "dischargePlanningId": 901,
    "inpatientStayId": 123,
    "expectedDischargeDate": "2025-11-25T10:00:00",
    "dischargeDiagnosis": "Viêm phổi đã khỏi",
    "dischargeInstructions": "Nghỉ ngơi tại nhà...",
    "status": "APPROVED",
    "createdByEmployeeName": "BS. Trần Thị B",
    "approvedByEmployeeName": "BS. Nguyễn Văn C"
  }
}
```

---

## BƯỚC 10: XUẤT VIỆN (DISCHARGE)

### 9.2. API: Đặt lệnh xuất viện (Order Discharge)

**Endpoint:** `POST /api/v1/inpatient/stays/{stayId}/order-discharge`

**Permission:** `inpatient.discharge`

**Role:** DOCTOR, ADMIN

**Mô tả:** Bác sĩ đặt lệnh xuất viện - chặn các Y lệnh mới (trừ thuốc xuất viện)

**Path Parameters:**
- `stayId` (Integer, required) - ID đợt nội trú

**Query Parameters:**
- `reason` (String, optional) - Lý do xuất viện

**Response:**
```json
{
  "status": "OK",
  "message": "Discharge ordered successfully. New orders are now blocked.",
  "data": {
    "stayId": 123,
    "status": "DISCHARGE_ORDERED",
    "dischargeOrderedAt": "2025-11-24T16:00:00",
    "dischargeOrderedByEmployeeId": 5,
    "dischargeOrderedByEmployeeName": "BS. Trần Thị B"
  }
}
```

### 9.2a. API: Hủy lệnh xuất viện

**Endpoint:** `POST /api/v1/inpatient/stays/{stayId}/cancel-discharge-order`

**Permission:** `inpatient.discharge`

**Role:** DOCTOR, ADMIN

**Mô tả:** Hủy lệnh xuất viện - cho phép nhận Y lệnh mới trở lại

**Path Parameters:**
- `stayId` (Integer, required) - ID đợt nội trú

**Query Parameters:**
- `reason` (String, optional) - Lý do hủy

**Response:**
```json
{
  "status": "OK",
  "message": "Discharge order cancelled. New orders can be accepted again.",
  "data": {
    "stayId": 123,
    "status": "ACTIVE",
    "dischargeOrderCancelledAt": "2025-11-24T17:00:00"
  }
}
```

### 9.3. API: Xuất viện bệnh nhân (Thực hiện xuất viện)

**Endpoint:** `POST /api/v1/inpatient/stays/{stayId}/discharge`

**Permission:** `inpatient.discharge`

**Role:** DOCTOR, ADMIN

**Mô tả:** Xuất viện bệnh nhân chính thức - ngừng tất cả Y lệnh, giải phóng giường, kết thúc đợt nội trú

**Path Parameters:**
- `stayId` (Integer, required) - ID đợt nội trú

**Request Body:**
```json
{
  "dischargeDate": "2025-11-25T10:00:00",
  "dischargeDiagnosis": "Viêm phổi đã khỏi, tình trạng ổn định",
  "dischargeCondition": "IMPROVED",
  "dischargeInstructions": "Nghỉ ngơi tại nhà, uống thuốc theo đơn, tái khám sau 1 tuần. Tránh lạnh, uống đủ nước.",
  "followUpInstructions": "Tái khám tại phòng khám Nội sau 1 tuần để kiểm tra lại phổi",
  "followUpDate": "2025-12-02T09:00:00",
  "dischargeDestination": "HOME",
  "dispositionType": "HOME",
  "medicationsAtDischarge": "Amlodipine 10mg x 30 viên, uống 1 viên mỗi sáng sau ăn",
  "dischargeNotes": "Bệnh nhân đã hồi phục tốt, có thể xuất viện"
}
```

**Request Fields:**

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `dischargeDate` | DateTime | ✅ | Ngày giờ xuất viện |
| `dischargeDiagnosis` | String | ❌ | Chẩn đoán xuất viện |
| `dischargeCondition` | String | ❌ | Tình trạng: `IMPROVED`, `STABLE`, `TRANSFERRED`, `DECEASED` |
| `dischargeInstructions` | String | ❌ | Hướng dẫn xuất viện |
| `followUpInstructions` | String | ❌ | Hướng dẫn tái khám |
| `followUpDate` | DateTime | ❌ | Ngày tái khám |
| `dischargeDestination` | String | ❌ | Nơi đến: `HOME`, `TRANSFER_TO_OTHER_HOSPITAL`, `NURSING_HOME` |
| `dispositionType` | String | ❌ | Loại xuất viện: `HOME`, `EXPIRED`, `TRANSFER`, `DAMA`, `AMA`, `ABSCONDED`, `HOSPICE`, `REHABILITATION` |
| `medicationsAtDischarge` | String | ❌ | Danh sách thuốc mang về (text) |
| `dischargeNotes` | String | ❌ | Ghi chú xuất viện |

**Disposition Types:**
- `HOME` - Về nhà
- `EXPIRED` - Tử vong
- `TRANSFER` - Chuyển viện
- `DAMA` - Discharge Against Medical Advice (Xin về)
- `AMA` - Against Medical Advice (Tự ý về)
- `ABSCONDED` - Bỏ viện
- `HOSPICE` - Chuyển chăm sóc giảm nhẹ
- `REHABILITATION` - Chuyển phục hồi chức năng

**Response:**
```json
{
  "status": "OK",
  "message": "Patient discharged successfully",
  "data": {
    "stayId": 123,
    "encounterId": 456,
    "patientId": 789,
    "patientName": "Nguyễn Văn A",
    "admissionDate": "2025-11-20T10:00:00",
    "dischargeDate": "2025-11-25T10:00:00",
    "lengthOfStay": 5,
    "dischargeDiagnosis": "Viêm phổi đã khỏi, tình trạng ổn định",
    "dischargeCondition": "IMPROVED",
    "dispositionType": "HOME",
    "bedId": 12,
    "bedNumber": "B-201",
    "bedStatus": "AVAILABLE",
    "status": "DISCHARGED",
    "isDischarged": true,
    "dischargedByDoctorId": 5,
    "dischargedByDoctorName": "BS. Trần Thị B",
    "activeMedicationOrdersDiscontinued": 3,
    "dischargePrescriptionId": 901,
    "totalCost": 15750000,
    "dischargedAt": "2025-11-25T10:00:00"
  }
}
```

**Lưu ý:**
- Khi xuất viện, hệ thống tự động:
  - Ngừng tất cả Y lệnh đang active (status → DISCONTINUED)
  - Giải phóng giường (bed status → AVAILABLE)
  - Tạo đơn thuốc mang về (nếu có `medicationsAtDischarge`)
  - Tính tổng chi phí điều trị
  - Cập nhật encounter status
- Không thể xuất viện nếu còn Y lệnh STAT chưa hoàn thành

### 9.3. API: Xem thông tin đợt nội trú

**Endpoint:** `GET /api/v1/inpatient/stays/{stayId}`

**Permission:** `inpatient.view`

**Role:** DOCTOR, NURSE, PHARMACIST, ADMIN

**Path Parameters:**
- `stayId` (Integer, required) - ID đợt nội trú

**Response:**
```json
{
  "status": "OK",
  "message": "Inpatient stay retrieved successfully",
  "data": {
    "stayId": 123,
    "encounterId": 456,
    "patientId": 789,
    "patientName": "Nguyễn Văn A",
    "patientAge": 45,
    "patientGender": "MALE",
    "admissionDate": "2025-11-20T10:00:00",
    "dischargeDate": null,
    "admissionDiagnosis": "Viêm phổi nặng, cần theo dõi và điều trị nội trú",
    "admissionType": "URGENT",
    "bedId": 12,
    "bedNumber": "B-201",
    "roomNumber": "201",
    "roomType": "Standard",
    "departmentId": 3,
    "departmentName": "Khoa Nội",
    "attendingDoctorId": 5,
    "attendingDoctorName": "BS. Trần Thị B",
    "status": "ACTIVE",
    "isActive": true,
    "isDischarged": false,
    "lengthOfStay": 5,
    "activeMedicationOrders": 2,
    "totalMedicationOrders": 3,
    "totalCost": 575000,
    "createdAt": "2025-11-20T10:00:00",
    "updatedAt": "2025-11-25T08:00:00"
  }
}
```

### 9.4. API: Chuyển giường

**Endpoint:** `POST /api/v1/inpatient/stays/{stayId}/transfer-bed`

**Permission:** `bed.transfer`

**Role:** DOCTOR, NURSE, ADMIN

**Path Parameters:**
- `stayId` (Integer, required) - ID đợt nội trú

**Request Body:**
```json
{
  "newBedId": 25,
  "transferReason": "Chuyển sang phòng ICU để theo dõi sát hơn",
  "transferDate": "2025-11-22T14:00:00"
}
```

**Response:**
```json
{
  "status": "OK",
  "message": "Bed transferred successfully",
  "data": {
    "stayId": 123,
    "oldBedId": 12,
    "oldBedNumber": "B-201",
    "newBedId": 25,
    "newBedNumber": "ICU-05",
    "transferReason": "Chuyển sang phòng ICU để theo dõi sát hơn",
    "transferredByEmployeeId": 5,
    "transferredAt": "2025-11-22T14:00:00"
  }
}
```

---

## 10. CÁC API HỖ TRỢ KHÁC

### 10.1. API: Xem tất cả bệnh nhân đang nội trú

**Endpoint:** `GET /api/v1/inpatient/stays/active`

**Permission:** `inpatient.view`

**Role:** DOCTOR, NURSE, PHARMACIST, ADMIN

**Mô tả:** Lấy danh sách tất cả bệnh nhân đang nội trú (status = ACTIVE)

**Response:**
```json
{
  "status": "OK",
  "message": "Active inpatient stays retrieved successfully",
  "data": [
    {
      "stayId": 123,
      "encounterId": 456,
      "patientId": 789,
      "patientName": "Nguyễn Văn A",
      "bedNumber": "B-201",
      "departmentName": "Khoa Nội",
      "attendingDoctorName": "BS. Trần Thị B",
      "admissionDate": "2025-11-20T10:00:00",
      "lengthOfStay": 5,
      "status": "ACTIVE"
    }
  ]
}
```

### 10.2. API: Xem danh sách bệnh nhân của bác sĩ

**Endpoint:** `GET /api/v1/inpatient/doctors/{doctorId}/stays`

**Permission:** `inpatient.view`

**Role:** DOCTOR, ADMIN

**Path Parameters:**
- `doctorId` (Integer, required) - ID bác sĩ

**Response:**
```json
{
  "status": "OK",
  "message": "Doctor's inpatient stays retrieved successfully",
  "data": [
    {
      "stayId": 123,
      "patientId": 789,
      "patientName": "Nguyễn Văn A",
      "bedNumber": "B-201",
      "admissionDate": "2025-11-20T10:00:00",
      "admissionDiagnosis": "Viêm phổi nặng",
      "lengthOfStay": 5,
      "status": "ACTIVE"
    }
  ]
}
```

### 10.3. API: Xem danh sách bệnh nhân theo khoa

**Endpoint:** `GET /api/v1/inpatient/departments/{departmentId}/stays`

**Permission:** `inpatient.view`

**Role:** DOCTOR, NURSE, ADMIN

**Path Parameters:**
- `departmentId` (Integer, required) - ID khoa

**Response:**
```json
{
  "status": "OK",
  "message": "Department inpatient stays retrieved successfully",
  "data": [
    {
      "stayId": 123,
      "patientId": 789,
      "patientName": "Nguyễn Văn A",
      "bedNumber": "B-201",
      "attendingDoctorName": "BS. Trần Thị B",
      "admissionDate": "2025-11-20T10:00:00",
      "lengthOfStay": 5,
      "status": "ACTIVE"
    }
  ]
}
```

### 10.3a. API: Xem lịch sử nội trú của bệnh nhân

**Endpoint:** `GET /api/v1/inpatient/patients/{patientId}/history`

**Permission:** `inpatient.view`

**Role:** DOCTOR, NURSE, ADMIN

**Path Parameters:**
- `patientId` (Integer, required) - ID bệnh nhân

**Response:**
```json
{
  "status": "OK",
  "message": "Patient inpatient history retrieved successfully",
  "data": [
    {
      "stayId": 123,
      "encounterId": 456,
      "admissionDate": "2025-11-20T10:00:00",
      "dischargeDate": "2025-11-25T10:00:00",
      "lengthOfStay": 5,
      "admissionDiagnosis": "Viêm phổi nặng",
      "dischargeDiagnosis": "Viêm phổi đã khỏi",
      "status": "DISCHARGED"
    }
  ]
}
```

### 10.4. API: Thống kê Y lệnh theo trạng thái

**Endpoint:** `GET /api/v1/medication-orders/stats/by-status`

**Permission:** `medication.view`

**Role:** DOCTOR, PHARMACIST, ADMIN

**Query Parameters:**
- `departmentId` (Integer, optional) - Lọc theo khoa
- `startDate` (DateTime, optional) - Từ ngày
- `endDate` (DateTime, optional) - Đến ngày

**Response:**
```json
{
  "status": "OK",
  "message": "Medication order statistics retrieved successfully",
  "data": {
    "totalOrders": 1250,
    "byStatus": {
      "ORDERED": 45,
      "VERIFIED": 23,
      "READY": 18,
      "ADMINISTERED": 1050,
      "HELD": 5,
      "DISCONTINUED": 89,
      "REFUSED": 12,
      "MISSED": 8
    },
    "complianceRate": 95.2,
    "refusalRate": 0.96,
    "missedRate": 0.64
  }
}
```

### 10.5. API: Báo cáo sử dụng thuốc

**Endpoint:** `GET /api/v1/medication-orders/report/usage`

**Permission:** `medication.view`

**Role:** PHARMACIST, ADMIN

**Query Parameters:**
- `startDate` (DateTime, required) - Từ ngày
- `endDate` (DateTime, required) - Đến ngày
- `departmentId` (Integer, optional) - Lọc theo khoa
- `medicineId` (Integer, optional) - Lọc theo thuốc

**Response:**
```json
{
  "status": "OK",
  "message": "Medication usage report retrieved successfully",
  "data": {
    "reportPeriod": {
      "startDate": "2025-11-01T00:00:00",
      "endDate": "2025-11-30T23:59:59"
    },
    "topMedications": [
      {
        "medicineId": 101,
        "medicineName": "Ceftriaxone 1g",
        "totalOrders": 245,
        "totalQuantity": 5145,
        "totalCost": 128625000,
        "averageDailyUsage": 171.5
      }
    ],
    "totalCost": 456750000,
    "totalOrders": 1250
  }
}
```

---

## 11. CẤU TRÚC DATABASE

### 11.1. Bảng InpatientStays

```sql
CREATE TABLE "InpatientStays" (
    stay_id SERIAL PRIMARY KEY,
    encounter_id INTEGER NOT NULL REFERENCES "Encounters"(encounter_id),
    patient_id INTEGER NOT NULL REFERENCES "Patients"(patient_id),
    bed_id INTEGER REFERENCES "Beds"(bed_id),
    admission_date TIMESTAMP NOT NULL,
    discharge_date TIMESTAMP,
    admission_diagnosis TEXT NOT NULL,
    discharge_diagnosis TEXT,
    admission_type VARCHAR(50), -- EMERGENCY, PLANNED, URGENT
    attending_doctor_id INTEGER REFERENCES "Employees"(employee_id),
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, DISCHARGED, TRANSFERRED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted_at TIMESTAMP
);
```

### 11.2. Bảng MedicationOrderGroups

```sql
CREATE TABLE "MedicationOrderGroups" (
    group_id SERIAL PRIMARY KEY,
    encounter_id INTEGER NOT NULL REFERENCES "Encounters"(encounter_id),
    inpatient_stay_id INTEGER REFERENCES "InpatientStays"(stay_id),
    patient_id INTEGER NOT NULL REFERENCES "Patients"(patient_id),
    ordering_doctor_id INTEGER NOT NULL REFERENCES "Employees"(employee_id),
    order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    priority VARCHAR(50), -- ROUTINE, URGENT, STAT
    status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, ORDERED, VERIFIED, PREPARED, DISPENSED, COMPLETED, CANCELLED, DISCONTINUED

    -- Verification
    verified_by_pharmacist_id INTEGER REFERENCES "Employees"(employee_id),
    verification_date TIMESTAMP,
    verification_notes TEXT,

    -- Preparation
    prepared_by_pharmacist_id INTEGER REFERENCES "Employees"(employee_id),
    preparation_date TIMESTAMP,
    preparation_notes TEXT,

    -- Dispensing
    dispensed_by_pharmacist_id INTEGER REFERENCES "Employees"(employee_id),
    dispensing_date TIMESTAMP,
    received_by_nurse_id INTEGER REFERENCES "Employees"(employee_id),
    goods_issue_id INTEGER REFERENCES "GoodsIssues"(goods_issue_id),
    dispensing_notes TEXT,

    -- Cancellation/Discontinuation
    cancelled_by_id INTEGER REFERENCES "Employees"(employee_id),
    cancellation_date TIMESTAMP,
    cancellation_reason TEXT,
    discontinued_by_id INTEGER REFERENCES "Employees"(employee_id),
    discontinuation_date TIMESTAMP,
    discontinuation_reason TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted_at TIMESTAMP
);
```


### 11.3. Bảng MedicationOrders

```sql
CREATE TABLE "MedicationOrders" (
    order_id SERIAL PRIMARY KEY,
    encounter_id INTEGER NOT NULL REFERENCES "Encounters"(encounter_id),
    inpatient_stay_id INTEGER REFERENCES "InpatientStays"(stay_id),
    patient_id INTEGER NOT NULL REFERENCES "Patients"(patient_id),
    medicine_id INTEGER NOT NULL REFERENCES "Medicines"(medicine_id),
    medication_order_group_id INTEGER REFERENCES "MedicationOrderGroups"(group_id),

    -- Order details
    dosage VARCHAR(255) NOT NULL,
    route VARCHAR(50) NOT NULL, -- PO, IV, IM, SC, TOPICAL, INHALATION
    frequency VARCHAR(50) NOT NULL, -- QD, BID, TID, QID, Q4H, Q6H, Q8H, Q12H, PRN
    order_type VARCHAR(50) NOT NULL, -- INPATIENT, OUTPATIENT
    status VARCHAR(50) DEFAULT 'ORDERED', -- ORDERED, VERIFIED, READY, ADMINISTERED, HELD, DISCONTINUED, REFUSED, MISSED
    priority VARCHAR(50), -- ROUTINE, URGENT, STAT

    -- Scheduling
    duration_days INTEGER,
    scheduled_datetime TIMESTAMP,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    is_prn BOOLEAN DEFAULT FALSE,
    is_stat BOOLEAN DEFAULT FALSE,

    -- Ordering
    ordering_doctor_id INTEGER NOT NULL REFERENCES "Employees"(employee_id),
    order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    order_notes TEXT,
    administration_instructions TEXT,

    -- Verification
    verified_by_pharmacist_id INTEGER REFERENCES "Employees"(employee_id),
    verification_date TIMESTAMP,

    -- Dispensing
    dispensed_by_pharmacist_id INTEGER REFERENCES "Employees"(employee_id),
    dispensing_date TIMESTAMP,
    quantity_ordered INTEGER,
    quantity_dispensed INTEGER,

    -- Administration
    administered_by_nurse_id INTEGER REFERENCES "Employees"(employee_id),
    administration_time TIMESTAMP,
    quantity_administered INTEGER,

    -- Discontinuation
    discontinued_by_doctor_id INTEGER REFERENCES "Employees"(employee_id),
    discontinuation_date TIMESTAMP,
    discontinuation_reason TEXT,

    -- Hold
    held_by_doctor_id INTEGER REFERENCES "Employees"(employee_id),
    hold_date TIMESTAMP,
    hold_reason TEXT,
    hold_until TIMESTAMP,

    -- Pricing
    unit_price DECIMAL(15,2),
    total_price DECIMAL(15,2),

    -- Barcode
    barcode VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted_at TIMESTAMP
);
```

### 11.4. Bảng MedicationAdministration

```sql
CREATE TABLE "MedicationAdministration" (
    administration_id SERIAL PRIMARY KEY,
    medication_order_id INTEGER NOT NULL REFERENCES "MedicationOrders"(order_id),
    inpatient_stay_id INTEGER NOT NULL REFERENCES "InpatientStays"(stay_id),
    patient_id INTEGER NOT NULL REFERENCES "Patients"(patient_id),

    -- Scheduling
    scheduled_time TIMESTAMP NOT NULL,
    administration_time TIMESTAMP,

    -- Administration details
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, ADMINISTERED, REFUSED, MISSED, CANCELLED
    administered_by_nurse_id INTEGER REFERENCES "Employees"(employee_id),
    actual_dosage VARCHAR(255),
    administration_method VARCHAR(255),
    administration_notes TEXT,

    -- Patient response
    patient_response VARCHAR(50), -- GOOD, MILD, MODERATE, SEVERE
    adverse_reaction TEXT,
    vital_signs JSONB,

    -- Verification
    barcode_scanned BOOLEAN DEFAULT FALSE,
    witness_nurse_id INTEGER REFERENCES "Employees"(employee_id),

    -- Refusal/Missed
    refusal_reason TEXT,
    missed_reason TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted_at TIMESTAMP
);
```

### 11.5. Quan hệ giữa các bảng

```
Encounters (1) ──────> (N) InpatientStays
    │                         │
    │                         │
    └──> (N) MedicationOrderGroups
              │
              └──> (N) MedicationOrders ──> (N) MedicationAdministration
                        │
                        └──> (1) Medicines

Employees (Doctors) ──> (N) MedicationOrders (ordering)
Employees (Pharmacists) ──> (N) MedicationOrders (verification, dispensing)
Employees (Nurses) ──> (N) MedicationAdministration (administration)

Beds (1) ──> (N) InpatientStays
Departments (1) ──> (N) Beds
```

---

## 12. TỔNG KẾT VÀ LƯU Ý

### 12.1. Workflow Summary

| Bước | Người thực hiện | API chính | Trạng thái |
|------|----------------|-----------|------------|
| 1. Nhập viện | Doctor | `POST /inpatient/encounters/{id}/admit` | ACTIVE |
| 2. Kê đơn | Doctor | `POST /medication-order-groups` | DRAFT → ORDERED |
| 3. Kiểm tra | Pharmacist | `POST /medication-order-groups/{id}/verify` | ORDERED → VERIFIED |
| 4. Chuẩn bị | Pharmacist | `POST /medication-order-groups/{id}/prepare` | VERIFIED → PREPARED |
| 5. Xuất kho | Pharmacist | `POST /medication-order-groups/{id}/dispense` | PREPARED → DISPENSED |
| 6. Cấp phát | Nurse | `POST /inpatient/medications/{id}/administer` | PENDING → ADMINISTERED |
| 7. Xuất viện | Doctor | `POST /inpatient/stays/{id}/discharge` | ACTIVE → DISCHARGED |

### 12.2. Best Practices

#### 12.2.1. Bác sĩ (Doctor)
- ✅ Luôn sử dụng `MedicationOrderGroup` để kê nhiều thuốc cùng lúc
- ✅ Kiểm tra tương tác thuốc trước khi kê đơn
- ✅ Ghi rõ `administrationInstructions` cho thuốc đặc biệt
- ✅ Đánh dấu `isStat=true` cho thuốc cấp cứu
- ✅ Đánh dấu `isPrn=true` cho thuốc dùng khi cần
- ⚠️ Không kê đơn cho bệnh nhân đã xuất viện
- ⚠️ Kiểm tra chống chỉ định trước khi kê

#### 12.2.2. Dược sĩ (Pharmacist)
- ✅ Kiểm tra kỹ liều lượng theo cân nặng, tuổi
- ✅ Kiểm tra tương tác thuốc trong nhóm Y lệnh
- ✅ Ghi rõ `batchNumber` và `expiryDate` khi chuẩn bị
- ✅ Kiểm tra tồn kho trước khi verify
- ✅ Hướng dẫn điều dưỡng cách pha chế thuốc đặc biệt
- ⚠️ Không dispense nếu chưa prepare
- ⚠️ Kiểm tra điều dưỡng nhận thuốc thuộc đúng khoa

#### 12.2.3. Điều dưỡng (Nurse)
- ✅ Luôn quét barcode (5 Rights verification)
- ✅ Kiểm tra sinh hiệu trước khi cấp phát
- ✅ Ghi nhận phản ứng bệnh nhân sau cấp phát
- ✅ Báo cáo ngay nếu có phản ứng bất thường
- ✅ Ghi rõ lý do nếu bệnh nhân từ chối hoặc bỏ lỡ
- ⚠️ Không cấp phát thuốc quá 30 phút so với lịch
- ⚠️ Thuốc nguy hiểm cần có `witnessNurseId`

### 12.3. ⚠️ LƯU Ý QUAN TRỌNG KHI SỬ DỤNG API

#### 12.3.1. Authentication
- **PHẢI có field `platform`** khi login: `WEB`, `MOBILE`, hoặc `TABLET`
- Token có thời hạn 24 giờ, cần refresh hoặc login lại khi hết hạn
- Mỗi role có permissions khác nhau, kiểm tra kỹ trước khi gọi API

#### 12.3.2. Route Values (Đường dùng thuốc)
- **PHẢI dùng giá trị đầy đủ**, KHÔNG dùng viết tắt
- ✅ Đúng: `ORAL`, `IV`, `IM`, `SC`, `TOPICAL`, `INHALATION`, `RECTAL`, `SUBLINGUAL`, `TRANSDERMAL`, `OTHER`
- ❌ SAI: `PO`, `po`, `oral` (viết thường)
- Ví dụ: Dùng `"route": "ORAL"` thay vì `"route": "PO"`

#### 12.3.3. GoodsIssue Issue Type
- **Database constraint values:**
  - `DEPARTMENT_ISSUE` - Xuất cho khoa phòng
  - `PATIENT_ISSUE` - Xuất cho bệnh nhân
  - `MEDICATION_ORDER_GROUP` - Xuất thuốc nội trú
  - `TRANSFER` - Chuyển kho
  - `DISPOSAL` - Hủy hàng
  - `SUPPLIER_RETURN` - Trả hàng NCC
- ❌ KHÔNG dùng: `DEPARTMENT_DISPENSING`, `PATIENT_DISPENSING` (đã deprecated)

#### 12.3.4. Dispense API Parameters
- **nurseId** và **notes** là **QUERY PARAMETERS**, KHÔNG phải JSON body
- ✅ Đúng: `POST /api/v1/medication-order-groups/12/dispense?nurseId=110&notes=Dispensed`
- ❌ SAI: Gửi `{"nurseId": 110, "notes": "Dispensed"}` trong body

#### 12.3.5. Workflow State Transitions
- Phải tuân thủ đúng thứ tự: DRAFT → ORDERED → VERIFIED → PREPARED → DISPENSED → ADMINISTERED
- Không thể skip bước hoặc quay lại trạng thái trước
- Mỗi transition cần đúng role và permission

### 12.4. Error Handling

#### Common Errors

| Error Code | Mô tả | Giải pháp |
|------------|-------|-----------|
| 400 | Bad Request - Thiếu field bắt buộc hoặc giá trị không hợp lệ | Kiểm tra lại request body, đặc biệt là `platform`, `route` |
| 401 | Unauthorized - Chưa đăng nhập hoặc token hết hạn | Login lại để lấy token mới, nhớ thêm `platform` |
| 403 | Forbidden - Không có quyền | Kiểm tra role và permission |
| 404 | Not Found - Không tìm thấy resource | Kiểm tra ID có đúng không |
| 409 | Conflict - Trạng thái không hợp lệ | Kiểm tra workflow state transition |
| 500 | Internal Server Error - Lỗi server | Kiểm tra logs, có thể do constraint violation (issue_type, route) |

#### Validation Errors

```json
{
  "status": "BAD_REQUEST",
  "message": "Validation failed",
  "errors": [
    {
      "field": "dosage",
      "message": "Dosage is required"
    },
    {
      "field": "route",
      "message": "Invalid route. Must be one of: ORAL, IV, IM, SC, TOPICAL, INHALATION, RECTAL, SUBLINGUAL, TRANSDERMAL, OTHER"
    },
    {
      "field": "platform",
      "message": "Platform is required. Must be one of: WEB, MOBILE, TABLET"
    }
  ]
}
```

#### Database Constraint Errors (500)

Nếu gặp lỗi 500 với message về constraint violation:
- **Check constraint "goods_issues_issue_type_check"**: Đang dùng sai `issue_type` value
  - Sửa: Dùng `DEPARTMENT_ISSUE` thay vì `DEPARTMENT_DISPENSING`
- **Check constraint "medication_orders_route_check"**: Đang dùng sai `route` value
  - Sửa: Dùng `ORAL` thay vì `PO`

### 12.4. Testing với Postman

#### 12.4.1. Setup Environment

```json
{
  "baseUrl": "http://100.96.182.10:8081",
  "accessToken": "{{token}}",
  "doctorUsername": "doctor3",
  "pharmacistUsername": "pharmacist1",
  "nurseUsername": "nurse1"
}
```

#### 12.4.2. Collection Structure

```
Hospital API
├── 1. Authentication
│   ├── Login Doctor
│   ├── Login Pharmacist
│   └── Login Nurse
├── 2. Inpatient Admission
│   ├── Admit Patient
│   └── Get Stay Info
├── 3. Medication Ordering (Doctor)
│   ├── Create Order Group
│   ├── Confirm Order Group
│   └── View Pending Orders
├── 4. Medication Verification (Pharmacist)
│   ├── Get Pending Verification
│   ├── Verify Order Group
│   └── Prepare Medications
├── 5. Medication Dispensing (Pharmacist)
│   ├── Get Ready for Dispensing
│   └── Dispense to Nurse
├── 6. Medication Administration (Nurse)
│   ├── Get Today's Medications
│   ├── Administer Medication
│   ├── Mark Refused
│   └── Mark Missed
└── 7. Discharge
    ├── Create Discharge Plan
    └── Discharge Patient
```

### 12.5. Monitoring & Alerts

#### Key Metrics to Monitor

1. **Medication Safety**
   - Số lượng thuốc bị từ chối (refusal rate)
   - Số lượng thuốc bỏ lỡ (missed rate)
   - Số lượng phản ứng bất thường (adverse reactions)
   - Thời gian trung bình từ kê đơn đến cấp phát

2. **Workflow Efficiency**
   - Thời gian verify trung bình
   - Thời gian prepare trung bình
   - Thời gian dispense trung bình
   - Số Y lệnh quá hạn (overdue)

3. **Inventory**
   - Thuốc sắp hết hạn
   - Thuốc sắp hết tồn kho
   - Giá trị thuốc xuất kho hàng ngày

### 12.6. Security Checklist

- ✅ Tất cả API đều yêu cầu JWT token
- ✅ Role-based access control (RBAC)
- ✅ Audit trail cho mọi thao tác
- ✅ Soft delete để giữ lịch sử
- ✅ Validation đầu vào
- ✅ SQL injection prevention
- ✅ XSS prevention
- ✅ CORS configuration

---

## 13. LIÊN HỆ VÀ HỖ TRỢ

### 13.1. Thông tin hệ thống

- **Server:** http://100.96.182.10:8081
- **Swagger UI:** http://100.96.182.10:8081/swagger-ui/index.html
- **Database:** PostgreSQL 15 (Docker)
- **PgAdmin:** http://localhost:8080

### 13.2. Tài khoản test

| Role | Username | Password | Mô tả |
|------|----------|----------|-------|
| Doctor | doctor3 | Password123! | Bác sĩ điều trị |
| Pharmacist | pharmacist1 | Password123! | Dược sĩ |
| Nurse | nurse1 | Password123! | Điều dưỡng |
| Admin | admin1 | Password123! | Quản trị viên |

### 13.3. Tài liệu tham khảo

- [PHARMACY_INVENTORY_API_COMPLETE_GUIDE.md](./PHARMACY_INVENTORY_API_COMPLETE_GUIDE.md)
- [LUONG_NOI_TRU_VA_THUOC_CHI_TIET.md](./LUONG_NOI_TRU_VA_THUOC_CHI_TIET.md)
- [INPATIENT-MEDICATION-REPORT.md](./INPATIENT-MEDICATION-REPORT.md)

---

**Ngày cập nhật:** 2025-11-20
**Phiên bản:** 1.0
**Tác giả:** Hospital Management System Team

---

## PHỤ LỤC: DANH SÁCH TẤT CẢ API ENDPOINTS

### A. Inpatient Management (14 APIs)

| Method | Endpoint | Permission | Role |
|--------|----------|------------|------|
| POST | `/api/v1/inpatient/encounters/{id}/admit` | `inpatient.admit` | DOCTOR, ADMIN |
| POST | `/api/v1/inpatient/stays/{id}/order-discharge` | `inpatient.discharge` | DOCTOR, ADMIN |
| POST | `/api/v1/inpatient/stays/{id}/cancel-discharge-order` | `inpatient.discharge` | DOCTOR, ADMIN |
| POST | `/api/v1/inpatient/stays/{id}/discharge` | `inpatient.discharge` | DOCTOR, ADMIN |
| POST | `/api/v1/inpatient/stays/{id}/discharge-planning` | `discharge.planning` | DOCTOR |
| PUT | `/api/v1/inpatient/discharge-planning/{id}` | `discharge.planning` | DOCTOR |
| POST | `/api/v1/inpatient/discharge-planning/{id}/approve` | `discharge.planning` | DOCTOR |
| GET | `/api/v1/inpatient/stays/{id}` | `inpatient.view` | ALL |
| GET | `/api/v1/inpatient/stays/active` | `inpatient.view` | ALL |
| GET | `/api/v1/inpatient/doctors/{id}/stays` | `inpatient.view` | DOCTOR, ADMIN |
| GET | `/api/v1/inpatient/departments/{id}/stays` | `inpatient.view` | ALL |
| GET | `/api/v1/inpatient/patients/{id}/history` | `inpatient.view` | ALL |
| GET | `/api/v1/inpatient/stays/{id}/discharge-planning` | `discharge.view` | ALL |
| GET | `/api/v1/inpatient/discharge-planning/{id}` | `discharge.view` | ALL |

### B. Medication Order Groups (13 APIs)

| Method | Endpoint | Permission | Role |
|--------|----------|------------|------|
| POST | `/api/v1/medication-order-groups` | `medication.order.create` | DOCTOR |
| POST | `/api/v1/medication-order-groups/{id}/confirm` | `medication.order.create` | DOCTOR |
| POST | `/api/v1/medication-order-groups/{id}/verify` | `medication.order.verify` | PHARMACIST |
| POST | `/api/v1/medication-order-groups/{id}/prepare` | `medication.order.prepare` | PHARMACIST |
| POST | `/api/v1/medication-order-groups/{id}/dispense` | `medication.order.dispense` | PHARMACIST |
| POST | `/api/v1/medication-order-groups/{id}/cancel` | `medication.order.cancel` | DOCTOR |
| POST | `/api/v1/medication-order-groups/{id}/discontinue` | `medication.order.discontinue` | DOCTOR |
| GET | `/api/v1/medication-order-groups/{id}` | `medication.order.view` | ALL |
| GET | `/api/v1/medication-order-groups/inpatient-stays/{id}` | `medication.order.view` | ALL |
| GET | `/api/v1/medication-order-groups/encounters/{id}` | `medication.order.view` | ALL |
| GET | `/api/v1/medication-order-groups/pending-verification` | `medication.order.verify` | PHARMACIST |
| GET | `/api/v1/medication-order-groups/pending-preparation` | `medication.order.prepare` | PHARMACIST |
| GET | `/api/v1/medication-order-groups/pending-dispensing` | `medication.order.dispense` | PHARMACIST |
| GET | `/api/v1/medication-order-groups/stat-orders` | `medication.order.view` | ALL |

### C. Medication Orders (9 APIs)

| Method | Endpoint | Permission | Role |
|--------|----------|------------|------|
| POST | `/api/v1/medication-orders` | `medication.order` | DOCTOR |
| POST | `/api/v1/medication-orders/{id}/verify` | `medication.verify` | PHARMACIST |
| POST | `/api/v1/medication-orders/{id}/prepare` | `medication.prepare` | PHARMACIST |
| POST | `/api/v1/medication-orders/{id}/hold` | `medication.order` | DOCTOR |
| POST | `/api/v1/medication-orders/{id}/resume` | `medication.order` | DOCTOR |
| POST | `/api/v1/medication-orders/{id}/discontinue` | `medication.order` | DOCTOR |
| GET | `/api/v1/medication-orders/{id}` | `medication.view` | ALL |
| GET | `/api/v1/medication-orders/encounter/{id}` | `medication.view` | ALL |
| GET | `/api/v1/medication-orders/inpatient-stay/{id}` | `medication.view` | ALL |
| GET | `/api/v1/medication-orders/patient/{id}` | `medication.view` | ALL |

### D. Medication Administration (12 APIs)

| Method | Endpoint | Permission | Role |
|--------|----------|------------|------|
| POST | `/api/v1/inpatient/medications/{id}/administer` | `medication.administer` | NURSE |
| POST | `/api/v1/inpatient/medications/{id}/refuse` | `medication.administer` | NURSE |
| POST | `/api/v1/inpatient/medications/{id}/miss` | `medication.administer` | NURSE |
| GET | `/api/v1/inpatient/medications/stays/{id}/today` | `medication.view` | ALL |
| GET | `/api/v1/inpatient/medications/stays/{id}/date/{date}` | `medication.view` | ALL |
| GET | `/api/v1/inpatient/medications/nurse/pending` | `medication.view` | NURSE |
| GET | `/api/v1/inpatient/medications/overdue` | `medication.view` | ALL |
| GET | `/api/v1/inpatient/medications/patient/{id}` | `medication.view` | ALL |
| PUT | `/api/v1/inpatient/medications/{id}/restore` | `medication.manage` | ADMIN |
| GET | `/api/v1/inpatient/medications/deleted` | `medication.view` | ALL |
| GET | `/api/v1/inpatient/medications/active` | `medication.view` | ALL |
| GET | `/api/v1/inpatient/medications/stats/soft-delete` | `medication.view` | ALL |

**Tổng cộng: 47 API endpoints cho luồng nội trú hoàn chỉnh**

**Phân loại:**
- Inpatient Management: 14 APIs
- Medication Order Groups: 13 APIs
- Medication Orders: 10 APIs
- Medication Administration: 12 APIs

---

🎉 **Chúc bạn triển khai thành công!** 🎉