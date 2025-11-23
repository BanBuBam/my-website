# 📋 LUỒNG THUỐC NỘI TRÚ - CHI TIẾT API

> **Tài liệu chi tiết về luồng thuốc nội trú từ khi bác sĩ tạo đơn đến khi thanh toán**
> 
> **Ngày tạo**: 2025-11-20  
> **Hệ thống**: Hospital Management System (HIS)

---

## 📊 TỔNG QUAN LUỒNG

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LUỒNG THUỐC NỘI TRÚ                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. BÁC SĨ TẠO ĐơN THUỐC (MedicationOrderGroup)                            │
│     └─> POST /api/v1/medication-order-groups                               │
│         Status: DRAFT                                                       │
│                                                                             │
│  2. BÁC SĨ XÁC NHẬN ĐƠN                                                    │
│     └─> POST /api/v1/medication-order-groups/{groupId}/confirm             │
│         Status: DRAFT → ORDERED                                             │
│                                                                             │
│  3. DƯỢC SĨ DUYỆT ĐƠN                                                      │
│     └─> POST /api/v1/medication-order-groups/{groupId}/verify              │
│         Status: ORDERED → VERIFIED                                          │
│                                                                             │
│  4. DƯỢC SĨ CHUẨN BỊ THUỐC                                                 │
│     └─> POST /api/v1/medication-order-groups/{groupId}/prepare             │
│         Status: VERIFIED → PREPARED                                         │
│                                                                             │
│  5. DƯỢC SĨ XUẤT KHO & BÀN GIAO CHO Y TÁ                                   │
│     └─> POST /api/v1/medication-order-groups/{groupId}/dispense            │
│         Status: PREPARED → DISPENSED                                        │
│         ✅ Tạo phiếu xuất kho (GoodsIssue)                                 │
│         ✅ Trừ tồn kho (InventoryStock - FEFO)                             │
│                                                                             │
│  6. Y TÁ CẤP PHÁT THUỐC CHO BỆNH NHÂN                                      │
│     └─> POST /api/v1/inpatient/medications/{administrationId}/administer   │
│         Status: PENDING → GIVEN                                             │
│                                                                             │
│  7. TẠO HÓA ĐƠN & THANH TOÁN                                               │
│     └─> POST /api/v1/invoices (Tạo hóa đơn)                                │
│     └─> POST /api/v1/payments (Thanh toán)                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 THÔNG TIN XÁC THỰC

### Test Accounts
```
Bác sĩ:     username: doctor3,      password: Password123!
Dược sĩ:    username: pharmacist1,  password: Password123!
Y tá:       username: nurse1,       password: Password123!
Thu ngân:   username: cashier1,     password: Password123!
```

### Lấy Token
```bash
# Login để lấy token
curl -X POST "http://100.96.182.10:8081/api/v1/auth/employee/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "doctor3",
    "password": "Password123!"
  }'
```

**Response:**
```json
{
  "status": "OK",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "employeeId": 3,
    "fullName": "Dr. Nguyễn Văn A",
    "role": "DOCTOR"
  }
}
```

---

## 📝 CHI TIẾT CÁC BƯỚC

### **BƯỚC 1: BÁC SĨ TẠO ĐƠN THUỐC**

#### API Endpoint
```
POST /api/v1/medication-order-groups
```

#### Headers
```
Authorization: Bearer {DOCTOR_TOKEN}
Content-Type: application/json
```

#### Request Body
```json
{
  "encounterId": 1,
  "inpatientStayId": 2,
  "patientId": 1,
  "priority": "ROUTINE",
  "isStat": false,
  "orderNotes": "Điều trị viêm phổi, theo dõi sát",
  "medications": [
    {
      "medicineId": 15,
      "dosage": "500mg",
      "route": "ORAL",
      "frequency": "TID",
      "durationDays": 7,
      "quantityOrdered": 21,
      "specialInstructions": "Uống sau ăn 30 phút",
      "isPrn": false,
      "isStat": false
    },
    {
      "medicineId": 28,
      "dosage": "10mg",
      "route": "IV",
      "frequency": "BID",
      "durationDays": 5,
      "quantityOrdered": 10,
      "specialInstructions": "Truyền chậm trong 30 phút",
      "isPrn": false,
      "isStat": false
    }
  ]
}
```

#### Response (201 Created)
```json
{
  "status": "CREATED",
  "message": "Medication order group created successfully.",
  "data": {
    "medicationOrderGroupId": 10,
    "encounterId": 1,
    "inpatientStayId": 2,
    "patientId": 1,
    "patientName": "Nguyễn Văn B",
    "orderDate": "2025-11-20T08:30:00",
    "status": "DRAFT",
    "priority": "ROUTINE",
    "isStat": false,
    "orderedByDoctorId": 3,
    "orderedByDoctorName": "Dr. Nguyễn Văn A",
    "orderedAt": null,
    "orderNotes": "Điều trị viêm phổi, theo dõi sát",
    "medications": [
      {
        "medicationOrderId": 101,
        "medicineId": 15,
        "medicineName": "Amoxicillin 500mg",
        "dosage": "500mg",
        "route": "ORAL",
        "frequency": "TID",
        "durationDays": 7,
        "quantityOrdered": 21,
        "status": "DRAFT",
        "unitPrice": 5000.00,
        "totalPrice": 105000.00
      },
      {
        "medicationOrderId": 102,
        "medicineId": 28,
        "medicineName": "Dexamethasone 10mg/ml",
        "dosage": "10mg",
        "route": "IV",
        "frequency": "BID",
        "durationDays": 5,
        "quantityOrdered": 10,
        "status": "DRAFT",
        "unitPrice": 15000.00,
        "totalPrice": 150000.00
      }
    ],
    "medicationCount": 2,
    "createdAt": "2025-11-20T08:30:00"
  }
}
```

#### Permissions Required
- `medication.order.create`

---

### **BƯỚC 2: BÁC SĨ XÁC NHẬN ĐƠN**

#### API Endpoint
```
POST /api/v1/medication-order-groups/{groupId}/confirm
```

#### Headers
```
Authorization: Bearer {DOCTOR_TOKEN}
Content-Type: application/json
```

#### Request
```bash
curl -X POST "http://100.96.182.10:8081/api/v1/medication-order-groups/10/confirm" \
  -H "Authorization: Bearer {DOCTOR_TOKEN}"
```

#### Response (200 OK)
```json
{
  "status": "OK",
  "message": "Medication order group confirmed successfully.",
  "data": {
    "medicationOrderGroupId": 10,
    "status": "ORDERED",
    "orderedByDoctorId": 3,
    "orderedByDoctorName": "Dr. Nguyễn Văn A",
    "orderedAt": "2025-11-20T08:35:00",
    "medications": [
      {
        "medicationOrderId": 101,
        "status": "ORDERED"
      },
      {
        "medicationOrderId": 102,
        "status": "ORDERED"
      }
    ]
  }
}
```

#### Permissions Required
- `medication.order.create`

---

### **BƯỚC 3: DƯỢC SĨ DUYỆT ĐƠN**

#### API Endpoint
```
POST /api/v1/medication-order-groups/{groupId}/verify
```

#### Headers
```
Authorization: Bearer {PHARMACIST_TOKEN}
Content-Type: application/json
```

#### Request
```bash
curl -X POST "http://100.96.182.10:8081/api/v1/medication-order-groups/10/verify?notes=Đã%20kiểm%20tra%20tương%20tác%20thuốc" \
  -H "Authorization: Bearer {PHARMACIST_TOKEN}"
```

#### Response (200 OK)
```json
{
  "status": "OK",
  "message": "Medication order group verified successfully.",
  "data": {
    "medicationOrderGroupId": 10,
    "status": "VERIFIED",
    "verifiedByPharmacistId": 128,
    "verifiedByPharmacistName": "Dược sĩ Trần Thị C",
    "verifiedAt": "2025-11-20T09:00:00",
    "verificationNotes": "Đã kiểm tra tương tác thuốc",
    "medications": [
      {
        "medicationOrderId": 101,
        "status": "VERIFIED"
      },
      {
        "medicationOrderId": 102,
        "status": "VERIFIED"
      }
    ]
  }
}
```

#### Permissions Required
- `medication.order.verify`

---

### **BƯỚC 4: DƯỢC SĨ CHUẨN BỊ THUỐC**

#### API Endpoint
```
POST /api/v1/medication-order-groups/{groupId}/prepare
```

#### Headers
```
Authorization: Bearer {PHARMACIST_TOKEN}
Content-Type: application/json
```

#### Request
```bash
curl -X POST "http://100.96.182.10:8081/api/v1/medication-order-groups/10/prepare?notes=Đã%20chuẩn%20bị%20đủ%20liều%20lượng" \
  -H "Authorization: Bearer {PHARMACIST_TOKEN}"
```

#### Response (200 OK)
```json
{
  "status": "OK",
  "message": "Medication order group prepared successfully.",
  "data": {
    "medicationOrderGroupId": 10,
    "status": "PREPARED",
    "preparedByPharmacistId": 128,
    "preparedByPharmacistName": "Dược sĩ Trần Thị C",
    "preparedAt": "2025-11-20T09:15:00",
    "preparationNotes": "Đã chuẩn bị đủ liều lượng"
  }
}
```

#### Permissions Required
- `medication.order.prepare`

---

### **BƯỚC 5: DƯỢC SĨ XUẤT KHO & BÀN GIAO CHO Y TÁ**

#### API Endpoint
```
POST /api/v1/medication-order-groups/{groupId}/dispense
```

#### Headers
```
Authorization: Bearer {PHARMACIST_TOKEN}
Content-Type: application/json
```

#### Request
```bash
curl -X POST "http://100.96.182.10:8081/api/v1/medication-order-groups/10/dispense?nurseId=3&notes=Bàn%20giao%20cho%20y%20tá%20ca%20sáng" \
  -H "Authorization: Bearer {PHARMACIST_TOKEN}"
```

#### Response (200 OK)
```json
{
  "status": "OK",
  "message": "Medication order group dispensed successfully. Inventory deducted.",
  "data": {
    "medicationOrderGroupId": 10,
    "status": "DISPENSED",
    "dispensedByPharmacistId": 128,
    "dispensedByPharmacistName": "Dược sĩ Trần Thị C",
    "dispensedAt": "2025-11-20T09:30:00",
    "dispensedNotes": "Bàn giao cho y tá ca sáng",
    "receivedByNurseId": 3,
    "receivedByNurseName": "Y tá Lê Thị D",
    "receivedAt": "2025-11-20T09:30:00",
    "goodsIssueId": 45,
    "medications": [
      {
        "medicationOrderId": 101,
        "status": "DISPENSED",
        "quantityDispensed": 21
      },
      {
        "medicationOrderId": 102,
        "status": "DISPENSED",
        "quantityDispensed": 10
      }
    ]
  }
}
```

#### Tác động hệ thống
✅ **Tạo phiếu xuất kho (GoodsIssue)**
- Loại: `DISPENSE_TO_NURSE`
- Từ kho: `Pharmacy` (Kho chính)
- Đến: `Cabinet` (Tủ thuốc tại khoa)

✅ **Trừ tồn kho (InventoryStock)**
- Áp dụng FEFO (First Expire First Out)
- Trừ số lượng từ các lô thuốc gần hết hạn nhất

#### Permissions Required
- `medication.order.dispense`

---

### **BƯỚC 6: Y TÁ CẤP PHÁT THUỐC CHO BỆNH NHÂN**

#### 6.1. Xem danh sách thuốc cần cấp phát

##### API Endpoint
```
GET /api/v1/inpatient/medications/nurse/pending
```

##### Headers
```
Authorization: Bearer {NURSE_TOKEN}
```

##### Request
```bash
curl -X GET "http://100.96.182.10:8081/api/v1/inpatient/medications/nurse/pending" \
  -H "Authorization: Bearer {NURSE_TOKEN}"
```

##### Response (200 OK)
```json
{
  "status": "OK",
  "message": "Pending medications retrieved successfully.",
  "data": [
    {
      "administrationId": 214,
      "prescriptionItemId": 191,
      "inpatientStayId": 2,
      "medicationName": "Amoxicillin 500mg",
      "dosage": "500mg",
      "routeOfAdministration": "ORAL",
      "frequency": "TID",
      "scheduledDatetime": "2025-11-20T08:00:00",
      "administrationStatus": "PENDING",
      "patientId": 1,
      "patientName": "Nguyễn Văn B",
      "patientCode": "BN001",
      "roomNumber": "301",
      "bedNumber": "A1"
    },
    {
      "administrationId": 215,
      "prescriptionItemId": 192,
      "inpatientStayId": 2,
      "medicationName": "Dexamethasone 10mg/ml",
      "dosage": "10mg",
      "routeOfAdministration": "IV",
      "frequency": "BID",
      "scheduledDatetime": "2025-11-20T08:00:00",
      "administrationStatus": "PENDING",
      "patientId": 1,
      "patientName": "Nguyễn Văn B",
      "patientCode": "BN001",
      "roomNumber": "301",
      "bedNumber": "A1"
    }
  ]
}
```

#### 6.2. Cấp phát thuốc cho bệnh nhân

##### API Endpoint
```
POST /api/v1/inpatient/medications/{administrationId}/administer
```

##### Headers
```
Authorization: Bearer {NURSE_TOKEN}
Content-Type: application/json
```

##### Request Body
```json
{
  "actualDatetime": "2025-11-20T08:05:00",
  "administrationNotes": "Bệnh nhân uống thuốc sau ăn sáng",
  "patientResponse": "Bệnh nhân dung nạp tốt, không có phản ứng bất thường",
  "sideEffectsObserved": null,
  "confirmationCode": "GIVEN"
}
```

##### Request Example
```bash
curl -X POST "http://100.96.182.10:8081/api/v1/inpatient/medications/214/administer" \
  -H "Authorization: Bearer {NURSE_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "actualDatetime": "2025-11-20T08:05:00",
    "administrationNotes": "Bệnh nhân uống thuốc sau ăn sáng",
    "patientResponse": "Bệnh nhân dung nạp tốt, không có phản ứng bất thường",
    "sideEffectsObserved": null,
    "confirmationCode": "GIVEN"
  }'
```

##### Response (200 OK)
```json
{
  "status": "OK",
  "message": "Medication administered successfully.",
  "data": {
    "administrationId": 214,
    "prescriptionItemId": 191,
    "inpatientStayId": 2,
    "medicationName": "Amoxicillin 500mg",
    "dosage": "500mg",
    "routeOfAdministration": "ORAL",
    "frequency": "TID",
    "scheduledDatetime": "2025-11-20T08:00:00",
    "actualDatetime": "2025-11-20T08:05:00",
    "administrationStatus": "GIVEN",
    "administeredByNurseId": 3,
    "administeredByNurseName": "Y tá Lê Thị D",
    "administrationNotes": "Bệnh nhân uống thuốc sau ăn sáng",
    "patientResponse": "Bệnh nhân dung nạp tốt, không có phản ứng bất thường",
    "sideEffectsObserved": null,
    "patientId": 1,
    "patientName": "Nguyễn Văn B",
    "updatedAt": "2025-11-20T08:05:00"
  }
}
```

#### 6.3. Trường hợp bệnh nhân từ chối

##### API Endpoint
```
POST /api/v1/inpatient/medications/{administrationId}/refuse
```

##### Request
```bash
curl -X POST "http://100.96.182.10:8081/api/v1/inpatient/medications/214/refuse?reason=Bệnh%20nhân%20buồn%20nôn" \
  -H "Authorization: Bearer {NURSE_TOKEN}"
```

##### Response (200 OK)
```json
{
  "status": "OK",
  "message": "Medication marked as refused.",
  "data": {
    "administrationId": 214,
    "administrationStatus": "REFUSED",
    "administrationNotes": "Bệnh nhân buồn nôn"
  }
}
```

#### 6.4. Trường hợp bỏ lỡ

##### API Endpoint
```
POST /api/v1/inpatient/medications/{administrationId}/miss
```

##### Request
```bash
curl -X POST "http://100.96.182.10:8081/api/v1/inpatient/medications/214/miss?reason=Bệnh%20nhân%20đi%20chụp%20X-quang" \
  -H "Authorization: Bearer {NURSE_TOKEN}"
```

##### Response (200 OK)
```json
{
  "status": "OK",
  "message": "Medication marked as missed.",
  "data": {
    "administrationId": 214,
    "administrationStatus": "MISSED",
    "administrationNotes": "Bệnh nhân đi chụp X-quang"
  }
}
```

#### Permissions Required
- `medication.administer` (cho administer, refuse, miss)
- `medication.view` (cho xem danh sách)

---


