# BÁO CÁO PHÂN TÍCH PHÂN HỆ CẤP CỨU (Emergency Subsystem)

## 📋 TỔNG QUAN

Phân hệ cấp cứu của hệ thống HIS (Hospital Information System) được thiết kế để quản lý toàn bộ quy trình cấp cứu từ khi bệnh nhân đến khoa cấp cứu cho đến khi xuất viện/nhập viện/chuyển viện.

---

## 🏗️ CẤU TRÚC PHÂN HỆ

### 1. Controllers (5 controllers)

| Controller | Endpoint Base | Mô tả |
|------------|---------------|-------|
| `EmergencyEncounterController` | `/api/v1/emergency/encounters` | Quản lý lượt cấp cứu, triage, workflow |
| `EmergencyConsultationController` | `/api/v1/emergency-consultations` | Quản lý hội chẩn cấp cứu |
| `EmergencyDiagnosticOrderController` | `/api/v1/emergency/diagnostic-orders` | Quản lý chỉ định xét nghiệm/CĐHA cấp cứu |
| `EmergencyProtocolController` | `/api/v1/emergency/protocols` | Quản lý quy trình cấp cứu đặc biệt |
| `EmergencyBillingController` | `/api/v1/emergency/billing` | Quản lý thanh toán, tạm ứng, quyết toán cấp cứu |

### 2. Services (5 service interfaces)

| Service | Chức năng chính |
|---------|-----------------|
| `EmergencyEncounterService` | CRUD, workflow, statistics cho lượt cấp cứu |
| `EmergencyConsultationService` | Quản lý hội chẩn, theo dõi tái khám |
| `EmergencyDiagnosticOrderService` | Quản lý chỉ định XN/CĐHA, theo dõi TAT |
| `EmergencyProtocolService` | Kích hoạt/giải quyết quy trình cấp cứu |
| `EmergencyBillingService` | Tạm ứng, tích lũy chi phí, quyết toán, hoàn tiền |

### 3. Models (6 entities/enums)

| Model | Loại | Mô tả |
|-------|------|-------|
| `EmergencyEncounter` | Entity | Lượt cấp cứu chính (436 lines, rich domain model) |
| `EmergencyConsultation` | Entity | Hội chẩn cấp cứu (236 lines) |
| `EmergencyDiagnosticOrder` | Entity | Chỉ định xét nghiệm/CĐHA (290 lines) |
| `EmergencyProtocol` | Entity | Quy trình cấp cứu đặc biệt (128 lines) |
| `EmergencyCategory` | Enum | Phân loại mức độ cấp cứu (5 levels) |
| `EmergencyStatus` | Enum | Trạng thái lượt cấp cứu (12 statuses) |

### 4. Billing Fields trong EmergencyEncounter

| Field | Type | Mô tả |
|-------|------|-------|
| `hasInsurance` | Boolean | Có BHYT không |
| `insuranceCardNumber` | String | Số thẻ BHYT |
| `insuranceCoveragePercent` | Integer | % BHYT chi trả (mặc định 100% cho cấp cứu) |
| `billingType` | String | INSURANCE / SELF_PAY / EXEMPTION |
| `invoiceId` | Integer | Link đến hóa đơn |

---

## 📊 CHI TIẾT TỪNG THÀNH PHẦN

### 1. EmergencyEncounter (Lượt cấp cứu)

#### Phân loại cấp cứu (EmergencyCategory) - Theo chuẩn quốc tế:

| Level | Tên | Màu | Thời gian chờ tối đa |
|-------|-----|-----|---------------------|
| 1 | RESUSCITATION (Hồi sức) | 🔴 RED | 0 phút (ngay lập tức) |
| 2 | EMERGENCY (Cấp cứu khẩn) | 🟠 ORANGE | 10 phút |
| 3 | URGENT (Khẩn cấp) | 🟡 YELLOW | 30 phút |
| 4 | SEMI_URGENT (Bán khẩn) | 🟢 GREEN | 60 phút |
| 5 | NON_URGENT (Không khẩn) | 🔵 BLUE | 120 phút |

#### Trạng thái lượt cấp cứu (EmergencyStatus):

```
WAITING_TRIAGE → IN_TRIAGE → WAITING_DOCTOR → IN_EXAMINATION 
    → WAITING_RESULTS → IN_TREATMENT → READY_DISCHARGE 
    → DISCHARGED / ADMITTED / TRANSFERRED / LEFT_WITHOUT_SEEN / DECEASED
```

#### APIs chính (29 APIs):

**CRUD Operations (4 APIs):**
- `POST /api/v1/emergency/encounters` - Tạo lượt cấp cứu
- `PUT /api/v1/emergency/encounters/{id}` - Cập nhật
- `GET /api/v1/emergency/encounters/{id}` - Lấy theo ID
- `GET /api/v1/emergency/encounters/encounter/{encounterId}` - Lấy theo encounter ID

**Query Operations (13 APIs):**
- `GET /active` - Lượt cấp cứu đang hoạt động
- `GET /life-threatening` - Ca đe dọa tính mạng
- `GET /waiting-triage` - Hàng đợi chờ phân loại
- `GET /waiting-doctor` - Hàng đợi chờ bác sĩ
- `GET /category/{category}` - Theo phân loại
- `GET /status/{status}` - Theo trạng thái
- `GET /severe-pain` - Đau nặng (pain score >= 7)
- `GET /excessive-wait` - Chờ quá lâu
- `GET /nurse/{nurseId}` - Theo điều dưỡng
- `GET /doctor/{doctorId}` - Theo bác sĩ
- `GET /recent-discharges` - Xuất viện gần đây
- `GET /recent-admissions` - Nhập viện gần đây
- `GET /search?query=` - Tìm kiếm

**Workflow Operations (7 APIs):**
- `PUT /{id}/assign-nurse` - Phân công điều dưỡng triage
- `PUT /{id}/assign-doctor` - Phân công bác sĩ
- `PUT /{id}/complete-triage` - Hoàn thành triage
- `PUT /{id}/status` - Cập nhật trạng thái
- `PUT /{id}/discharge` - Xuất viện
- `POST /{id}/admit` - **Nhập viện nội trú (Full workflow với AdmissionRequest)**
- `PUT /{id}/transfer` - Chuyển viện

**Emergency → Inpatient Workflow (admitPatient):**
```
1. Validate EmergencyEncounter (không được DISCHARGED/ADMITTED/TRANSFERRED)
2. Tạo AdmissionRequest (type=EMERGENCY, priority=1)
3. Auto-approve (emergency bypass)
4. Financial clearance (INSURANCE nếu có BHYT, EXEMPTION nếu không)
5. Assign bed (nếu có preferredBedId)
6. Complete admission → Tạo InpatientStay
7. Update Encounter.type: EMERGENCY → INPATIENT
8. Update EmergencyEncounter.status → ADMITTED
```

**Statistics (5 APIs):**
- `GET /statistics` - Thống kê tổng hợp
- `GET /dashboard` - Dữ liệu dashboard
- `GET /count/active` - Đếm đang hoạt động
- `GET /count/category/{category}` - Đếm theo phân loại
- `GET /count/status/{status}` - Đếm theo trạng thái

---

### 2. EmergencyConsultation (Hội chẩn cấp cứu)

#### Chức năng:
- Bác sĩ cấp cứu yêu cầu hội chẩn chuyên khoa
- Ghi nhận khuyến cáo theo dõi sau cấp cứu
- Tạo lịch hẹn tái khám tự động
- Cảnh báo dấu hiệu nguy hiểm cần quay lại

#### APIs chính (12 APIs):
- `POST /api/v1/emergency-consultations` - Tạo hội chẩn
- `PUT /{consultationId}` - Cập nhật
- `GET /{consultationId}` - Lấy chi tiết
- `GET /encounter/{emergencyEncounterId}` - Theo lượt cấp cứu
- `GET /doctor/{doctorId}` - Theo bác sĩ
- `GET /follow-up-recommended` - Khuyến cáo tái khám
- `GET /without-booking` - Chưa tạo lịch hẹn
- `GET /urgent-follow-ups` - Tái khám khẩn cấp
- `GET /time-range` - Theo khoảng thời gian
- `GET /statistics` - Thống kê
- `GET /count/doctor/{doctorId}` - Đếm theo bác sĩ
- `GET /count/specialty/{specialty}` - Đếm theo chuyên khoa

---

### 3. EmergencyDiagnosticOrder (Chỉ định XN/CĐHA cấp cứu)

#### Loại chẩn đoán:
- `LABORATORY` - Xét nghiệm (máu, nước tiểu, dịch)
- `RADIOLOGY` - Chẩn đoán hình ảnh (X-quang, CT, MRI)
- `ULTRASOUND` - Siêu âm
- `ECG` - Điện tim
- `ENDOSCOPY` - Nội soi
- `OTHER` - Khác

#### Mức độ khẩn cấp:
| Level | Thời gian mục tiêu | Mô tả |
|-------|-------------------|-------|
| STAT | 30 phút | Cực khẩn - nguy cơ tính mạng |
| URGENT | 2 giờ | Khẩn - ảnh hưởng điều trị |
| ROUTINE | 6 giờ | Thường quy |

#### Workflow trạng thái:
```
ORDERED → ACCEPTED → IN_PROGRESS → COMPLETED → REPORTED → CONFIRMED
                                                    ↓
                                              CANCELLED
```

#### APIs chính (33 APIs):

**CRUD (5 APIs):**
- `POST /api/v1/emergency/diagnostic-orders` - Tạo chỉ định
- `PUT /{id}` - Cập nhật
- `POST /{id}/cancel` - Hủy ✅ (đã sửa từ DELETE → POST theo chuẩn RESTful)
- `GET /{id}` - Lấy chi tiết
- `GET /` - Danh sách (phân trang)

**Workflow (5 APIs):**
- `POST /{id}/accept` - Tiếp nhận
- `POST /{id}/start` - Bắt đầu thực hiện
- `POST /{id}/complete` - Hoàn thành
- `POST /{id}/report` - Báo cáo kết quả
- `POST /{id}/confirm` - Bác sĩ xác nhận

**Query by Encounter (4 APIs):**
- `GET /encounter/{encounterId}` - Theo ca cấp cứu
- `GET /encounter/{encounterId}/pending` - Chỉ định đang chờ theo ca
- `GET /encounter/{encounterId}/completed` - Chỉ định đã hoàn thành theo ca
- `GET /encounter/{encounterId}/count` - Đếm chỉ định theo ca

**Query by Type/Urgency/Status (9 APIs):**
- `GET /type/{diagnosticType}` - Theo loại
- `GET /urgency/{urgencyLevel}` - Theo mức độ khẩn
- `GET /status/{status}` - Theo trạng thái
- `GET /stat` - Chỉ định STAT
- `GET /urgent` - Chỉ định khẩn
- `GET /pending` - Đang chờ
- `GET /in-progress` - Đang thực hiện
- `GET /completed` - Đã hoàn thành
- `GET /doctor/{doctorId}` - Theo bác sĩ

**Alerts & Monitoring (4 APIs):**
- `GET /overdue` - Quá hạn
- `GET /due-soon` - Sắp đến hạn
- `GET /{id}/time-remaining` - Thời gian còn lại
- `GET /{id}/is-overdue` - Kiểm tra quá hạn

**Statistics (6 APIs):**
- `GET /statistics/turnaround-time` - Thống kê TAT
- `GET /statistics/performance` - Hiệu suất
- `GET /statistics/by-type` - Theo loại
- `GET /statistics/by-urgency` - Theo mức độ khẩn
- `GET /statistics/count-by-status` - Đếm theo trạng thái
- `GET /statistics/average-turnaround/{diagnosticType}` - TAT trung bình theo loại

---

### 4. EmergencyProtocol (Quy trình cấp cứu đặc biệt)

#### Chức năng:
- Kích hoạt quy trình cấp cứu đặc biệt (Code Blue, Code Red, etc.)
- Thông báo đội phản ứng
- Theo dõi và giải quyết tình huống

#### Trạng thái:
- `ACTIVE` - Đang hoạt động
- `RESOLVED` - Đã giải quyết
- `CANCELLED` - Đã hủy

#### APIs chính (15 APIs):
- `POST /api/v1/emergency/protocols/activate` - Kích hoạt
- `POST /{protocolId}/resolve` - Giải quyết
- `POST /{protocolId}/cancel` - Hủy
- `GET /{protocolId}` - Chi tiết
- `GET /active` - Đang hoạt động
- `GET /critical` - Nghiêm trọng
- `GET /department/{departmentId}` - Theo khoa
- `GET /type/{protocolType}` - Theo loại
- `GET /patient/{patientId}` - Theo bệnh nhân
- `GET /overdue` - Quá hạn
- `GET /recent` - Gần đây
- `GET /procedures/{protocolType}` - Quy trình xử lý
- `GET /response-team/{protocolType}` - Đội phản ứng
- `POST /{protocolId}/alert` - Gửi cảnh báo
- `GET /statistics` - Thống kê

---

### 5. EmergencyBilling (Thanh toán cấp cứu) ✅ MỚI

#### Chức năng:
- Thu tạm ứng cấp cứu (deposit)
- Tích lũy chi phí từ DiagnosticOrders
- Tạo hóa đơn với BHYT (thông tuyến cấp cứu = 100%)
- Quyết toán xuất viện, hoàn tiền dư

#### APIs chính (5 APIs) ✅ ĐÃ SỬA THEO CHUẨN RESTFUL:
- `POST /api/v1/emergency/billing/deposits` - Thu tạm ứng (danh từ số nhiều)
- `GET /api/v1/emergency/billing/encounters/{encounterId}/balance` - Kiểm tra số dư (quan hệ cha-con)
- `GET /api/v1/emergency/billing/encounters/{encounterId}/charges` - Chi phí tích lũy (quan hệ cha-con)
- `POST /api/v1/emergency/billing/encounters/{encounterId}/invoices` - Tạo hóa đơn (quan hệ cha-con)
- `POST /api/v1/emergency/billing/encounters/{encounterId}/settlements` - Quyết toán xuất viện (quan hệ cha-con)

#### Quy tắc BHYT cấp cứu:
```
- Thông tuyến cấp cứu: BHYT chi trả 100% cho cấp cứu
- Nếu có BHYT → billingType = "INSURANCE", coveragePercent = 100%
- Nếu không có BHYT → billingType = "SELF_PAY"
```

#### Quyết toán xuất viện (settleEmergencyDischarge):
```
1. Tính tổng chi phí từ DiagnosticOrders (COMPLETED/REPORTED)
2. Áp dụng BHYT (nếu có) - 100% coverage
3. Trừ tạm ứng (deposit)
4. Hoàn tiền dư (nếu deposit > chi phí)
5. Thông báo số tiền còn thiếu (nếu chi phí > deposit)
```

---

## 🔐 PHÂN QUYỀN (Authorization)

### EmergencyEncounter:
- `emergency.create`, `nurse.triage` - Tạo lượt cấp cứu
- `emergency.update`, `nurse.triage`, `doctor.emergency` - Cập nhật
- `emergency.view`, `nurse.triage`, `doctor.emergency` - Xem
- `emergency.triage`, `nurse.triage` - Phân loại
- `emergency.assign`, `nurse.triage` - Phân công
- `emergency.discharge`, `doctor.emergency` - Xuất viện
- `emergency.admit`, `doctor.emergency` - Nhập viện
- `emergency.transfer`, `doctor.emergency` - Chuyển viện

### EmergencyConsultation:
- `emergency.consultation.create`, `doctor.emergency` - Tạo hội chẩn
- `emergency.consultation.update`, `doctor.emergency` - Cập nhật
- `emergency.consultation.view`, `doctor.view` - Xem

### EmergencyDiagnosticOrder:
- `emergency.diagnostic.create` - Tạo chỉ định
- `emergency.diagnostic.update` - Cập nhật
- `emergency.diagnostic.cancel` - Hủy
- `emergency.diagnostic.view` - Xem
- `emergency.diagnostic.process` - Xử lý
- `emergency.diagnostic.report` - Báo cáo
- `emergency.diagnostic.confirm` - Xác nhận

### EmergencyProtocol:
- `emergency.activate` - Kích hoạt
- `emergency.resolve` - Giải quyết
- `emergency.cancel` - Hủy
- `emergency.view` - Xem
- `emergency.alert` - Gửi cảnh báo

---

## ✅ ĐÁNH GIÁ CHẤT LƯỢNG

### Điểm mạnh:

1. **Thiết kế theo chuẩn quốc tế**: Phân loại cấp cứu theo ESI/ATS/CTAS
2. **Workflow đầy đủ**: Từ tiếp nhận → triage → khám → điều trị → xuất viện
3. **Theo dõi thời gian**: TAT cho xét nghiệm, cảnh báo quá hạn
4. **Audit trail**: Sử dụng AuditableEntity để theo dõi thay đổi
5. **Soft delete**: Hỗ trợ xóa mềm, khôi phục dữ liệu
6. **Business logic trong Entity**: Các method tiện ích như `isLifeThreatening()`, `isOverdue()`
7. **Phân quyền chi tiết**: Theo vai trò (nurse, doctor, admin)
8. **API RESTful**: Thiết kế chuẩn REST với Swagger documentation

### ✅ Đã implement đầy đủ (cập nhật 27/11/2025):

1. **Service Implementation**: ✅ Có đầy đủ 5 file `*ServiceImpl.java`
2. **Repository**: ✅ Có đầy đủ các Repository
3. **DTO Request/Response**: ✅ Có đầy đủ các DTO
4. **Integration với các module khác**:
   - ✅ Billing (EmergencyBillingService - thanh toán cấp cứu)
   - ✅ Inpatient (AdmissionRequest - nhập viện từ cấp cứu)
   - ✅ Booking (EmergencyConsultation.createdBookingId - tái khám)
   - ✅ Pharmacy (Prescription - kê đơn thuốc khi xuất viện cấp cứu) **MỚI 27/11/2025**
   - ✅ HospitalReferral (Giấy chuyển viện khi transfer) **MỚI 27/11/2025**

### Điểm cần cải thiện:

1. **Thiếu Unit Tests**: Cần bổ sung tests cho các service
2. **EmergencyProtocol notification**: `notifyResponseTeam()` và `sendEmergencyAlert()` chỉ có log, chưa gửi thông báo thực

---

## 🔍 ĐÁNH GIÁ SO VỚI HIS THỰC TẾ VIỆT NAM

### ✅ CÁC ĐIỂM ĐÃ IMPLEMENT (cập nhật 26/11/2025):

| # | Tính năng | Trạng thái | Ghi chú |
|---|-----------|------------|---------|
| 1 | **Đăng ký tiếp nhận** | ✅ Có | `EncounterService.createEmergencyEncounter()` cho walk-in |
| 2 | **Thu phí cấp cứu** | ✅ Có | `EmergencyBillingService` - tạm ứng, quyết toán |
| 3 | **BHYT cấp cứu** | ✅ Có | Thông tuyến 100%, fields: hasInsurance, insuranceCoveragePercent |
| 4 | **Nhập viện từ cấp cứu** | ✅ Có | `admitPatient()` với full AdmissionRequest workflow |

### ⚠️ CÁC ĐIỂM CÒN THIẾU:

| # | Thiếu | Mô tả | Mức độ |
|---|-------|-------|--------|
| 1 | ~~**Kê đơn thuốc cấp cứu**~~ | ✅ ĐÃ HOÀN THÀNH (27/11/2025) - Tích hợp Prescription khi discharge | ✅ |
| 2 | **Thủ thuật cấp cứu** | Thiếu ghi nhận thủ thuật (khâu vết thương, đặt NKQ, v.v.) | 🟡 TB |
| 3 | **Theo dõi sinh hiệu liên tục** | Chỉ có vitalSigns 1 lần, thiếu monitoring liên tục | 🟡 TB |
| 4 | **Quản lý giường cấp cứu** | Có observationBedId nhưng thiếu quản lý giường chi tiết | 🟡 TB |
| 5 | ~~**Giấy chuyển tuyến**~~ | ✅ ĐÃ HOÀN THÀNH (27/11/2025) - Tích hợp HospitalReferral khi transfer | ✅ |

### ❌ CÁC ĐIỂM CẦN XEM LẠI:

| # | Vấn đề | Hiện tại | Đề xuất |
|---|--------|----------|---------|
| 1 | **Hội chẩn vs Tái khám** | EmergencyConsultation mix 2 nghiệp vụ | Tách riêng: Consultation (hội chẩn tại chỗ) và FollowUp (hẹn tái khám) |
| 2 | **Diagnostic Order riêng** | Có EmergencyDiagnosticOrder riêng | Có thể dùng chung LabTest/Radiology với flag `isEmergency=true` (tùy chọn) |

### ✅ THIẾT KẾ ĐÚNG - ENCOUNTER VS EMERGENCY ENCOUNTER:

Thiết kế hiện tại **ĐÚNG** theo pattern **Entity Extension**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ENCOUNTER                                       │
│                    (Lượt khám CHUNG - Base Entity)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  - patientId, encounterType, visitType, status                              │
│  - departmentId, bookingId, startDatetime, endDatetime                      │
│  → Áp dụng cho TẤT CẢ loại khám (Ngoại trú, Nội trú, Cấp cứu)              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1:1 (encounterId)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EMERGENCY ENCOUNTER                                  │
│              (Thông tin CHI TIẾT cho lượt cấp cứu)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  - chiefComplaint, arrivalMethod, arrivalTime, accompaniedBy                │
│  - emergencyCategory (1-5), vitalSigns, painScore                           │
│  - triageNurseId, assignedDoctorId, status (workflow cấp cứu)               │
│  - dischargeSummary, dischargeInstructions, dischargeMedications            │
│  → Chỉ áp dụng cho CẤP CỨU, mở rộng thông tin từ Encounter                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Luồng đúng:**
1. Tạo **Encounter** (encounterType = "EMERGENCY") → Link với Patient
2. Tạo **EmergencyEncounter** (encounterId = encounter vừa tạo) → Thông tin chi tiết cấp cứu
3. Workflow cấp cứu diễn ra trên EmergencyEncounter

### 📋 ĐỀ XUẤT LUỒNG NGHIỆP VỤ CHUẨN HIS VIỆT NAM:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              LUỒNG CẤP CỨU CHUẨN HIS VIỆT NAM (ĐỀ XUẤT)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. TIẾP NHẬN (Receptionist/Nurse)                                          │
│     ├── Tra cứu/Đăng ký bệnh nhân (Patient module)                          │
│     ├── Kiểm tra BHYT (Insurance module) - thông tuyến cấp cứu              │
│     ├── Tạo Encounter + EmergencyEncounter                                  │
│     └── Thu tạm ứng cấp cứu (Deposit module) - nếu không có BHYT            │
│                                                                             │
│  2. TRIAGE (Nurse)                                                          │
│     ├── Đo sinh hiệu (VitalSigns module - có thể nhiều lần)                 │
│     ├── Đánh giá mức độ (Category 1-5)                                      │
│     └── Phân công bác sĩ theo mức độ                                        │
│                                                                             │
│  3. KHÁM (Doctor)                                                           │
│     ├── Khám lâm sàng, ghi nhận triệu chứng                                 │
│     ├── Chỉ định xét nghiệm (LabTest module - flag isEmergency)             │
│     ├── Chỉ định CĐHA (Radiology module - flag isEmergency)                 │
│     ├── Kê đơn thuốc cấp cứu (Pharmacy module)                              │
│     └── Thực hiện thủ thuật (Procedure module)                              │
│                                                                             │
│  4. HỘI CHẨN (nếu cần)                                                      │
│     ├── Yêu cầu hội chẩn chuyên khoa (tại chỗ)                              │
│     └── Ghi nhận ý kiến chuyên gia                                          │
│                                                                             │
│  5. ĐIỀU TRỊ                                                                │
│     ├── Theo dõi sinh hiệu liên tục (Monitoring)                            │
│     ├── Thực hiện y lệnh                                                    │
│     └── Cập nhật tình trạng                                                 │
│                                                                             │
│  6. KẾT THÚC                                                                │
│     ├── XUẤT VIỆN:                                                          │
│     │   ├── Tạo hóa đơn (Invoice module)                                    │
│     │   ├── Thanh toán/Quyết toán BHYT (Billing module)                     │
│     │   ├── Kê đơn thuốc về nhà                                             │
│     │   └── Hẹn tái khám (Booking module)                                   │
│     │                                                                       │
│     ├── NHẬP VIỆN:                                                          │
│     │   ├── Tạo Admission Request (Inpatient module)                        │
│     │   ├── Chuyển hồ sơ sang nội trú                                       │
│     │   └── Chuyển số dư tạm ứng                                            │
│     │                                                                       │
│     └── CHUYỂN VIỆN:                                                        │
│         ├── Tạo giấy chuyển tuyến (Referral module)                         │
│         ├── Liên hệ BV tiếp nhận                                            │
│         └── Thanh toán phần đã sử dụng                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 🔧 HÀNH ĐỘNG CẦN THỰC HIỆN (cập nhật 27/11/2025):

| # | Hành động | Trạng thái | Ghi chú |
|---|-----------|------------|---------|
| 1 | **Tích hợp Billing** | ✅ Đã xong | EmergencyBillingService |
| 2 | **Tích hợp Insurance** | ✅ Đã xong | Thông tuyến 100% |
| 3 | **Tích hợp Inpatient** | ✅ Đã xong | AdmissionRequest workflow |
| 4 | **Tích hợp Pharmacy** | ✅ Đã xong | `createEmergencyPrescription()` - prescriptionCategory = "DISCHARGE" |
| 5 | **Tích hợp HospitalReferral** | ✅ Đã xong | Tự động tạo giấy chuyển viện khi transfer |
| 6 | **Thêm VitalSigns module** | ⏳ Chưa | Theo dõi sinh hiệu nhiều lần |
| 7 | **Thêm Procedure module** | ⏳ Chưa | Ghi nhận thủ thuật cấp cứu |
| 8 | **Unit Tests** | ⏳ Chưa | Cần bổ sung tests |

---

## 📈 THỐNG KÊ API

| Module | Số lượng API |
|--------|-------------|
| EmergencyEncounter | 29 APIs |
| EmergencyConsultation | 12 APIs |
| EmergencyDiagnosticOrder | 33 APIs |
| EmergencyProtocol | 15 APIs |
| EmergencyBilling | 5 APIs |
| **Tổng cộng** | **94 APIs** |

---

## 🔄 WORKFLOW TỔNG QUAN

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        EMERGENCY DEPARTMENT WORKFLOW                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────────┐   │
│  │ ARRIVAL  │───▶│  TRIAGE  │───▶│  DOCTOR  │───▶│ TREATMENT/TESTS  │   │
│  │          │    │ (Nurse)  │    │  EXAM    │    │                  │   │
│  └──────────┘    └──────────┘    └──────────┘    └──────────────────┘   │
│       │              │               │                    │              │
│       │              │               │                    │              │
│       ▼              ▼               ▼                    ▼              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────────┐   │
│  │ Category │    │ Vital    │    │ Consult  │    │ Diagnostic       │   │
│  │ Assigned │    │ Signs    │    │ Request  │    │ Orders           │   │
│  │ (1-5)    │    │ Pain     │    │          │    │ (Lab/Radiology)  │   │
│  └──────────┘    └──────────┘    └──────────┘    └──────────────────┘   │
│                                                           │              │
│                                                           ▼              │
│                                      ┌────────────────────────────────┐  │
│                                      │         DISPOSITION            │  │
│                                      ├────────────────────────────────┤  │
│                                      │ • DISCHARGED (Xuất viện)       │  │
│                                      │ • ADMITTED (Nhập viện)         │  │
│                                      │ • TRANSFERRED (Chuyển viện)    │  │
│                                      │ • LEFT_WITHOUT_SEEN            │  │
│                                      │ • DECEASED                     │  │
│                                      └────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📝 KẾT LUẬN (Cập nhật 27/11/2025)

Phân hệ cấp cứu được thiết kế **hoàn chỉnh** với:
- **5 Controllers** quản lý các nghiệp vụ chính
- **5 Service interfaces + implementations** định nghĩa business logic
- **6 Models** (4 entities + 2 enums) cho data layer
- **~100 APIs** phục vụ các chức năng

### ✅ Tính năng đã hoàn thiện:
1. **Workflow cấp cứu đầy đủ**: 12 trạng thái, 5 cấp độ triage theo chuẩn quốc tế
2. **Thanh toán cấp cứu**: Tạm ứng, tích lũy chi phí, quyết toán, hoàn tiền
3. **BHYT thông tuyến**: 100% coverage cho cấp cứu
4. **Emergency → Inpatient**: Full workflow với AdmissionRequest
5. **Hội chẩn chuyên khoa**: Với link đến Booking tái khám
6. **Chỉ định XN/CĐHA**: STAT/URGENT/ROUTINE với theo dõi TAT
7. **Quy trình đặc biệt**: Code Blue, Fire, Mass Casualty với response team
8. **✅ MỚI: Xuất viện với đơn thuốc**: Tích hợp Prescription khi discharge (27/11/2025)
9. **✅ MỚI: Chuyển viện với giấy chuyển**: Tích hợp HospitalReferral khi transfer (27/11/2025)

### 🔄 4 Luồng kết thúc cấp cứu hoàn chỉnh:
| Luồng | API | Tích hợp | Trạng thái |
|-------|-----|----------|------------|
| **Xuất viện về nhà** | `POST /discharge` | Prescription (DISCHARGE) | ✅ Hoàn thành |
| **Nhập viện nội trú** | `POST /admit` | AdmissionRequest, InpatientStay | ✅ Hoàn thành |
| **Chuyển viện** | `POST /transfer` | HospitalReferral | ✅ Hoàn thành |
| **Bệnh nhân bỏ về** | `PUT /status` | - | ✅ Hoàn thành |

Hệ thống tuân theo các chuẩn quốc tế về phân loại cấp cứu (ESI/ATS/CTAS) và quy định y tế Việt Nam (TT 52/2017/TT-BYT) về phân loại đơn thuốc.

---

## 🔄 LUỒNG NGHIỆP VỤ CHI TIẾT

### Luồng 1: Tiếp nhận bệnh nhân cấp cứu

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LUỒNG TIẾP NHẬN BỆNH NHÂN CẤP CỨU                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. BỆNH NHÂN ĐẾN KHOA CẤP CỨU                                              │
│     ├── Đi bộ (WALK_IN)                                                     │
│     ├── Xe cấp cứu (AMBULANCE)                                              │
│     ├── Trực thăng (HELICOPTER)                                             │
│     └── Công an đưa đến (POLICE)                                            │
│                                                                             │
│  2. TẠO LƯỢT CẤP CỨU (EmergencyEncounter)                                   │
│     POST /api/v1/emergency/encounters                                       │
│     {                                                                       │
│       "encounterId": 123,           // Link với Encounter chính             │
│       "chiefComplaint": "Đau ngực", // Lý do đến                            │
│       "arrivalMethod": "AMBULANCE", // Phương tiện đến                      │
│       "accompaniedBy": "Vợ",        // Người đi cùng                        │
│       "emergencyContactName": "...",                                        │
│       "emergencyContactPhone": "..."                                        │
│     }                                                                       │
│     → Status: WAITING_TRIAGE                                                │
│                                                                              │
│  3. PHÂN CÔNG ĐIỀU DƯỠNG TRIAGE                                             │
│     PUT /api/v1/emergency/encounters/{id}/assign-nurse?nurseId=456          │
│     → Status: IN_TRIAGE                                                     │
│                                                                             │
│  4. HOÀN THÀNH TRIAGE                                                       │
│     PUT /api/v1/emergency/encounters/{id}/complete-triage                   │
│     ?category=EMERGENCY&assessment=...&vitalSigns=...&painScore=8           │
│     → Status: WAITING_DOCTOR                                                │
│     → Category: EMERGENCY (Level 2 - Màu cam - Chờ tối đa 10 phút)         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Luồng 2: Khám và điều trị

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LUỒNG KHÁM VÀ ĐIỀU TRỊ                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  5. PHÂN CÔNG BÁC SĨ                                                        │
│     PUT /api/v1/emergency/encounters/{id}/assign-doctor?doctorId=789        │
│     → Status: IN_EXAMINATION                                                │
│                                                                             │
│  6. CHỈ ĐỊNH XÉT NGHIỆM/CHẨN ĐOÁN HÌNH ẢNH                                  │
│     POST /api/v1/emergency/diagnostic-orders                                │
│     {                                                                       │
│       "emergencyEncounterId": 1,                                            │
│       "diagnosticType": "LABORATORY",    // Xét nghiệm máu                  │
│       "orderDetails": "Troponin, CK-MB, ECG",                               │
│       "clinicalIndication": "Nghi nhồi máu cơ tim",                         │
│       "urgencyLevel": "STAT"             // Cực khẩn - 30 phút              │
│     }                                                                       │
│     → Status: ORDERED                                                       │
│                                                                             │
│  7. PHÒNG XÉT NGHIỆM TIẾP NHẬN                                              │
│     POST /api/v1/emergency/diagnostic-orders/{id}/accept                    │
│     → Status: ACCEPTED                                                      │
│                                                                             │
│  8. THỰC HIỆN XÉT NGHIỆM                                                    │
│     POST /api/v1/emergency/diagnostic-orders/{id}/start                     │
│     → Status: IN_PROGRESS                                                   │
│                                                                             │
│  9. HOÀN THÀNH VÀ BÁO CÁO KẾT QUẢ                                           │
│     POST /api/v1/emergency/diagnostic-orders/{id}/complete                  │
│     POST /api/v1/emergency/diagnostic-orders/{id}/report                    │
│     ?results=Troponin: 0.5ng/mL (cao)&interpretation=Nghi NMCT              │
│     → Status: REPORTED                                                      │
│                                                                             │
│  10. BÁC SĨ XÁC NHẬN KẾT QUẢ                                                │
│      POST /api/v1/emergency/diagnostic-orders/{id}/confirm                  │
│      → Status: CONFIRMED                                                    │
│                                                                             │
│  11. CẬP NHẬT TRẠNG THÁI ĐIỀU TRỊ                                           │
│      PUT /api/v1/emergency/encounters/{id}/status?status=IN_TREATMENT       │
│      → Status: IN_TREATMENT                                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Luồng 3: Hội chẩn chuyên khoa

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LUỒNG HỘI CHẨN CHUYÊN KHOA                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Khi bác sĩ cấp cứu cần ý kiến chuyên khoa:                                 │
│                                                                             │
│  POST /api/v1/emergency-consultations                                       │
│  {                                                                          │
│    "emergencyEncounterId": 1,                                               │
│    "consultationReason": "Cần hội chẩn Tim mạch cho ca nghi NMCT",          │
│    "doctorAdvice": "Cần can thiệp mạch vành khẩn cấp",                      │
│    "recommendedSpecialty": "Cardiology",                                    │
│    "recommendedDepartmentId": 5,                                            │
│    "suggestedAppointmentTime": "2025-11-27T08:00:00",                        │
│    "appointmentPriority": "URGENT",                                         │
│    "homeCareInstructions": "Nghỉ ngơi, uống thuốc đúng giờ",                │
│    "warningSignsToReturn": "Đau ngực tăng, khó thở, vã mồ hôi"              │
│  }                                                                          │
│                                                                             │
│  → Tự động tạo lịch hẹn tái khám nếu cần                                    │
│  → Cảnh báo nếu chưa tạo booking cho ca cần tái khám                        │
│                                                                             │
│  KIỂM TRA CA CẦN TÁI KHÁM KHẨN CẤP:                                         │
│  GET /api/v1/emergency-consultations/urgent-follow-ups                      │
│                                                                             │
│  KIỂM TRA CA CHƯA TẠO LỊCH HẸN:                                             │
│  GET /api/v1/emergency-consultations/without-booking                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Luồng 4: Kết thúc lượt cấp cứu ✅ CẬP NHẬT 27/11/2025

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      LUỒNG KẾT THÚC LƯỢT CẤP CỨU                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  OPTION A: XUẤT VIỆN VỀ NHÀ (Discharge to Home) ✅ MỚI                      │
│  ─────────────────────────────────────────────────────────────────────────  │
│  👤 Người thực hiện: DOCTOR (doctor.emergency)                              │
│                                                                             │
│  A1. Xuất viện đơn giản (không có đơn thuốc):                               │
│      PUT /api/v1/emergency/encounters/{id}/discharge                        │
│      → Status: DISCHARGED                                                   │
│                                                                             │
│  A2. Xuất viện với đơn thuốc (có thuốc mang về): ✅ MỚI 27/11/2025          │
│      POST /api/v1/emergency/encounters/{id}/discharge                       │
│      Request Body: {                                                        │
│        "dischargeDiagnosis": "Gãy xương cẳng tay",                          │
│        "dischargeSummary": "Bệnh nhân ổn định...",                          │
│        "dischargeInstructions": "Tái khám sau 7 ngày...",                   │
│        "prescriptionItems": [                                               │
│          {                                                                  │
│            "medicineId": 1,                                                 │
│            "dosage": "500mg x 3 lần/ngày",                                  │
│            "quantity": 21,                                                  │
│            "notes": "Uống sau ăn"                                           │
│          }                                                                  │
│        ],                                                                   │
│        "prescriptionNotes": "Thuốc giảm đau sau gãy xương"                  │
│      }                                                                      │
│      → Workflow:                                                            │
│        1. Validate EmergencyEncounter (không được DISCHARGED/ADMITTED)      │
│        2. Tạo Prescription với prescriptionCategory = "DISCHARGE"           │
│           (Theo TT 52/2017/TT-BYT - không dùng "EMERGENCY")                 │
│        3. Validate drug interactions, allergies, dosages                    │
│        4. Update EmergencyEncounter.status → DISCHARGED                     │
│        5. Update Encounter.status → COMPLETED                               │
│      → Response: prescriptionId, prescriptionCode                           │
│                                                                             │
│  OPTION B: NHẬP VIỆN NỘI TRÚ (Admit to Inpatient) ✅ ĐÃ CẬP NHẬT           │
│  ─────────────────────────────────────────────────────────────────────────  │
│  👤 Người thực hiện: DOCTOR (doctor.emergency)                              │
│                                                                             │
│  POST /api/v1/emergency/encounters/{id}/admit                               │
│  Request Body: {                                                            │
│    "departmentId": 5,                                                       │
│    "admissionDiagnosis": "STEMI anterior",                                  │
│    "admissionNotes": "Cần can thiệp mạch vành khẩn cấp",                    │
│    "preferredBedId": 10  // optional                                        │
│  }                                                                          │
│  → Workflow:                                                                │
│    1. Validate EmergencyEncounter                                           │
│    2. Tạo AdmissionRequest (type=EMERGENCY, priority=1)                     │
│    3. Auto-approve (emergency bypass)                                       │
│    4. Financial clearance (INSURANCE/EXEMPTION)                             │
│    5. Assign bed (nếu có)                                                   │
│    6. Complete admission → Tạo InpatientStay                                │
│    7. Update Encounter.type → INPATIENT                                     │
│    8. Update EmergencyEncounter.status → ADMITTED                           │
│  → Response: admissionRequestId, inpatientStayId                            │
│                                                                             │
│  OPTION C: CHUYỂN VIỆN (Transfer to Another Hospital) ✅ MỚI 27/11/2025    │
│  ─────────────────────────────────────────────────────────────────────────  │
│  👤 Người thực hiện: DOCTOR (doctor.emergency)                              │
│                                                                             │
│  C1. Chuyển viện đơn giản:                                                  │
│      PUT /api/v1/emergency/encounters/{id}/transfer                         │
│      → Status: TRANSFERRED                                                  │
│                                                                             │
│  C2. Chuyển viện với giấy chuyển viện: ✅ MỚI 27/11/2025                    │
│      POST /api/v1/emergency/encounters/{id}/transfer                        │
│      Request Body: {                                                        │
│        "targetHospitalId": 2,                                               │
│        "transferReason": "Cần can thiệp mạch vành - BV không có DSA",       │
│        "clinicalSummary": "BN nam 55 tuổi, STEMI anterior...",              │
│        "currentTreatment": "Aspirin 300mg, Heparin 5000UI",                 │
│        "transportMethod": "AMBULANCE",                                      │
│        "escortRequired": true,                                              │
│        "escortType": "DOCTOR_AND_NURSE"                                     │
│      }                                                                      │
│      → Workflow:                                                            │
│        1. Validate EmergencyEncounter                                       │
│        2. Tạo HospitalReferral (status = APPROVED - auto cho emergency)     │
│        3. Generate referralCode (REF20251127xxx)                            │
│        4. Link hospitalReferralId vào EmergencyEncounter                    │
│        5. Update EmergencyEncounter.status → TRANSFERRED                    │
│        6. Update Encounter.status → COMPLETED                               │
│      → Response: hospitalReferralId, hospitalReferralCode                   │
│                                                                             │
│  OPTION D: BỆNH NHÂN BỎ VỀ (Left Without Being Seen)                        │
│  ─────────────────────────────────────────────────────────────────────────  │
│  👤 Người thực hiện: NURSE (nurse.triage) hoặc DOCTOR (doctor.emergency)    │
│                                                                             │
│  PUT /api/v1/emergency/encounters/{id}/status?status=LEFT_WITHOUT_SEEN      │
│  → Status: LEFT_WITHOUT_SEEN                                                │
│                                                                             │
│  OPTION E: TỬ VONG (Deceased)                                               │
│  ─────────────────────────────────────────────────────────────────────────  │
│  👤 Người thực hiện: DOCTOR (doctor.emergency)                              │
│                                                                             │
│  PUT /api/v1/emergency/encounters/{id}/status?status=DECEASED               │
│  → Status: DECEASED                                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Luồng 5: Quy trình cấp cứu đặc biệt (Emergency Protocol)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LUỒNG QUY TRÌNH CẤP CỨU ĐẶC BIỆT                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Các loại Protocol thường gặp:                                              │
│  • CODE BLUE - Ngừng tim/ngừng thở                                          │
│  • CODE RED - Cháy nổ                                                       │
│  • CODE ORANGE - Thảm họa hàng loạt                                         │
│  • CODE PINK - Bắt cóc trẻ em                                               │
│  • STROKE ALERT - Đột quỵ                                                   │
│  • STEMI ALERT - Nhồi máu cơ tim                                            │
│  • TRAUMA ALERT - Chấn thương nặng                                          │
│                                                                             │
│  1. KÍCH HOẠT PROTOCOL                                                      │
│     POST /api/v1/emergency/protocols/activate                               │
│     {                                                                       │
│       "protocolType": "CODE_BLUE",                                          │
│       "patientId": 123,                                                     │
│       "departmentId": 1,                                                    │
│       "location": "Phòng cấp cứu 3",                                        │
│       "severityLevel": "CRITICAL",                                          │
│       "description": "Bệnh nhân ngừng tim đột ngột"                         │
│     }                                                                       │
│     → Status: ACTIVE                                                        │
│     → Tự động thông báo đội phản ứng                                        │
│                                                                             │
│  2. GỬI CẢNH BÁO                                                            │
│     POST /api/v1/emergency/protocols/{id}/alert                             │
│     ?alertMessage=CODE BLUE - Phòng cấp cứu 3 - Cần hỗ trợ ngay!            │
│                                                                             │
│  3. LẤY QUY TRÌNH XỬ LÝ                                                     │
│     GET /api/v1/emergency/protocols/procedures/CODE_BLUE                    │
│     → Trả về danh sách các bước cần thực hiện                               │
│                                                                             │
│  4. LẤY ĐỘI PHẢN ỨNG                                                        │
│     GET /api/v1/emergency/protocols/response-team/CODE_BLUE?departmentId=1  │
│     → Trả về danh sách nhân viên cần triệu tập                              │
│                                                                             │
│  5. GIẢI QUYẾT PROTOCOL                                                     │
│     POST /api/v1/emergency/protocols/{id}/resolve                           │
│     ?resolutionNotes=Hồi sức thành công, bệnh nhân ổn định                  │
│     → Status: RESOLVED                                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Luồng 6: Giám sát và Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LUỒNG GIÁM SÁT VÀ DASHBOARD                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  DASHBOARD TỔNG QUAN:                                                       │
│  GET /api/v1/emergency/encounters/dashboard                                 │
│  → Trả về:                                                                  │
│     • Số ca đang hoạt động theo từng category                               │
│     • Số ca chờ triage, chờ bác sĩ                                          │
│     • Số ca đe dọa tính mạng                                                │
│     • Thời gian chờ trung bình                                              │
│                                                                             │
│  CẢNH BÁO QUAN TRỌNG:                                                       │
│                                                                             │
│  1. Ca đe dọa tính mạng:                                                    │
│     GET /api/v1/emergency/encounters/life-threatening                       │
│                                                                             │
│  2. Ca chờ quá lâu:                                                         │
│     GET /api/v1/emergency/encounters/excessive-wait                         │
│                                                                             │
│  3. Ca đau nặng (pain >= 7):                                                │
│     GET /api/v1/emergency/encounters/severe-pain                            │
│                                                                             │
│  4. Xét nghiệm quá hạn:                                                     │
│     GET /api/v1/emergency/diagnostic-orders/overdue                         │
│                                                                             │
│  5. Xét nghiệm sắp đến hạn:                                                 │
│     GET /api/v1/emergency/diagnostic-orders/due-soon?minutesAhead=15        │
│                                                                             │
│  6. Protocol quá hạn:                                                       │
│     GET /api/v1/emergency/protocols/overdue?hoursThreshold=4                │
│                                                                             │
│  THỐNG KÊ:                                                                  │
│  GET /api/v1/emergency/encounters/statistics?startTime=...                  │
│  GET /api/v1/emergency/diagnostic-orders/statistics/turnaround-time         │
│  GET /api/v1/emergency-consultations/statistics                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔗 TÍCH HỢP VỚI CÁC MODULE KHÁC (Cập nhật 27/11/2025)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TÍCH HỢP VỚI CÁC MODULE KHÁC                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐                                                           │
│  │   PATIENT    │◄──── EmergencyEncounter.encounterId → Encounter           │
│  │   MODULE     │      → Patient (thông tin bệnh nhân)                      │
│  └──────────────┘                                                           │
│                                                                             │
│  ┌──────────────┐                                                           │
│  │   BOOKING    │◄──── EmergencyConsultation.createdBookingId               │
│  │   MODULE     │      → Tạo lịch hẹn tái khám từ cấp cứu                   │
│  └──────────────┘                                                           │
│                                                                             │
│  ┌──────────────┐                                                           │
│  │  INPATIENT   │◄──── EmergencyEncounter.status = ADMITTED                 │
│  │   MODULE     │      → Tạo Admission Request                              │
│  └──────────────┘                                                           │
│                                                                             │
│  ┌──────────────┐                                                           │
│  │   LAB TEST   │◄──── EmergencyDiagnosticOrder.diagnosticType = LABORATORY │
│  │   MODULE     │      → Có thể link với MedicalTest                        │
│  └──────────────┘                                                           │
│                                                                             │
│  ┌──────────────┐                                                           │
│  │  RADIOLOGY   │◄──── EmergencyDiagnosticOrder.diagnosticType = RADIOLOGY  │
│  │   MODULE     │      → X-quang, CT, MRI                                   │
│  └──────────────┘                                                           │
│                                                                             │
│  ┌──────────────┐                                                           │
│  │  EMPLOYEE    │◄──── triageNurseId, assignedDoctorId, consultingDoctorId  │
│  │   MODULE     │      → Thông tin nhân viên y tế                           │
│  └──────────────┘                                                           │
│                                                                             │
│  ┌──────────────┐                                                           │
│  │ DEPARTMENT   │◄──── recommendedDepartmentId, departmentId                │
│  │   MODULE     │      → Khoa/phòng ban                                     │
│  └──────────────┘                                                           │
│                                                                             │
│  ┌──────────────┐  ✅ MỚI 27/11/2025                                        │
│  │ PRESCRIPTION │◄──── EmergencyEncounter.prescriptionId                    │
│  │   MODULE     │      → Đơn thuốc khi xuất viện cấp cứu                    │
│  │              │      → prescriptionCategory = "DISCHARGE"                 │
│  │              │      → Gọi PrescriptionService.createEmergencyPrescription│
│  └──────────────┘                                                           │
│                                                                             │
│  ┌──────────────┐  ✅ MỚI 27/11/2025                                        │
│  │  HOSPITAL    │◄──── EmergencyEncounter.hospitalReferralId                │
│  │  REFERRAL    │      → Giấy chuyển viện khi transfer                      │
│  │   MODULE     │      → Auto-approved cho emergency                        │
│  │              │      → Gọi HospitalReferralService.createReferral         │
│  └──────────────┘                                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 VÍ DỤ THỰC TẾ: CA CẤP CỨU ĐAU NGỰC

```
┌─────────────────────────────────────────────────────────────────────────────┐
│           VÍ DỤ: BỆNH NHÂN NAM 55 TUỔI ĐAU NGỰC CẤP                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  08:00 - Bệnh nhân đến cấp cứu bằng xe cấp cứu                              │
│          POST /emergency/encounters                                         │
│          chiefComplaint: "Đau ngực dữ dội, lan ra tay trái"                 │
│          arrivalMethod: "AMBULANCE"                                         │
│          → Status: WAITING_TRIAGE                                           │
│                                                                             │
│  08:02 - Điều dưỡng triage tiếp nhận                                        │
│          PUT /emergency/encounters/1/assign-nurse?nurseId=10                │
│          → Status: IN_TRIAGE                                                │
│                                                                             │
│  08:05 - Hoàn thành triage                                                  │
│          PUT /emergency/encounters/1/complete-triage                        │
│          category: EMERGENCY (Level 2)                                      │
│          vitalSigns: "BP: 160/100, HR: 110, SpO2: 94%"                      │
│          painScore: 9                                                       │
│          → Status: WAITING_DOCTOR                                           │
│                                                                             │
│  08:07 - Bác sĩ cấp cứu tiếp nhận                                           │
│          PUT /emergency/encounters/1/assign-doctor?doctorId=20              │
│          → Status: IN_EXAMINATION                                           │
│                                                                             │
│  08:10 - Chỉ định xét nghiệm STAT                                           │
│          POST /emergency/diagnostic-orders                                  │
│          diagnosticType: "LABORATORY"                                       │
│          orderDetails: "Troponin, CK-MB, D-Dimer"                           │
│          urgencyLevel: "STAT" (30 phút)                                     │
│                                                                             │
│          POST /emergency/diagnostic-orders                                  │
│          diagnosticType: "ECG"                                              │
│          urgencyLevel: "STAT"                                               │
│                                                                             │
│  08:15 - Phòng XN tiếp nhận và thực hiện                                    │
│          POST /emergency/diagnostic-orders/1/accept                         │
│          POST /emergency/diagnostic-orders/1/start                          │
│                                                                             │
│  08:25 - Kết quả xét nghiệm                                                 │
│          POST /emergency/diagnostic-orders/1/report                         │
│          results: "Troponin: 2.5 ng/mL (cao), ECG: ST elevation V1-V4"      │
│          interpretation: "STEMI anterior"                                   │
│                                                                             │
│  08:30 - Kích hoạt STEMI Protocol                                           │
│          POST /emergency/protocols/activate                                 │
│          protocolType: "STEMI_ALERT"                                        │
│          severityLevel: "CRITICAL"                                          │
│          → Thông báo đội can thiệp tim mạch                                 │
│                                                                             │
│  08:35 - Hội chẩn Tim mạch                                                  │
│          POST /emergency-consultations                                      │
│          recommendedSpecialty: "Cardiology"                                 │
│          doctorAdvice: "Cần can thiệp mạch vành khẩn cấp"                   │
│          appointmentPriority: "URGENT"                                      │
│                                                                             │
│  09:00 - Chuyển lên phòng can thiệp tim mạch                                │
│          POST /emergency/encounters/1/admit                                 │
│          Body: { "departmentId": 5, "admissionDiagnosis": "STEMI anterior" }│
│          → Workflow:                                                        │
│            1. Tạo AdmissionRequest (type=EMERGENCY, priority=1)             │
│            2. Auto-approve                                                  │
│            3. Financial clearance (INSURANCE - 100%)                        │
│            4. Complete admission → Tạo InpatientStay                        │
│          → Status: ADMITTED                                                 │
│                                                                             │
│  09:05 - Giải quyết Protocol                                                │
│          POST /emergency/protocols/1/resolve                                │
│          resolutionNotes: "Chuyển can thiệp mạch vành thành công"           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 RESTFUL API REFACTORING (November 26, 2025)

### Các thay đổi đã thực hiện:

#### 1. EmergencyDiagnosticOrderController
| Trước | Sau | Lý do |
|-------|-----|-------|
| `DELETE /{id}/cancel` | `POST /{id}/cancel` | DELETE không nên có path con, cancel là action không phải xóa resource |

#### 2. EmergencyBillingController
| Trước | Sau | Lý do |
|-------|-----|-------|
| `POST /deposit` | `POST /deposits` | Dùng danh từ số nhiều theo chuẩn REST |
| `GET /balance/{encounterId}` | `GET /encounters/{encounterId}/balance` | Thể hiện quan hệ cha-con |
| `GET /charges/{encounterId}` | `GET /encounters/{encounterId}/charges` | Thể hiện quan hệ cha-con |
| `POST /invoice/{encounterId}` | `POST /encounters/{encounterId}/invoices` | Thể hiện quan hệ cha-con + danh từ số nhiều |
| `POST /settle/{encounterId}` | `POST /encounters/{encounterId}/settlements` | Bỏ động từ, dùng danh từ + quan hệ cha-con |

### Nguyên tắc RESTful đã áp dụng:
1. **Dùng danh từ, không dùng động từ** trong URL
2. **Dùng số nhiều** cho collection resources (`/deposits`, `/invoices`, `/settlements`)
3. **Thể hiện quan hệ cha-con** qua nested URL (`/encounters/{id}/balance`)
4. **HTTP method phù hợp**: POST cho tạo mới, GET cho đọc, PUT/PATCH cho cập nhật, DELETE cho xóa
5. **Không dùng DELETE với path con** như `/cancel` - thay bằng POST action hoặc PATCH status

---

---

## 📋 CHI TIẾT API VÀ NGƯỜI THỰC HIỆN THEO TỪNG LUỒNG

### 🔐 MA TRẬN PHÂN QUYỀN THEO VAI TRÒ

| Vai trò | Mô tả | Quyền chính |
|---------|-------|-------------|
| **RECEPTIONIST** | Lễ tân | Đăng ký bệnh nhân, tạo encounter |
| **NURSE** | Điều dưỡng | Triage, đo sinh hiệu, phân công |
| **DOCTOR** | Bác sĩ | Khám, chẩn đoán, kê đơn, xuất viện |
| **LAB_TECH** | Kỹ thuật viên XN | Thực hiện xét nghiệm, báo cáo kết quả |
| **PHARMACIST** | Dược sĩ | Phát thuốc theo đơn |
| **CASHIER** | Thu ngân | Thu tạm ứng, quyết toán |
| **ADMIN** | Quản trị | Toàn quyền |

---

### 📊 LUỒNG 1: TIẾP NHẬN BỆNH NHÂN CẤP CỨU

| Bước | API | Method | Người thực hiện | Quyền cần có |
|------|-----|--------|-----------------|--------------|
| 1.1 | Tạo lượt cấp cứu | `POST /api/v1/emergency/encounters` | NURSE, RECEPTIONIST | `emergency.create`, `nurse.triage` |
| 1.2 | Phân công điều dưỡng triage | `PUT /api/v1/emergency/encounters/{id}/assign-nurse` | NURSE | `emergency.triage`, `nurse.triage` |
| 1.3 | Hoàn thành triage | `PUT /api/v1/emergency/encounters/{id}/complete-triage` | NURSE | `emergency.triage`, `nurse.triage` |
| 1.4 | Thu tạm ứng (nếu không BHYT) | `POST /api/v1/emergency/billing/deposits` | CASHIER | - |

**Request mẫu - Tạo lượt cấp cứu:**
```json
POST /api/v1/emergency/encounters
{
  "encounterId": 123,
  "chiefComplaint": "Đau ngực dữ dội, lan ra tay trái",
  "arrivalMethod": "AMBULANCE",
  "accompaniedBy": "Vợ",
  "emergencyContactName": "Nguyễn Văn A",
  "emergencyContactPhone": "0901234567"
}
```

---

### 📊 LUỒNG 2: KHÁM VÀ ĐIỀU TRỊ

#### 2.1 Phân công bác sĩ và cập nhật trạng thái

| Bước | API | Method | Người thực hiện | Quyền cần có |
|------|-----|--------|-----------------|--------------|
| 2.1.1 | Phân công bác sĩ | `PUT /api/v1/emergency/encounters/{id}/assign-doctor?doctorId=` | NURSE | `emergency.assign`, `nurse.triage` |
| 2.1.2 | Cập nhật trạng thái | `PUT /api/v1/emergency/encounters/{id}/status?status=` | DOCTOR, NURSE | `emergency.update`, `nurse.triage`, `doctor.emergency` |

#### 2.2 Chỉ định xét nghiệm/CĐHA (EmergencyDiagnosticOrder)

**CRUD Operations:**
| Bước | API | Method | Người thực hiện | Quyền cần có |
|------|-----|--------|-----------------|--------------|
| 2.2.1 | Tạo chỉ định | `POST /api/v1/emergency/diagnostic-orders` | DOCTOR | `emergency.diagnostic.create` |
| 2.2.2 | Cập nhật chỉ định | `PUT /api/v1/emergency/diagnostic-orders/{id}` | DOCTOR | `emergency.diagnostic.update` |
| 2.2.3 | Xem chỉ định | `GET /api/v1/emergency/diagnostic-orders/{id}` | ALL | `emergency.diagnostic.view` |
| 2.2.4 | DS tất cả chỉ định | `GET /api/v1/emergency/diagnostic-orders` | ALL | `emergency.diagnostic.view` |
| 2.2.5 | Hủy chỉ định | `POST /api/v1/emergency/diagnostic-orders/{id}/cancel?cancellationReason=` | DOCTOR | `emergency.diagnostic.cancel` |

**Workflow Operations:**
| Bước | API | Method | Người thực hiện | Quyền cần có |
|------|-----|--------|-----------------|--------------|
| 2.2.6 | Tiếp nhận chỉ định | `POST /api/v1/emergency/diagnostic-orders/{id}/accept` | LAB_TECH, RADIOLOGY_TECH | `emergency.diagnostic.process` |
| 2.2.7 | Bắt đầu thực hiện | `POST /api/v1/emergency/diagnostic-orders/{id}/start` | LAB_TECH, RADIOLOGY_TECH | `emergency.diagnostic.process` |
| 2.2.8 | Hoàn thành xét nghiệm | `POST /api/v1/emergency/diagnostic-orders/{id}/complete` | LAB_TECH, RADIOLOGY_TECH | `emergency.diagnostic.process` |
| 2.2.9 | Báo cáo kết quả | `POST /api/v1/emergency/diagnostic-orders/{id}/report?results=&interpretation=` | LAB_TECH, RADIOLOGY_TECH | `emergency.diagnostic.report` |
| 2.2.10 | Xác nhận kết quả | `POST /api/v1/emergency/diagnostic-orders/{id}/confirm` | DOCTOR | `emergency.diagnostic.confirm` |

**Query by Encounter:**
| Bước | API | Method | Người thực hiện | Quyền cần có |
|------|-----|--------|-----------------|--------------|
| 2.2.11 | DS theo encounter | `GET /api/v1/emergency/diagnostic-orders/encounter/{encounterId}` | ALL | `emergency.diagnostic.view` |
| 2.2.12 | DS đang chờ theo encounter | `GET /api/v1/emergency/diagnostic-orders/encounter/{encounterId}/pending` | ALL | `emergency.diagnostic.view` |
| 2.2.13 | DS hoàn thành theo encounter | `GET /api/v1/emergency/diagnostic-orders/encounter/{encounterId}/completed` | ALL | `emergency.diagnostic.view` |
| 2.2.14 | Đếm theo encounter | `GET /api/v1/emergency/diagnostic-orders/encounter/{encounterId}/count` | ALL | `emergency.diagnostic.view` |

**Query by Type/Urgency/Status:**
| Bước | API | Method | Người thực hiện | Quyền cần có |
|------|-----|--------|-----------------|--------------|
| 2.2.15 | DS theo loại | `GET /api/v1/emergency/diagnostic-orders/type/{diagnosticType}` | ALL | `emergency.diagnostic.view` |
| 2.2.16 | DS theo mức độ khẩn | `GET /api/v1/emergency/diagnostic-orders/urgency/{urgencyLevel}` | ALL | `emergency.diagnostic.view` |
| 2.2.17 | DS STAT | `GET /api/v1/emergency/diagnostic-orders/stat` | ALL | `emergency.diagnostic.view` |
| 2.2.18 | DS khẩn cấp | `GET /api/v1/emergency/diagnostic-orders/urgent` | ALL | `emergency.diagnostic.view` |
| 2.2.19 | DS theo trạng thái | `GET /api/v1/emergency/diagnostic-orders/status/{status}` | ALL | `emergency.diagnostic.view` |
| 2.2.20 | DS đang chờ | `GET /api/v1/emergency/diagnostic-orders/pending` | ALL | `emergency.diagnostic.view` |
| 2.2.21 | DS đang thực hiện | `GET /api/v1/emergency/diagnostic-orders/in-progress` | ALL | `emergency.diagnostic.view` |
| 2.2.22 | DS hoàn thành | `GET /api/v1/emergency/diagnostic-orders/completed` | ALL | `emergency.diagnostic.view` |
| 2.2.23 | DS theo bác sĩ | `GET /api/v1/emergency/diagnostic-orders/doctor/{doctorId}` | ALL | `emergency.diagnostic.view` |

**Alerts & Monitoring:**
| Bước | API | Method | Người thực hiện | Quyền cần có |
|------|-----|--------|-----------------|--------------|
| 2.2.24 | DS quá hạn | `GET /api/v1/emergency/diagnostic-orders/overdue` | ALL | `emergency.diagnostic.view` |
| 2.2.25 | DS sắp đến hạn | `GET /api/v1/emergency/diagnostic-orders/due-soon?minutesAhead=30` | ALL | `emergency.diagnostic.view` |
| 2.2.26 | Thời gian còn lại | `GET /api/v1/emergency/diagnostic-orders/{id}/time-remaining` | ALL | `emergency.diagnostic.view` |
| 2.2.27 | Kiểm tra quá hạn | `GET /api/v1/emergency/diagnostic-orders/{id}/is-overdue` | ALL | `emergency.diagnostic.view` |

**Statistics:**
| Bước | API | Method | Người thực hiện | Quyền cần có |
|------|-----|--------|-----------------|--------------|
| 2.2.28 | Thống kê TAT | `GET /api/v1/emergency/diagnostic-orders/statistics/turnaround-time` | ADMIN | `emergency.diagnostic.view` |
| 2.2.29 | Thống kê hiệu suất | `GET /api/v1/emergency/diagnostic-orders/statistics/performance` | ADMIN | `emergency.diagnostic.view` |
| 2.2.30 | Thống kê theo loại | `GET /api/v1/emergency/diagnostic-orders/statistics/by-type` | ADMIN | `emergency.diagnostic.view` |
| 2.2.31 | Thống kê theo mức độ khẩn | `GET /api/v1/emergency/diagnostic-orders/statistics/by-urgency` | ADMIN | `emergency.diagnostic.view` |
| 2.2.32 | Đếm theo trạng thái | `GET /api/v1/emergency/diagnostic-orders/statistics/count-by-status?status=` | ADMIN | `emergency.diagnostic.view` |
| 2.2.33 | TAT trung bình | `GET /api/v1/emergency/diagnostic-orders/statistics/average-turnaround/{diagnosticType}` | ADMIN | `emergency.diagnostic.view` |

**Request mẫu - Chỉ định xét nghiệm STAT:**
```json
POST /api/v1/emergency/diagnostic-orders
{
  "emergencyEncounterId": 1,
  "diagnosticType": "LABORATORY",
  "orderDetails": "Troponin, CK-MB, D-Dimer",
  "clinicalIndication": "Nghi nhồi máu cơ tim",
  "urgencyLevel": "STAT"
}
```

---

### 📊 LUỒNG 3: HỘI CHẨN CHUYÊN KHOA

| Bước | API | Method | Người thực hiện | Quyền cần có |
|------|-----|--------|-----------------|--------------|
| 3.1 | Tạo hội chẩn | `POST /api/v1/emergency-consultations` | DOCTOR | `emergency.consultation.create`, `doctor.emergency` |
| 3.2 | Cập nhật hội chẩn | `PUT /api/v1/emergency-consultations/{id}` | DOCTOR | `emergency.consultation.update`, `doctor.emergency` |
| 3.3 | Xem hội chẩn | `GET /api/v1/emergency-consultations/{id}` | DOCTOR | `emergency.consultation.view`, `doctor.view` |
| 3.4 | DS hội chẩn theo encounter | `GET /api/v1/emergency-consultations/encounter/{emergencyEncounterId}` | DOCTOR | `emergency.consultation.view`, `doctor.view` |
| 3.5 | DS hội chẩn theo bác sĩ | `GET /api/v1/emergency-consultations/doctor/{doctorId}` | DOCTOR | `emergency.consultation.view`, `doctor.view` |
| 3.6 | DS khuyến cáo tái khám | `GET /api/v1/emergency-consultations/follow-up-recommended` | DOCTOR | `emergency.consultation.view`, `doctor.view` |
| 3.7 | DS chưa tạo lịch hẹn | `GET /api/v1/emergency-consultations/without-booking` | RECEPTIONIST | `emergency.consultation.view`, `receptionist.view` |
| 3.8 | DS tái khám khẩn cấp | `GET /api/v1/emergency-consultations/urgent-follow-ups` | DOCTOR | `emergency.consultation.view` |
| 3.9 | DS theo khoảng thời gian | `GET /api/v1/emergency-consultations/time-range?startTime=&endTime=` | DOCTOR, ADMIN | `emergency.consultation.view`, `statistics.view` |
| 3.10 | Thống kê hội chẩn | `GET /api/v1/emergency-consultations/statistics` | ADMIN | `emergency.consultation.view`, `statistics.view` |
| 3.11 | Đếm theo bác sĩ | `GET /api/v1/emergency-consultations/count/doctor/{doctorId}` | ADMIN | `emergency.consultation.view`, `statistics.view` |
| 3.12 | Đếm theo chuyên khoa | `GET /api/v1/emergency-consultations/count/specialty/{specialty}` | ADMIN | `emergency.consultation.view`, `statistics.view` |

**Request mẫu - Tạo hội chẩn:**
```json
POST /api/v1/emergency-consultations
{
  "emergencyEncounterId": 1,
  "consultationReason": "Cần hội chẩn Tim mạch cho ca nghi NMCT",
  "doctorAdvice": "Cần can thiệp mạch vành khẩn cấp",
  "recommendedSpecialty": "Cardiology",
  "recommendedDepartmentId": 5,
  "appointmentPriority": "URGENT",
  "warningSignsToReturn": "Đau ngực tăng, khó thở, vã mồ hôi"
}
```

---

### 📊 LUỒNG 4: KẾT THÚC LƯỢT CẤP CỨU

#### 4A. XUẤT VIỆN VỀ NHÀ (Discharge to Home)

| Bước | API | Method | Người thực hiện | Quyền cần có |
|------|-----|--------|-----------------|--------------|
| 4A.1 | Xuất viện đơn giản | `PUT /api/v1/emergency/encounters/{id}/discharge` | DOCTOR | `emergency.discharge`, `doctor.emergency` |
| 4A.2 | Xuất viện với đơn thuốc | `POST /api/v1/emergency/encounters/{id}/discharge` | DOCTOR | `emergency.discharge`, `doctor.emergency` |
| 4A.3 | Quyết toán | `POST /api/v1/emergency/billing/encounters/{id}/settlements` | CASHIER | - |

**Request mẫu - Xuất viện với đơn thuốc:** ✅ MỚI 27/11/2025
```json
POST /api/v1/emergency/encounters/{id}/discharge
{
  "dischargeDiagnosis": "Gãy xương cẳng tay phải",
  "dischargeSummary": "Bệnh nhân ổn định, đã bó bột, hướng dẫn chăm sóc",
  "dischargeInstructions": "Tái khám sau 7 ngày, giữ bột khô ráo",
  "prescriptionItems": [
    {
      "medicineId": 1,
      "dosage": "500mg x 3 lần/ngày",
      "quantity": 21,
      "notes": "Uống sau ăn trong 7 ngày"
    },
    {
      "medicineId": 2,
      "dosage": "20mg x 2 lần/ngày",
      "quantity": 14,
      "notes": "Uống khi đau"
    }
  ],
  "prescriptionNotes": "Thuốc giảm đau và kháng viêm sau gãy xương"
}
```

**Response mẫu:**
```json
{
  "status": "OK",
  "message": "Patient discharged successfully with prescription created",
  "data": {
    "emergencyEncounterId": 11,
    "status": "DISCHARGED",
    "prescriptionId": 200,
    "prescriptionCode": "RX20251127001",
    "dischargeSummary": "Bệnh nhân ổn định...",
    "dischargeTime": "2025-11-27T10:30:00"
  }
}
```

#### 4B. NHẬP VIỆN NỘI TRÚ (Admit to Inpatient)

| Bước | API | Method | Người thực hiện | Quyền cần có |
|------|-----|--------|-----------------|--------------|
| 4B.1 | Nhập viện | `POST /api/v1/emergency/encounters/{id}/admit` | DOCTOR | `emergency.admit`, `doctor.emergency` |

**Request mẫu - Nhập viện:**
```json
POST /api/v1/emergency/encounters/{id}/admit
{
  "departmentId": 5,
  "admissionDiagnosis": "STEMI anterior - cần can thiệp mạch vành",
  "admissionNotes": "Bệnh nhân cần theo dõi ICU sau can thiệp",
  "preferredBedId": 10
}
```

#### 4C. CHUYỂN VIỆN (Transfer to Another Hospital)

| Bước | API | Method | Người thực hiện | Quyền cần có |
|------|-----|--------|-----------------|--------------|
| 4C.1 | Chuyển viện đơn giản | `PUT /api/v1/emergency/encounters/{id}/transfer` | DOCTOR | `emergency.transfer`, `doctor.emergency` |
| 4C.2 | Chuyển viện với giấy chuyển | `POST /api/v1/emergency/encounters/{id}/transfer` | DOCTOR | `emergency.transfer`, `doctor.emergency` |

**Request mẫu - Chuyển viện với giấy chuyển viện:** ✅ MỚI 27/11/2025
```json
POST /api/v1/emergency/encounters/{id}/transfer
{
  "targetHospitalId": 2,
  "transferReason": "Cần can thiệp mạch vành - BV không có phòng DSA",
  "clinicalSummary": "BN nam 55 tuổi, STEMI anterior, Troponin 2.5ng/mL",
  "currentTreatment": "Aspirin 300mg, Heparin 5000UI IV",
  "transportMethod": "AMBULANCE",
  "escortRequired": true,
  "escortType": "DOCTOR_AND_NURSE"
}
```

**Response mẫu:**
```json
{
  "status": "OK",
  "message": "Patient transferred successfully. Hospital referral created: REF20251127002",
  "data": {
    "emergencyEncounterId": 9,
    "status": "TRANSFERRED",
    "hospitalReferralId": 2,
    "hospitalReferralCode": "REF20251127002",
    "dischargeSummary": "Chuyển viện đến BV Tim Hà Nội...",
    "transferTime": "2025-11-27T11:00:00"
  }
}
```

---

### 📊 LUỒNG 5: QUY TRÌNH CẤP CỨU ĐẶC BIỆT (Emergency Protocol)

| Bước | API | Method | Người thực hiện | Quyền cần có |
|------|-----|--------|-----------------|--------------|
| 5.1 | Kích hoạt protocol | `POST /api/v1/emergency/protocols/activate` | DOCTOR, NURSE | `emergency.activate` |
| 5.2 | Xem protocol | `GET /api/v1/emergency/protocols/{protocolId}` | ALL | `emergency.view` |
| 5.3 | DS protocol đang hoạt động | `GET /api/v1/emergency/protocols/active` | ALL | `emergency.view` |
| 5.4 | DS protocol nghiêm trọng | `GET /api/v1/emergency/protocols/critical` | ALL | `emergency.view` |
| 5.5 | DS protocol theo khoa | `GET /api/v1/emergency/protocols/department/{departmentId}` | ALL | `emergency.view` |
| 5.6 | DS protocol theo loại | `GET /api/v1/emergency/protocols/type/{protocolType}` | ALL | `emergency.view` |
| 5.7 | DS protocol theo bệnh nhân | `GET /api/v1/emergency/protocols/patient/{patientId}` | ALL | `emergency.view` |
| 5.8 | DS protocol quá hạn | `GET /api/v1/emergency/protocols/overdue?hoursThreshold=4` | ALL | `emergency.view` |
| 5.9 | DS protocol gần đây | `GET /api/v1/emergency/protocols/recent?hoursBack=24` | ALL | `emergency.view` |
| 5.10 | Lấy quy trình xử lý | `GET /api/v1/emergency/protocols/procedures/{protocolType}` | ALL | `emergency.view` |
| 5.11 | Lấy đội phản ứng | `GET /api/v1/emergency/protocols/response-team/{protocolType}?departmentId=` | ALL | `emergency.view` |
| 5.12 | Gửi cảnh báo | `POST /api/v1/emergency/protocols/{protocolId}/alert?alertMessage=` | DOCTOR, NURSE | `emergency.alert` |
| 5.13 | Giải quyết protocol | `POST /api/v1/emergency/protocols/{protocolId}/resolve?resolutionNotes=` | DOCTOR | `emergency.resolve` |
| 5.14 | Hủy protocol | `POST /api/v1/emergency/protocols/{protocolId}/cancel?reason=` | DOCTOR | `emergency.cancel` |
| 5.15 | Thống kê protocol | `GET /api/v1/emergency/protocols/statistics?departmentId=` | ADMIN | `emergency.view` |

**Request mẫu - Kích hoạt CODE BLUE:**
```json
POST /api/v1/emergency/protocols/activate
{
  "protocolType": "CODE_BLUE",
  "patientId": 123,
  "departmentId": 1,
  "location": "Phòng cấp cứu 3",
  "severityLevel": "CRITICAL",
  "description": "Bệnh nhân ngừng tim đột ngột"
}
```

---

### 📊 LUỒNG 6: THANH TOÁN CẤP CỨU (Emergency Billing)

| Bước | API | Method | Người thực hiện | Quyền cần có |
|------|-----|--------|-----------------|--------------|
| 6.1 | Thu tạm ứng | `POST /api/v1/emergency/billing/deposits` | CASHIER | - |
| 6.2 | Kiểm tra số dư | `GET /api/v1/emergency/billing/encounters/{id}/balance` | CASHIER | - |
| 6.3 | Xem chi phí tích lũy | `GET /api/v1/emergency/billing/encounters/{id}/charges` | CASHIER | - |
| 6.4 | Tạo hóa đơn | `POST /api/v1/emergency/billing/encounters/{id}/invoices` | CASHIER | - |
| 6.5 | Quyết toán xuất viện | `POST /api/v1/emergency/billing/encounters/{id}/settlements` | CASHIER | - |

**Request mẫu - Thu tạm ứng:**
```json
POST /api/v1/emergency/billing/deposits
{
  "emergencyEncounterId": 1,
  "amount": 5000000,
  "paymentMethod": "CASH",
  "notes": "Tạm ứng cấp cứu"
}
```

---

### 📊 LUỒNG 7: GIÁM SÁT VÀ DASHBOARD

| Bước | API | Method | Người thực hiện | Quyền cần có |
|------|-----|--------|-----------------|--------------|
| 7.1 | Dashboard tổng quan | `GET /api/v1/emergency/encounters/dashboard` | ALL | `emergency.dashboard` |
| 7.2 | Ca đe dọa tính mạng | `GET /api/v1/emergency/encounters/life-threatening` | DOCTOR, NURSE | `emergency.view` |
| 7.3 | Ca chờ quá lâu | `GET /api/v1/emergency/encounters/excessive-wait` | NURSE | `emergency.view` |
| 7.4 | Ca đau nặng | `GET /api/v1/emergency/encounters/severe-pain` | DOCTOR, NURSE | `emergency.view` |
| 7.5 | XN quá hạn | `GET /api/v1/emergency/diagnostic-orders/overdue` | LAB_TECH | `emergency.diagnostic.view` |
| 7.6 | XN sắp đến hạn | `GET /api/v1/emergency/diagnostic-orders/due-soon` | LAB_TECH | `emergency.diagnostic.view` |
| 7.7 | Protocol quá hạn | `GET /api/v1/emergency/protocols/overdue` | DOCTOR, NURSE | `emergency.view` |
| 7.8 | Thống kê | `GET /api/v1/emergency/encounters/statistics` | ADMIN | `emergency.stats` |

---

## 📝 GHI CHÚ QUAN TRỌNG VỀ TUÂN THỦ QUY ĐỊNH

### Thông tư 52/2017/TT-BYT - Phân loại đơn thuốc

Theo quy định của Bộ Y tế Việt Nam, đơn thuốc được phân loại theo **nguồn chi trả**, không phải theo khoa/phòng:

| Loại | Mô tả | Sử dụng trong hệ thống |
|------|-------|------------------------|
| `OUTPATIENT` | Đơn thuốc ngoại trú | Khám bệnh thông thường |
| `DISCHARGE` | Đơn thuốc khi xuất viện/rời cơ sở y tế | **Cấp cứu xuất viện**, Nội trú xuất viện |

**Lưu ý:** Hệ thống KHÔNG sử dụng `prescriptionCategory = "EMERGENCY"` vì:
1. Không có trong quy chuẩn y tế Việt Nam
2. Thông tin "cấp cứu" đã được lưu trong `Encounter.encounter_type = 'EMERGENCY'`
3. Tránh trùng lặp dữ liệu

**Cách truy vấn đơn thuốc từ khoa cấp cứu:**
```sql
SELECT p.*
FROM "Prescriptions" p
JOIN "Encounters" e ON p.encounter_id = e.encounter_id
WHERE e.encounter_type = 'EMERGENCY';
```

---

## 📋 DANH SÁCH API CHI TIẾT THEO CONTROLLER (Cập nhật 27/11/2025)

### 1. EmergencyEncounterController (31 APIs)
**Base URL:** `/api/v1/emergency/encounters`

#### CRUD Operations (4 APIs)
| # | Method | Endpoint | Mô tả | Người thực hiện | Quyền |
|---|--------|----------|-------|-----------------|-------|
| 1 | POST | `/` | Tạo lượt cấp cứu | NURSE, RECEPTIONIST | `emergency.create`, `nurse.triage` |
| 2 | PUT | `/{id}` | Cập nhật lượt cấp cứu | NURSE, DOCTOR | `emergency.update`, `nurse.triage`, `doctor.emergency` |
| 3 | GET | `/{id}` | Lấy theo ID | NURSE, DOCTOR | `emergency.view`, `nurse.triage`, `doctor.emergency` |
| 4 | GET | `/encounter/{encounterId}` | Lấy theo encounter ID | NURSE, DOCTOR | `emergency.view`, `nurse.triage`, `doctor.emergency` |

#### Query Operations (13 APIs)
| # | Method | Endpoint | Mô tả | Người thực hiện | Quyền |
|---|--------|----------|-------|-----------------|-------|
| 5 | GET | `/active` | Lượt cấp cứu đang hoạt động | NURSE, DOCTOR | `emergency.view` |
| 6 | GET | `/life-threatening` | Ca đe dọa tính mạng | NURSE, DOCTOR | `emergency.view` |
| 7 | GET | `/waiting-triage` | Hàng đợi chờ phân loại | NURSE | `emergency.view`, `nurse.triage` |
| 8 | GET | `/waiting-doctor` | Hàng đợi chờ bác sĩ | DOCTOR | `emergency.view`, `doctor.emergency` |
| 9 | GET | `/category/{category}` | Theo phân loại (1-5) | NURSE, DOCTOR | `emergency.view` |
| 10 | GET | `/status/{status}` | Theo trạng thái | NURSE, DOCTOR | `emergency.view` |
| 11 | GET | `/severe-pain` | Đau nặng (pain >= 7) | NURSE, DOCTOR | `emergency.view` |
| 12 | GET | `/excessive-wait` | Chờ quá lâu | NURSE, DOCTOR | `emergency.view` |
| 13 | GET | `/nurse/{nurseId}` | Theo điều dưỡng | NURSE | `emergency.view`, `nurse.triage` |
| 14 | GET | `/doctor/{doctorId}` | Theo bác sĩ | DOCTOR | `emergency.view`, `doctor.emergency` |
| 15 | GET | `/recent-discharges?hours=24` | Xuất viện gần đây | NURSE, DOCTOR | `emergency.view` |
| 16 | GET | `/recent-admissions?hours=24` | Nhập viện gần đây | NURSE, DOCTOR | `emergency.view` |
| 17 | GET | `/search?query=` | Tìm kiếm | NURSE, DOCTOR | `emergency.view` |

#### Workflow Operations (9 APIs)
| # | Method | Endpoint | Mô tả | Người thực hiện | Quyền |
|---|--------|----------|-------|-----------------|-------|
| 18 | PUT | `/{id}/assign-nurse?nurseId=` | Phân công điều dưỡng | NURSE | `emergency.triage`, `nurse.triage` |
| 19 | PUT | `/{id}/assign-doctor?doctorId=` | Phân công bác sĩ | NURSE | `emergency.assign`, `nurse.triage` |
| 20 | PUT | `/{id}/complete-triage` | Hoàn thành triage | NURSE | `emergency.triage`, `nurse.triage` |
| 21 | PUT | `/{id}/status?status=` | Cập nhật trạng thái | NURSE, DOCTOR | `emergency.update` |
| 22 | PUT | `/{id}/discharge` | Xuất viện (đơn giản) | DOCTOR | `emergency.discharge`, `doctor.emergency` |
| 23 | POST | `/{id}/discharge` | Xuất viện với đơn thuốc ✅ | DOCTOR | `emergency.discharge`, `doctor.emergency` |
| 24 | POST | `/{id}/admit` | Nhập viện nội trú | DOCTOR | `emergency.admit`, `doctor.emergency` |
| 25 | PUT | `/{id}/transfer` | Chuyển viện (đơn giản) | DOCTOR | `emergency.transfer`, `doctor.emergency` |
| 26 | POST | `/{id}/transfer` | Chuyển viện với giấy chuyển ✅ | DOCTOR | `emergency.transfer`, `doctor.emergency` |

#### Statistics & Dashboard (5 APIs)
| # | Method | Endpoint | Mô tả | Người thực hiện | Quyền |
|---|--------|----------|-------|-----------------|-------|
| 27 | GET | `/statistics?startTime=` | Thống kê tổng hợp | ADMIN | `emergency.view`, `emergency.stats` |
| 28 | GET | `/dashboard` | Dữ liệu dashboard | ALL | `emergency.view`, `emergency.dashboard` |
| 29 | GET | `/count/active` | Đếm đang hoạt động | ALL | `emergency.view` |
| 30 | GET | `/count/category/{category}` | Đếm theo phân loại | ALL | `emergency.view` |
| 31 | GET | `/count/status/{status}` | Đếm theo trạng thái | ALL | `emergency.view` |

---

### 2. EmergencyConsultationController (12 APIs)
**Base URL:** `/api/v1/emergency-consultations`

| # | Method | Endpoint | Mô tả | Người thực hiện | Quyền |
|---|--------|----------|-------|-----------------|-------|
| 1 | POST | `/` | Tạo hội chẩn | DOCTOR | `emergency.consultation.create`, `doctor.emergency` |
| 2 | PUT | `/{consultationId}` | Cập nhật hội chẩn | DOCTOR | `emergency.consultation.update`, `doctor.emergency` |
| 3 | GET | `/{consultationId}` | Lấy chi tiết | DOCTOR | `emergency.consultation.view`, `doctor.view` |
| 4 | GET | `/encounter/{emergencyEncounterId}` | Theo lượt cấp cứu | DOCTOR | `emergency.consultation.view`, `doctor.view` |
| 5 | GET | `/doctor/{doctorId}` | Theo bác sĩ | DOCTOR | `emergency.consultation.view`, `doctor.view` |
| 6 | GET | `/follow-up-recommended` | Khuyến cáo tái khám | DOCTOR | `emergency.consultation.view`, `doctor.view` |
| 7 | GET | `/without-booking` | Chưa tạo lịch hẹn | RECEPTIONIST | `emergency.consultation.view`, `receptionist.view` |
| 8 | GET | `/urgent-follow-ups` | Tái khám khẩn cấp | DOCTOR | `emergency.consultation.view`, `doctor.view` |
| 9 | GET | `/time-range?startTime=&endTime=` | Theo khoảng thời gian | ADMIN | `emergency.consultation.view`, `statistics.view` |
| 10 | GET | `/statistics?startTime=` | Thống kê | ADMIN | `emergency.consultation.view`, `statistics.view` |
| 11 | GET | `/count/doctor/{doctorId}` | Đếm theo bác sĩ | ADMIN | `emergency.consultation.view`, `statistics.view` |
| 12 | GET | `/count/specialty/{specialty}` | Đếm theo chuyên khoa | ADMIN | `emergency.consultation.view`, `statistics.view` |

---

### 3. EmergencyDiagnosticOrderController (33 APIs)
**Base URL:** `/api/v1/emergency/diagnostic-orders`

#### CRUD Operations (5 APIs)
| # | Method | Endpoint | Mô tả | Người thực hiện | Quyền |
|---|--------|----------|-------|-----------------|-------|
| 1 | POST | `/` | Tạo chỉ định XN/CĐHA | DOCTOR | `emergency.diagnostic.create` |
| 2 | PUT | `/{id}` | Cập nhật chỉ định | DOCTOR | `emergency.diagnostic.update` |
| 3 | POST | `/{id}/cancel?cancellationReason=` | Hủy chỉ định | DOCTOR | `emergency.diagnostic.cancel` |
| 4 | GET | `/{id}` | Lấy chi tiết | ALL | `emergency.diagnostic.view` |
| 5 | GET | `/` | Danh sách (phân trang) | ALL | `emergency.diagnostic.view` |

#### Workflow Management (5 APIs)
| # | Method | Endpoint | Mô tả | Người thực hiện | Quyền |
|---|--------|----------|-------|-----------------|-------|
| 6 | POST | `/{id}/accept` | Tiếp nhận | LAB_TECH, RADIOLOGY_TECH | `emergency.diagnostic.process` |
| 7 | POST | `/{id}/start` | Bắt đầu thực hiện | LAB_TECH, RADIOLOGY_TECH | `emergency.diagnostic.process` |
| 8 | POST | `/{id}/complete` | Hoàn thành | LAB_TECH, RADIOLOGY_TECH | `emergency.diagnostic.process` |
| 9 | POST | `/{id}/report?results=&interpretation=` | Báo cáo kết quả | LAB_TECH, RADIOLOGY_TECH | `emergency.diagnostic.report` |
| 10 | POST | `/{id}/confirm` | Bác sĩ xác nhận | DOCTOR | `emergency.diagnostic.confirm` |

#### Query by Encounter (4 APIs)
| # | Method | Endpoint | Mô tả | Người thực hiện | Quyền |
|---|--------|----------|-------|-----------------|-------|
| 11 | GET | `/encounter/{encounterId}` | Theo ca cấp cứu | ALL | `emergency.diagnostic.view` |
| 12 | GET | `/encounter/{encounterId}/pending` | Đang chờ theo ca | ALL | `emergency.diagnostic.view` |
| 13 | GET | `/encounter/{encounterId}/completed` | Đã hoàn thành theo ca | ALL | `emergency.diagnostic.view` |
| 14 | GET | `/encounter/{encounterId}/count` | Đếm theo ca | ALL | `emergency.diagnostic.view` |

#### Query by Type/Urgency/Status (9 APIs)
| # | Method | Endpoint | Mô tả | Người thực hiện | Quyền |
|---|--------|----------|-------|-----------------|-------|
| 15 | GET | `/type/{diagnosticType}` | Theo loại (LABORATORY, RADIOLOGY, ECG...) | ALL | `emergency.diagnostic.view` |
| 16 | GET | `/urgency/{urgencyLevel}` | Theo mức độ khẩn (STAT, URGENT, ROUTINE) | ALL | `emergency.diagnostic.view` |
| 17 | GET | `/status/{status}` | Theo trạng thái | ALL | `emergency.diagnostic.view` |
| 18 | GET | `/stat` | Chỉ định STAT (cực khẩn) | ALL | `emergency.diagnostic.view` |
| 19 | GET | `/urgent` | Chỉ định khẩn | ALL | `emergency.diagnostic.view` |
| 20 | GET | `/pending` | Đang chờ | ALL | `emergency.diagnostic.view` |
| 21 | GET | `/in-progress` | Đang thực hiện | ALL | `emergency.diagnostic.view` |
| 22 | GET | `/completed` | Đã hoàn thành | ALL | `emergency.diagnostic.view` |
| 23 | GET | `/doctor/{doctorId}` | Theo bác sĩ chỉ định | ALL | `emergency.diagnostic.view` |

#### Alerts & Monitoring (4 APIs)
| # | Method | Endpoint | Mô tả | Người thực hiện | Quyền |
|---|--------|----------|-------|-----------------|-------|
| 24 | GET | `/overdue` | Quá hạn | LAB_TECH, NURSE | `emergency.diagnostic.view` |
| 25 | GET | `/due-soon?minutesAhead=30` | Sắp đến hạn | LAB_TECH, NURSE | `emergency.diagnostic.view` |
| 26 | GET | `/{id}/time-remaining` | Thời gian còn lại (phút) | ALL | `emergency.diagnostic.view` |
| 27 | GET | `/{id}/is-overdue` | Kiểm tra quá hạn | ALL | `emergency.diagnostic.view` |

#### Statistics (6 APIs)
| # | Method | Endpoint | Mô tả | Người thực hiện | Quyền |
|---|--------|----------|-------|-----------------|-------|
| 28 | GET | `/statistics/turnaround-time` | Thống kê TAT | ADMIN | `emergency.diagnostic.view` |
| 29 | GET | `/statistics/performance` | Hiệu suất | ADMIN | `emergency.diagnostic.view` |
| 30 | GET | `/statistics/by-type` | Theo loại | ADMIN | `emergency.diagnostic.view` |
| 31 | GET | `/statistics/by-urgency` | Theo mức độ khẩn | ADMIN | `emergency.diagnostic.view` |
| 32 | GET | `/statistics/count-by-status?status=` | Đếm theo trạng thái | ADMIN | `emergency.diagnostic.view` |
| 33 | GET | `/statistics/average-turnaround/{diagnosticType}` | TAT trung bình theo loại | ADMIN | `emergency.diagnostic.view` |

---

### 4. EmergencyProtocolController (15 APIs)
**Base URL:** `/api/v1/emergency/protocols`

#### Protocol Management (3 APIs)
| # | Method | Endpoint | Mô tả | Người thực hiện | Quyền |
|---|--------|----------|-------|-----------------|-------|
| 1 | POST | `/activate` | Kích hoạt protocol | DOCTOR, NURSE | `emergency.activate` |
| 2 | POST | `/{protocolId}/resolve?resolutionNotes=` | Giải quyết | DOCTOR | `emergency.resolve` |
| 3 | POST | `/{protocolId}/cancel?reason=` | Hủy | DOCTOR | `emergency.cancel` |

#### Query Operations (8 APIs)
| # | Method | Endpoint | Mô tả | Người thực hiện | Quyền |
|---|--------|----------|-------|-----------------|-------|
| 4 | GET | `/{protocolId}` | Chi tiết | ALL | `emergency.view` |
| 5 | GET | `/active` | Đang hoạt động | ALL | `emergency.view` |
| 6 | GET | `/critical` | Nghiêm trọng | ALL | `emergency.view` |
| 7 | GET | `/department/{departmentId}` | Theo khoa | ALL | `emergency.view` |
| 8 | GET | `/type/{protocolType}` | Theo loại (CODE_BLUE, STEMI_ALERT...) | ALL | `emergency.view` |
| 9 | GET | `/patient/{patientId}` | Theo bệnh nhân | ALL | `emergency.view` |
| 10 | GET | `/overdue?hoursThreshold=4` | Quá hạn | ALL | `emergency.view` |
| 11 | GET | `/recent?hoursBack=24` | Gần đây | ALL | `emergency.view` |

#### Support Operations (4 APIs)
| # | Method | Endpoint | Mô tả | Người thực hiện | Quyền |
|---|--------|----------|-------|-----------------|-------|
| 12 | GET | `/procedures/{protocolType}` | Quy trình xử lý | ALL | `emergency.view` |
| 13 | GET | `/response-team/{protocolType}?departmentId=` | Đội phản ứng | ALL | `emergency.view` |
| 14 | POST | `/{protocolId}/alert?alertMessage=` | Gửi cảnh báo | DOCTOR, NURSE | `emergency.alert` |
| 15 | GET | `/statistics?departmentId=` | Thống kê | ADMIN | `emergency.view` |

---

### 5. EmergencyBillingController (5 APIs)
**Base URL:** `/api/v1/emergency/billing`

| # | Method | Endpoint | Mô tả | Người thực hiện | Quyền |
|---|--------|----------|-------|-----------------|-------|
| 1 | POST | `/deposits` | Thu tạm ứng cấp cứu | CASHIER | - |
| 2 | GET | `/encounters/{encounterId}/balance` | Kiểm tra số dư | CASHIER, NURSE | - |
| 3 | GET | `/encounters/{encounterId}/charges` | Chi phí tích lũy | CASHIER | - |
| 4 | POST | `/encounters/{encounterId}/invoices?employeeId=` | Tạo hóa đơn | CASHIER | - |
| 5 | POST | `/encounters/{encounterId}/settlements?refundMethod=&employeeId=` | Quyết toán xuất viện | CASHIER | - |

---

## 👥 MA TRẬN PHÂN QUYỀN THEO VAI TRÒ

| Vai trò | Mô tả | Các quyền chính |
|---------|-------|-----------------|
| **RECEPTIONIST** | Lễ tân | Tạo encounter, tra cứu bệnh nhân |
| **NURSE** | Điều dưỡng | Triage, phân công, theo dõi, cập nhật trạng thái |
| **DOCTOR** | Bác sĩ | Khám, chỉ định, hội chẩn, xuất viện, nhập viện, chuyển viện |
| **LAB_TECH** | Kỹ thuật viên XN | Tiếp nhận, thực hiện, báo cáo kết quả XN |
| **RADIOLOGY_TECH** | Kỹ thuật viên CĐHA | Tiếp nhận, thực hiện, báo cáo kết quả CĐHA |
| **PHARMACIST** | Dược sĩ | Phát thuốc theo đơn |
| **CASHIER** | Thu ngân | Thu tạm ứng, tạo hóa đơn, quyết toán |
| **ADMIN** | Quản trị | Thống kê, báo cáo, cấu hình |

---

## 📊 TỔNG KẾT SỐ LƯỢNG API

| Controller | Số API | Ghi chú |
|------------|--------|---------|
| EmergencyEncounterController | 31 | +2 API mới (discharge/transfer với details) |
| EmergencyConsultationController | 12 | Đầy đủ |
| EmergencyDiagnosticOrderController | 33 | Đầy đủ |
| EmergencyProtocolController | 15 | Đầy đủ |
| EmergencyBillingController | 5 | Đầy đủ |
| **TỔNG CỘNG** | **96 APIs** | |

---

*Báo cáo được tạo tự động bởi Kiro - November 26, 2025*
*Cập nhật lần cuối: November 27, 2025 - Hoàn thiện tích hợp Prescription và HospitalReferral, bổ sung chi tiết API đầy đủ*
