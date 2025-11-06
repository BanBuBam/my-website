# 📊 PHÂN TÍCH LUỒNG NỘI TRÚ CHI TIẾT

## 🎯 TỔNG QUAN HỆ THỐNG

Hệ thống nội trú được thiết kế theo chuẩn **HIS quốc tế** (Epic EMR, Cerner Millennium) với **8 giai đoạn chính**:

```
KHÁM NGOẠI TRÚ → KÝ BỆNH ÁN → YÊU CẦU NHẬP VIỆN → PHÊ DUYỆT → GÁN GIƯỜNG → NHẬP VIỆN → ĐIỀU TRỊ → XUẤT VIỆN
```

### **🔄 LUỒNG HOÀN CHỈNH TỪ NGOẠI TRÚ ĐẾN NỘI TRÚ**

#### **Giai đoạn 0: Khám ngoại trú**
1. **Bệnh nhân check-in** → Encounter status: `PLANNED` → `ARRIVED`
2. **Bác sĩ bắt đầu khám** → Encounter status: `ARRIVED` → `IN_PROGRESS`
3. **Bác sĩ ký bệnh án** → Clinical Note: `DRAFT` → `SIGNED`, Encounter: `IN_PROGRESS` → `FINISHED`

#### **Giai đoạn 1: Tạo yêu cầu nhập viện**
4. **Bác sĩ tạo admission request** → Status: `PENDING`
   - Encounter vẫn giữ type = `OUTPATIENT`
   - Encounter status = `FINISHED` hoặc `IN_PROGRESS`

#### **Giai đoạn 2-3: Phê duyệt và gán giường**
5. **Trưởng khoa phê duyệt** → Status: `PENDING` → `APPROVED`
6. **Điều dưỡng gán giường** → Status: `APPROVED` → `BED_ASSIGNED`, Bed: `AVAILABLE` → `RESERVED`

#### **Giai đoạn 4: Hoàn tất nhập viện (CRITICAL!)**
7. **Điều dưỡng hoàn tất nhập viện** → Status: `BED_ASSIGNED` → `ADMITTED`
   - **🔴 Encounter chuyển từ OUTPATIENT → INPATIENT** (Bước quan trọng nhất!)
   - Encounter status: → `IN_PROGRESS`
   - Bed: `RESERVED` → `OCCUPIED`
   - Tự động tạo InpatientStay
   - Khởi tạo 9 workflow steps

#### **Giai đoạn 5-6: Điều trị nội trú**
8. **Điều trị nội trú** → Nursing notes, medications, safety assessments
9. **Theo dõi workflow** → 9 bước tự động

#### **Giai đoạn 7: Xuất viện**
10. **Lập kế hoạch xuất viện** → Discharge planning
11. **Thực hiện xuất viện** → InpatientStay: `ACTIVE` → `DISCHARGED`, Bed: `OCCUPIED` → `NEEDS_CLEANING`

### **🔴 ĐIỂM QUAN TRỌNG NHẤT**

**Encounter type chỉ chuyển từ OUTPATIENT → INPATIENT khi:**
- ✅ Admission request đã được phê duyệt
- ✅ Giường đã được gán
- ✅ Pre-admission checklist hoàn tất
- ✅ **Điều dưỡng thực hiện "Complete Admission"** (POST `/api/v1/admission-requests/{id}/complete`)

**Trước đó, dù đã tạo admission request, encounter vẫn là OUTPATIENT!**

---

## 📋 GIAI ĐOẠN 0: KHÁM NGOẠI TRÚ (OUTPATIENT EXAMINATION)

### **Luồng khám ngoại trú hoàn chỉnh**

```
PLANNED → ARRIVED → IN_PROGRESS → FINISHED → (Tạo yêu cầu nhập viện)
```

### **0.1. Bệnh nhân check-in**

#### **API Endpoint**
```
POST /api/v1/encounters/{encounterId}/checkin
```

#### **Quyền yêu cầu**
- `encounter.checkin`

#### **Business Logic**
```java
// Encounter status: PLANNED → ARRIVED
encounter.setStatus(EncounterStatus.ARRIVED.name());
encounter.setStartDatetime(LocalDateTime.now());
```

**Trạng thái:** `PLANNED` → `ARRIVED`

---

### **0.2. Bác sĩ bắt đầu khám**

#### **Tự động chuyển trạng thái**

Khi bác sĩ tạo clinical note hoặc prescription, hệ thống **TỰ ĐỘNG** chuyển:

```java
// Auto-trigger when doctor creates clinical note or prescription
if (encounter.getStatus().equals(EncounterStatus.ARRIVED.name())) {
    encounter.setStatus(EncounterStatus.IN_PROGRESS.name());
    encounterRepository.save(encounter);
    log.info("Encounter {} automatically moved to IN_PROGRESS", encounterId);
}
```

**Trạng thái:** `ARRIVED` → `IN_PROGRESS`

---

### **0.3. Bác sĩ ký bệnh án (CRITICAL!)**

#### **API Endpoint**
```
POST /api/v1/clinical-notes/{noteId}/sign
```

#### **Quyền yêu cầu**
- `notes.sign`

#### **Business Logic**

```java
// 1. Sign clinical note
clinicalNote.setStatus("SIGNED");
clinicalNote.setSignedByEmployeeId(employeeId);
clinicalNote.setSignedAt(LocalDateTime.now());

// 2. Auto-trigger encounter status change
boolean hasSignedNote = clinicalNoteRepository.existsByEncounterIdAndStatus(encounterId, "SIGNED");

// For OUTPATIENT: Only need signed clinical note
if ("OUTPATIENT".equals(encounter.getEncounterType())) {
    if (hasSignedNote) {
        encounter.setStatus(EncounterStatus.FINISHED.name());
        encounterRepository.save(encounter);
        log.info("Outpatient encounter {} ready for discharge (FINISHED)", encounterId);
    }
}
```

**Trạng thái:**
- **Clinical Note:** `DRAFT` → `SIGNED`
- **Encounter:** `IN_PROGRESS` → `FINISHED`

**🔴 LƯU Ý QUAN TRỌNG:**
- Bác sĩ **PHẢI KÝ BỆNH ÁN** trước khi tạo yêu cầu nhập viện
- Encounter phải ở trạng thái `FINISHED` hoặc `IN_PROGRESS` mới được tạo admission request
- Nếu chưa ký bệnh án, encounter vẫn ở trạng thái `IN_PROGRESS`

---

## 📋 GIAI ĐOẠN 1: TẠO YÊU CẦU NHẬP VIỆN

### **Điều kiện tiên quyết**

✅ **Bác sĩ ĐÃ KÝ BỆNH ÁN** (Clinical Note status = SIGNED)
✅ **Encounter ở trạng thái FINISHED hoặc IN_PROGRESS**
✅ **Encounter type = OUTPATIENT**
✅ **Chưa có admission request active cho encounter này**
✅ **Chưa có inpatient stay cho encounter này**

### **API Endpoint**
```
POST /api/v1/admission-requests
```

### **Quyền yêu cầu**
- `admission.create` HOẶC
- `doctor.admission`

### **Request Body**

```json
{
  "encounterId": 344,
  "admissionType": "EMERGENCY",
  "priorityLevel": 1,
  "admissionDiagnosis": "Viêm ruột thừa cấp",
  "specialRequirements": "Cần phẫu thuật khẩn cấp",
  "bedTypeRequired": "ICU",
  "requestedDepartmentId": 5,
  "requestedByEmployeeId": 121,
  "expectedAdmissionDate": "2025-11-04",
  "estimatedLengthOfStay": 7,
  "isolationRequired": false,
  "requiresIcu": true,
  "oxygenRequired": true,
  "monitoringLevel": "INTENSIVE",
  "preAdmissionChecklistCompleted": true,
  "insuranceVerified": true,
  "consentFormSigned": true
}
```

### **Admission Types (Loại nhập viện)**

| Type | Tên tiếng Việt | Priority | Yêu cầu giường ngay |
|------|----------------|----------|---------------------|
| `EMERGENCY` | Cấp cứu | 1-2 | ✅ Có |
| `ELECTIVE` | Kế hoạch | 3-5 | ❌ Không |
| `OBSERVATION` | Theo dõi | 3-4 | ❌ Không |
| `DAY_SURGERY` | Phẫu thuật ngày | 3-4 | ❌ Không |
| `TRANSFER` | Chuyển viện | 1-2 | ✅ Có |

### **Priority Levels (Mức độ ưu tiên)**

- **1** = Nguy kịch (life-threatening) - Cần giường ngay lập tức
- **2** = Khẩn cấp (urgent) - Cần giường trong 4 giờ
- **3** = Ưu tiên (priority) - Cần giường trong 24 giờ
- **4** = Thường (routine) - Cần giường trong 48 giờ
- **5** = Kế hoạch (elective) - Có thể chờ đợi

### **Bed Types (Loại giường)**

- `ICU` - Hồi sức tích cực
- `GENERAL` - Giường thường
- `ISOLATION` - Phòng cách ly
- `PRIVATE` - Phòng riêng
- `VIP` - Phòng VIP

### **Monitoring Levels (Mức độ theo dõi)**

- `BASIC` - Theo dõi cơ bản
- `INTERMEDIATE` - Theo dõi trung bình
- `INTENSIVE` - Theo dõi tích cực
- `CRITICAL` - Theo dõi nguy kịch

### **Validation Logic (7 bước kiểm tra)**

```java
// ✅ 1. Validate encounter exists and is valid for admission
Encounter encounter = encounterRepository.findById(request.getEncounterId())
        .orElseThrow(() -> new RuntimeException("Encounter not found with ID: " + request.getEncounterId()));

// ✅ 2. Validate encounter type is OUTPATIENT (chỉ ngoại trú mới được nhập nội trú)
if (!"OUTPATIENT".equals(encounter.getEncounterType())) {
    throw new RuntimeException("Only OUTPATIENT encounters can be admitted to inpatient. Current type: " + encounter.getEncounterType());
}

// ✅ 3. Validate encounter status is valid (OPEN/IN_PROGRESS)
// Encounter phải đang hoạt động (chưa hoàn thành khám)
if (!"OPEN".equals(encounter.getStatus()) &&
    !"IN_PROGRESS".equals(encounter.getStatus())) {
    throw new RuntimeException("Encounter must be OPEN or IN_PROGRESS to create admission request. Current status: " + encounter.getStatus());
}

// ✅ 4. Validate encounter doesn't already have an inpatient stay
if (inpatientStayRepository.existsByEncounterId(request.getEncounterId())) {
    throw new RuntimeException("Encounter already has an inpatient stay. Cannot create admission request.");
}

// ✅ 5. Validate no duplicate admission request for same encounter
Optional<AdmissionRequest> existingRequest = admissionRequestRepository.findByEncounterId(request.getEncounterId());
if (existingRequest.isPresent() &&
    !existingRequest.get().isCompleted() &&
    !existingRequest.get().isRejected() &&
    !existingRequest.get().isCancelled()) {
    throw new RuntimeException("Active admission request already exists for encounter ID: " + request.getEncounterId());
}

// ✅ 6. Auto-adjust priority for EMERGENCY admissions
if (request.getAdmissionType() == AdmissionType.EMERGENCY && request.getPriorityLevel() > 2) {
    log.warn("EMERGENCY admission should have priority 1-2, but got priority {}", request.getPriorityLevel());
    request.setPriorityLevel(1); // Auto-adjust to highest priority
}

// ✅ 7. Auto-set bed type for ICU/Isolation requirements
if (Boolean.TRUE.equals(request.getRequiresIcu()) && !"ICU".equals(request.getBedTypeRequired())) {
    log.warn("ICU required but bed type is not ICU, auto-setting to ICU");
    request.setBedTypeRequired("ICU");
}

if (Boolean.TRUE.equals(request.getIsolationRequired()) && !"ISOLATION".equals(request.getBedTypeRequired())) {
    log.warn("Isolation required but bed type is not ISOLATION, auto-setting to ISOLATION");
    request.setBedTypeRequired("ISOLATION");
}
```

### **Response**

```json
{
  "success": true,
  "message": "Yêu cầu nhập viện đã được tạo - EMERGENCY - Ưu tiên: 1",
  "data": {
    "admissionRequestId": 123,
    "encounterId": 344,
    "patientId": 456,
    "status": "PENDING",
    "admissionType": "EMERGENCY",
    "priorityLevel": 1,
    "admissionDiagnosis": "Viêm ruột thừa cấp",
    "bedTypeRequired": "ICU",
    "requestedDepartmentId": 5,
    "requestedByEmployeeId": 121,
    "requestedAt": "2025-11-04T10:30:00",
    "preAdmissionChecklistCompleted": true,
    "insuranceVerified": true,
    "consentFormSigned": true
  }
}
```

### **Trạng thái sau khi tạo**
`PENDING` (Chờ duyệt)

### **🔴 LƯU Ý QUAN TRỌNG**

1. **Encounter vẫn giữ nguyên type = OUTPATIENT** cho đến khi hoàn tất nhập viện (complete admission)
2. **Encounter status không thay đổi** khi tạo admission request
3. **Chỉ khi complete admission** thì encounter mới chuyển từ `OUTPATIENT` → `INPATIENT`
4. **Bác sĩ có thể tạo admission request ngay sau khi ký bệnh án** (encounter status = FINISHED)
5. **Hoặc tạo trong khi đang khám** (encounter status = IN_PROGRESS)

---

## 📋 GIAI ĐOẠN 2: PHÊ DUYỆT YÊU CẦU

### **API Endpoint**
```
POST /api/v1/admission-requests/{admissionRequestId}/approve
```

### **Quyền yêu cầu**
- `admission.approve` HOẶC
- `department.head`

### **Request Body**

```json
{
  "approvalNotes": "Đồng ý nhập viện, cần phẫu thuật khẩn cấp"
}
```

### **Business Logic**

```java
// Chỉ cho phép phê duyệt yêu cầu đang PENDING
if (!admissionRequest.isPending()) {
    throw new RuntimeException("Only pending requests can be approved");
}

admissionRequest.setApprovedByEmployeeId(approverId);
admissionRequest.setApprovedAt(LocalDateTime.now());
admissionRequest.setApprovalNotes(approvalNotes);
admissionRequest.setStatus(AdmissionRequestStatus.APPROVED);
```

### **Trạng thái**
`PENDING` → `APPROVED`

### **Các API hỗ trợ quản lý yêu cầu**

```bash
# Danh sách chờ duyệt
GET /api/v1/admission-requests/pending

# Danh sách cấp cứu
GET /api/v1/admission-requests/emergency

# Danh sách ưu tiên cao
GET /api/v1/admission-requests/high-priority

# Danh sách chờ quá lâu (> 24h)
GET /api/v1/admission-requests/excessive-wait

# Lọc theo trạng thái
GET /api/v1/admission-requests/status/{status}

# Lọc theo loại nhập viện
GET /api/v1/admission-requests/type/{admissionType}

# Lọc theo khoa
GET /api/v1/admission-requests/department/{departmentId}

# Lọc theo bác sĩ
GET /api/v1/admission-requests/doctor/{doctorId}
```

### **API từ chối yêu cầu**

```
POST /api/v1/admission-requests/{admissionRequestId}/reject
```

**Request:**
```json
{
  "rejectionNotes": "Không đủ điều kiện nhập viện, điều trị ngoại trú"
}
```

**Logic:**
- Nếu đã gán giường → Tự động giải phóng giường (RESERVED → AVAILABLE)
- Status: → REJECTED

---

## 📋 GIAI ĐOẠN 3: GÁN GIƯỜNG BỆNH

### **API Endpoint**
```
POST /api/v1/admission-requests/{admissionRequestId}/assign-bed
```

### **Quyền yêu cầu**
- `admission.assign.bed` HOẶC
- `nurse.head`

### **Request Body**

```json
{
  "bedId": 15
}
```

### **Validation Logic (5 bước kiểm tra)**

```java
// ✅ 1. Validate bed exists WITH PESSIMISTIC LOCK (ngăn gán đồng thời)
HospitalBed bed = hospitalBedRepository.findByIdWithLock(bedId)
        .orElseThrow(() -> new RuntimeException("Bed not found"));

log.info("🔒 Acquired pessimistic lock on bed {}", bed.getBedNumber());

// ✅ 2. Validate bed is available
if (!bed.canBeAssigned()) {
    throw new RuntimeException("Bed is not available. Current status: " + bed.getStatus());
}

// ✅ 3. Validate bed type matches requirements
if (admissionRequest.isIcuRequired() && !"ICU".equals(bedType)) {
    throw new RuntimeException("ICU bed required but assigned bed type is: " + bedType);
}

if (admissionRequest.isIsolationRequired() && !bed.getIsolationCapable()) {
    throw new RuntimeException("Isolation capable bed required");
}

// ✅ 4. Validate monitoring level matches
if (!isMonitoringLevelCompatible(required, available)) {
    throw new RuntimeException("Monitoring level mismatch");
}

// ✅ 5. Validate gender restriction
if (bed.getGenderRestriction() != null && !"ANY".equals(bed.getGenderRestriction())) {
    String patientGender = patient.getPerson().getGender().name();
    if (!bed.getGenderRestriction().equalsIgnoreCase(patientGender)) {
        throw new RuntimeException("Gender mismatch");
    }
}
```

### **Đặt trước giường (RESERVE)**

```java
// ==================== RESERVE BED IMMEDIATELY ====================
bed.reserve();  // AVAILABLE → RESERVED
hospitalBedRepository.save(bed);

log.info("✅ Reserved bed {} for admission request {}", 
         bed.getBedNumber(), admissionRequestId);

// Set bed assignment fields
admissionRequest.setAssignedBedId(bedId);
admissionRequest.setBedAssignedAt(LocalDateTime.now());
admissionRequest.setBedAssignedByEmployeeId(employeeId);
admissionRequest.setStatus(AdmissionRequestStatus.BED_ASSIGNED);
```

### **Trạng thái**
- **AdmissionRequest:** `APPROVED` → `BED_ASSIGNED`
- **Bed Status:** `AVAILABLE` → `RESERVED`

### **Các API hỗ trợ tìm giường**

```bash
# Tất cả giường trống
GET /api/v1/bed-management/available

# Giường trống theo khoa
GET /api/v1/bed-management/available/department/{departmentId}

# Giường trống theo loại
GET /api/v1/bed-management/available/type/{bedType}

# Thống kê công suất
GET /api/v1/bed-management/stats/occupancy

# Công suất theo khoa
GET /api/v1/bed-management/stats/occupancy/department/{departmentId}
```

---

## 📋 GIAI ĐOẠN 4: HOÀN TẤT NHẬP VIỆN (CRITICAL!)

### **API Endpoint**
```
POST /api/v1/admission-requests/{admissionRequestId}/complete
```

### **Quyền yêu cầu**
- `admission.complete`

### **Pre-admission Checklist (3 yêu cầu bắt buộc)**

```java
// ✅ 1. Pre-admission checklist must be completed
if (!admissionRequest.isPreAdmissionChecklistCompleted()) {
    throw new RuntimeException("Pre-admission checklist must be completed");
}

// ✅ 2. Insurance must be verified
if (!admissionRequest.isInsuranceVerified()) {
    throw new RuntimeException("Insurance must be verified");
}

// ✅ 3. Consent form must be signed
if (!admissionRequest.isConsentFormSigned()) {
    throw new RuntimeException("Consent form must be signed");
}
```

### **Trạng thái**
`BED_ASSIGNED` → `ADMITTED`

### **🔴 CRITICAL: Tự động tạo InpatientStay**

Khi hoàn tất nhập viện, hệ thống **TỰ ĐỘNG** thực hiện 5 bước:

```java
// ==================== CREATE INPATIENT STAY ====================
try {
    createInpatientStayFromAdmissionRequest(updated, employeeId);
    log.info("✅ Successfully created InpatientStay");
} catch (Exception e) {
    // Rollback admission status if InpatientStay creation fails
    admissionRequest.setStatus(AdmissionRequestStatus.BED_ASSIGNED);
    admissionRequest.setActualAdmissionDate(null);
    admissionRequestRepository.save(admissionRequest);
    throw new RuntimeException("Failed to create InpatientStay: " + e.getMessage());
}
```

#### **Bước 1: Cập nhật Encounter (CRITICAL!)**

```java
// ==================== 1. UPDATE ENCOUNTER ====================
// 🔴 ĐÂY LÀ BƯỚC QUAN TRỌNG NHẤT: Chuyển encounter từ ngoại trú sang nội trú
encounter.setEncounterType("INPATIENT");  // OUTPATIENT → INPATIENT
encounter.setStatus("IN_PROGRESS");       // Bắt đầu điều trị nội trú
encounterRepository.save(encounter);

log.info("✅ Updated Encounter {} - Type: OUTPATIENT → INPATIENT, Status: → IN_PROGRESS",
        encounter.getEncounterId());
```

**🔴 LƯU Ý:**
- **Đây là bước chuyển đổi chính thức** từ khám ngoại trú sang điều trị nội trú
- **Encounter type thay đổi:** `OUTPATIENT` → `INPATIENT`
- **Encounter status:** `FINISHED` hoặc `IN_PROGRESS` → `IN_PROGRESS` (bắt đầu điều trị nội trú)
- **Từ thời điểm này, bệnh nhân chính thức là bệnh nhân nội trú**

#### **Bước 2: Chiếm giường (OCCUPY)**

```java
// Occupy bed: AVAILABLE/RESERVED → OCCUPIED
bed.occupy();
hospitalBedRepository.save(bed);

log.info("✅ Occupied Bed {} - Status: {} → OCCUPIED", bed.getBedNumber(), bed.getStatus());
```

**Bed Status:** `RESERVED` → `OCCUPIED`

#### **Bước 3: Tạo InpatientStay Record**

```java
InpatientStay inpatientStay = InpatientStay.builder()
        .encounterId(admissionRequest.getEncounterId())
        .hospitalBedId(admissionRequest.getAssignedBedId())
        .admissionDate(admissionRequest.getActualAdmissionDate())
        .admissionDiagnosis(admissionRequest.getAdmissionDiagnosis())
        .attendingDoctorId(admissionRequest.getRequestedByEmployeeId())
        .admissionType(mapAdmissionType(admissionRequest.getAdmissionType()))
        .currentStatus(InpatientStay.InpatientStatus.ACTIVE)
        // Workflow flags
        .preAdmissionCompleted(true)
        .admissionOrdersCompleted(false)
        .dischargePlanningInitiated(false)
        .dischargeReady(false)
        .build();

InpatientStay savedStay = inpatientStayRepository.save(inpatientStay);
```

**InpatientStay Status:** `ACTIVE`

#### **Bước 4: Khởi tạo 9 Workflow Steps**

```java
// ==================== INITIALIZE WORKFLOW TRACKING ====================
try {
    inpatientWorkflowStatusService.initializeWorkflowForInpatientStay(savedStay.getInpatientStayId());
    log.info("✅ Initialized workflow tracking for InpatientStay ID: {}", savedStay.getInpatientStayId());
} catch (Exception e) {
    log.warn("⚠️ Failed to initialize workflow tracking - Error: {}", e.getMessage());
    // Don't fail admission if workflow initialization fails
}
```

Hệ thống tự động tạo **9 workflow steps** trong bảng `InpatientWorkflowStatus`:

1. ADMISSION (ADMIN, 1h)
2. INITIAL_ASSESSMENT (DOCTOR, 2h)
3. SAFETY_ASSESSMENT (NURSE, 1h)
4. TREATMENT_PLANNING (DOCTOR, 3h)
5. TREATMENT_EXECUTION (NURSE, liên tục)
6. DAILY_ROUNDS (DOCTOR, hàng ngày)
7. PROGRESS_EVALUATION (DOCTOR, 2h)
8. DISCHARGE_PLANNING (DOCTOR, 2h)
9. DISCHARGE (ADMIN, 1h)

#### **Bước 5: Mapping Admission Types**

```java
// AdmissionRequest types → InpatientStay types
private InpatientStay.AdmissionType mapAdmissionType(AdmissionType requestType) {
    return switch (requestType) {
        case EMERGENCY -> InpatientStay.AdmissionType.EMERGENCY;
        case ELECTIVE, OBSERVATION, DAY_SURGERY -> InpatientStay.AdmissionType.PLANNED;
        case TRANSFER -> InpatientStay.AdmissionType.URGENT;
    };
}
```

| AdmissionRequest Type | InpatientStay Type |
|-----------------------|--------------------|
| EMERGENCY | EMERGENCY |
| ELECTIVE | PLANNED |
| OBSERVATION | PLANNED |
| DAY_SURGERY | PLANNED |
| TRANSFER | URGENT |

---

## 📋 GIAI ĐOẠN 5: QUẢN LÝ WORKFLOW (9 BƯỚC TỰ ĐỘNG)

### **API xem workflow**

```bash
# Xem tất cả workflow steps của bệnh nhân
GET /api/v1/inpatient-workflow/stay/{inpatientStayId}

# Xem tiến độ workflow
GET /api/v1/inpatient-workflow/stay/{inpatientStayId}/progress

# Xem phần trăm hoàn thành
GET /api/v1/inpatient-workflow/stay/{inpatientStayId}/completion-percentage
```

### **9 Workflow Steps Chi Tiết**

| Bước | Code | Tên | Người thực hiện | Thời gian ước tính | Mô tả |
|------|------|-----|-----------------|-------------------|-------|
| 1 | `ADMISSION` | Nhập viện | ADMIN | 1h | Hoàn tất thủ tục nhập viện, ghi nhận thông tin |
| 2 | `INITIAL_ASSESSMENT` | Đánh giá ban đầu | DOCTOR | 2h | Bác sĩ khám ban đầu, đánh giá tình trạng |
| 3 | `SAFETY_ASSESSMENT` | Đánh giá an toàn | NURSE | 1h | Y tá đánh giá nguy cơ (té ngã, loét, v.v.) |
| 4 | `TREATMENT_PLANNING` | Lập kế hoạch điều trị | DOCTOR | 3h | Bác sĩ lập phác đồ điều trị |
| 5 | `TREATMENT_EXECUTION` | Thực hiện điều trị | NURSE | Liên tục | Y tá thực hiện điều trị, cho thuốc |
| 6 | `DAILY_ROUNDS` | Thăm khám hàng ngày | DOCTOR | Hàng ngày | Bác sĩ thăm khám, đánh giá tiến triển |
| 7 | `PROGRESS_EVALUATION` | Đánh giá tiến triển | DOCTOR | 2h | Đánh giá kết quả điều trị |
| 8 | `DISCHARGE_PLANNING` | Chuẩn bị xuất viện | DOCTOR | 2h | Lập kế hoạch xuất viện |
| 9 | `DISCHARGE` | Xuất viện | ADMIN | 1h | Hoàn tất thủ tục xuất viện |

### **API quản lý workflow**

```bash
# Khởi tạo workflow (tự động khi tạo InpatientStay)
POST /api/v1/inpatient-workflow/initialize/{inpatientStayId}

# Bắt đầu một bước
POST /api/v1/inpatient-workflow/steps/{stepId}/start

# Hoàn thành một bước
POST /api/v1/inpatient-workflow/steps/{stepId}/complete

# Bỏ qua một bước (với lý do)
POST /api/v1/inpatient-workflow/steps/{stepId}/skip?reason=...

# Xem chi tiết một bước
GET /api/v1/inpatient-workflow/steps/{stepId}
```

### **Workflow Step Statuses**

- `NOT_STARTED` - Chưa bắt đầu
- `IN_PROGRESS` - Đang thực hiện
- `COMPLETED` - Đã hoàn thành
- `SKIPPED` - Đã bỏ qua
- `OVERDUE` - Quá hạn

---

## 📋 GIAI ĐOẠN 6: ĐIỀU TRỊ NỘI TRÚ

### **6.1. Ghi chú điều dưỡng (Nursing Notes)**

#### **API Endpoint**
```
POST /api/v1/inpatient/nursing-notes/stays/{stayId}
```

#### **Quyền yêu cầu**
- `nursing.note.create`

#### **Tần suất**
Mỗi ca (MORNING / AFTERNOON / NIGHT)

#### **Request Body**

```json
{
  "noteDate": "2025-11-04",
  "shift": "MORNING",
  "vitalSigns": {
    "temperature": 37.2,
    "bloodPressure": "120/80",
    "heartRate": 75,
    "respiratoryRate": 18,
    "oxygenSaturation": 98
  },
  "generalCondition": "Bệnh nhân tỉnh táo, tiếp xúc tốt",
  "painLevel": 3,
  "nutritionIntake": "Ăn được 80% khẩu phần",
  "fluidIntake": 1500,
  "urineOutput": 1200,
  "skinCondition": "Da hồng, không loét",
  "mobilityStatus": "Đi lại được với hỗ trợ",
  "nursingInterventions": "Thay băng vết mổ, hướng dẫn vận động",
  "patientResponse": "Bệnh nhân hợp tác tốt",
  "additionalNotes": "Cần theo dõi sát vết mổ"
}
```

#### **Các API khác**

```bash
# Cập nhật nursing note
PUT /api/v1/inpatient/nursing-notes/{noteId}

# Xem chi tiết
GET /api/v1/inpatient/nursing-notes/{noteId}

# Tất cả notes của một inpatient stay
GET /api/v1/inpatient/nursing-notes/stays/{stayId}

# Notes theo ngày cụ thể
GET /api/v1/inpatient/nursing-notes/stays/{stayId}/date/{date}

# Notes theo ca
GET /api/v1/inpatient/nursing-notes/stays/{stayId}/shift/{shift}
```

---

### **6.2. Cho thuốc nội trú (Medication Administration)**

#### **API Endpoint**
```
POST /api/v1/inpatient/medications/{administrationId}/administer
```

#### **Quyền yêu cầu**
- `medication.administer`

#### **Request Body**

```json
{
  "administeredAt": "2025-11-04T08:00:00",
  "administeredDose": "500mg",
  "administrationRoute": "ORAL",
  "administrationSite": null,
  "administeredByEmployeeId": 45,
  "patientResponse": "Bệnh nhân uống thuốc tốt, không nôn",
  "adverseReaction": null,
  "notes": "Uống sau ăn sáng"
}
```

#### **Administration Routes**

- `ORAL` - Uống
- `IV` - Tiêm tĩnh mạch
- `IM` - Tiêm bắp
- `SC` - Tiêm dưới da
- `TOPICAL` - Bôi ngoài da
- `INHALATION` - Hít
- `RECTAL` - Đặt hậu môn
- `SUBLINGUAL` - Ngậm dưới lưỡi

#### **Medication Administration Statuses**

- `PENDING` - Chờ cho thuốc
- `GIVEN` - Đã cho
- `REFUSED` - Bệnh nhân từ chối
- `MISSED` - Bỏ lỡ
- `HELD` - Tạm ngưng

#### **Các API khác**

```bash
# Bệnh nhân từ chối thuốc
POST /api/v1/inpatient/medications/{administrationId}/refuse
Request: { "refusalReason": "Bệnh nhân nôn, không uống được" }

# Bỏ lỡ thuốc
POST /api/v1/inpatient/medications/{administrationId}/miss
Request: { "missedReason": "Bệnh nhân đi chụp X-quang" }

# Lịch thuốc hôm nay
GET /api/v1/inpatient/medications/stays/{stayId}/today

# Lịch thuốc theo ngày
GET /api/v1/inpatient/medications/stays/{stayId}/date/{date}

# Thuốc chờ cho (của y tá hiện tại)
GET /api/v1/inpatient/medications/nurse/pending

# Thuốc quá hạn
GET /api/v1/inpatient/medications/overdue
```

---

### **6.3. Đánh giá an toàn bệnh nhân (Patient Safety Assessment)**

#### **API Endpoint**
```
POST /api/patient-safety-assessments
```

#### **Quyền yêu cầu**
- `safety.assessment.create` HOẶC
- `nurse.inpatient`

#### **Request Body**

```json
{
  "inpatientStayId": 50,
  "assessmentType": "FALL_RISK",
  "assessmentDate": "2025-11-04T09:00:00",
  "riskLevel": "HIGH",
  "riskScore": 8,
  "assessmentDetails": {
    "age": "> 65 tuổi",
    "mobilityImpairment": "Đi lại khó khăn",
    "cognitiveImpairment": "Lú lẫn nhẹ",
    "medications": "Dùng thuốc an thần",
    "historyOfFalls": "Đã té 1 lần trong 6 tháng"
  },
  "interventions": [
    "Gắn thanh chắn giường",
    "Đèn báo gọi y tá trong tầm tay",
    "Kiểm tra mỗi 2 giờ",
    "Hướng dẫn gia đình hỗ trợ khi đi lại"
  ],
  "assessedByEmployeeId": 45,
  "nextAssessmentDue": "2025-11-05T09:00:00"
}
```

#### **Assessment Types**

| Type | Tên tiếng Việt | Mô tả |
|------|----------------|-------|
| `FALL_RISK` | Nguy cơ té ngã | Đánh giá nguy cơ té ngã của bệnh nhân |
| `PRESSURE_ULCER` | Nguy cơ loét do nằm lâu | Đánh giá nguy cơ loét da |
| `INFECTION_RISK` | Nguy cơ nhiễm trùng | Đánh giá nguy cơ nhiễm khuẩn |
| `SUICIDE_RISK` | Nguy cơ tự tử | Đánh giá sức khỏe tâm thần |
| `MEDICATION_SAFETY` | An toàn dùng thuốc | Đánh giá nguy cơ tác dụng phụ |
| `NUTRITION_RISK` | Nguy cơ suy dinh dưỡng | Đánh giá tình trạng dinh dưỡng |
| `DVT_RISK` | Nguy cơ huyết khối | Đánh giá nguy cơ huyết khối tĩnh mạch sâu |

#### **Risk Levels**

- `LOW` - Thấp (1-3 điểm)
- `MEDIUM` - Trung bình (4-6 điểm)
- `HIGH` - Cao (7-8 điểm)
- `CRITICAL` - Nguy kịch (9-10 điểm)

#### **Các API khác**

```bash
# Cập nhật đánh giá
PUT /api/patient-safety-assessments/{assessmentId}

# Xem chi tiết
GET /api/patient-safety-assessments/{assessmentId}

# Tất cả đánh giá của một inpatient stay
GET /api/patient-safety-assessments/stay/{stayId}

# Đánh giá theo loại
GET /api/patient-safety-assessments/stay/{stayId}/type/{assessmentType}

# Đánh giá theo mức độ nguy cơ
GET /api/patient-safety-assessments/stay/{stayId}/risk-level/{riskLevel}

# Đánh giá cần review (quá hạn)
GET /api/patient-safety-assessments/overdue
```

---

### **6.4. Chuyển giường (Bed Transfer)**

#### **API Endpoint**
```
POST /api/v1/inpatient/stays/{stayId}/transfer-bed
```

#### **Quyền yêu cầu**
- `bed.transfer`

#### **Request Body**

```json
{
  "newBedId": 20,
  "transferReason": "Chuyển sang phòng ICU do tình trạng xấu đi",
  "approvedByEmployeeId": 121,
  "transferNotes": "Bệnh nhân cần theo dõi sát hơn"
}
```

#### **Business Logic**

```java
// 1. Validate new bed is available
// 2. Validate new bed type matches patient requirements
// 3. Mark old bed for cleaning: OCCUPIED → NEEDS_CLEANING
// 4. Occupy new bed: AVAILABLE → OCCUPIED
// 5. Update InpatientStay.hospitalBedId
// 6. Create bed transfer history record
```

---

## 📋 GIAI ĐOẠN 7: XUẤT VIỆN

### **7.1. Lập kế hoạch xuất viện (Discharge Planning)**

#### **API Endpoint**
```
POST /api/v1/inpatient/stays/{stayId}/discharge-planning
```

#### **Quyền yêu cầu**
- `discharge.planning`

#### **Request Body**

```json
{
  "plannedDischargeDate": "2025-11-08T10:00:00",
  "dischargeDisposition": "HOME",
  "dischargeInstructions": "Nghỉ ngơi tại nhà 2 tuần, tránh vận động mạnh",
  "followUpInstructions": "Tái khám sau 1 tuần tại phòng khám ngoại",
  "medicationsOnDischarge": [
    "Paracetamol 500mg x 3 lần/ngày x 5 ngày",
    "Amoxicillin 500mg x 3 lần/ngày x 7 ngày"
  ],
  "dietaryRestrictions": "Ăn nhẹ, tránh đồ cay nóng, nhiều rau xanh",
  "activityRestrictions": "Không vận động mạnh, không mang vác nặng",
  "warningSignsToWatch": "Sốt cao > 38.5°C, đau bụng tăng, vết mổ sưng đỏ chảy mủ",
  "equipmentNeeded": null,
  "homeHealthServices": null,
  "transportationArranged": true,
  "patientEducationCompleted": true,
  "familyEducationCompleted": true
}
```

#### **Discharge Dispositions**

| Disposition | Tên tiếng Việt | Mô tả |
|-------------|----------------|-------|
| `HOME` | Về nhà | Bệnh nhân về nhà, tự chăm sóc |
| `HOME_WITH_SERVICES` | Về nhà có chăm sóc | Về nhà với dịch vụ chăm sóc tại nhà |
| `TRANSFER_TO_FACILITY` | Chuyển viện khác | Chuyển sang bệnh viện/cơ sở khác |
| `REHABILITATION` | Phục hồi chức năng | Chuyển sang trung tâm phục hồi |
| `NURSING_HOME` | Viện dưỡng lão | Chuyển sang viện dưỡng lão |
| `EXPIRED` | Tử vong | Bệnh nhân tử vong |
| `AGAINST_MEDICAL_ADVICE` | Xin về | Bệnh nhân xin về dù chưa khỏi |

#### **Các API khác**

```bash
# Cập nhật kế hoạch xuất viện
PUT /api/v1/inpatient/discharge-planning/{planId}

# Phê duyệt kế hoạch xuất viện
POST /api/v1/inpatient/discharge-planning/{planId}/approve

# Xem kế hoạch xuất viện của inpatient stay
GET /api/v1/inpatient/stays/{stayId}/discharge-planning

# Xem chi tiết kế hoạch
GET /api/v1/inpatient/discharge-planning/{planId}
```

---

### **7.2. Thực hiện xuất viện (Discharge)**

#### **API Endpoint**
```
POST /api/v1/inpatient/stays/{stayId}/discharge
```

#### **Quyền yêu cầu**
- `inpatient.discharge`

#### **Request Body**

```json
{
  "dischargeDate": "2025-11-08T10:00:00",
  "dischargeDiagnosis": "Viêm ruột thừa cấp đã phẫu thuật, hồi phục tốt",
  "dischargeNotes": "Bệnh nhân hồi phục tốt, vết mổ liền tốt, không sốt, ăn uống bình thường",
  "dischargeDisposition": "HOME",
  "dischargedByEmployeeId": 121
}
```

#### **Hệ thống tự động thực hiện**

```java
// 1. Update InpatientStay
inpatientStay.setDischargeDate(dischargeDate);
inpatientStay.setCurrentStatus(InpatientStatus.DISCHARGED);
inpatientStay.setDischargeDiagnosis(dischargeDiagnosis);

// 2. Mark bed for housekeeping: OCCUPIED → NEEDS_CLEANING
bed.markNeedsCleaning();
hospitalBedRepository.save(bed);
log.info("🧹 Bed marked for cleaning (OCCUPIED → NEEDS_CLEANING)");

// 3. Update Encounter: IN_PROGRESS → CLOSED
encounter.setStatus("CLOSED");
encounter.setEndDatetime(dischargeDate);
encounter.setDisposition(dischargeCondition);
encounterRepository.save(encounter);

// 4. Complete all remaining workflow steps
inpatientWorkflowStatusService.completeAllRemainingSteps(stayId);

// 5. Calculate total length of stay
int lengthOfStay = calculateLengthOfStay(admissionDate, dischargeDate);
inpatientStay.setLengthOfStay(lengthOfStay);
```

#### **Trạng thái sau xuất viện**

- **InpatientStay Status:** `ACTIVE` → `DISCHARGED`
- **Bed Status:** `OCCUPIED` → `NEEDS_CLEANING` (sau đó → `CLEANING` → `AVAILABLE`)
- **Encounter Status:** `IN_PROGRESS` → `CLOSED`
- **Workflow Steps:** Tất cả → `COMPLETED`

---

## 📊 CÁC API THỐNG KÊ & QUẢN LÝ

### **Danh sách bệnh nhân nội trú**

```bash
# Tất cả bệnh nhân đang nội trú
GET /api/v1/inpatient/stays/active

# Chi tiết một inpatient stay
GET /api/v1/inpatient/stays/{stayId}

# Bệnh nhân nội trú theo khoa
GET /api/v1/inpatient/departments/{departmentId}/stays

# Bệnh nhân nội trú theo bác sĩ
GET /api/v1/inpatient/doctors/{doctorId}/stays

# Lịch sử nội trú của bệnh nhân
GET /api/v1/inpatient/patients/{patientId}/history

# Bệnh nhân sắp xuất viện (trong 24h)
GET /api/v1/inpatient/stays/upcoming-discharges

# Bệnh nhân nằm viện lâu (> 14 ngày)
GET /api/v1/inpatient/stays/long-stay
```

### **Thống kê giường bệnh**

```bash
# Tổng quan công suất giường
GET /api/v1/bed-management/stats/occupancy
Response:
{
  "totalBeds": 200,
  "occupiedBeds": 150,
  "availableBeds": 45,
  "reservedBeds": 5,
  "occupancyRate": 75.0,
  "availabilityRate": 22.5
}

# Công suất theo khoa
GET /api/v1/bed-management/stats/occupancy/department/{departmentId}

# Công suất theo loại giường
GET /api/v1/bed-management/stats/occupancy/type/{bedType}

# Lịch sử sử dụng giường
GET /api/v1/bed-management/beds/{bedId}/history
```

### **Thống kê yêu cầu nhập viện**

```bash
# Thống kê tổng quan
GET /api/v1/admission-requests/statistics?startDate=2025-11-01

Response:
{
  "byTypeAndStatus": {
    "EMERGENCY": {
      "PENDING": 5,
      "APPROVED": 3,
      "ADMITTED": 20
    },
    "ELECTIVE": {
      "PENDING": 10,
      "APPROVED": 8,
      "ADMITTED": 15
    }
  },
  "averageWaitTime": {
    "EMERGENCY": 2.5,
    "ELECTIVE": 24.0
  },
  "pendingCount": 15
}

# Đếm theo trạng thái
GET /api/v1/admission-requests/count/status/{status}

# Đếm theo loại
GET /api/v1/admission-requests/count/type/{admissionType}
```

---

## 🎯 SƠ ĐỒ LUỒNG HOÀN CHỈNH

```
┌─────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 1: TẠO YÊU CẦU NHẬP VIỆN                              │
│ POST /api/v1/admission-requests                                 │
│ - Bác sĩ tạo yêu cầu từ encounter OUTPATIENT                    │
│ - Validation: 7 bước kiểm tra                                   │
│ - Status: PENDING                                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 2: PHÊ DUYỆT                                          │
│ POST /api/v1/admission-requests/{id}/approve                    │
│ - Trưởng khoa phê duyệt                                         │
│ - Status: PENDING → APPROVED                                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 3: GÁN GIƯỜNG                                         │
│ POST /api/v1/admission-requests/{id}/assign-bed                 │
│ - Điều dưỡng trưởng gán giường                                  │
│ - Validation: 5 bước (bed type, ICU, isolation, gender, etc.)   │
│ - Bed Status: AVAILABLE → RESERVED                              │
│ - Status: APPROVED → BED_ASSIGNED                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 4: HOÀN TẤT NHẬP VIỆN (CRITICAL!)                     │
│ POST /api/v1/admission-requests/{id}/complete                   │
│ - Validation: Pre-admission checklist (3 yêu cầu)               │
│ - Status: BED_ASSIGNED → ADMITTED                               │
│                                                                 │
│ 🔴 TỰ ĐỘNG TẠO INPATIENT STAY:                                  │
│   1. Encounter: OUTPATIENT → INPATIENT                          │
│   2. Encounter Status: → IN_PROGRESS                            │
│   3. Bed: RESERVED → OCCUPIED                                   │
│   4. Tạo InpatientStay record (Status: ACTIVE)                  │
│   5. Khởi tạo 9 workflow steps                                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 5: WORKFLOW TRACKING (9 BƯỚC)                         │
│                                                                 │
│ 1. ADMISSION (ADMIN, 1h)                                        │
│    POST /api/v1/inpatient-workflow/steps/{id}/start            │
│    POST /api/v1/inpatient-workflow/steps/{id}/complete         │
│                                                                 │
│ 2. INITIAL_ASSESSMENT (DOCTOR, 2h)                              │
│ 3. SAFETY_ASSESSMENT (NURSE, 1h)                                │
│ 4. TREATMENT_PLANNING (DOCTOR, 3h)                              │
│ 5. TREATMENT_EXECUTION (NURSE, liên tục)                        │
│ 6. DAILY_ROUNDS (DOCTOR, hàng ngày)                             │
│ 7. PROGRESS_EVALUATION (DOCTOR, 2h)                             │
│ 8. DISCHARGE_PLANNING (DOCTOR, 2h)                              │
│ 9. DISCHARGE (ADMIN, 1h)                                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 6: ĐIỀU TRỊ NỘI TRÚ                                   │
│                                                                 │
│ 6.1. Nursing Notes (mỗi ca: MORNING/AFTERNOON/NIGHT)            │
│      POST /api/v1/inpatient/nursing-notes/stays/{id}            │
│      - Ghi nhận vital signs, tình trạng bệnh nhân               │
│      - Ghi nhận can thiệp điều dưỡng                            │
│                                                                 │
│ 6.2. Medication Administration                                 │
│      POST /api/v1/inpatient/medications/{id}/administer         │
│      - Cho thuốc theo lịch                                      │
│      - Ghi nhận phản ứng bệnh nhân                              │
│                                                                 │
│ 6.3. Safety Assessment                                         │
│      POST /api/patient-safety-assessments                       │
│      - Đánh giá nguy cơ (té ngã, loét, nhiễm trùng, v.v.)       │
│      - Lập kế hoạch can thiệp                                   │
│                                                                 │
│ 6.4. Bed Transfer (nếu cần)                                     │
│      POST /api/v1/inpatient/stays/{id}/transfer-bed             │
│      - Chuyển giường/phòng khi cần thiết                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 7: XUẤT VIỆN                                          │
│                                                                 │
│ 7.1. Lập kế hoạch xuất viện                                     │
│      POST /api/v1/inpatient/stays/{id}/discharge-planning       │
│      - Ngày xuất viện dự kiến                                   │
│      - Hướng dẫn chăm sóc tại nhà                               │
│      - Đơn thuốc về nhà                                         │
│      - Lịch tái khám                                            │
│                                                                 │
│ 7.2. Phê duyệt kế hoạch                                         │
│      POST /api/v1/inpatient/discharge-planning/{id}/approve     │
│                                                                 │
│ 7.3. Thực hiện xuất viện                                        │
│      POST /api/v1/inpatient/stays/{id}/discharge                │
│      - InpatientStay: ACTIVE → DISCHARGED                       │
│      - Bed: OCCUPIED → NEEDS_CLEANING                           │
│      - Encounter: IN_PROGRESS → CLOSED                          │
│      - Workflow: Tất cả steps → COMPLETED                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📝 BẢNG TỔNG HỢP PERMISSIONS

| Permission | Mô tả | Roles thường có |
|------------|-------|-----------------|
| `admission.create` | Tạo yêu cầu nhập viện | DOCTOR |
| `doctor.admission` | Bác sĩ tạo yêu cầu nhập viện | DOCTOR |
| `admission.approve` | Phê duyệt yêu cầu nhập viện | DEPARTMENT_HEAD |
| `department.head` | Quyền trưởng khoa | DEPARTMENT_HEAD |
| `admission.assign.bed` | Gán giường bệnh | NURSE_HEAD, ADMIN |
| `nurse.head` | Quyền điều dưỡng trưởng | NURSE_HEAD |
| `admission.complete` | Hoàn tất nhập viện | ADMIN, NURSE |
| `admission.view` | Xem yêu cầu nhập viện | DOCTOR, NURSE, ADMIN |
| `emergency.view` | Xem yêu cầu cấp cứu | DOCTOR, NURSE, ADMIN |
| `bed.view` | Xem thông tin giường | NURSE, ADMIN |
| `bed.assign` | Gán giường | NURSE_HEAD, ADMIN |
| `bed.transfer` | Chuyển giường | NURSE, ADMIN |
| `inpatient.admit` | Nhập viện bệnh nhân | ADMIN, NURSE |
| `inpatient.view` | Xem thông tin nội trú | DOCTOR, NURSE, ADMIN |
| `inpatient.discharge` | Xuất viện bệnh nhân | DOCTOR, ADMIN |
| `inpatient.manage` | Quản lý nội trú | ADMIN |
| `inpatient.workflow.create` | Tạo workflow | SYSTEM |
| `inpatient.workflow.update` | Cập nhật workflow | DOCTOR, NURSE, ADMIN |
| `inpatient.workflow.view` | Xem workflow | DOCTOR, NURSE, ADMIN |
| `nursing.note.create` | Tạo ghi chú điều dưỡng | NURSE |
| `nursing.note.update` | Cập nhật ghi chú điều dưỡng | NURSE |
| `nursing.note.view` | Xem ghi chú điều dưỡng | DOCTOR, NURSE, ADMIN |
| `nurse.inpatient` | Y tá nội trú | NURSE |
| `safety.assessment.create` | Tạo đánh giá an toàn | NURSE |
| `safety.assessment.update` | Cập nhật đánh giá an toàn | NURSE |
| `safety.assessment.view` | Xem đánh giá an toàn | DOCTOR, NURSE, ADMIN |
| `medication.administer` | Cho thuốc | NURSE |
| `medication.view` | Xem lịch thuốc | DOCTOR, NURSE, PHARMACIST |
| `discharge.planning` | Lập kế hoạch xuất viện | DOCTOR |
| `discharge.view` | Xem kế hoạch xuất viện | DOCTOR, NURSE, ADMIN |

---

## 🔄 BẢNG TỔNG HỢP STATUS TRANSITIONS

### **AdmissionRequest Status Flow**

```
PENDING (Chờ duyệt)
    ↓ approve
APPROVED (Đã duyệt)
    ↓ assign-bed
BED_ASSIGNED (Đã gán giường)
    ↓ complete
ADMITTED (Đã nhập viện)

Alternative flows:
PENDING/APPROVED/BED_ASSIGNED → reject → REJECTED (Từ chối)
PENDING/APPROVED/BED_ASSIGNED → cancel → CANCELLED (Hủy bỏ)
```

### **Bed Status Flow**

```
AVAILABLE (Trống)
    ↓ reserve (khi assign-bed)
RESERVED (Đặt trước)
    ↓ occupy (khi complete admission)
OCCUPIED (Đang sử dụng)
    ↓ markNeedsCleaning (khi discharge)
NEEDS_CLEANING (Cần dọn dẹp)
    ↓ startCleaning (housekeeping bắt đầu)
CLEANING (Đang dọn dẹp)
    ↓ completeCleaning (housekeeping hoàn tất)
AVAILABLE (Trống)

Alternative flows:
RESERVED → makeAvailable (khi reject/cancel admission)
OCCUPIED → MAINTENANCE (Bảo trì)
MAINTENANCE → AVAILABLE
AVAILABLE → OUT_OF_ORDER (Hỏng hóc)
OUT_OF_ORDER → MAINTENANCE → AVAILABLE
```

### **InpatientStay Status Flow**

```
ACTIVE (Đang nội trú)
    ↓ discharge
DISCHARGED (Đã xuất viện)

Alternative flows:
ACTIVE → TRANSFERRED (Chuyển viện)
ACTIVE → EXPIRED (Tử vong)
```

### **Encounter Status Flow (trong luồng nội trú)**

```
OPEN/IN_PROGRESS (Ngoại trú)
    ↓ complete admission
IN_PROGRESS (Nội trú)
    ↓ discharge
CLOSED (Đã đóng)
```

### **Workflow Step Status Flow**

```
NOT_STARTED (Chưa bắt đầu)
    ↓ start
IN_PROGRESS (Đang thực hiện)
    ↓ complete
COMPLETED (Đã hoàn thành)

Alternative flow:
NOT_STARTED/IN_PROGRESS → skip → SKIPPED (Bỏ qua)
```

---

## 💡 LƯU Ý QUAN TRỌNG

### **1. Transaction Management**

Tất cả các API quan trọng đều sử dụng `@Transactional` để đảm bảo tính toàn vẹn dữ liệu:

```java
@Transactional
public AdmissionRequestResponse completeAdmission(Integer admissionRequestId, Integer employeeId) {
    // Nếu có lỗi ở bất kỳ bước nào, tất cả thay đổi sẽ được rollback
}
```

### **2. Pessimistic Locking**

Khi gán giường, hệ thống sử dụng **pessimistic lock** để ngăn 2 người gán cùng 1 giường:

```java
HospitalBed bed = hospitalBedRepository.findByIdWithLock(bedId)
        .orElseThrow(() -> new RuntimeException("Bed not found"));
```

### **3. Soft Delete**

Tất cả các entity đều hỗ trợ **soft delete** (không xóa vật lý):

```java
admissionRequest.softDelete();  // Set deleted_at = NOW()
admissionRequest.restore();     // Set deleted_at = NULL
```

### **4. Audit Trail**

Tất cả thay đổi đều được ghi nhận:

- `created_at`, `created_by_employee_id`
- `updated_at`, `updated_by_employee_id`
- `deleted_at`

### **5. Optimistic Locking**

Sử dụng `@Version` để ngăn concurrent updates:

```java
@Version
private Integer version;
```

### **6. Validation Layers**

Hệ thống có 3 lớp validation:

1. **Bean Validation** (`@NotNull`, `@NotBlank`, etc.)
2. **Business Logic Validation** (trong Service layer)
3. **Database Constraints** (CHECK, FOREIGN KEY, UNIQUE)

---

## 🎯 BEST PRACTICES

### **1. Luôn kiểm tra Pre-admission Checklist**

Trước khi hoàn tất nhập viện, đảm bảo:
- ✅ Pre-admission checklist completed
- ✅ Insurance verified
- ✅ Consent form signed

### **2. Workflow Tracking**

- Bắt đầu workflow step trước khi thực hiện
- Hoàn thành workflow step sau khi xong
- Ghi rõ lý do nếu bỏ qua step

### **3. Nursing Notes**

- Ghi chú **MỖI CA** (MORNING/AFTERNOON/NIGHT)
- Ghi đầy đủ vital signs
- Ghi rõ can thiệp và phản ứng bệnh nhân

### **4. Medication Administration**

- Kiểm tra "5 đúng": Đúng người, đúng thuốc, đúng liều, đúng đường, đúng giờ
- Ghi nhận phản ứng bệnh nhân
- Báo cáo ngay nếu có tác dụng phụ

### **5. Safety Assessment**

- Đánh giá ngay khi nhập viện
- Đánh giá lại định kỳ (mỗi 24-48h)
- Đánh giá lại khi có thay đổi tình trạng

### **6. Discharge Planning**

- Bắt đầu lập kế hoạch sớm (ngay từ ngày 2-3)
- Giáo dục bệnh nhân và gia đình
- Đảm bảo có đơn thuốc về nhà
- Đặt lịch tái khám

---

## 📞 SUPPORT

Nếu có vấn đề khi sử dụng API, kiểm tra:

1. **Permissions** - Đảm bảo user có quyền cần thiết
2. **Status** - Đảm bảo entity ở đúng trạng thái
3. **Validation** - Kiểm tra request body đầy đủ và hợp lệ
4. **Logs** - Xem server logs để biết lỗi chi tiết

---

## 📝 TÓM TẮT LUỒNG TỪ NGOẠI TRÚ ĐẾN NỘI TRÚ

### **Câu hỏi thường gặp**

#### **1. Khi nào encounter chuyển từ OUTPATIENT sang INPATIENT?**

**Trả lời:** Encounter chỉ chuyển từ OUTPATIENT → INPATIENT khi **điều dưỡng thực hiện "Complete Admission"** (POST `/api/v1/admission-requests/{id}/complete`).

**Trước đó:**
- Tạo admission request → Encounter vẫn là OUTPATIENT
- Phê duyệt admission request → Encounter vẫn là OUTPATIENT
- Gán giường → Encounter vẫn là OUTPATIENT

**Sau khi complete admission:**
- Encounter type: OUTPATIENT → **INPATIENT**
- Encounter status: → **IN_PROGRESS**
- Bed status: RESERVED → **OCCUPIED**
- Tự động tạo **InpatientStay**
- Khởi tạo **9 workflow steps**

---

#### **2. Bác sĩ có thể tạo admission request khi nào?**

**Trả lời:** Bác sĩ có thể tạo admission request khi:

✅ **Encounter type = OUTPATIENT**
✅ **Encounter status = OPEN hoặc IN_PROGRESS** (chưa hoàn thành khám)
✅ **Chưa có admission request active cho encounter này**
✅ **Chưa có inpatient stay cho encounter này**

**Lưu ý:** Hệ thống chỉ cho phép tạo admission request khi encounter đang OPEN hoặc IN_PROGRESS, không cho phép khi đã FINISHED.

---

#### **3. Luồng hoàn chỉnh từ đầu đến cuối là gì?**

```
1. Bệnh nhân check-in
   → POST /api/v1/encounters/{id}/checkin
   → Encounter: PLANNED → ARRIVED

2. Bác sĩ bắt đầu khám (tự động)
   → Khi tạo clinical note hoặc prescription
   → Encounter: ARRIVED → IN_PROGRESS

3. Bác sĩ ký bệnh án
   → POST /api/v1/clinical-notes/{id}/sign
   → Clinical Note: DRAFT → SIGNED
   → Encounter: IN_PROGRESS → FINISHED

4. Bác sĩ tạo yêu cầu nhập viện
   → POST /api/v1/admission-requests
   → AdmissionRequest: → PENDING
   → Encounter vẫn là OUTPATIENT

5. Trưởng khoa phê duyệt
   → POST /api/v1/admission-requests/{id}/approve
   → AdmissionRequest: PENDING → APPROVED
   → Encounter vẫn là OUTPATIENT

6. Điều dưỡng gán giường
   → POST /api/v1/admission-requests/{id}/assign-bed
   → AdmissionRequest: APPROVED → BED_ASSIGNED
   → Bed: AVAILABLE → RESERVED
   → Encounter vẫn là OUTPATIENT

7. Điều dưỡng hoàn tất nhập viện (CRITICAL!)
   → POST /api/v1/admission-requests/{id}/complete
   → AdmissionRequest: BED_ASSIGNED → ADMITTED
   → Encounter: OUTPATIENT → INPATIENT ⭐
   → Encounter status: → IN_PROGRESS
   → Bed: RESERVED → OCCUPIED
   → Tự động tạo InpatientStay
   → Khởi tạo 9 workflow steps

8. Điều trị nội trú
   → Nursing notes, medications, safety assessments
   → Theo dõi 9 workflow steps

9. Xuất viện
   → POST /api/v1/inpatient/stays/{stayId}/discharge
   → InpatientStay: ACTIVE → DISCHARGED
   → Bed: OCCUPIED → NEEDS_CLEANING
   → Encounter: IN_PROGRESS → CLOSED
```

---

#### **4. Tại sao phải có 3 bước validation trước khi complete admission?**

**Trả lời:** Đây là yêu cầu của **HIS quốc tế** (Epic, Cerner) để đảm bảo an toàn bệnh nhân:

1. **Pre-admission checklist completed** - Đảm bảo đã kiểm tra đầy đủ (tiền sử bệnh, dị ứng, thuốc đang dùng, v.v.)
2. **Insurance verified** - Xác nhận bảo hiểm để tránh tranh chấp thanh toán
3. **Consent form signed** - Bệnh nhân/người nhà đã ký đồng ý điều trị

Nếu thiếu bất kỳ bước nào → **Không được phép complete admission** → Hệ thống throw exception.

---

#### **5. Bed reservation có hết hạn không?**

**Trả lời:** Có! Bed reservation có **TTL 30 phút**.

- Khi gán giường → Bed status: AVAILABLE → RESERVED
- Scheduler chạy mỗi **5 phút** để kiểm tra
- Nếu sau **30 phút** mà chưa complete admission → **Tự động hủy reservation**
- Bed status: RESERVED → AVAILABLE
- AdmissionRequest status: BED_ASSIGNED → APPROVED (để gán lại giường khác)

**Lý do:** Tránh giường bị "lock" vô thời hạn khi điều dưỡng quên complete admission.

---

#### **6. Có thể hủy admission request không?**

**Trả lời:** Có! Có 2 cách:

1. **Reject (từ chối)** - Trưởng khoa từ chối yêu cầu
   ```
   POST /api/v1/admission-requests/{id}/reject
   ```
   - Nếu đã gán giường → Tự động giải phóng giường (RESERVED → AVAILABLE)
   - Status: → REJECTED

2. **Cancel (hủy)** - Bác sĩ hoặc admin hủy yêu cầu
   ```
   POST /api/v1/admission-requests/{id}/cancel
   ```
   - Nếu đã gán giường → Tự động giải phóng giường (RESERVED → AVAILABLE)
   - Status: → CANCELLED

---

#### **7. Làm sao biết encounter đã có admission request chưa?**

**Trả lời:** Dùng API:

```
GET /api/v1/admission-requests/encounter/{encounterId}
```

Nếu có → Trả về admission request
Nếu không → Trả về 404 Not Found

---

#### **8. Có thể tạo nhiều admission request cho cùng 1 encounter không?**

**Trả lời:** **KHÔNG!** Hệ thống validate:

```java
// ✅ 5. Validate no duplicate admission request for same encounter
Optional<AdmissionRequest> existingRequest = admissionRequestRepository.findByEncounterId(encounterId);
if (existingRequest.isPresent() &&
    !existingRequest.get().isCompleted() &&
    !existingRequest.get().isRejected() &&
    !existingRequest.get().isCancelled()) {
    throw new RuntimeException("Active admission request already exists");
}
```

**Chỉ được tạo mới nếu:**
- Chưa có admission request nào, HOẶC
- Admission request cũ đã COMPLETED/REJECTED/CANCELLED

---

## 🧹 HOUSEKEEPING WORKFLOW (BED CLEANING)

### **Tại sao cần Housekeeping Workflow?**

Theo chuẩn **Infection Prevention and Control (IPC)** và **JCI/ISO 9001**, giường bệnh PHẢI được dọn dẹp và khử trùng sau mỗi lần xuất viện hoặc chuyển giường để:

1. **Ngăn ngừa nhiễm khuẩn bệnh viện (HAI - Hospital-Acquired Infection)**
2. **Tuân thủ quy định y tế** (Bộ Y tế, JCI, ISO)
3. **Theo dõi bed turnaround time** (KPI quan trọng)
4. **Đảm bảo an toàn bệnh nhân**

### **Bed Cleaning Workflow**

```
OCCUPIED (Bệnh nhân đang nằm)
    ↓ Xuất viện hoặc chuyển giường
NEEDS_CLEANING (Cần dọn dẹp)
    ↓ Housekeeping nhận nhiệm vụ
CLEANING (Đang dọn dẹp)
    ↓ Hoàn tất dọn dẹp + khử trùng
AVAILABLE (Sẵn sàng cho bệnh nhân mới)
```

### **API Housekeeping**

```bash
# 1. Bắt đầu dọn dẹp giường
POST /api/v1/bed-management/beds/{bedId}/start-cleaning
Request: { "housekeeperId": 789 }

# 2. Hoàn tất dọn dẹp
POST /api/v1/bed-management/beds/{bedId}/complete-cleaning
Request: { "housekeeperId": 789 }

# 3. Danh sách giường cần dọn
GET /api/v1/bed-management/beds/needs-cleaning

# 4. Danh sách giường đang dọn
GET /api/v1/bed-management/beds/cleaning

# 5. Thống kê bed turnaround time
GET /api/v1/bed-management/stats/turnaround-time
```

### **Business Logic**

```java
// Khi xuất viện
bed.markNeedsCleaning();  // OCCUPIED → NEEDS_CLEANING
bed.setCleanedAt(null);   // Reset cleaned timestamp

// Khi bắt đầu dọn
bed.startCleaning();      // NEEDS_CLEANING → CLEANING

// Khi hoàn tất dọn
bed.completeCleaning();   // CLEANING → AVAILABLE
bed.setCleanedAt(LocalDateTime.now());  // Ghi nhận thời gian hoàn tất
```

### **Bed Turnaround Time KPI**

**Công thức:**
```
Bed Turnaround Time = cleanedAt - dischargeDate
```

**Mục tiêu:**
- **Giường thường:** < 2 giờ
- **Giường ICU:** < 1 giờ
- **Giường cách ly:** < 3 giờ (cần khử trùng kỹ hơn)

### **Lợi ích của Housekeeping Workflow**

1. ✅ **Tuân thủ IPC:** Ngăn ngừa nhiễm khuẩn chéo
2. ✅ **Tracking KPI:** Theo dõi hiệu suất dọn dẹp
3. ✅ **Tối ưu công suất:** Biết chính xác giường nào sẵn sàng
4. ✅ **Compliance:** Đáp ứng JCI, ISO, Bộ Y tế
5. ✅ **Trách nhiệm rõ ràng:** Biết ai dọn giường nào, khi nào

---

## 🔄 SO SÁNH VỚI HỆ THỐNG KHÁC

### **Hệ thống CŨ (không có housekeeping)**

```
OCCUPIED → makeAvailable() → AVAILABLE
```

**Vấn đề:**
- ❌ Không biết giường đã dọn chưa
- ❌ Nguy cơ nhiễm khuẩn cao
- ❌ Không tracking được bed turnaround time
- ❌ Không tuân thủ IPC

### **Hệ thống MỚI (có housekeeping)**

```
OCCUPIED → markNeedsCleaning() → NEEDS_CLEANING → startCleaning() → CLEANING → completeCleaning() → AVAILABLE
```

**Lợi ích:**
- ✅ Đảm bảo giường được dọn trước khi gán
- ✅ Tracking đầy đủ
- ✅ Tuân thủ IPC
- ✅ Có KPI bed turnaround time

---

**Tài liệu này được tạo dựa trên phân tích code thực tế và best practices từ Epic EMR, Cerner Millennium, Oracle Health.**

**Phiên bản:** 2.1
**Ngày cập nhật:** 2025-11-05
**Tác giả:** Hospital Management System Team
**Cập nhật:** Đồng bộ với code thực tế, bổ sung housekeeping workflow



