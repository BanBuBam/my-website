# 🏥 LUỒNG NHẬP VIỆN CHI TIẾT

**Ngày:** 2025-11-13  
**Mục đích:** Giải thích chi tiết quy trình nhập viện từ A-Z

---

## 📊 TỔNG QUAN

Hệ thống HIS có **3 loại nhập viện** chính:

| Loại | Tiếng Việt | Priority | Đặt cọc | Thời gian xử lý |
|------|-----------|----------|---------|-----------------|
| **EMERGENCY** | Cấp cứu | 1-2 | ❌ Không bắt buộc | < 4 giờ |
| **ELECTIVE** | Kế hoạch | 3-5 | ✅ Bắt buộc | < 24 giờ |
| **TRANSFER** | Chuyển viện | 2-3 | ⚠️ Tùy trường hợp | < 8 giờ |
| **OBSERVATION** | Theo dõi | 3-4 | ✅ Bắt buộc | < 12 giờ |
| **DAY_SURGERY** | Phẫu thuật ngày | 4-5 | ✅ Bắt buộc | < 24 giờ |

---

## 🔄 QUY TRÌNH CHI TIẾT

### **BƯỚC 1: Bệnh nhân đến khám (Encounter)**

**Ai thực hiện:** Lễ tân (Reception)

**API:** `POST /api/v1/encounters`

**Request:**
```json
{
  "patientId": 123,
  "encounterType": "OUTPATIENT",
  "chiefComplaint": "Đau bụng dữ dội",
  "departmentId": 10
}
```

**Kết quả:**
- ✅ Tạo Encounter mới
- ✅ Status: `CHECKED_IN`
- ✅ Type: `OUTPATIENT`

---

### **BƯỚC 2: Bác sĩ khám bệnh**

**Ai thực hiện:** Bác sĩ (Doctor)

**Hành động:**
- Khám bệnh nhân
- Chẩn đoán: Viêm ruột thừa cấp
- Quyết định: **Cần nhập viện phẫu thuật**

---

### **BƯỚC 3: Tạo yêu cầu nhập viện (Create Admission Request)**

**Ai thực hiện:** Bác sĩ (Doctor)

**API:** `POST /api/v1/admission-requests`

**Quyền cần:** `admission.create` hoặc `doctor.admission`

**Request:**
```json
{
  "encounterId": 456,
  "requestingDoctorId": 45,
  "departmentId": 15,
  "admissionType": "EMERGENCY",
  "priority": 1,
  "diagnosis": "Viêm ruột thừa cấp, cần phẫu thuật khẩn",
  "reasonForAdmission": "Nguy cơ vỡ ruột thừa, cần can thiệp ngay",
  "requiredBedType": "STANDARD",
  "requiresMonitoring": true,
  "estimatedStayDuration": 3
}
```

**Kết quả:**
- ✅ Tạo AdmissionRequest
- ✅ Status: `PENDING`
- ✅ Priority: `1` (Critical)
- ✅ Type: `EMERGENCY`

**Validation:**
- ✅ Encounter phải tồn tại
- ✅ Bác sĩ phải hợp lệ
- ✅ Khoa phải tồn tại
- ✅ Priority: 1-5

---

### **BƯỚC 4: Phê duyệt yêu cầu (Approve Request)**

**Ai thực hiện:** Điều dưỡng trưởng (Head Nurse) hoặc Trưởng khoa

**API:** `POST /api/v1/admission-requests/{id}/approve`

**Quyền cần:** `admission.approve` hoặc `nurse.head`

**Request:**
```json
{
  "approvalNotes": "Đồng ý nhập viện khoa Ngoại, chuẩn bị phẫu thuật"
}
```

**Kết quả:**
- ✅ Status: `PENDING` → `APPROVED`
- ✅ Ghi nhận người phê duyệt
- ✅ Ghi nhận thời gian phê duyệt

**Validation:**
- ✅ Chỉ PENDING mới approve được
- ✅ Người approve phải có quyền

---

### **BƯỚC 5: Tìm giường trống (Find Available Bed)**

**Ai thực hiện:** Điều dưỡng (Nurse)

**API:** `GET /api/v1/beds/available`

**Query params:**
```
?departmentId=15
&bedType=STANDARD
&gender=MALE
```

**Response:**
```json
{
  "data": [
    {
      "bedId": 101,
      "bedNumber": "A-101",
      "roomNumber": "A-10",
      "bedType": "STANDARD",
      "status": "AVAILABLE",
      "genderRestriction": "MALE"
    }
  ]
}
```

---

### **BƯỚC 6: Gán giường (Assign Bed)**

**Ai thực hiện:** Điều dưỡng (Nurse)

**API:** `POST /api/v1/admission-requests/{id}/assign-bed/{bedId}`

**Quyền cần:** `admission.assign-bed` hoặc `nurse.head` hoặc `bed.assign`

**Ví dụ:** `POST /api/v1/admission-requests/1/assign-bed/101`

**Validation:**
1. ✅ Admission request phải `APPROVED`
2. ✅ Giường phải `AVAILABLE`
3. ✅ Loại giường phù hợp (ICU/STANDARD/ISOLATION)
4. ✅ Giới tính phù hợp (nếu có gender_restriction)
5. ✅ Monitoring level phù hợp
6. ✅ Không có conflict với giường khác

**Kết quả:**
- ✅ Status: `APPROVED` → `BED_ASSIGNED`
- ✅ Bed Status: `AVAILABLE` → `RESERVED`
- ✅ Ghi nhận người gán giường
- ✅ Ghi nhận thời gian gán giường

**Code logic:**
```java
// Pessimistic lock để tránh conflict
HospitalBed bed = hospitalBedRepository.findByIdWithLock(bedId);

// Validate bed
if (!bed.canBeAssigned()) {
    throw new RuntimeException("Bed not available");
}

// Reserve bed
bed.reserve();
hospitalBedRepository.save(bed);

// Update admission request
admissionRequest.setAssignedBedId(bedId);
admissionRequest.setStatus(BED_ASSIGNED);
```

---

### **BƯỚC 7: Xác nhận tài chính (Financial Clearance)**

**⚠️ QUAN TRỌNG: Phân biệt theo loại nhập viện!**

#### 7A. Nhập viện CẤP CỨU (EMERGENCY)

**Ai thực hiện:** Bỏ qua bước này

**Lý do:**
- ⚠️ Bệnh nhân cần nhập viện ngay lập tức
- ⚠️ Không có thời gian hoàn tất thủ tục tài chính
- ⚠️ Ưu tiên cứu người trước
- ⚠️ Thanh toán sau khi bệnh nhân ổn định

**Kết quả:**
- ✅ Có thể bỏ qua bước này
- ✅ Chuyển thẳng sang BƯỚC 8

---

#### 7B. Nhập viện KẾ HOẠCH (ELECTIVE/PLANNED)

**Ai thực hiện:** Thu ngân (Cashier) hoặc Điều dưỡng

**API:** `POST /api/v1/admission-requests/{id}/financial-clearance`

**Quyền cần:** `admission.financial` hoặc `cashier.admission`

**Query params:**
```
?clearanceType=DEPOSIT
&depositAmount=5000000
```

**Các loại clearance:**
- `DEPOSIT`: Đặt cọc tiền mặt (5-10 triệu VNĐ)
- `INSURANCE`: Xác nhận bảo hiểm y tế
- `PREPAID`: Đã thanh toán trước
- `WAIVED`: Miễn phí (bệnh nhân nghèo, từ thiện)

**Validation:**
- ✅ Admission request phải `BED_ASSIGNED`
- ✅ Deposit amount > 0 (nếu type = DEPOSIT)
- ✅ Insurance verified (nếu type = INSURANCE)

**Kết quả:**
- ✅ `financial_cleared` = true
- ✅ `financial_clearance_type` = "DEPOSIT"
- ✅ `deposit_amount` = 5000000

**⚠️ LƯU Ý:**
- Nếu PLANNED mà chưa đặt cọc → **KHÔNG THỂ** complete admission
- Sẽ báo lỗi 500: "Deposit is required before admission"

---

### **BƯỚC 8: Hoàn tất nhập viện (Complete Admission)**

**Ai thực hiện:** Điều dưỡng (Nurse)

**API:** `POST /api/v1/admission-requests/{id}/complete`

**Quyền cần:** `admission.complete` hoặc `nurse.admission`

**Validation:**

#### Kiểm tra chung (tất cả loại):
1. ✅ Status = `BED_ASSIGNED`
2. ✅ Pre-admission checklist completed
3. ✅ Insurance verified
4. ✅ Consent form signed

#### Kiểm tra tài chính (phân biệt loại):
```java
if (!admissionRequest.isFinancialCleared()) {
    if (admissionRequest.isEmergency()) {
        // EMERGENCY: Cho phép bỏ qua
        log.warn("⚠️ Emergency admission - Financial clearance waived");
    } else {
        // PLANNED: BẮT BUỘC phải có deposit
        throw new RuntimeException("Deposit is required before admission");
    }
}
```

**Kết quả:**
- ✅ Status: `BED_ASSIGNED` → `ADMITTED`
- ✅ Ghi nhận thời gian nhập viện thực tế
- ✅ Tự động trigger tạo InpatientStay

---

### **BƯỚC 9: Tạo InpatientStay (Tự động)**

**Ai thực hiện:** Hệ thống tự động

**Code:** `createInpatientStayFromAdmissionRequest()`

**Các hành động:**

#### 9.1. Cập nhật Encounter
```java
encounter.setEncounterType(EncounterType.INPATIENT);
encounter.setStatus(EncounterStatus.IN_PROGRESS);
encounterRepository.save(encounter);
```

**Kết quả:**
- ✅ Encounter Type: `OUTPATIENT` → `INPATIENT`
- ✅ Encounter Status: → `IN_PROGRESS`

---

#### 9.2. Chiếm giường (Occupy Bed)
```java
bed.occupy();  // RESERVED → OCCUPIED
hospitalBedRepository.save(bed);
```

**Kết quả:**
- ✅ Bed Status: `RESERVED` → `OCCUPIED`
- ✅ Giường không thể gán cho bệnh nhân khác

---

#### 9.3. Tạo InpatientStay
```java
InpatientStay inpatientStay = InpatientStay.builder()
    .encounterId(admissionRequest.getEncounterId())
    .hospitalBedId(admissionRequest.getAssignedBedId())
    .admissionDate(admissionRequest.getActualAdmissionDate())
    .admissionDiagnosis(admissionRequest.getAdmissionDiagnosis())
    .attendingDoctorId(admissionRequest.getRequestedByEmployeeId())
    .admissionType(mapAdmissionType(admissionRequest.getAdmissionType()))
    .currentStatus(InpatientStatus.ACTIVE)
    .preAdmissionCompleted(true)
    .admissionOrdersCompleted(false)
    .dischargePlanningInitiated(false)
    .dischargeReady(false)
    .build();

inpatientStayRepository.save(inpatientStay);
```

**Mapping AdmissionType:**
- `EMERGENCY` → `InpatientStay.AdmissionType.EMERGENCY`
- `ELECTIVE` → `InpatientStay.AdmissionType.PLANNED`
- `OBSERVATION` → `InpatientStay.AdmissionType.PLANNED`
- `DAY_SURGERY` → `InpatientStay.AdmissionType.PLANNED`
- `TRANSFER` → `InpatientStay.AdmissionType.URGENT`

---

#### 9.4. Khởi tạo 11 Workflow Steps
```java
inpatientWorkflowStatusService.initializeWorkflowForInpatientStay(inpatientStayId);
```

**11 bước workflow:**
1. **ADMISSION** - Nhập viện
2. **INITIAL_ASSESSMENT** - Đánh giá ban đầu
3. **DIAGNOSTIC_TESTS** - Xét nghiệm chẩn đoán
4. **TREATMENT_PLAN** - Kế hoạch điều trị
5. **MEDICATION_ORDERS** - Y lệnh thuốc
6. **NURSING_CARE** - Chăm sóc điều dưỡng
7. **DAILY_ROUNDS** - Thăm khám hàng ngày
8. **DISCHARGE_PLANNING** - Lập kế hoạch xuất viện
9. **DISCHARGE_ORDERS** - Y lệnh xuất viện
10. **DISCHARGE_EDUCATION** - Hướng dẫn xuất viện
11. **DISCHARGE_COMPLETE** - Hoàn tất xuất viện

**Mỗi step có:**
- `workflow_step`: Tên bước
- `status`: NOT_STARTED / IN_PROGRESS / COMPLETED / SKIPPED
- `started_at`: Thời gian bắt đầu
- `completed_at`: Thời gian hoàn thành
- `completed_by_employee_id`: Người hoàn thành
- `notes`: Ghi chú

---

### **BƯỚC 10: Điều trị nội trú (Inpatient Care)**

**Ai thực hiện:** Bác sĩ, Điều dưỡng, Dược sĩ, Kỹ thuật viên

**Các hoạt động:**

#### 10.1. Medication Administration (Cho thuốc)
- API: `POST /api/v1/inpatient/medication-administrations`
- Ghi nhận: Thuốc gì, liều lượng, thời gian, người cho

#### 10.2. Vital Signs Monitoring (Theo dõi sinh hiệu)
- API: `POST /api/v1/inpatient/vital-signs`
- Ghi nhận: Huyết áp, mạch, nhiệt độ, SpO2

#### 10.3. Lab Tests (Xét nghiệm)
- API: `POST /api/v1/lab/orders`
- Ghi nhận: Xét nghiệm máu, nước tiểu, X-quang

#### 10.4. Procedures (Thủ thuật)
- API: `POST /api/v1/procedures`
- Ghi nhận: Phẫu thuật, nội soi, chọc dò

#### 10.5. Daily Progress Notes (Ghi chú tiến triển)
- API: `POST /api/v1/inpatient/progress-notes`
- Ghi nhận: Tình trạng bệnh nhân hàng ngày

---

### **BƯỚC 11: Xuất viện (Discharge)**

**Ai thực hiện:** Bác sĩ điều trị

**API:** `POST /api/v1/inpatient/{inpatientStayId}/discharge`

**Request:**
```json
{
  "dischargeDate": "2025-11-15T10:00:00",
  "dispositionType": "HOME",
  "dischargeDiagnosis": "Viêm ruột thừa cấp đã phẫu thuật, hồi phục tốt",
  "dischargeInstructions": "Uống thuốc kháng sinh 7 ngày, tái khám sau 1 tuần",
  "followUpDate": "2025-11-22"
}
```

**Disposition Types:**
- `HOME`: Xuất viện về nhà (bình thường)
- `EXPIRED`: Tử vong
- `TRANSFER`: Chuyển viện
- `DAMA`: Xin về (có chỉ định bác sĩ)
- `AMA`: Tự ý về (không theo chỉ định)
- `ABSCONDED`: Bỏ trốn
- `HOSPICE`: Chuyển chăm sóc cuối đời
- `REHABILITATION`: Chuyển phục hồi chức năng

**Kết quả:**
- ✅ InpatientStay Status: `ACTIVE` → `DISCHARGED`
- ✅ Bed Status: `OCCUPIED` → `AVAILABLE`
- ✅ Encounter Status: → `COMPLETED`
- ✅ Ghi nhận thời gian xuất viện
- ✅ Tính tổng chi phí nằm viện

---

## 📊 TRẠNG THÁI (STATUS) FLOW

### AdmissionRequest Status:
```
PENDING → APPROVED → BED_ASSIGNED → ADMITTED
   ↓
REJECTED (nếu từ chối)
```

### Bed Status:
```
AVAILABLE → RESERVED → OCCUPIED → AVAILABLE
                ↓
         (nếu reject) → AVAILABLE
```

### Encounter Type:
```
OUTPATIENT → INPATIENT → (discharge) → COMPLETED
```

### InpatientStay Status:
```
ACTIVE → DISCHARGED
   ↓
TRANSFERRED (nếu chuyển viện)
```

---

## 🎯 VÍ DỤ THỰC TẾ

### Tình huống 1: Cấp cứu (EMERGENCY)

**14:00** - Bệnh nhân Nguyễn Văn A đau bụng dữ dội, đến cấp cứu
```bash
POST /api/v1/encounters
{
  "encounterType": "OUTPATIENT",
  "chiefComplaint": "Đau bụng dữ dội"
}
```

**14:05** - Bác sĩ khám: Viêm ruột thừa cấp, cần phẫu thuật ngay
```bash
POST /api/v1/admission-requests
{
  "admissionType": "EMERGENCY",
  "priority": 1,
  "diagnosis": "Viêm ruột thừa cấp"
}
```

**14:10** - Điều dưỡng trưởng phê duyệt
```bash
POST /api/v1/admission-requests/1/approve
```

**14:15** - Gán giường phòng mổ
```bash
POST /api/v1/admission-requests/1/assign-bed/101
```

**14:20** - Nhập viện ngay (BỎ QUA đặt cọc)
```bash
POST /api/v1/admission-requests/1/complete
# ✅ Thành công dù chưa đặt cọc
```

**14:25** - Phẫu thuật
**16:00** - Chuyển phòng hồi sức
**18:00** - Gia đình đến, hoàn tất thủ tục tài chính

---

### Tình huống 2: Kế hoạch (ELECTIVE)

**09:00** - Bệnh nhân Trần Thị B đến khám, bác sĩ chẩn đoán: Sỏi mật, cần phẫu thuật
```bash
POST /api/v1/admission-requests
{
  "admissionType": "ELECTIVE",
  "priority": 4,
  "diagnosis": "Sỏi mật, cần phẫu thuật nội soi"
}
```

**09:30** - Phê duyệt, hẹn nhập viện ngày mai
```bash
POST /api/v1/admission-requests/2/approve
```

**Ngày hôm sau - 07:00** - Bệnh nhân đến nhập viện
```bash
POST /api/v1/admission-requests/2/assign-bed/102
```

**07:30** - Thu ngân nhận đặt cọc 8 triệu
```bash
POST /api/v1/admission-requests/2/financial-clearance?clearanceType=DEPOSIT&depositAmount=8000000
```

**08:00** - Hoàn tất nhập viện
```bash
POST /api/v1/admission-requests/2/complete
# ✅ Thành công vì đã đặt cọc
```

**10:00** - Phẫu thuật nội soi
**15:00** - Hồi phục tốt
**Ngày hôm sau** - Xuất viện

---

## 🚨 CÁC LỖI THƯỜNG GẶP

### Lỗi 1: "Only approved requests can have beds assigned"
**Nguyên nhân:** Chưa approve request
**Giải pháp:** Gọi API approve trước

### Lỗi 2: "Bed is not available"
**Nguyên nhân:** Giường đã bị chiếm hoặc đang bảo trì
**Giải pháp:** Tìm giường khác

### Lỗi 3: "Deposit is required before admission"
**Nguyên nhân:** PLANNED admission chưa đặt cọc
**Giải pháp:** Gọi API financial-clearance trước

### Lỗi 4: "Bed must be assigned before completing admission"
**Nguyên nhân:** Chưa gán giường
**Giải pháp:** Gọi API assign-bed trước

---

**Hết! Bạn có câu hỏi gì không? 🤔**

