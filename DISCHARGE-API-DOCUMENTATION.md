# 📋 Tài Liệu API Xuất Viện (Discharge APIs)

> Tổng hợp tất cả các API liên quan đến quy trình xuất viện bệnh nhân nội trú

---

## 📑 Mục Lục

1. [Tổng Quan Quy Trình Xuất Viện](#1-tổng-quan-quy-trình-xuất-viện)
2. [API Quản Lý Xuất Viện (InpatientController)](#2-api-quản-lý-xuất-viện)
3. [API Kế Hoạch Xuất Viện (Discharge Planning)](#3-api-kế-hoạch-xuất-viện)
4. [API Workflow Xuất Viện](#4-api-workflow-xuất-viện)
5. [API Thanh Toán & Quyết Toán](#5-api-thanh-toán--quyết-toán)
6. [DTOs (Request/Response)](#6-dtos-requestresponse)
7. [Permissions Required](#7-permissions-required)
8. [Luồng Xử Lý Hoàn Chỉnh](#8-luồng-xử-lý-hoàn-chỉnh)
9. [API Xuất Viện Ngoại Trú](#9-api-xuất-viện-ngoại-trú-encounter-discharge)
10. [API Xuất Viện Cấp Cứu](#10-api-xuất-viện-cấp-cứu-emergency-discharge)
11. [API Phẫu Thuật - Xuất Phòng Hồi Tỉnh](#11-api-phẫu-thuật---xuất-phòng-hồi-tỉnh)
12. [API Ngừng Y Lệnh Thuốc](#12-api-ngừng-y-lệnh-thuốc-khi-xuất-viện)
13. [API Tái Khám Sau Xuất Viện](#13-api-tái-khám-sau-xuất-viện-follow-up-appointments)
14. [API Tra Cứu Bệnh Nhân Nội Trú](#14-api-tra-cứu-bệnh-nhân-nội-trú-hỗ-trợ-xuất-viện)
15. [👥 Phân Quyền Theo Role](#15-👥-phân-quyền-theo-role-role-based-access)

---

## 1. Tổng Quan Quy Trình Xuất Viện

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        QUY TRÌNH XUẤT VIỆN                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. Lập kế hoạch xuất viện (Discharge Planning)                            │
│     └── POST /api/v1/inpatient/stays/{stayId}/discharge-planning           │
│                                                                             │
│  2. Phê duyệt kế hoạch xuất viện                                           │
│     └── POST /api/v1/inpatient/discharge-planning/{planId}/approve         │
│                                                                             │
│  3. Bác sĩ ra lệnh xuất viện (Order Discharge)                             │
│     └── POST /api/v1/inpatient/stays/{stayId}/order-discharge              │
│     └── Status: ACTIVE → DISCHARGE_ORDERED                                  │
│                                                                             │
│  4. Kiểm tra thanh toán trước xuất viện                                    │
│     └── GET /api/payments/can-discharge/{encounterId}                       │
│                                                                             │
│  5. Quyết toán tạm ứng (nếu có)                                            │
│     └── POST /api/v1/deposits/settle                                        │
│                                                                             │
│  6. Hoàn tất xuất viện (Discharge Patient)                                 │
│     └── POST /api/v1/inpatient/stays/{stayId}/discharge                    │
│     └── Status: DISCHARGE_ORDERED → DISCHARGED                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. API Quản Lý Xuất Viện

### Base URL: `/api/v1/inpatient`

### 2.1. Ra Lệnh Xuất Viện (Order Discharge)

Bác sĩ ra lệnh xuất viện - chặn các y lệnh mới (trừ thuốc xuất viện).

```http
POST /api/v1/inpatient/stays/{stayId}/order-discharge
```

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| stayId | Integer | ✅ | ID đợt nội trú |
| reason | String | ❌ | Lý do xuất viện |

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "OK",
  "message": "Discharge ordered successfully. New orders are now blocked.",
  "data": {
    "inpatientStayId": 123,
    "encounterId": 456,
    "currentStatus": "DISCHARGE_ORDERED",
    "patientName": "Nguyễn Văn A",
    "bedNumber": "101-A",
    "departmentName": "Nội khoa"
  }
}
```

**Permission:** `inpatient.discharge`

---

### 2.2. Hủy Lệnh Xuất Viện (Cancel Discharge Order)

Hủy lệnh xuất viện - cho phép tiếp tục điều trị.

```http
POST /api/v1/inpatient/stays/{stayId}/cancel-discharge-order
```

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| stayId | Integer | ✅ | ID đợt nội trú |
| reason | String | ❌ | Lý do hủy |

**Response:**
```json
{
  "status": "OK",
  "message": "Discharge order cancelled. New orders can be accepted again.",
  "data": {
    "inpatientStayId": 123,
    "currentStatus": "ACTIVE"
  }
}
```

**Permission:** `inpatient.discharge`

---

### 2.3. Xuất Viện Bệnh Nhân (Discharge Patient)

Hoàn tất xuất viện - giải phóng giường bệnh.

```http
POST /api/v1/inpatient/stays/{stayId}/discharge
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "dischargeDate": "2024-12-04T10:00:00",
  "dischargeDiagnosis": "Viêm phổi - đã hồi phục",
  "dischargeInstructions": "Nghỉ ngơi, uống thuốc đầy đủ",
  "followUpInstructions": "Tái khám sau 1 tuần",
  "followUpDate": "2024-12-11T09:00:00",
  "dischargeCondition": "IMPROVED",
  "dischargeDestination": "HOME",
  "medicationsAtDischarge": "Paracetamol 500mg x 10 viên",
  "dischargeNotes": "Bệnh nhân ổn định",
  "dispositionType": "HOME"
}
```

**Response:**
```json
{
  "status": "OK",
  "message": "Patient discharged successfully.",
  "data": {
    "inpatientStayId": 123,
    "encounterId": 456,
    "currentStatus": "DISCHARGED",
    "dischargeDate": "2024-12-04T10:00:00",
    "lengthOfStay": 5,
    "isDischarged": true
  }
}
```

**Permission:** `inpatient.discharge`

---

### 2.4. Xem Chi Tiết Đợt Nội Trú

```http
GET /api/v1/inpatient/stays/{stayId}
```

**Permission:** `inpatient.view` hoặc `payment.view`

---

### 2.5. Danh Sách Bệnh Nhân Nội Trú Đang Điều Trị

```http
GET /api/v1/inpatient/stays/active
```

**Permission:** `inpatient.view` hoặc `payment.view`

---

## 3. API Kế Hoạch Xuất Viện

### 3.1. Tạo Kế Hoạch Xuất Viện

```http
POST /api/v1/inpatient/stays/{stayId}/discharge-planning
```

**Request Body:**
```json
{
  "expectedDischargeDate": "2024-12-05",
  "dischargeDestination": "HOME",
  "homeCarePlan": "Chăm sóc tại nhà, theo dõi nhiệt độ",
  "followUpInstructions": "Tái khám sau 7 ngày",
  "followUpDate": "2024-12-12",
  "medicationReconciliation": "Tiếp tục thuốc kháng sinh 5 ngày",
  "specialInstructions": "Tránh vận động mạnh",
  "equipmentNeeded": "Không",
  "transportationArrangements": "Gia đình đón",
  "familyEducation": "Đã hướng dẫn cách chăm sóc",
  "dischargeReadinessAssessment": "Bệnh nhân sẵn sàng xuất viện"
}
```

**Response:**
```json
{
  "status": "CREATED",
  "message": "Discharge planning created successfully.",
  "data": {
    "dischargePlanId": 789,
    "inpatientStayId": 123,
    "patientName": "Nguyễn Văn A",
    "expectedDischargeDate": "2024-12-05",
    "dischargeDestination": "HOME",
    "planStatus": "DRAFT",
    "createdByEmployeeName": "BS. Trần Văn B"
  }
}
```

**Permission:** `discharge.planning`

---

### 3.2. Cập Nhật Kế Hoạch Xuất Viện

```http
PUT /api/v1/inpatient/discharge-planning/{planId}
```

**Permission:** `discharge.planning`

---

### 3.3. Phê Duyệt Kế Hoạch Xuất Viện

```http
POST /api/v1/inpatient/discharge-planning/{planId}/approve
```

**Response:**
```json
{
  "status": "OK",
  "message": "Discharge planning approved successfully.",
  "data": {
    "dischargePlanId": 789,
    "planStatus": "APPROVED",
    "approvedByEmployeeName": "BS. Nguyễn Văn C",
    "approvedAt": "2024-12-04T08:30:00"
  }
}
```

**Permission:** `discharge.planning`

---

### 3.4. Xem Kế Hoạch Xuất Viện Theo Đợt Nội Trú

```http
GET /api/v1/inpatient/stays/{stayId}/discharge-planning
```

**Permission:** `discharge.view`

---

### 3.5. Xem Kế Hoạch Xuất Viện Theo ID

```http
GET /api/v1/inpatient/discharge-planning/{planId}
```

**Permission:** `discharge.view`

---

## 4. API Workflow Xuất Viện

### Base URL: `/api/v1/inpatient/workflow`

### 4.1. Lấy Các Bước Xuất Viện

```http
GET /api/v1/inpatient/workflow/discharge-steps
```

**Response:**
```json
{
  "status": "OK",
  "message": "Lấy các bước xuất viện thành công.",
  "data": [
    {
      "id": 1,
      "workflowStep": "DISCHARGE_PLANNING",
      "stepName": "Lập kế hoạch xuất viện",
      "status": "COMPLETED"
    },
    {
      "id": 2,
      "workflowStep": "DISCHARGE_APPROVAL",
      "stepName": "Phê duyệt xuất viện",
      "status": "IN_PROGRESS"
    },
    {
      "id": 3,
      "workflowStep": "BILLING_SETTLEMENT",
      "stepName": "Quyết toán viện phí",
      "status": "PENDING"
    },
    {
      "id": 4,
      "workflowStep": "DISCHARGE_COMPLETE",
      "stepName": "Hoàn tất xuất viện",
      "status": "PENDING"
    }
  ]
}
```

**Permission:** `inpatient.workflow.view`

---

### 4.2. Lấy Workflow Theo Đợt Nội Trú

```http
GET /api/v1/inpatient/workflow/stay/{inpatientStayId}
```

**Permission:** `inpatient.workflow.view`

---

### 4.3. Hoàn Thành Bước Workflow

```http
POST /api/v1/inpatient/workflow/steps/{id}/complete
```

**Permission:** `inpatient.workflow.update`

---

### 4.4. Lấy Tiến Độ Workflow

```http
GET /api/v1/inpatient/workflow/stay/{inpatientStayId}/progress
```

**Permission:** `inpatient.workflow.view`

---

### 4.5. Lấy Tỷ Lệ Hoàn Thành

```http
GET /api/v1/inpatient/workflow/stay/{inpatientStayId}/completion-percentage
```

**Response:**
```json
{
  "status": "OK",
  "message": "Lấy tỷ lệ hoàn thành thành công.",
  "data": 75.0
}
```

**Permission:** `inpatient.workflow.view`

---

## 5. API Thanh Toán & Quyết Toán

### 5.1. Kiểm Tra Có Thể Xuất Viện (Payment Check)

```http
GET /api/payments/can-discharge/{encounterId}
```

**Response (Có thể xuất viện):**
```json
{
  "status": "OK",
  "message": "Discharge check completed",
  "data": {
    "encounter_id": 456,
    "can_discharge": true,
    "has_pending_payments": false,
    "status": "READY",
    "message": "✅ Patient can be discharged. All payments settled.",
    "action_required": "None"
  }
}
```

**Response (Chưa thanh toán):**
```json
{
  "status": "OK",
  "message": "Discharge check completed",
  "data": {
    "encounter_id": 456,
    "can_discharge": false,
    "has_pending_payments": true,
    "status": "BLOCKED",
    "message": "❌ Cannot discharge. Patient has pending payments.",
    "action_required": "Generate invoice and collect payment before discharge."
  }
}
```

**Permission:** `payment.view` hoặc `receptionist.billing`

---

### 5.2. Sử Dụng Tạm Ứng Thanh Toán

```http
POST /api/v1/deposits/use
```

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| patientId | Integer | ✅ | ID bệnh nhân |
| invoiceId | Integer | ✅ | ID hóa đơn |
| amount | BigDecimal | ✅ | Số tiền sử dụng |

**Permission:** `payment.create` hoặc `receptionist.billing`

---

### 5.3. Hoàn Trả Tạm Ứng Thừa

```http
POST /api/v1/deposits/refund
```

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| patientId | Integer | ✅ | ID bệnh nhân |
| refundMethod | String | ✅ | CASH hoặc BANK_TRANSFER |
| reason | String | ✅ | Lý do hoàn trả |

**Permission:** `payment.refund`

---

### 5.4. Quyết Toán Tạm Ứng Khi Xuất Viện

```http
POST /api/v1/deposits/settle
```

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| patientId | Integer | ✅ | ID bệnh nhân |
| invoiceId | Integer | ✅ | ID hóa đơn |
| refundMethod | String | ✅ | CASH hoặc BANK_TRANSFER |

**Response:**
```json
{
  "status": "OK",
  "message": "Quyết toán tạm ứng thành công",
  "data": {
    "initial_balance": 5000000,
    "invoice_amount": 3500000,
    "amount_paid_from_deposit": 3500000,
    "remaining_balance": 1500000,
    "refund_amount": 1500000,
    "status": "COMPLETED"
  }
}
```

**Permission:** `payment.create` hoặc `receptionist.billing`

---

### 5.5. Lấy Giao Dịch Theo Đợt Nội Trú

```http
GET /api/v1/deposits/inpatient-stay/{stayId}/transactions
```

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| transactionType | String | ❌ | ADVANCE_PAYMENT, INVOICE_PAYMENT, REFUND |

**Permission:** `payment.view` hoặc `inpatient.view`

---

## 6. DTOs (Request/Response)

### 6.1. DischargeRequest

```java
{
  "dischargeDate": "LocalDateTime (required)",
  "dischargeDiagnosis": "String",
  "dischargeInstructions": "String",
  "followUpInstructions": "String",
  "followUpDate": "LocalDateTime",
  "dischargeCondition": "IMPROVED | STABLE | TRANSFERRED | DECEASED",
  "dischargeDestination": "HOME | TRANSFER_TO_OTHER_HOSPITAL | NURSING_HOME",
  "medicationsAtDischarge": "String",
  "dischargeNotes": "String",
  "dispositionType": "HOME | EXPIRED | TRANSFER | DAMA | AMA | ABSCONDED | HOSPICE | REHABILITATION"
}
```

### 6.2. DischargePlanningRequest

```java
{
  "expectedDischargeDate": "LocalDate (required)",
  "dischargeDestination": "String (required) - HOME | NURSING_HOME | TRANSFER_TO_OTHER_HOSPITAL | REHABILITATION",
  "homeCarePlan": "String",
  "followUpInstructions": "String",
  "followUpDate": "LocalDate",
  "medicationReconciliation": "String",
  "specialInstructions": "String",
  "equipmentNeeded": "String",
  "transportationArrangements": "String",
  "familyEducation": "String",
  "dischargeReadinessAssessment": "String"
}
```

### 6.3. InpatientStayResponse

```java
{
  "inpatientStayId": "Integer",
  "encounterId": "Integer",
  "hospitalBedId": "Integer",
  "bedNumber": "String",
  "roomNumber": "String",
  "roomType": "String",
  "departmentId": "Integer",
  "departmentName": "String",
  "admissionDate": "LocalDateTime",
  "dischargeDate": "LocalDateTime",
  "admissionDiagnosis": "String",
  "attendingDoctorId": "Integer",
  "attendingDoctorName": "String",
  "admissionType": "EMERGENCY | PLANNED | URGENT",
  "currentStatus": "ACTIVE | DISCHARGE_ORDERED | DISCHARGED | TRANSFERRED",
  "patientId": "Integer",
  "patientCode": "String",
  "patientName": "String",
  "lengthOfStay": "Integer",
  "isActive": "Boolean",
  "isDischarged": "Boolean"
}
```

### 6.4. DischargePlanningResponse

```java
{
  "dischargePlanId": "Integer",
  "inpatientStayId": "Integer",
  "patientId": "Integer",
  "patientName": "String",
  "patientCode": "String",
  "expectedDischargeDate": "LocalDate",
  "dischargeDestination": "String",
  "homeCarePlan": "String",
  "followUpInstructions": "String",
  "followUpDate": "LocalDate",
  "medicationReconciliation": "String",
  "specialInstructions": "String",
  "equipmentNeeded": "String",
  "transportationArrangements": "String",
  "familyEducation": "String",
  "dischargeReadinessAssessment": "String",
  "planStatus": "DRAFT | APPROVED | COMPLETED",
  "createdByEmployeeId": "Integer",
  "createdByEmployeeName": "String",
  "approvedByEmployeeId": "Integer",
  "approvedByEmployeeName": "String",
  "createdAt": "LocalDateTime",
  "updatedAt": "LocalDateTime",
  "approvedAt": "LocalDateTime"
}
```

---

## 7. Permissions Required

| API | Permission |
|-----|------------|
| Order Discharge | `inpatient.discharge` |
| Cancel Discharge Order | `inpatient.discharge` |
| Discharge Patient | `inpatient.discharge` |
| View Inpatient Stay | `inpatient.view` hoặc `payment.view` |
| Create Discharge Planning | `discharge.planning` |
| Update Discharge Planning | `discharge.planning` |
| Approve Discharge Planning | `discharge.planning` |
| View Discharge Planning | `discharge.view` |
| Workflow Operations | `inpatient.workflow.view`, `inpatient.workflow.update` |
| Payment Check | `payment.view` hoặc `receptionist.billing` |
| Use Deposit | `payment.create` hoặc `receptionist.billing` |
| Refund Deposit | `payment.refund` |
| Settle Deposit | `payment.create` hoặc `receptionist.billing` |

---

## 8. Luồng Xử Lý Hoàn Chỉnh

### Sequence Diagram

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  Bác sĩ │     │ Điều dưỡng│    │ Thu ngân │     │  System │     │   Bed   │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │               │
     │ 1. Tạo kế hoạch xuất viện     │               │               │
     │──────────────────────────────>│               │               │
     │               │               │               │               │
     │ 2. Phê duyệt kế hoạch         │               │               │
     │──────────────────────────────>│               │               │
     │               │               │               │               │
     │ 3. Ra lệnh xuất viện          │               │               │
     │──────────────────────────────────────────────>│               │
     │               │               │               │               │
     │               │               │ 4. Kiểm tra thanh toán        │
     │               │               │──────────────>│               │
     │               │               │               │               │
     │               │               │ 5. Quyết toán tạm ứng         │
     │               │               │──────────────>│               │
     │               │               │               │               │
     │ 6. Hoàn tất xuất viện         │               │               │
     │──────────────────────────────────────────────>│               │
     │               │               │               │               │
     │               │               │               │ 7. Giải phóng giường
     │               │               │               │──────────────>│
     │               │               │               │               │
```

### Các Bước Chi Tiết

1. **Bác sĩ tạo kế hoạch xuất viện**
   - `POST /api/v1/inpatient/stays/{stayId}/discharge-planning`
   - Status: `DRAFT`

2. **Bác sĩ/Trưởng khoa phê duyệt**
   - `POST /api/v1/inpatient/discharge-planning/{planId}/approve`
   - Status: `APPROVED`

3. **Bác sĩ ra lệnh xuất viện**
   - `POST /api/v1/inpatient/stays/{stayId}/order-discharge`
   - InpatientStay Status: `ACTIVE` → `DISCHARGE_ORDERED`
   - Chặn các y lệnh mới (trừ thuốc xuất viện)

4. **Thu ngân kiểm tra thanh toán**
   - `GET /api/payments/can-discharge/{encounterId}`
   - Nếu `can_discharge = false` → Yêu cầu thanh toán

5. **Thu ngân quyết toán tạm ứng**
   - `POST /api/v1/deposits/settle`
   - Sử dụng tạm ứng thanh toán hóa đơn
   - Hoàn trả số dư thừa (nếu có)

6. **Bác sĩ hoàn tất xuất viện**
   - `POST /api/v1/inpatient/stays/{stayId}/discharge`
   - InpatientStay Status: `DISCHARGE_ORDERED` → `DISCHARGED`

7. **Hệ thống tự động giải phóng giường**
   - Bed Status: `OCCUPIED` → `AVAILABLE`

---

## 📝 Ghi Chú

- Tất cả API đều yêu cầu JWT token trong header `Authorization: Bearer {token}`
- Các trường `dischargeCondition` và `dispositionType` có thể khác nhau tùy theo quy định bệnh viện
- Nên kiểm tra thanh toán (`can-discharge`) trước khi thực hiện xuất viện
- Workflow steps có thể được tùy chỉnh theo quy trình của từng bệnh viện

---

## 9. API Xuất Viện Ngoại Trú (Encounter Discharge)

### Base URL: `/api/v1/encounters`

### 9.1. Xuất Viện Bệnh Nhân Ngoại Trú

Chuyển trạng thái encounter từ `READY_FOR_DISCHARGE` → `CLOSED`.

```http
POST /api/v1/encounters/{encounterId}/discharge
```

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| encounterId | Integer | ✅ | ID lượt khám |
| disposition | String | ❌ | Loại xuất viện |

**Response:**
```json
{
  "status": "OK",
  "message": "Patient discharged successfully.",
  "data": {
    "encounterId": 456,
    "status": "CLOSED",
    "patientName": "Nguyễn Văn A"
  }
}
```

**Permission:** `encounter.discharge`

---

## 10. API Xuất Viện Cấp Cứu (Emergency Discharge)

### Base URL: `/api/v1/emergency/encounters`

### 10.1. Xuất Viện Cấp Cứu (Đơn Giản)

Xuất viện không kèm đơn thuốc.

```http
PUT /api/v1/emergency/encounters/{id}/discharge
```

**Permission:** `emergency.discharge` hoặc `doctor.emergency`

---

### 10.2. Xuất Viện Cấp Cứu (Có Đơn Thuốc)

Xuất viện kèm đơn thuốc mang về.

```http
POST /api/v1/emergency/encounters/{id}/discharge
```

**Request Body:**
```json
{
  "dischargeDiagnosis": "Viêm dạ dày cấp",
  "diagnosisCode": "K29.0",
  "dischargeSummary": "Bệnh nhân ổn định sau điều trị",
  "dischargeInstructions": "Nghỉ ngơi, uống nhiều nước, tái khám sau 3 ngày",
  "followUpDate": "2024-12-07",
  "followUpNotes": "Tái khám tại phòng khám Nội tổng hợp",
  "warningSigns": "Nếu sốt cao trên 39°C, khó thở, đau ngực - quay lại cấp cứu ngay",
  "createPrescription": true,
  "prescriptionType": "TU_TUC",
  "prescriptionItems": [
    {
      "medicineId": 101,
      "dosage": "1 viên x 3 lần/ngày sau ăn",
      "quantity": 21,
      "notes": "Uống đủ liều"
    }
  ],
  "prescriptionNotes": "Thuốc uống trong 7 ngày"
}
```

**Response:**
```json
{
  "status": "OK",
  "message": "Patient discharged successfully with prescription created",
  "data": {
    "emergencyEncounterId": 789,
    "status": "DISCHARGED",
    "prescriptionId": 456
  }
}
```

**Permission:** `emergency.discharge` hoặc `doctor.emergency`

---

### 10.3. Lấy Danh Sách Xuất Viện Gần Đây

```http
GET /api/v1/emergency/encounters/recent-discharges?hours=24
```

**Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| hours | Integer | 24 | Số giờ gần đây |

**Permission:** `emergency.view`, `nurse.triage`, hoặc `doctor.emergency`

---

### 10.4. Quyết Toán Xuất Viện Cấp Cứu

```http
POST /api/v1/emergency/billing/encounters/{encounterId}/settlements
```

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| encounterId | Integer | ✅ | ID lượt cấp cứu |
| refundMethod | String | ❌ | CASH (default) hoặc BANK_TRANSFER |
| employeeId | Integer | ✅ | ID nhân viên xử lý |

**Response:**
```json
{
  "status": "OK",
  "message": "Settlement completed successfully",
  "data": {
    "emergencyEncounterId": 789,
    "patientId": 123,
    "totalCharges": 2500000,
    "depositUsed": 2000000,
    "refundAmount": 500000,
    "amountDue": 0,
    "settlementStatus": "COMPLETED",
    "settledAt": "2024-12-04T10:30:00"
  }
}
```

---

## 11. API Phẫu Thuật - Xuất Phòng Hồi Tỉnh

### Base URL: `/api/v1/surgeries`

### 11.1. Xuất Bệnh Nhân Khỏi Phòng Hồi Tỉnh

```http
POST /api/v1/surgeries/{surgeryId}/recovery/discharge
```

**Response:**
```json
{
  "status": "OK",
  "message": "Patient discharged from recovery room successfully.",
  "data": {
    "surgeryId": 123,
    "status": "COMPLETED",
    "recoveryEndTime": "2024-12-04T14:30:00"
  }
}
```

**Permission:** `surgery.recovery`

---

## 12. API Ngừng Y Lệnh Thuốc Khi Xuất Viện

### Base URL: `/api/v1/medication-order-groups`

### 12.1. Ngừng Nhóm Y Lệnh Thuốc

Sử dụng khi bệnh nhân xuất viện để ngừng tất cả y lệnh thuốc.

```http
POST /api/v1/medication-order-groups/{groupId}/discontinue
```

**Request Body:**
```json
{
  "reason": "Patient discharged",
  "discontinuedAt": "2024-12-04T10:00:00"
}
```

**Permission:** `medication.order.discontinue`

---

## 📊 Tổng Hợp Tất Cả API Xuất Viện

| # | API | Method | Endpoint | Mô tả |
|---|-----|--------|----------|-------|
| 1 | Tạo kế hoạch xuất viện | POST | `/api/v1/inpatient/stays/{stayId}/discharge-planning` | Lập kế hoạch |
| 2 | Cập nhật kế hoạch | PUT | `/api/v1/inpatient/discharge-planning/{planId}` | Sửa kế hoạch |
| 3 | Phê duyệt kế hoạch | POST | `/api/v1/inpatient/discharge-planning/{planId}/approve` | Duyệt kế hoạch |
| 4 | Xem kế hoạch theo stay | GET | `/api/v1/inpatient/stays/{stayId}/discharge-planning` | Xem chi tiết |
| 5 | Ra lệnh xuất viện | POST | `/api/v1/inpatient/stays/{stayId}/order-discharge` | Bác sĩ ra lệnh |
| 6 | Hủy lệnh xuất viện | POST | `/api/v1/inpatient/stays/{stayId}/cancel-discharge-order` | Hủy lệnh |
| 7 | Xuất viện nội trú | POST | `/api/v1/inpatient/stays/{stayId}/discharge` | Hoàn tất xuất viện |
| 8 | Kiểm tra thanh toán | GET | `/api/payments/can-discharge/{encounterId}` | Check payment |
| 9 | Quyết toán tạm ứng | POST | `/api/v1/deposits/settle` | Quyết toán |
| 10 | Hoàn trả tạm ứng | POST | `/api/v1/deposits/refund` | Hoàn tiền thừa |
| 11 | Xuất viện ngoại trú | POST | `/api/v1/encounters/{encounterId}/discharge` | Encounter → CLOSED |
| 12 | Xuất viện cấp cứu (simple) | PUT | `/api/v1/emergency/encounters/{id}/discharge` | Không đơn thuốc |
| 13 | Xuất viện cấp cứu (full) | POST | `/api/v1/emergency/encounters/{id}/discharge` | Có đơn thuốc |
| 14 | Quyết toán cấp cứu | POST | `/api/v1/emergency/billing/encounters/{id}/settlements` | Quyết toán |
| 15 | DS xuất viện gần đây | GET | `/api/v1/emergency/encounters/recent-discharges` | Danh sách |
| 16 | Xuất phòng hồi tỉnh | POST | `/api/v1/surgeries/{surgeryId}/recovery/discharge` | Sau phẫu thuật |
| 17 | Ngừng y lệnh thuốc | POST | `/api/v1/medication-order-groups/{groupId}/discontinue` | Ngừng thuốc |
| 18 | Workflow xuất viện | GET | `/api/v1/inpatient/workflow/discharge-steps` | Các bước workflow |
| 19 | Tiến độ workflow | GET | `/api/v1/inpatient/workflow/stay/{id}/progress` | Theo dõi tiến độ |

---

## 📝 Ghi Chú Bổ Sung

### Phân Loại Theo Loại Bệnh Nhân

**Nội trú (Inpatient):**
- Sử dụng `/api/v1/inpatient/stays/{stayId}/...`
- Có quy trình đầy đủ: Kế hoạch → Phê duyệt → Ra lệnh → Thanh toán → Xuất viện

**Ngoại trú (Outpatient):**
- Sử dụng `/api/v1/encounters/{encounterId}/discharge`
- Quy trình đơn giản hơn

**Cấp cứu (Emergency):**
- Sử dụng `/api/v1/emergency/encounters/{id}/discharge`
- Có thể kèm đơn thuốc mang về

### Disposition Types (Loại Xuất Viện)

| Code | Mô tả |
|------|-------|
| HOME | Về nhà |
| EXPIRED | Tử vong |
| TRANSFER | Chuyển viện |
| DAMA | Discharge Against Medical Advice (Xin về) |
| AMA | Against Medical Advice |
| ABSCONDED | Trốn viện |
| HOSPICE | Chăm sóc cuối đời |
| REHABILITATION | Phục hồi chức năng |

### Discharge Conditions (Tình Trạng Xuất Viện)

| Code | Mô tả |
|------|-------|
| IMPROVED | Cải thiện |
| STABLE | Ổn định |
| TRANSFERRED | Chuyển viện |
| DECEASED | Tử vong |

---

## 13. API Tái Khám Sau Xuất Viện (Follow-up Appointments)

### Base URL: `/api/v1`

Các API này liên quan đến việc đặt lịch tái khám sau khi xuất viện.

### 13.1. Tạo Lịch Tái Khám

```http
POST /api/v1/encounters/{encounterId}/follow-up
```

**Request Body:**
```json
{
  "followUpDate": "2024-12-11",
  "followUpTime": "09:00",
  "doctorId": 14,
  "departmentId": 5,
  "reason": "Tái khám sau xuất viện",
  "notes": "Kiểm tra tình trạng hồi phục"
}
```

**Response:**
```json
{
  "status": "CREATED",
  "message": "Follow-up appointment created successfully.",
  "data": {
    "appointmentId": 123,
    "encounterId": 456,
    "patientName": "Nguyễn Văn A",
    "followUpDate": "2024-12-11",
    "doctorName": "BS. Trần Văn B"
  }
}
```

**Permission:** `booking.create`

---

### 13.2. Lấy Danh Sách Lịch Tái Khám Theo Encounter

```http
GET /api/v1/encounters/{encounterId}/follow-up
```

**Permission:** `booking.view`

---

### 13.3. Lấy Chi Tiết Lịch Tái Khám

```http
GET /api/v1/follow-up/{appointmentId}
```

**Permission:** `booking.view`

---

### 13.4. Cập Nhật Lịch Tái Khám

```http
PUT /api/v1/follow-up/{appointmentId}
```

**Permission:** `booking.update`

---

### 13.5. Hủy Lịch Tái Khám

```http
DELETE /api/v1/follow-up/{appointmentId}
```

**Permission:** `booking.update`

---

### 13.6. Lấy Danh Sách Tái Khám Theo Bác Sĩ

```http
GET /api/v1/doctors/{doctorId}/follow-up
```

**Permission:** `booking.view`

---

## 📊 Bảng Tổng Hợp Đầy Đủ (Cập Nhật)

| # | API | Method | Endpoint | Mô tả |
|---|-----|--------|----------|-------|
| **KẾ HOẠCH XUẤT VIỆN** |
| 1 | Tạo kế hoạch xuất viện | POST | `/api/v1/inpatient/stays/{stayId}/discharge-planning` | Lập kế hoạch |
| 2 | Cập nhật kế hoạch | PUT | `/api/v1/inpatient/discharge-planning/{planId}` | Sửa kế hoạch |
| 3 | Phê duyệt kế hoạch | POST | `/api/v1/inpatient/discharge-planning/{planId}/approve` | Duyệt kế hoạch |
| 4 | Xem kế hoạch theo stay | GET | `/api/v1/inpatient/stays/{stayId}/discharge-planning` | Xem chi tiết |
| 5 | Xem kế hoạch theo ID | GET | `/api/v1/inpatient/discharge-planning/{planId}` | Xem chi tiết |
| **XUẤT VIỆN NỘI TRÚ** |
| 6 | Ra lệnh xuất viện | POST | `/api/v1/inpatient/stays/{stayId}/order-discharge` | Bác sĩ ra lệnh |
| 7 | Hủy lệnh xuất viện | POST | `/api/v1/inpatient/stays/{stayId}/cancel-discharge-order` | Hủy lệnh |
| 8 | Xuất viện nội trú | POST | `/api/v1/inpatient/stays/{stayId}/discharge` | Hoàn tất xuất viện |
| 9 | Xem chi tiết đợt nội trú | GET | `/api/v1/inpatient/stays/{stayId}` | Xem thông tin |
| 10 | DS bệnh nhân đang điều trị | GET | `/api/v1/inpatient/stays/active` | Danh sách active |
| **THANH TOÁN & QUYẾT TOÁN** |
| 11 | Kiểm tra thanh toán | GET | `/api/payments/can-discharge/{encounterId}` | Check payment |
| 12 | Sử dụng tạm ứng | POST | `/api/v1/deposits/use` | Thanh toán từ deposit |
| 13 | Quyết toán tạm ứng | POST | `/api/v1/deposits/settle` | Quyết toán |
| 14 | Hoàn trả tạm ứng | POST | `/api/v1/deposits/refund` | Hoàn tiền thừa |
| 15 | Giao dịch theo đợt nội trú | GET | `/api/v1/deposits/inpatient-stay/{stayId}/transactions` | Lịch sử GD |
| **XUẤT VIỆN NGOẠI TRÚ** |
| 16 | Xuất viện ngoại trú | POST | `/api/v1/encounters/{encounterId}/discharge` | Encounter → CLOSED |
| **XUẤT VIỆN CẤP CỨU** |
| 17 | Xuất viện cấp cứu (simple) | PUT | `/api/v1/emergency/encounters/{id}/discharge` | Không đơn thuốc |
| 18 | Xuất viện cấp cứu (full) | POST | `/api/v1/emergency/encounters/{id}/discharge` | Có đơn thuốc |
| 19 | Quyết toán cấp cứu | POST | `/api/v1/emergency/billing/encounters/{id}/settlements` | Quyết toán |
| 20 | DS xuất viện gần đây | GET | `/api/v1/emergency/encounters/recent-discharges` | Danh sách |
| **PHẪU THUẬT** |
| 21 | Xuất phòng hồi tỉnh | POST | `/api/v1/surgeries/{surgeryId}/recovery/discharge` | Sau phẫu thuật |
| **Y LỆNH THUỐC** |
| 22 | Ngừng y lệnh thuốc | POST | `/api/v1/medication-order-groups/{groupId}/discontinue` | Ngừng thuốc |
| **WORKFLOW** |
| 23 | Các bước xuất viện | GET | `/api/v1/inpatient/workflow/discharge-steps` | Workflow steps |
| 24 | Tiến độ workflow | GET | `/api/v1/inpatient/workflow/stay/{id}/progress` | Theo dõi |
| 25 | Tỷ lệ hoàn thành | GET | `/api/v1/inpatient/workflow/stay/{id}/completion-percentage` | % hoàn thành |
| 26 | Hoàn thành bước | POST | `/api/v1/inpatient/workflow/steps/{id}/complete` | Complete step |
| **TÁI KHÁM** |
| 27 | Tạo lịch tái khám | POST | `/api/v1/encounters/{encounterId}/follow-up` | Đặt lịch |
| 28 | DS tái khám theo encounter | GET | `/api/v1/encounters/{encounterId}/follow-up` | Danh sách |
| 29 | Chi tiết lịch tái khám | GET | `/api/v1/follow-up/{appointmentId}` | Xem chi tiết |
| 30 | Cập nhật lịch tái khám | PUT | `/api/v1/follow-up/{appointmentId}` | Sửa lịch |
| 31 | Hủy lịch tái khám | DELETE | `/api/v1/follow-up/{appointmentId}` | Hủy lịch |
| 32 | DS tái khám theo bác sĩ | GET | `/api/v1/doctors/{doctorId}/follow-up` | Theo bác sĩ |

---

## 🔐 Tổng Hợp Permissions

| Permission | Mô tả | APIs |
|------------|-------|------|
| `inpatient.discharge` | Xuất viện nội trú | Order/Cancel/Discharge |
| `inpatient.view` | Xem thông tin nội trú | Get stays |
| `discharge.planning` | Quản lý kế hoạch xuất viện | Create/Update/Approve plan |
| `discharge.view` | Xem kế hoạch xuất viện | Get plans |
| `inpatient.workflow.view` | Xem workflow | Get workflow steps |
| `inpatient.workflow.update` | Cập nhật workflow | Complete/Skip steps |
| `payment.view` | Xem thanh toán | Can-discharge check |
| `payment.create` | Tạo thanh toán | Use/Settle deposit |
| `payment.refund` | Hoàn tiền | Refund deposit |
| `receptionist.billing` | Thu ngân | Payment operations |
| `encounter.discharge` | Xuất viện ngoại trú | Discharge encounter |
| `emergency.discharge` | Xuất viện cấp cứu | Emergency discharge |
| `doctor.emergency` | Bác sĩ cấp cứu | Emergency operations |
| `surgery.recovery` | Phòng hồi tỉnh | Recovery discharge |
| `medication.order.discontinue` | Ngừng y lệnh | Discontinue orders |
| `booking.create` | Tạo lịch hẹn | Create follow-up |
| `booking.view` | Xem lịch hẹn | Get follow-ups |
| `booking.update` | Cập nhật lịch hẹn | Update/Cancel follow-up |

---

## 14. API Tra Cứu Bệnh Nhân Nội Trú (Hỗ Trợ Xuất Viện)

### Base URL: `/api/v1/inpatient`

Các API này hỗ trợ tra cứu thông tin bệnh nhân nội trú phục vụ quy trình xuất viện.

### 14.1. Lấy Danh Sách Bệnh Nhân Theo Khoa

```http
GET /api/v1/inpatient/departments/{departmentId}/stays
```

**Response:**
```json
{
  "status": "OK",
  "message": "Department inpatient stays retrieved successfully.",
  "data": [
    {
      "inpatientStayId": 123,
      "patientName": "Nguyễn Văn A",
      "bedNumber": "101-A",
      "currentStatus": "ACTIVE",
      "admissionDate": "2024-12-01T08:00:00"
    }
  ]
}
```

**Permission:** `inpatient.view`

---

### 14.2. Lấy Danh Sách Bệnh Nhân Theo Bác Sĩ

```http
GET /api/v1/inpatient/doctors/{doctorId}/stays
```

**Permission:** `inpatient.view`

---

### 14.3. Lấy Lịch Sử Nội Trú Của Bệnh Nhân

```http
GET /api/v1/inpatient/patients/{patientId}/history
```

**Permission:** `inpatient.view` hoặc `payment.view`

---

### 14.4. Khôi Phục Đợt Nội Trú Đã Xóa

```http
PUT /api/v1/inpatient/stays/{stayId}/restore
```

**Permission:** `inpatient.manage`

---

### 14.5. Lấy Danh Sách Đợt Nội Trú Đã Xóa

```http
GET /api/v1/inpatient/stays/deleted?page=0&size=10
```

**Permission:** `inpatient.view`

---

### 14.6. Thống Kê Soft Delete

```http
GET /api/v1/inpatient/stays/stats/soft-delete
```

**Response:**
```json
{
  "status": "OK",
  "message": "Statistics retrieved successfully.",
  "data": {
    "active": 45,
    "deleted": 12,
    "total": 57
  }
}
```

**Permission:** `inpatient.view`

---

## 📊 Bảng Tổng Hợp Đầy Đủ FINAL (38 APIs)

| # | API | Method | Endpoint | Mô tả |
|---|-----|--------|----------|-------|
| **KẾ HOẠCH XUẤT VIỆN** |||||
| 1 | Tạo kế hoạch xuất viện | POST | `/api/v1/inpatient/stays/{stayId}/discharge-planning` | Lập kế hoạch |
| 2 | Cập nhật kế hoạch | PUT | `/api/v1/inpatient/discharge-planning/{planId}` | Sửa kế hoạch |
| 3 | Phê duyệt kế hoạch | POST | `/api/v1/inpatient/discharge-planning/{planId}/approve` | Duyệt kế hoạch |
| 4 | Xem kế hoạch theo stay | GET | `/api/v1/inpatient/stays/{stayId}/discharge-planning` | Xem chi tiết |
| 5 | Xem kế hoạch theo ID | GET | `/api/v1/inpatient/discharge-planning/{planId}` | Xem chi tiết |
| **XUẤT VIỆN NỘI TRÚ** |||||
| 6 | Ra lệnh xuất viện | POST | `/api/v1/inpatient/stays/{stayId}/order-discharge` | Bác sĩ ra lệnh |
| 7 | Hủy lệnh xuất viện | POST | `/api/v1/inpatient/stays/{stayId}/cancel-discharge-order` | Hủy lệnh |
| 8 | Xuất viện nội trú | POST | `/api/v1/inpatient/stays/{stayId}/discharge` | Hoàn tất xuất viện |
| 9 | Xem chi tiết đợt nội trú | GET | `/api/v1/inpatient/stays/{stayId}` | Xem thông tin |
| 10 | DS bệnh nhân đang điều trị | GET | `/api/v1/inpatient/stays/active` | Danh sách active |
| 11 | DS bệnh nhân theo khoa | GET | `/api/v1/inpatient/departments/{departmentId}/stays` | Theo khoa |
| 12 | DS bệnh nhân theo bác sĩ | GET | `/api/v1/inpatient/doctors/{doctorId}/stays` | Theo bác sĩ |
| 13 | Lịch sử nội trú bệnh nhân | GET | `/api/v1/inpatient/patients/{patientId}/history` | Lịch sử |
| 14 | Khôi phục đợt nội trú | PUT | `/api/v1/inpatient/stays/{stayId}/restore` | Restore |
| 15 | DS đợt nội trú đã xóa | GET | `/api/v1/inpatient/stays/deleted` | Deleted list |
| 16 | Thống kê soft delete | GET | `/api/v1/inpatient/stays/stats/soft-delete` | Statistics |
| **THANH TOÁN & QUYẾT TOÁN** |||||
| 17 | Kiểm tra thanh toán | GET | `/api/payments/can-discharge/{encounterId}` | Check payment |
| 18 | Sử dụng tạm ứng | POST | `/api/v1/deposits/use` | Thanh toán từ deposit |
| 19 | Quyết toán tạm ứng | POST | `/api/v1/deposits/settle` | Quyết toán |
| 20 | Hoàn trả tạm ứng | POST | `/api/v1/deposits/refund` | Hoàn tiền thừa |
| 21 | Giao dịch theo đợt nội trú | GET | `/api/v1/deposits/inpatient-stay/{stayId}/transactions` | Lịch sử GD |
| **XUẤT VIỆN NGOẠI TRÚ** |||||
| 22 | Xuất viện ngoại trú | POST | `/api/v1/encounters/{encounterId}/discharge` | Encounter → CLOSED |
| **XUẤT VIỆN CẤP CỨU** |||||
| 23 | Xuất viện cấp cứu (simple) | PUT | `/api/v1/emergency/encounters/{id}/discharge` | Không đơn thuốc |
| 24 | Xuất viện cấp cứu (full) | POST | `/api/v1/emergency/encounters/{id}/discharge` | Có đơn thuốc |
| 25 | Quyết toán cấp cứu | POST | `/api/v1/emergency/billing/encounters/{id}/settlements` | Quyết toán |
| 26 | DS xuất viện gần đây | GET | `/api/v1/emergency/encounters/recent-discharges` | Danh sách |
| **PHẪU THUẬT** |||||
| 27 | Xuất phòng hồi tỉnh | POST | `/api/v1/surgeries/{surgeryId}/recovery/discharge` | Sau phẫu thuật |
| **Y LỆNH THUỐC** |||||
| 28 | Ngừng y lệnh thuốc | POST | `/api/v1/medication-order-groups/{groupId}/discontinue` | Ngừng thuốc |
| **WORKFLOW** |||||
| 29 | Các bước xuất viện | GET | `/api/v1/inpatient/workflow/discharge-steps` | Workflow steps |
| 30 | Tiến độ workflow | GET | `/api/v1/inpatient/workflow/stay/{id}/progress` | Theo dõi |
| 31 | Tỷ lệ hoàn thành | GET | `/api/v1/inpatient/workflow/stay/{id}/completion-percentage` | % hoàn thành |
| 32 | Hoàn thành bước | POST | `/api/v1/inpatient/workflow/steps/{id}/complete` | Complete step |
| **TÁI KHÁM** |||||
| 33 | Tạo lịch tái khám | POST | `/api/v1/encounters/{encounterId}/follow-up` | Đặt lịch |
| 34 | DS tái khám theo encounter | GET | `/api/v1/encounters/{encounterId}/follow-up` | Danh sách |
| 35 | Chi tiết lịch tái khám | GET | `/api/v1/follow-up/{appointmentId}` | Xem chi tiết |
| 36 | Cập nhật lịch tái khám | PUT | `/api/v1/follow-up/{appointmentId}` | Sửa lịch |
| 37 | Hủy lịch tái khám | DELETE | `/api/v1/follow-up/{appointmentId}` | Hủy lịch |
| 38 | DS tái khám theo bác sĩ | GET | `/api/v1/doctors/{doctorId}/follow-up` | Theo bác sĩ |

---

## 🔐 Tổng Hợp Permissions (Cập Nhật)

| Permission | Mô tả | APIs |
|------------|-------|------|
| `inpatient.discharge` | Xuất viện nội trú | Order/Cancel/Discharge |
| `inpatient.view` | Xem thông tin nội trú | Get stays, history |
| `inpatient.manage` | Quản lý nội trú | Restore deleted |
| `discharge.planning` | Quản lý kế hoạch xuất viện | Create/Update/Approve plan |
| `discharge.view` | Xem kế hoạch xuất viện | Get plans |
| `inpatient.workflow.view` | Xem workflow | Get workflow steps |
| `inpatient.workflow.update` | Cập nhật workflow | Complete/Skip steps |
| `payment.view` | Xem thanh toán | Can-discharge check |
| `payment.create` | Tạo thanh toán | Use/Settle deposit |
| `payment.refund` | Hoàn tiền | Refund deposit |
| `receptionist.billing` | Thu ngân | Payment operations |
| `encounter.discharge` | Xuất viện ngoại trú | Discharge encounter |
| `emergency.discharge` | Xuất viện cấp cứu | Emergency discharge |
| `doctor.emergency` | Bác sĩ cấp cứu | Emergency operations |
| `surgery.recovery` | Phòng hồi tỉnh | Recovery discharge |
| `medication.order.discontinue` | Ngừng y lệnh | Discontinue orders |
| `booking.create` | Tạo lịch hẹn | Create follow-up |
| `booking.view` | Xem lịch hẹn | Get follow-ups |
| `booking.update` | Cập nhật lịch hẹn | Update/Cancel follow-up |

---

## 15. 👥 Phân Quyền Theo Role (Role-Based Access)

### 15.1. Các Role Trong Hệ Thống

| Role | Mô tả | Phạm vi công việc |
|------|-------|-------------------|
| `DOCTOR` | Bác sĩ | Khám bệnh, kê đơn, ra y lệnh, xuất viện |
| `NURSE` | Điều dưỡng | Chăm sóc bệnh nhân, thực hiện y lệnh, theo dõi |
| `PHARMACIST` | Dược sĩ | Quản lý thuốc, cấp phát, kiểm tra tương tác |
| `CASHIER` | Thu ngân | Thanh toán, quyết toán, hoàn tiền |
| `RECEPTIONIST` | Lễ tân | Tiếp nhận, đăng ký, đặt lịch |
| `ADMIN` | Quản trị viên | Toàn quyền hệ thống |
| `HR_MANAGER` | Quản lý nhân sự | Quản lý nhân viên, phân quyền |
| `LAB_TECH` | Kỹ thuật viên xét nghiệm | Xét nghiệm, trả kết quả |

---

### 15.2. Ma Trận Phân Quyền API Xuất Viện Theo Role

| # | API | DOCTOR | NURSE | PHARMACIST | CASHIER | RECEPTIONIST | ADMIN |
|---|-----|:------:|:-----:|:----------:|:-------:|:------------:|:-----:|
| **KẾ HOẠCH XUẤT VIỆN** |||||||
| 1 | Tạo kế hoạch xuất viện | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| 2 | Cập nhật kế hoạch | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| 3 | Phê duyệt kế hoạch | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| 4-5 | Xem kế hoạch xuất viện | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **XUẤT VIỆN NỘI TRÚ** |||||||
| 6 | Ra lệnh xuất viện | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| 7 | Hủy lệnh xuất viện | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| 8 | Xuất viện nội trú | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| 9-16 | Xem thông tin nội trú | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| **THANH TOÁN & QUYẾT TOÁN** |||||||
| 17 | Kiểm tra thanh toán | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| 18 | Sử dụng tạm ứng | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| 19 | Quyết toán tạm ứng | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| 20 | Hoàn trả tạm ứng | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| 21 | Xem giao dịch | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ |
| **XUẤT VIỆN NGOẠI TRÚ** |||||||
| 22 | Xuất viện ngoại trú | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **XUẤT VIỆN CẤP CỨU** |||||||
| 23-24 | Xuất viện cấp cứu | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| 25 | Quyết toán cấp cứu | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| 26 | DS xuất viện gần đây | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **PHẪU THUẬT** |||||||
| 27 | Xuất phòng hồi tỉnh | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Y LỆNH THUỐC** |||||||
| 28 | Ngừng y lệnh thuốc | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **WORKFLOW** |||||||
| 29-31 | Xem workflow | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| 32 | Hoàn thành bước | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **TÁI KHÁM** |||||||
| 33 | Tạo lịch tái khám | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| 34-38 | Xem/Sửa/Hủy tái khám | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |

---

### 15.3. Chi Tiết Permission Theo Role

#### 🩺 DOCTOR (Bác sĩ)

| Permission | Mô tả |
|------------|-------|
| `inpatient.discharge` | Ra lệnh, hủy lệnh, hoàn tất xuất viện |
| `inpatient.view` | Xem thông tin bệnh nhân nội trú |
| `discharge.planning` | Tạo, sửa, phê duyệt kế hoạch xuất viện |
| `discharge.view` | Xem kế hoạch xuất viện |
| `inpatient.workflow.view` | Xem các bước workflow |
| `inpatient.workflow.update` | Hoàn thành các bước workflow |
| `emergency.discharge` | Xuất viện cấp cứu |
| `doctor.emergency` | Thao tác cấp cứu |
| `encounter.discharge` | Xuất viện ngoại trú |
| `surgery.recovery` | Xuất phòng hồi tỉnh |
| `medication.order.discontinue` | Ngừng y lệnh thuốc |
| `payment.view` | Kiểm tra thanh toán |
| `booking.create` | Tạo lịch tái khám |
| `booking.view` | Xem lịch tái khám |
| `booking.update` | Cập nhật lịch tái khám |

---

#### 👩‍⚕️ NURSE (Điều dưỡng)

| Permission | Mô tả |
|------------|-------|
| `inpatient.view` | Xem thông tin bệnh nhân nội trú |
| `discharge.view` | Xem kế hoạch xuất viện |
| `inpatient.workflow.view` | Xem các bước workflow |
| `inpatient.workflow.update` | Hoàn thành các bước workflow (chăm sóc) |
| `emergency.view` | Xem thông tin cấp cứu |
| `nurse.triage` | Phân loại bệnh nhân cấp cứu |
| `surgery.recovery` | Theo dõi phòng hồi tỉnh |

---

#### 💊 PHARMACIST (Dược sĩ)

| Permission | Mô tả |
|------------|-------|
| `medication.order.discontinue` | Ngừng y lệnh thuốc khi xuất viện |
| `medication.order.verify` | Xác nhận y lệnh thuốc |
| `medication.order.prepare` | Chuẩn bị thuốc |
| `medication.order.dispense` | Cấp phát thuốc |

---

#### 💰 CASHIER (Thu ngân)

| Permission | Mô tả |
|------------|-------|
| `payment.view` | Kiểm tra thanh toán, xem giao dịch |
| `payment.create` | Sử dụng tạm ứng, quyết toán |
| `payment.refund` | Hoàn trả tạm ứng thừa |
| `inpatient.view` | Xem thông tin nội trú (để quyết toán) |

---

#### 🏥 RECEPTIONIST (Lễ tân)

| Permission | Mô tả |
|------------|-------|
| `receptionist.billing` | Thanh toán, quyết toán |
| `payment.view` | Kiểm tra thanh toán |
| `payment.create` | Sử dụng tạm ứng |
| `booking.create` | Tạo lịch tái khám |
| `booking.view` | Xem lịch tái khám |
| `booking.update` | Cập nhật lịch tái khám |
| `receptionist.emergency` | Tiếp nhận cấp cứu |

---

#### 🔧 ADMIN (Quản trị viên)

| Permission | Mô tả |
|------------|-------|
| `*` | Toàn quyền truy cập tất cả API |
| `inpatient.manage` | Khôi phục dữ liệu đã xóa |

---

### 15.4. Luồng Xuất Viện Theo Role

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LUỒNG XUẤT VIỆN THEO ROLE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. 🩺 DOCTOR: Tạo kế hoạch xuất viện                                      │
│     └── POST /api/v1/inpatient/stays/{stayId}/discharge-planning           │
│                                                                             │
│  2. 🩺 DOCTOR (Trưởng khoa): Phê duyệt kế hoạch                            │
│     └── POST /api/v1/inpatient/discharge-planning/{planId}/approve         │
│                                                                             │
│  3. 🩺 DOCTOR: Ra lệnh xuất viện                                           │
│     └── POST /api/v1/inpatient/stays/{stayId}/order-discharge              │
│                                                                             │
│  4. 💊 PHARMACIST: Ngừng y lệnh thuốc (nếu cần)                            │
│     └── POST /api/v1/medication-order-groups/{groupId}/discontinue         │
│                                                                             │
│  5. 💰 CASHIER/RECEPTIONIST: Kiểm tra thanh toán                           │
│     └── GET /api/payments/can-discharge/{encounterId}                       │
│                                                                             │
│  6. 💰 CASHIER/RECEPTIONIST: Quyết toán tạm ứng                            │
│     └── POST /api/v1/deposits/settle                                        │
│                                                                             │
│  7. 🩺 DOCTOR: Hoàn tất xuất viện                                          │
│     └── POST /api/v1/inpatient/stays/{stayId}/discharge                    │
│                                                                             │
│  8. 🩺 DOCTOR/🏥 RECEPTIONIST: Đặt lịch tái khám                           │
│     └── POST /api/v1/encounters/{encounterId}/follow-up                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 15.5. Ghi Chú Về Phân Quyền

1. **ADMIN** có toàn quyền truy cập tất cả API trong hệ thống
2. **DOCTOR** là role chính thực hiện các thao tác xuất viện y tế
3. **CASHIER** và **RECEPTIONIST** có quyền tương tự về thanh toán, nhưng chỉ CASHIER có quyền hoàn tiền
4. **NURSE** chủ yếu có quyền xem và thực hiện các bước workflow liên quan đến chăm sóc
5. **PHARMACIST** chỉ can thiệp vào phần y lệnh thuốc
6. Một số API có thể được truy cập bởi nhiều role với các permission khác nhau (OR condition)

---

*Tài liệu được tạo tự động từ source code - Cập nhật: 04/12/2024*
*Tổng cộng: 38 APIs liên quan đến xuất viện*
