# 📋 BÁO CÁO PHÂN HỆ NỘI TRÚ - THUỐC (INPATIENT MEDICATION)

**Hospital Management System - Spring Boot 3.3.5**  
**Ngày tạo báo cáo:** 2025-11-16  
**Phiên bản:** 1.0

---

## 📊 TỔNG QUAN HỆ THỐNG

Phân hệ Nội trú - Thuốc là hệ thống quản lý Y lệnh điều trị và cấp phát thuốc cho bệnh nhân nội trú, đảm bảo quy trình an toàn, chính xác và tuân thủ các quy định y tế.

### Thành phần chính

| Component | Path | Mục đích |
|-----------|------|----------|
| **MedicationOrderController** | `/api/v1/medication-orders` | Quản lý Y lệnh điều trị nội trú |
| **MedicationAdministrationController** | `/api/v1/inpatient/medications` | Quản lý việc cấp phát thuốc |

### Thống kê

- **Tổng số APIs:** 44 APIs
- **MedicationOrder APIs:** 28 APIs
- **MedicationAdministration APIs:** 16 APIs
- **Permissions:** 7 permissions
- **Workflow States:** 8 states
- **Roles:** 4 roles (DOCTOR, PHARMACIST, NURSE, ADMIN)

---

## 🔄 LUỒNG HOẠT ĐỘNG CHÍNH

### Workflow: ORDERED → VERIFIED → READY → ADMINISTERED

```
┌─────────────────────────────────────────────────────────────┐
│                    MEDICATION ORDER WORKFLOW                 │
└─────────────────────────────────────────────────────────────┘

1. DOCTOR TẠO Y LỆNH (ORDERED)
   ↓
   POST /medication-orders
   - Doctor tạo Y lệnh điều trị cho bệnh nhân nội trú
   - Có thể tạo đơn lẻ hoặc batch (nhiều Y lệnh cùng lúc)
   - Status: ORDERED

2. PHARMACIST KIỂM TRA (VERIFIED)
   ↓
   POST /medication-orders/{orderId}/verify
   - Dược sĩ kiểm tra Y lệnh
   - Xác nhận thuốc có sẵn, liều lượng đúng
   - Kiểm tra tương tác thuốc
   - Status: ORDERED → VERIFIED

3. PHARMACIST CHUẨN BỊ THUỐC (READY)
   ↓
   POST /medication-orders/{orderId}/prepare
   - Dược sĩ chuẩn bị thuốc theo đơn vị liều (unit-dose)
   - Đóng gói, dán nhãn barcode
   - Status: VERIFIED → READY

4. NURSE CẤP PHÁT THUỐC (ADMINISTERED)
   ↓
   POST /medication-orders/{orderId}/administer
   POST /medication-orders/{orderId}/administer-barcode
   - Y tá cấp phát thuốc cho bệnh nhân
   - Ghi nhận phản ứng của bệnh nhân
   - Quét barcode (5 Rights Verification)
   - Status: READY → ADMINISTERED
```

### Luồng phụ (Alternative Flows)

| Action | API | Role | Description |
|--------|-----|------|-------------|
| **DISCONTINUE** | `POST /medication-orders/{id}/discontinue` | DOCTOR | Ngừng Y lệnh vĩnh viễn |
| **HOLD** | `POST /medication-orders/{id}/hold` | DOCTOR | Tạm dừng Y lệnh |
| **RESUME** | `POST /medication-orders/{id}/resume` | DOCTOR | Tiếp tục Y lệnh đã tạm dừng |
| **REFUSE** | `POST /medication-orders/{id}/refuse` | NURSE | Bệnh nhân từ chối uống thuốc |
| **MISS** | `POST /medication-orders/{id}/miss` | NURSE | Bỏ lỡ cấp phát thuốc |

---

## 📦 DANH SÁCH APIs CHI TIẾT

### 1. MEDICATION ORDER APIs (28 APIs)

#### 1.1 CREATE OPERATIONS (2 APIs)

| # | Method | Endpoint | Role | Permission | Description |
|---|--------|----------|------|------------|-------------|
| 1 | POST | `/api/v1/medication-orders` | DOCTOR | medication.order | Tạo Y lệnh điều trị đơn lẻ |
| 2 | POST | `/api/v1/medication-orders/batch` | DOCTOR | medication.order | Tạo nhiều Y lệnh cùng lúc |

#### 1.2 READ OPERATIONS (5 APIs)

| # | Method | Endpoint | Permission | Description |
|---|--------|----------|------------|-------------|
| 3 | GET | `/api/v1/medication-orders/{orderId}` | medication.view | Xem chi tiết Y lệnh |
| 4 | GET | `/api/v1/medication-orders/encounter/{encounterId}` | medication.view | Xem tất cả Y lệnh của encounter |
| 5 | GET | `/api/v1/medication-orders/inpatient-stay/{stayId}` | medication.view | Xem tất cả Y lệnh của đợt nội trú |
| 6 | GET | `/api/v1/medication-orders/patient/{patientId}` | medication.view | Xem tất cả Y lệnh của bệnh nhân |
| 7 | GET | `/api/v1/medication-orders/status/{status}` | medication.view | Xem Y lệnh theo status (paginated) |

#### 1.3 WORKFLOW OPERATIONS (9 APIs)

| # | Method | Endpoint | Role | Permission | Status Transition |
|---|--------|----------|------|------------|-------------------|
| 8 | POST | `/api/v1/medication-orders/{orderId}/verify` | PHARMACIST | medication.verify | ORDERED → VERIFIED |
| 9 | POST | `/api/v1/medication-orders/{orderId}/prepare` | PHARMACIST | medication.prepare | VERIFIED → READY |
| 10 | POST | `/api/v1/medication-orders/{orderId}/administer` | NURSE | medication.administer | READY → ADMINISTERED |
| 11 | POST | `/api/v1/medication-orders/{orderId}/administer-barcode` | NURSE | medication.administer | READY → ADMINISTERED |
| 12 | POST | `/api/v1/medication-orders/{orderId}/discontinue` | DOCTOR | medication.order | ANY → DISCONTINUED |
| 13 | POST | `/api/v1/medication-orders/{orderId}/hold` | DOCTOR | medication.order | ANY → HELD |
| 14 | POST | `/api/v1/medication-orders/{orderId}/resume` | DOCTOR | medication.order | HELD → Previous |
| 15 | POST | `/api/v1/medication-orders/{orderId}/refuse` | NURSE | medication.administer | READY → REFUSED |
| 16 | POST | `/api/v1/medication-orders/{orderId}/miss` | NURSE | medication.administer | READY → MISSED |

#### 1.4 QUERY FOR PHARMACIST (3 APIs)

| # | Method | Endpoint | Role | Description |
|---|--------|----------|------|-------------|
| 17 | GET | `/api/v1/medication-orders/pending-verification` | PHARMACIST | Danh sách Y lệnh chờ kiểm tra |
| 18 | GET | `/api/v1/medication-orders/ready-for-preparation` | PHARMACIST | Danh sách Y lệnh chờ chuẩn bị |
| 19 | GET | `/api/v1/medication-orders/stat-orders` | ALL | Danh sách Y lệnh STAT (khẩn cấp) |

#### 1.5 QUERY FOR NURSE (4 APIs)

| # | Method | Endpoint | Role | Description |
|---|--------|----------|------|-------------|
| 20 | GET | `/api/v1/medication-orders/ready-for-administration` | NURSE | Danh sách thuốc chờ cấp phát |
| 21 | GET | `/api/v1/medication-orders/inpatient-stay/{stayId}/today` | NURSE | Lịch thuốc hôm nay |
| 22 | GET | `/api/v1/medication-orders/overdue` | NURSE | Danh sách thuốc quá hạn |
| 23 | GET | `/api/v1/medication-orders/patient/{patientId}/prn` | ALL | Y lệnh PRN (as needed) |

#### 1.6 STATISTICS (3 APIs)

| # | Method | Endpoint | Description |
|---|--------|----------|-------------|
| 24 | GET | `/api/v1/medication-orders/inpatient-stay/{stayId}/compliance-rate` | Tỷ lệ tuân thủ dùng thuốc (%) |
| 25 | GET | `/api/v1/medication-orders/statistics/today-administered` | Số thuốc đã cấp phát hôm nay |
| 26 | GET | `/api/v1/medication-orders/statistics/today-missed` | Số thuốc bỏ lỡ hôm nay |

#### 1.7 SOFT DELETE (2 APIs)

| # | Method | Endpoint | Permission | Description |
|---|--------|----------|------------|-------------|
| 27 | DELETE | `/api/v1/medication-orders/{orderId}` | medication.delete | Xóa mềm Y lệnh |
| 28 | POST | `/api/v1/medication-orders/{orderId}/restore` | medication.delete | Khôi phục Y lệnh |

---

### 2. MEDICATION ADMINISTRATION APIs (16 APIs)

#### 2.1 CRUD OPERATIONS (3 APIs)

| # | Method | Endpoint | Role | Permission | Description |
|---|--------|----------|------|------------|-------------|
| 29 | POST | `/api/v1/inpatient/medications` | NURSE | medication.administer | Tạo lịch cấp phát thủ công |
| 30 | GET | `/api/v1/inpatient/medications/{administrationId}` | ALL | medication.view | Xem chi tiết lịch cấp phát |
| 31 | PUT | `/api/v1/inpatient/medications/{administrationId}` | NURSE | medication.administer | Cập nhật lịch (chỉ PENDING) |

#### 2.2 ADMINISTRATION OPERATIONS (3 APIs)

| # | Method | Endpoint | Role | Status Transition |
|---|--------|----------|------|-------------------|
| 32 | POST | `/api/v1/inpatient/medications/{administrationId}/administer` | NURSE | PENDING → ADMINISTERED |
| 33 | POST | `/api/v1/inpatient/medications/{administrationId}/refuse` | NURSE | PENDING → REFUSED |
| 34 | POST | `/api/v1/inpatient/medications/{administrationId}/miss` | NURSE | PENDING → MISSED |

#### 2.3 QUERY OPERATIONS (6 APIs)

| # | Method | Endpoint | Description |
|---|--------|----------|-------------|
| 35 | GET | `/api/v1/inpatient/medications/stays/{stayId}/today` | Lịch thuốc hôm nay cho bệnh nhân |
| 36 | GET | `/api/v1/inpatient/medications/stays/{stayId}/date/{date}` | Lịch thuốc theo ngày cụ thể |
| 37 | GET | `/api/v1/inpatient/medications/nurse/pending` | Danh sách thuốc chờ cấp phát của nurse |
| 38 | GET | `/api/v1/inpatient/medications/overdue` | Danh sách thuốc quá hạn |
| 39 | GET | `/api/v1/inpatient/medications/patient/{patientId}` | Tất cả thuốc của bệnh nhân |
| 40 | GET | `/api/v1/inpatient/medications/stays/{stayId}/all` | Lịch sử cấp phát đầy đủ |

#### 2.4 SOFT DELETE (4 APIs)

| # | Method | Endpoint | Permission | Description |
|---|--------|----------|------------|-------------|
| 41 | PUT | `/api/v1/inpatient/medications/{medicationId}/restore` | medication.manage | Khôi phục lịch cấp phát |
| 42 | GET | `/api/v1/inpatient/medications/deleted` | medication.view | Danh sách đã xóa (paginated) |
| 43 | GET | `/api/v1/inpatient/medications/active` | medication.view | Danh sách active (paginated) |
| 44 | GET | `/api/v1/inpatient/medications/stats/soft-delete` | medication.view | Thống kê soft delete |

---

## 🔐 PHÂN QUYỀN (PERMISSIONS)

### Bảng phân quyền chi tiết

| Permission | Role | Số APIs | Mô tả |
|------------|------|---------|-------|
| **medication.order** | DOCTOR | 6 APIs | Tạo, sửa, ngừng Y lệnh |
| **medication.verify** | PHARMACIST | 2 APIs | Kiểm tra Y lệnh |
| **medication.prepare** | PHARMACIST | 2 APIs | Chuẩn bị thuốc |
| **medication.administer** | NURSE | 9 APIs | Cấp phát thuốc |
| **medication.view** | ALL | 21 APIs | Xem thông tin thuốc |
| **medication.manage** | ADMIN | 1 API | Quản lý (restore soft delete) |
| **medication.delete** | ADMIN | 2 APIs | Xóa Y lệnh |

### Phân quyền theo Role

```
DOCTOR (medication.order):
  ✅ Tạo Y lệnh (POST /medication-orders)
  ✅ Tạo batch Y lệnh (POST /medication-orders/batch)
  ✅ Ngừng Y lệnh (POST /medication-orders/{id}/discontinue)
  ✅ Tạm dừng Y lệnh (POST /medication-orders/{id}/hold)
  ✅ Tiếp tục Y lệnh (POST /medication-orders/{id}/resume)
  ✅ Xem tất cả thông tin

PHARMACIST (medication.verify + medication.prepare):
  ✅ Kiểm tra Y lệnh (POST /medication-orders/{id}/verify)
  ✅ Chuẩn bị thuốc (POST /medication-orders/{id}/prepare)
  ✅ Xem Y lệnh chờ kiểm tra
  ✅ Xem Y lệnh chờ chuẩn bị
  ✅ Xem tất cả thông tin

NURSE (medication.administer):
  ✅ Cấp phát thuốc (POST /medication-orders/{id}/administer)
  ✅ Cấp phát với barcode (POST /medication-orders/{id}/administer-barcode)
  ✅ Ghi nhận từ chối (POST /medication-orders/{id}/refuse)
  ✅ Ghi nhận bỏ lỡ (POST /medication-orders/{id}/miss)
  ✅ Xem lịch thuốc hôm nay
  ✅ Xem thuốc quá hạn
  ✅ Tạo/cập nhật lịch cấp phát

ADMIN (medication.manage + medication.delete):
  ✅ Xóa mềm Y lệnh
  ✅ Khôi phục Y lệnh
  ✅ Xem thống kê soft delete
  ✅ Tất cả quyền của các role khác
```

---

## 🎯 TÍNH NĂNG NỔI BẬT

### 1. Barcode Scanning (5 Rights Verification)

**API:** `POST /api/v1/medication-orders/{orderId}/administer-barcode`

**5 Rights (5 Đúng):**
- ✅ **Right Patient** - Đúng bệnh nhân (quét vòng tay)
- ✅ **Right Drug** - Đúng thuốc (quét barcode thuốc)
- ✅ **Right Dose** - Đúng liều lượng
- ✅ **Right Route** - Đúng đường dùng (uống, tiêm, ...)
- ✅ **Right Time** - Đúng thời gian

**Lợi ích:**
- Giảm thiểu sai sót trong cấp phát thuốc
- Tăng tính an toàn cho bệnh nhân
- Audit trail đầy đủ

### 2. STAT Orders (Y lệnh khẩn cấp)

**API:** `GET /api/v1/medication-orders/stat-orders`

**Đặc điểm:**
- Ưu tiên cao nhất
- Cần xử lý ngay lập tức
- Hiển thị riêng cho Pharmacist và Nurse
- Cảnh báo đặc biệt

### 3. PRN Orders (Y lệnh khi cần)

**API:** `GET /api/v1/medication-orders/patient/{patientId}/prn`

**Đặc điểm:**
- Thuốc uống khi cần (as needed)
- Không theo lịch cố định
- Nurse quyết định khi nào cấp phát
- Ví dụ: Thuốc giảm đau, thuốc hạ sốt

### 4. Batch Creation

**API:** `POST /api/v1/medication-orders/batch`

**Lợi ích:**
- Tạo nhiều Y lệnh cùng lúc
- Tiết kiệm thời gian cho Doctor
- Giảm thiểu lỗi nhập liệu

### 5. Compliance Tracking

**API:** `GET /api/v1/medication-orders/inpatient-stay/{stayId}/compliance-rate`

**Tính năng:**
- Theo dõi tỷ lệ tuân thủ dùng thuốc (%)
- Báo cáo thuốc bỏ lỡ/từ chối
- Phân tích xu hướng
- Cải thiện chất lượng điều trị

### 6. Overdue Alerts

**APIs:**
- `GET /api/v1/medication-orders/overdue`
- `GET /api/v1/inpatient/medications/overdue`

**Tính năng:**
- Cảnh báo thuốc quá hạn cấp phát
- Giúp Nurse không bỏ lỡ
- Đảm bảo điều trị đúng lịch

### 7. Soft Delete Support

**APIs:**
- `DELETE /api/v1/medication-orders/{orderId}`
- `POST /api/v1/medication-orders/{orderId}/restore`

**Lợi ích:**
- Xóa mềm an toàn
- Có thể khôi phục lại
- Audit trail đầy đủ
- Tuân thủ quy định pháp lý

---

## 📈 SO SÁNH: NỘI TRÚ vs NGOẠI TRÚ

| Tiêu chí | Nội trú (MedicationOrder) | Ngoại trú (Prescription) |
|----------|---------------------------|--------------------------|
| **Workflow** | 4 bước (ORDERED → VERIFIED → READY → ADMINISTERED) | 3 bước (DRAFT → SIGNED → DISPENSED) |
| **Số bước** | 4 bước | 3 bước |
| **Cấp phát** | Nhiều lần (theo lịch hàng ngày) | 1 lần (mang về nhà) |
| **Người thực hiện** | DOCTOR → PHARMACIST → NURSE | DOCTOR → PHARMACIST |
| **Barcode** | ✅ Có (5 Rights) | ❌ Không |
| **Compliance** | ✅ Theo dõi chi tiết | ❌ Không |
| **PRN/STAT** | ✅ Có | ❌ Không |
| **Overdue Alerts** | ✅ Có | ❌ Không |
| **Batch Creation** | ✅ Có | ❌ Không |
| **Số APIs** | 44 APIs | ~20 APIs |

---

## 🗄️ DATABASE TABLES

### Các bảng liên quan

| Table Name | Description |
|------------|-------------|
| `MedicationOrders` | Lưu trữ Y lệnh điều trị |
| `MedicationAdministrations` | Lưu trữ lịch cấp phát thuốc |
| `InpatientStays` | Thông tin đợt nội trú |
| `Encounters` | Thông tin lượt khám |
| `Patients` | Thông tin bệnh nhân |
| `Medications` | Danh mục thuốc |
| `Users` | Thông tin nhân viên (Doctor, Pharmacist, Nurse) |

---

## ✅ KẾT LUẬN

### Điểm mạnh

✅ **Workflow rõ ràng** - 4 bước chính + 4 luồng phụ  
✅ **Phân quyền chi tiết** - 7 permissions cho 4 roles  
✅ **Safety features** - Barcode scanning, Drug interaction checking  
✅ **Compliance tracking** - Theo dõi tỷ lệ tuân thủ  
✅ **Query APIs phong phú** - 21 APIs cho Pharmacist, Nurse, Doctor  
✅ **Statistics** - Thống kê chi tiết  
✅ **Soft delete support** - Xóa mềm an toàn  
✅ **STAT/PRN orders** - Hỗ trợ Y lệnh đặc biệt  
✅ **Overdue alerts** - Cảnh báo thuốc quá hạn  
✅ **Batch creation** - Tạo nhiều Y lệnh cùng lúc  

### Khuyến nghị

1. **Testing:** Cần test đầy đủ 44 APIs
2. **Permissions:** Kiểm tra permissions đã được gán đúng cho các roles
3. **Database:** Kiểm tra các bảng database có đầy đủ dữ liệu test
4. **Integration:** Test tích hợp với các phân hệ khác (Inpatient, Pharmacy)
5. **Performance:** Test performance với số lượng lớn Y lệnh
6. **Security:** Audit security cho các APIs nhạy cảm

### Trạng thái

🟢 **READY FOR TESTING** - Hệ thống đã hoàn chỉnh, sẵn sàng để test

---

**Người tạo báo cáo:** Augment Agent
**Ngày:** 2025-11-16
**Phiên bản:** 1.0

---

## 📝 JSON EXAMPLES CHO CÁC APIs

### 1. CREATE MEDICATION ORDER

#### API #1: POST /api/v1/medication-orders

**Request Body:**
```json
{
  "encounterId": 123,
  "patientId": 456,
  "medicineId": 789,
  "dosage": "500mg",
  "route": "ORAL",
  "frequency": "BID",
  "orderType": "INPATIENT",
  "inpatientStayId": 101,
  "durationDays": 7,
  "specialInstructions": "Uống sau bữa ăn",
  "scheduledDatetime": "2025-11-16T08:00:00",
  "priority": "ROUTINE",
  "isPrn": false,
  "isStat": false,
  "unitPrice": 15000.00,
  "quantityOrdered": 14,
  "discountAmount": 0.00
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Medication order created successfully.",
  "data": {
    "medicationOrderId": 1001,
    "encounterId": 123,
    "inpatientStayId": 101,
    "patientId": 456,
    "patientName": "Nguyễn Văn A",
    "patientCode": "BN000456",
    "prescriptionId": null,
    "medicineId": 789,
    "medicineName": "Paracetamol",
    "medicineCode": "MED789",
    "dosage": "500mg",
    "route": "ORAL",
    "frequency": "BID",
    "durationDays": 7,
    "specialInstructions": "Uống sau bữa ăn",
    "orderType": "INPATIENT",
    "status": "ORDERED",
    "priority": "ROUTINE",
    "isPrn": false,
    "isStat": false,
    "isDiscontinued": false,
    "scheduledDatetime": "2025-11-16T08:00:00",
    "administeredDatetime": null,
    "orderedByDoctorId": 10,
    "orderedByDoctorName": "BS. Trần Thị B",
    "orderedAt": "2025-11-16T07:30:00",
    "administeredByNurseId": null,
    "administeredByNurseName": null,
    "administrationNotes": null,
    "patientResponse": null,
    "adverseReaction": null,
    "dispensedByPharmacistId": null,
    "dispensedByPharmacistName": null,
    "dispensedAt": null,
    "quantityDispensed": null,
    "dispensingNotes": null,
    "discontinuedByDoctorId": null,
    "discontinuedByDoctorName": null,
    "discontinuedAt": null,
    "discontinuationReason": null,
    "unitPrice": 15000.00,
    "quantityOrdered": 14,
    "totalPrice": 210000.00,
    "discountAmount": 0.00,
    "finalPrice": 210000.00,
    "medicineBarcodeScanned": null,
    "patientWristbandScanned": null,
    "barcodeScanDatetime": null,
    "createdAt": "2025-11-16T07:30:00",
    "updatedAt": "2025-11-16T07:30:00",
    "version": 0
  }
}
```

---

#### API #2: POST /api/v1/medication-orders/batch

**Request Body:**
```json
[
  {
    "encounterId": 123,
    "patientId": 456,
    "medicineId": 789,
    "dosage": "500mg",
    "route": "ORAL",
    "frequency": "BID",
    "orderType": "INPATIENT",
    "inpatientStayId": 101,
    "scheduledDatetime": "2025-11-16T08:00:00",
    "priority": "ROUTINE"
  },
  {
    "encounterId": 123,
    "patientId": 456,
    "medicineId": 790,
    "dosage": "250mg",
    "route": "ORAL",
    "frequency": "TID",
    "orderType": "INPATIENT",
    "inpatientStayId": 101,
    "scheduledDatetime": "2025-11-16T08:00:00",
    "priority": "ROUTINE"
  }
]
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Medication orders created successfully.",
  "data": [
    {
      "medicationOrderId": 1001,
      "medicineName": "Paracetamol",
      "status": "ORDERED",
      ...
    },
    {
      "medicationOrderId": 1002,
      "medicineName": "Amoxicillin",
      "status": "ORDERED",
      ...
    }
  ]
}
```

---

### 2. WORKFLOW OPERATIONS

#### API #8: POST /api/v1/medication-orders/{orderId}/verify

**URL:** `POST /api/v1/medication-orders/1001/verify?notes=Đã kiểm tra tồn kho`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Medication order verified successfully.",
  "data": {
    "medicationOrderId": 1001,
    "status": "VERIFIED",
    "verifiedByPharmacistId": 20,
    "verifiedByPharmacistName": "DS. Lê Văn C",
    "verifiedAt": "2025-11-16T07:45:00",
    ...
  }
}
```

---

#### API #9: POST /api/v1/medication-orders/{orderId}/prepare

**URL:** `POST /api/v1/medication-orders/1001/prepare?notes=Đã chuẩn bị unit-dose`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Medication order prepared successfully.",
  "data": {
    "medicationOrderId": 1001,
    "status": "READY",
    "preparedByPharmacistId": 20,
    "preparedByPharmacistName": "DS. Lê Văn C",
    "preparedAt": "2025-11-16T07:50:00",
    ...
  }
}
```

---

#### API #10: POST /api/v1/medication-orders/{orderId}/administer

**URL:** `POST /api/v1/medication-orders/1001/administer`

**Query Parameters:**
- `patientResponse`: "Bệnh nhân uống thuốc tốt"
- `adverseReaction`: null
- `notes`: "Đã cấp phát đúng giờ"

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Medication order administered successfully.",
  "data": {
    "medicationOrderId": 1001,
    "status": "ADMINISTERED",
    "administeredByNurseId": 30,
    "administeredByNurseName": "Điều dưỡng Phạm Thị D",
    "administeredDatetime": "2025-11-16T08:05:00",
    "patientResponse": "Bệnh nhân uống thuốc tốt",
    "adverseReaction": null,
    "administrationNotes": "Đã cấp phát đúng giờ",
    ...
  }
}
```

---

#### API #11: POST /api/v1/medication-orders/{orderId}/administer-barcode

**URL:** `POST /api/v1/medication-orders/1001/administer-barcode`

**Query Parameters:**
- `medicineBarcode`: "MED789-BATCH001"
- `patientWristband`: "BN000456-WRIST"
- `patientResponse`: "Bệnh nhân uống thuốc tốt"
- `adverseReaction`: null
- `notes`: "Đã quét barcode, xác minh 5 đúng"

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Medication order administered successfully with barcode verification.",
  "data": {
    "medicationOrderId": 1001,
    "status": "ADMINISTERED",
    "administeredByNurseId": 30,
    "administeredByNurseName": "Điều dưỡng Phạm Thị D",
    "administeredDatetime": "2025-11-16T08:05:00",
    "patientResponse": "Bệnh nhân uống thuốc tốt",
    "adverseReaction": null,
    "administrationNotes": "Đã quét barcode, xác minh 5 đúng",
    "medicineBarcodeScanned": "MED789-BATCH001",
    "patientWristbandScanned": "BN000456-WRIST",
    "barcodeScanDatetime": "2025-11-16T08:05:00",
    ...
  }
}
```

---

#### API #12: POST /api/v1/medication-orders/{orderId}/discontinue

**URL:** `POST /api/v1/medication-orders/1001/discontinue?reason=Bệnh nhân dị ứng`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Medication order discontinued successfully.",
  "data": {
    "medicationOrderId": 1001,
    "status": "DISCONTINUED",
    "isDiscontinued": true,
    "discontinuedByDoctorId": 10,
    "discontinuedByDoctorName": "BS. Trần Thị B",
    "discontinuedAt": "2025-11-16T09:00:00",
    "discontinuationReason": "Bệnh nhân dị ứng",
    ...
  }
}
```

---

#### API #13: POST /api/v1/medication-orders/{orderId}/hold

**URL:** `POST /api/v1/medication-orders/1001/hold?reason=Chờ kết quả xét nghiệm`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Medication order held successfully.",
  "data": {
    "medicationOrderId": 1001,
    "status": "HELD",
    "holdReason": "Chờ kết quả xét nghiệm",
    ...
  }
}
```

---

#### API #14: POST /api/v1/medication-orders/{orderId}/resume

**URL:** `POST /api/v1/medication-orders/1001/resume`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Medication order resumed successfully.",
  "data": {
    "medicationOrderId": 1001,
    "status": "READY",
    "holdReason": null,
    ...
  }
}
```

---

#### API #15: POST /api/v1/medication-orders/{orderId}/refuse

**URL:** `POST /api/v1/medication-orders/1001/refuse?reason=Bệnh nhân từ chối uống`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Medication marked as refused.",
  "data": {
    "medicationOrderId": 1001,
    "status": "REFUSED",
    "refusedByNurseId": 30,
    "refusedByNurseName": "Điều dưỡng Phạm Thị D",
    "refusedAt": "2025-11-16T08:05:00",
    "refusalReason": "Bệnh nhân từ chối uống",
    ...
  }
}
```

---

#### API #16: POST /api/v1/medication-orders/{orderId}/miss

**URL:** `POST /api/v1/medication-orders/1001/miss?reason=Bệnh nhân đi xét nghiệm`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Medication marked as missed.",
  "data": {
    "medicationOrderId": 1001,
    "status": "MISSED",
    "missedByNurseId": 30,
    "missedByNurseName": "Điều dưỡng Phạm Thị D",
    "missedAt": "2025-11-16T08:35:00",
    "missedReason": "Bệnh nhân đi xét nghiệm",
    ...
  }
}
```

---

### 3. READ OPERATIONS

#### API #3: GET /api/v1/medication-orders/{orderId}

**URL:** `GET /api/v1/medication-orders/1001`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Medication order retrieved successfully.",
  "data": {
    "medicationOrderId": 1001,
    "encounterId": 123,
    "inpatientStayId": 101,
    "patientId": 456,
    "patientName": "Nguyễn Văn A",
    "patientCode": "BN000456",
    "medicineName": "Paracetamol",
    "dosage": "500mg",
    "route": "ORAL",
    "frequency": "BID",
    "status": "ADMINISTERED",
    ...
  }
}
```

---

#### API #4: GET /api/v1/medication-orders/encounter/{encounterId}

**URL:** `GET /api/v1/medication-orders/encounter/123`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Medication orders retrieved successfully.",
  "data": [
    {
      "medicationOrderId": 1001,
      "medicineName": "Paracetamol",
      "status": "ADMINISTERED",
      ...
    },
    {
      "medicationOrderId": 1002,
      "medicineName": "Amoxicillin",
      "status": "READY",
      ...
    }
  ]
}
```

---

#### API #5: GET /api/v1/medication-orders/inpatient-stay/{stayId}

**URL:** `GET /api/v1/medication-orders/inpatient-stay/101`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Medication orders retrieved successfully.",
  "data": [
    {
      "medicationOrderId": 1001,
      "medicineName": "Paracetamol",
      "status": "ADMINISTERED",
      "scheduledDatetime": "2025-11-16T08:00:00",
      ...
    },
    {
      "medicationOrderId": 1002,
      "medicineName": "Amoxicillin",
      "status": "READY",
      "scheduledDatetime": "2025-11-16T08:00:00",
      ...
    }
  ]
}
```

---

#### API #6: GET /api/v1/medication-orders/patient/{patientId}

**URL:** `GET /api/v1/medication-orders/patient/456`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Medication orders retrieved successfully.",
  "data": [
    {
      "medicationOrderId": 1001,
      "medicineName": "Paracetamol",
      "status": "ADMINISTERED",
      "orderType": "INPATIENT",
      ...
    }
  ]
}
```

---

#### API #7: GET /api/v1/medication-orders/status/{status}

**URL:** `GET /api/v1/medication-orders/status/READY?page=0&size=20`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Medication orders retrieved successfully.",
  "data": {
    "content": [
      {
        "medicationOrderId": 1002,
        "medicineName": "Amoxicillin",
        "status": "READY",
        ...
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 20
    },
    "totalElements": 1,
    "totalPages": 1
  }
}
```

---

### 4. QUERY OPERATIONS

#### API #17: GET /api/v1/medication-orders/pending-verification

**URL:** `GET /api/v1/medication-orders/pending-verification`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Pending verification orders retrieved successfully.",
  "data": [
    {
      "medicationOrderId": 1003,
      "patientName": "Nguyễn Văn B",
      "medicineName": "Aspirin",
      "status": "ORDERED",
      "orderedAt": "2025-11-16T09:00:00",
      "priority": "ROUTINE"
    }
  ]
}
```

---

#### API #18: GET /api/v1/medication-orders/ready-for-preparation

**URL:** `GET /api/v1/medication-orders/ready-for-preparation`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Ready for preparation orders retrieved successfully.",
  "data": [
    {
      "medicationOrderId": 1004,
      "patientName": "Trần Thị C",
      "medicineName": "Ibuprofen",
      "status": "VERIFIED",
      "verifiedAt": "2025-11-16T09:15:00"
    }
  ]
}
```

---

#### API #19: GET /api/v1/medication-orders/stat-orders

**URL:** `GET /api/v1/medication-orders/stat-orders`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "STAT orders retrieved successfully.",
  "data": [
    {
      "medicationOrderId": 1005,
      "patientName": "Lê Văn D",
      "medicineName": "Epinephrine",
      "status": "ORDERED",
      "priority": "STAT",
      "isStat": true,
      "orderedAt": "2025-11-16T09:30:00"
    }
  ]
}
```

---

#### API #20: GET /api/v1/medication-orders/ready-for-administration

**URL:** `GET /api/v1/medication-orders/ready-for-administration`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Ready for administration orders retrieved successfully.",
  "data": [
    {
      "medicationOrderId": 1002,
      "patientName": "Nguyễn Văn A",
      "patientCode": "BN000456",
      "roomNumber": "301",
      "bedNumber": "A",
      "medicineName": "Amoxicillin",
      "dosage": "250mg",
      "route": "ORAL",
      "status": "READY",
      "scheduledDatetime": "2025-11-16T08:00:00"
    }
  ]
}
```

---

#### API #21: GET /api/v1/medication-orders/inpatient-stay/{stayId}/today

**URL:** `GET /api/v1/medication-orders/inpatient-stay/101/today`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Today's medication schedule retrieved successfully.",
  "data": [
    {
      "medicationOrderId": 1001,
      "medicineName": "Paracetamol",
      "dosage": "500mg",
      "scheduledDatetime": "2025-11-16T08:00:00",
      "status": "ADMINISTERED"
    },
    {
      "medicationOrderId": 1001,
      "medicineName": "Paracetamol",
      "dosage": "500mg",
      "scheduledDatetime": "2025-11-16T20:00:00",
      "status": "READY"
    }
  ]
}
```

---

#### API #22: GET /api/v1/medication-orders/overdue

**URL:** `GET /api/v1/medication-orders/overdue`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Overdue medication orders retrieved successfully.",
  "data": [
    {
      "medicationOrderId": 1006,
      "patientName": "Phạm Thị E",
      "medicineName": "Metformin",
      "scheduledDatetime": "2025-11-16T07:00:00",
      "status": "READY",
      "minutesOverdue": 95
    }
  ]
}
```

---

#### API #23: GET /api/v1/medication-orders/patient/{patientId}/prn

**URL:** `GET /api/v1/medication-orders/patient/456/prn`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "PRN orders retrieved successfully.",
  "data": [
    {
      "medicationOrderId": 1007,
      "medicineName": "Morphine",
      "dosage": "10mg",
      "route": "IV",
      "isPrn": true,
      "specialInstructions": "Dùng khi đau",
      "status": "READY"
    }
  ]
}
```

---

### 5. STATISTICS

#### API #24: GET /api/v1/medication-orders/inpatient-stay/{stayId}/compliance-rate

**URL:** `GET /api/v1/medication-orders/inpatient-stay/101/compliance-rate`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Compliance rate retrieved successfully.",
  "data": {
    "inpatientStayId": 101,
    "totalOrders": 20,
    "administeredOrders": 18,
    "refusedOrders": 1,
    "missedOrders": 1,
    "complianceRate": 90.0,
    "refusalRate": 5.0,
    "missedRate": 5.0
  }
}
```

---

#### API #25: GET /api/v1/medication-orders/statistics/today-administered

**URL:** `GET /api/v1/medication-orders/statistics/today-administered`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Today's administered count retrieved successfully.",
  "data": {
    "date": "2025-11-16",
    "totalAdministered": 145,
    "byPriority": {
      "STAT": 5,
      "URGENT": 20,
      "ROUTINE": 120
    },
    "byRoute": {
      "ORAL": 100,
      "IV": 30,
      "IM": 10,
      "SC": 5
    }
  }
}
```

---

#### API #26: GET /api/v1/medication-orders/statistics/today-missed

**URL:** `GET /api/v1/medication-orders/statistics/today-missed`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Today's missed count retrieved successfully.",
  "data": {
    "date": "2025-11-16",
    "totalMissed": 8,
    "reasons": {
      "Bệnh nhân đi xét nghiệm": 3,
      "Bệnh nhân ngủ": 2,
      "Thiếu thuốc": 2,
      "Khác": 1
    }
  }
}
```

---

### 6. MEDICATION ADMINISTRATION APIs

#### API #29: POST /api/v1/inpatient/medications

**Request Body:**
```json
{
  "inpatientStayId": 101,
  "prescriptionItemId": 501,
  "scheduledDatetime": "2025-11-16T14:00:00",
  "dosage": "500mg",
  "routeOfAdministration": "ORAL",
  "frequency": "BID",
  "administrationNotes": "Uống sau bữa ăn"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Medication administration created successfully.",
  "data": {
    "administrationId": 2001,
    "prescriptionItemId": 501,
    "inpatientStayId": 101,
    "medicationName": "Paracetamol",
    "dosage": "500mg",
    "routeOfAdministration": "ORAL",
    "frequency": "BID",
    "scheduledDatetime": "2025-11-16T14:00:00",
    "actualDatetime": null,
    "administrationStatus": "PENDING",
    "administeredByNurseId": null,
    "administeredByNurseName": null,
    "administrationNotes": "Uống sau bữa ăn",
    "patientResponse": null,
    "sideEffectsObserved": null,
    "patientId": 456,
    "patientName": "Nguyễn Văn A",
    "patientCode": "BN000456",
    "roomNumber": "301",
    "bedNumber": "A",
    "prescriptionId": 500,
    "prescribedByEmployeeId": 10,
    "prescribedByEmployeeName": "BS. Trần Thị B",
    "prescriptionDate": "2025-11-16T07:00:00",
    "createdAt": "2025-11-16T13:00:00",
    "updatedAt": "2025-11-16T13:00:00"
  }
}
```

---

#### API #30: GET /api/v1/inpatient/medications/{administrationId}

**URL:** `GET /api/v1/inpatient/medications/2001`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Medication administration retrieved successfully.",
  "data": {
    "administrationId": 2001,
    "medicationName": "Paracetamol",
    "dosage": "500mg",
    "administrationStatus": "PENDING",
    "scheduledDatetime": "2025-11-16T14:00:00",
    ...
  }
}
```

---

#### API #31: PUT /api/v1/inpatient/medications/{administrationId}

**URL:** `PUT /api/v1/inpatient/medications/2001`

**Request Body:**
```json
{
  "scheduledDatetime": "2025-11-16T15:00:00",
  "administrationNotes": "Đổi giờ theo yêu cầu bệnh nhân"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Medication administration updated successfully.",
  "data": {
    "administrationId": 2001,
    "scheduledDatetime": "2025-11-16T15:00:00",
    "administrationNotes": "Đổi giờ theo yêu cầu bệnh nhân",
    ...
  }
}
```

---

#### API #32: POST /api/v1/inpatient/medications/{administrationId}/administer

**URL:** `POST /api/v1/inpatient/medications/2001/administer`

**Request Body:**
```json
{
  "actualDatetime": "2025-11-16T14:05:00",
  "administrationNotes": "Đã cấp phát đúng giờ",
  "patientResponse": "Bệnh nhân uống thuốc tốt",
  "sideEffectsObserved": null,
  "confirmationCode": "GIVEN"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Medication administered successfully.",
  "data": {
    "administrationId": 2001,
    "administrationStatus": "GIVEN",
    "actualDatetime": "2025-11-16T14:05:00",
    "administeredByNurseId": 30,
    "administeredByNurseName": "Điều dưỡng Phạm Thị D",
    "patientResponse": "Bệnh nhân uống thuốc tốt",
    "sideEffectsObserved": null,
    ...
  }
}
```

---

#### API #33: POST /api/v1/inpatient/medications/{administrationId}/refuse

**URL:** `POST /api/v1/inpatient/medications/2001/refuse`

**Request Body:**
```json
{
  "actualDatetime": "2025-11-16T14:05:00",
  "administrationNotes": "Bệnh nhân từ chối uống thuốc",
  "patientResponse": "Không muốn uống",
  "confirmationCode": "REFUSED"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Medication marked as refused.",
  "data": {
    "administrationId": 2001,
    "administrationStatus": "REFUSED",
    "actualDatetime": "2025-11-16T14:05:00",
    "patientResponse": "Không muốn uống",
    ...
  }
}
```

---

#### API #34: POST /api/v1/inpatient/medications/{administrationId}/miss

**URL:** `POST /api/v1/inpatient/medications/2001/miss`

**Request Body:**
```json
{
  "actualDatetime": "2025-11-16T14:35:00",
  "administrationNotes": "Bệnh nhân đi xét nghiệm",
  "confirmationCode": "MISSED"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Medication marked as missed.",
  "data": {
    "administrationId": 2001,
    "administrationStatus": "MISSED",
    "actualDatetime": "2025-11-16T14:35:00",
    "administrationNotes": "Bệnh nhân đi xét nghiệm",
    ...
  }
}
```

---

#### API #35: GET /api/v1/inpatient/medications/stays/{stayId}/today

**URL:** `GET /api/v1/inpatient/medications/stays/101/today`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Today's medications retrieved successfully.",
  "data": [
    {
      "administrationId": 2001,
      "medicationName": "Paracetamol",
      "dosage": "500mg",
      "scheduledDatetime": "2025-11-16T08:00:00",
      "administrationStatus": "GIVEN"
    },
    {
      "administrationId": 2002,
      "medicationName": "Paracetamol",
      "dosage": "500mg",
      "scheduledDatetime": "2025-11-16T20:00:00",
      "administrationStatus": "PENDING"
    }
  ]
}
```

---

#### API #36: GET /api/v1/inpatient/medications/stays/{stayId}/date/{date}

**URL:** `GET /api/v1/inpatient/medications/stays/101/date/2025-11-15`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Medications for date retrieved successfully.",
  "data": [
    {
      "administrationId": 1999,
      "medicationName": "Paracetamol",
      "scheduledDatetime": "2025-11-15T08:00:00",
      "administrationStatus": "GIVEN"
    }
  ]
}
```

---

#### API #37: GET /api/v1/inpatient/medications/nurse/pending

**URL:** `GET /api/v1/inpatient/medications/nurse/pending`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Pending medications retrieved successfully.",
  "data": [
    {
      "administrationId": 2002,
      "patientName": "Nguyễn Văn A",
      "roomNumber": "301",
      "bedNumber": "A",
      "medicationName": "Paracetamol",
      "scheduledDatetime": "2025-11-16T20:00:00",
      "administrationStatus": "PENDING"
    }
  ]
}
```

---

#### API #38: GET /api/v1/inpatient/medications/overdue

**URL:** `GET /api/v1/inpatient/medications/overdue`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Overdue medications retrieved successfully.",
  "data": [
    {
      "administrationId": 2003,
      "patientName": "Trần Thị B",
      "medicationName": "Insulin",
      "scheduledDatetime": "2025-11-16T07:00:00",
      "administrationStatus": "PENDING",
      "minutesOverdue": 155
    }
  ]
}
```

---

#### API #39: GET /api/v1/inpatient/medications/patient/{patientId}

**URL:** `GET /api/v1/inpatient/medications/patient/456`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Patient medications retrieved successfully.",
  "data": [
    {
      "administrationId": 2001,
      "medicationName": "Paracetamol",
      "scheduledDatetime": "2025-11-16T08:00:00",
      "administrationStatus": "GIVEN"
    },
    {
      "administrationId": 2002,
      "medicationName": "Paracetamol",
      "scheduledDatetime": "2025-11-16T20:00:00",
      "administrationStatus": "PENDING"
    }
  ]
}
```

---

#### API #40: GET /api/v1/inpatient/medications/stays/{stayId}/all

**URL:** `GET /api/v1/inpatient/medications/stays/101/all`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Complete administration history retrieved successfully.",
  "data": [
    {
      "administrationId": 1999,
      "medicationName": "Paracetamol",
      "scheduledDatetime": "2025-11-15T08:00:00",
      "actualDatetime": "2025-11-15T08:05:00",
      "administrationStatus": "GIVEN"
    },
    {
      "administrationId": 2000,
      "medicationName": "Paracetamol",
      "scheduledDatetime": "2025-11-15T20:00:00",
      "actualDatetime": "2025-11-15T20:10:00",
      "administrationStatus": "GIVEN"
    }
  ]
}
```

---

### 7. SOFT DELETE OPERATIONS

#### API #27: DELETE /api/v1/medication-orders/{orderId}

**URL:** `DELETE /api/v1/medication-orders/1001`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Medication order deleted successfully.",
  "data": null
}
```

---

#### API #28: POST /api/v1/medication-orders/{orderId}/restore

**URL:** `POST /api/v1/medication-orders/1001/restore`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Medication order restored successfully.",
  "data": {
    "medicationOrderId": 1001,
    "status": "ORDERED",
    "deletedAt": null,
    ...
  }
}
```

---

#### API #41: PUT /api/v1/inpatient/medications/{medicationId}/restore

**URL:** `PUT /api/v1/inpatient/medications/2001/restore`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Medication administration restored successfully.",
  "data": {
    "administrationId": 2001,
    "deletedAt": null,
    ...
  }
}
```

---

#### API #42: GET /api/v1/inpatient/medications/deleted

**URL:** `GET /api/v1/inpatient/medications/deleted?page=0&size=20`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Deleted medications retrieved successfully.",
  "data": {
    "content": [
      {
        "administrationId": 1998,
        "medicationName": "Aspirin",
        "deletedAt": "2025-11-15T10:00:00"
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 20
    },
    "totalElements": 1,
    "totalPages": 1
  }
}
```

---

#### API #43: GET /api/v1/inpatient/medications/active

**URL:** `GET /api/v1/inpatient/medications/active?page=0&size=20`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Active medications retrieved successfully.",
  "data": {
    "content": [
      {
        "administrationId": 2001,
        "medicationName": "Paracetamol",
        "administrationStatus": "GIVEN"
      }
    ],
    "totalElements": 50,
    "totalPages": 3
  }
}
```

---

#### API #44: GET /api/v1/inpatient/medications/stats/soft-delete

**URL:** `GET /api/v1/inpatient/medications/stats/soft-delete`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Soft delete statistics retrieved successfully.",
  "data": {
    "active_count": 150,
    "deleted_count": 10,
    "total_count": 160,
    "deletion_rate": 6.25
  }
}
```

---

## 📌 GHI CHÚ VỀ JSON EXAMPLES

### Quy ước chung:

1. **Timestamps**: Sử dụng format ISO 8601: `"2025-11-16T08:00:00"`
2. **BigDecimal**: Số tiền sử dụng 2 chữ số thập phân: `15000.00`
3. **Boolean**: `true` hoặc `false` (lowercase)
4. **Null values**: Sử dụng `null` khi không có giá trị
5. **Status codes**:
   - `200 OK`: Thành công (GET, PUT, POST workflow)
   - `201 Created`: Tạo mới thành công (POST create)
   - `400 Bad Request`: Lỗi validation
   - `401 Unauthorized`: Chưa đăng nhập
   - `403 Forbidden`: Không có quyền
   - `404 Not Found`: Không tìm thấy
   - `500 Internal Server Error`: Lỗi server

### Enum values:

**Order Type:**
- `INPATIENT` - Nội trú
- `OUTPATIENT` - Ngoại trú

**Status:**
- `ORDERED` - Đã kê đơn
- `VERIFIED` - Đã duyệt
- `READY` - Sẵn sàng
- `ADMINISTERED` - Đã thực hiện
- `DISPENSED` - Đã cấp phát
- `HELD` - Tạm dừng
- `DISCONTINUED` - Ngừng
- `REFUSED` - Bệnh nhân từ chối
- `MISSED` - Bỏ lỡ
- `CANCELLED` - Hủy

**Priority:**
- `STAT` - Cấp cứu (khẩn cấp)
- `URGENT` - Khẩn
- `ROUTINE` - Thường quy

**Route:**
- `ORAL` - Uống
- `IV` - Tiêm tĩnh mạch
- `IM` - Tiêm bắp
- `SC` - Tiêm dưới da
- `TOPICAL` - Bôi ngoài da
- `INHALATION` - Hít

**Frequency:**
- `BID` - 2 lần/ngày
- `TID` - 3 lần/ngày
- `QID` - 4 lần/ngày
- `Q4H` - Mỗi 4 giờ
- `Q6H` - Mỗi 6 giờ
- `PRN` - Khi cần
- `STAT` - Ngay lập tức

**Administration Status:**
- `PENDING` - Chờ thực hiện
- `GIVEN` - Đã thực hiện
- `REFUSED` - Bệnh nhân từ chối
- `MISSED` - Bỏ lỡ
- `HELD` - Tạm dừng

---

