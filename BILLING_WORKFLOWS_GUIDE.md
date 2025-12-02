# 📋 HƯỚNG DẪN CÁC LUỒNG THANH TOÁN (BILLING WORKFLOWS)

> **Tài liệu này mô tả tất cả các luồng thanh toán trong hệ thống HIS**
> 
> Ngày cập nhật: 26/11/2025

---

## 📊 TỔNG QUAN CÁC LUỒNG THANH TOÁN

Hệ thống HIS có **8 luồng thanh toán chính**:

| # | Luồng | Mô tả | Đặc điểm |
|---|-------|-------|----------|
| 1 | **Ngoại trú (Outpatient)** | Khám bệnh và về trong ngày | Không tính tiền thuốc |
| 2 | **Nội trú (Inpatient)** | Nằm viện điều trị | Tính thuốc từ MedicationOrder |
| 3 | **Xuất viện (Discharge)** | Ra viện sau nội trú | Tính thuốc mang về |
| 4 | **Cấp cứu (Emergency)** | Cấp cứu khẩn cấp | Thanh toán sau điều trị |
| 5 | **Trả góp (Installment)** | Chia kỳ thanh toán | Cho hóa đơn lớn |
| 6 | **Tạm ứng (Advance Payment)** | Đặt cọc trước | Cho nội trú/phẫu thuật |
| 7 | **Hoàn tiền (Refund)** | Hoàn trả tiền thừa | Khi hủy dịch vụ/thanh toán dư |
| 8 | **Ca thu ngân (Cashier Shift)** | Quản lý ca làm việc | Đối soát cuối ca |

---

## 1️⃣ LUỒNG NGOẠI TRÚ (OUTPATIENT BILLING)

### 1.1. Sơ đồ luồng

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LUỒNG NGOẠI TRÚ (OUTPATIENT)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ Đăng ký  │───▶│ Tiếp nhận│───▶│ Khám bệnh│───▶│ Xét nghiệm│             │
│  │ (Booking)│    │(Encounter)│   │ (Doctor) │    │ (Lab/CĐHA)│             │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘              │
│                                        │                │                   │
│                                        ▼                ▼                   │
│                              ┌─────────────────────────────┐                │
│                              │      TẠO HÓA ĐƠN            │                │
│                              │  ✅ Phí khám + xét nghiệm   │                │
│                              │  ❌ Tiền thuốc (KHÔNG)      │                │
│                              └─────────────────────────────┘                │
│                                        │                                    │
│                                        ▼                                    │
│                              ┌─────────────────┐                            │
│                              │   THANH TOÁN    │                            │
│                              └─────────────────┘                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2. Chi tiết API

```bash
# Bước 1: Đăng ký khám
POST /api/v1/bookings
{ "patient_id": 30, "doctor_id": 5, "clinic_id": 1, "booking_date": "2025-11-26" }

# Bước 2: Tiếp nhận
POST /api/v1/encounters
{ "patient_id": 30, "booking_id": 123, "encounter_type": "OUTPATIENT" }

# Bước 3: Chỉ định xét nghiệm/CĐHA
POST /api/v1/lab-tests
{ "encounter_id": 456, "tests": [{"medical_test_id": 1}] }

# Bước 4: Tạo hóa đơn
POST /api/v1/payments/generate-invoice
{ "encounter_id": 456, "health_insurance_id": 10 }

# Bước 5: Thanh toán
POST /api/v1/transactions/process-payment
{ "patient_id": 30, "invoice_id": 345, "transaction_type": "INVOICE_PAYMENT", "amount": 90000, "payment_method": "CASH" }
```

### 1.3. Hóa đơn ngoại trú bao gồm

| Loại chi phí | Tính vào hóa đơn? | Ghi chú |
|--------------|-------------------|---------|
| Phí khám bệnh | ✅ Có | Consultation fee |
| Phí xét nghiệm | ✅ Có | Lab tests |
| Phí CĐHA | ✅ Có | X-ray, CT, MRI |
| **Tiền thuốc** | ❌ **KHÔNG** | Bệnh nhân tự mua ngoài |

### 1.4. Quy trình thanh toán ngoại trú thực tế

```
┌─────────────────────────────────────────────────────────────────┐
│  BƯỚC 1: Thanh toán PHÍ KHÁM trước khi vào phòng khám          │
│  → Bệnh nhân đóng tiền khám → Nhận số thứ tự → Vào khám        │
├─────────────────────────────────────────────────────────────────┤
│  BƯỚC 2: Thanh toán PHÍ XÉT NGHIỆM/CĐHA trước khi làm          │
│  → Bác sĩ chỉ định → Thu ngân thu tiền → Làm xét nghiệm        │
├─────────────────────────────────────────────────────────────────┤
│  BƯỚC 3: Hoặc thanh toán TẤT CẢ một lần cuối buổi khám         │
│  → Tạo hóa đơn tổng → Thanh toán → Nhận đơn thuốc về           │
└─────────────────────────────────────────────────────────────────┘
```

> **Lưu ý**: Tùy quy định từng BV, có thể thanh toán từng phần hoặc một lần cuối.

### 1.5. Đặt cọc trước khi khám (Consultation Deposit) 💰

Một số bệnh viện yêu cầu đặt cọc phí khám trước khi vào phòng khám:

```
┌─────────────────────────────────────────────────────────────────┐
│              QUY TRÌNH ĐẶT CỌC NGOẠI TRÚ                       │
├─────────────────────────────────────────────────────────────────┤
│  1. Bệnh nhân đăng ký khám (Booking)                           │
│     ↓                                                          │
│  2. Thu ngân thu PHÍ KHÁM (đặt cọc)                            │
│     → Tạo transaction: ADVANCE_PAYMENT hoặc INVOICE_PAYMENT    │
│     → In phiếu thu / biên lai                                  │
│     ↓                                                          │
│  3. Bệnh nhân nhận số thứ tự → Vào phòng khám                  │
│     ↓                                                          │
│  4. Sau khám: Thanh toán thêm xét nghiệm/CĐHA (nếu có)         │
│     → Hoặc tạo hóa đơn tổng cuối buổi                          │
└─────────────────────────────────────────────────────────────────┘
```

**API đặt cọc phí khám:**
```bash
# Cách 1: Thanh toán phí khám trực tiếp (không qua invoice)
POST /api/v1/transactions/advance-payment?patientId=30&amount=150000&paymentMethod=CASH

# Cách 2: Tạo invoice phí khám → Thanh toán
POST /api/v1/payments/generate-invoice
{ "encounter_id": 456, "service_type": "CONSULTATION_ONLY" }

POST /api/v1/transactions/process-payment
{ "patient_id": 30, "invoice_id": 345, "transaction_type": "INVOICE_PAYMENT", "amount": 150000, "payment_method": "CASH" }
```

**Mức phí khám tham khảo:**

| Loại khám | Phí khám (VND) |
|-----------|---------------|
| Khám thường | 100,000 - 150,000 |
| Khám chuyên khoa | 150,000 - 300,000 |
| Khám giáo sư/PGS | 300,000 - 500,000 |
| Khám ngoài giờ | +50% phí khám |
| Khám VIP | 500,000 - 1,000,000 |

---

## 2️⃣ LUỒNG NỘI TRÚ (INPATIENT BILLING)

### 2.1. Sơ đồ luồng

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          LUỒNG NỘI TRÚ (INPATIENT)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ Nhập viện│───▶│ Phân     │───▶│ Điều trị │───▶│ Y lệnh   │              │
│  │(Admission)│   │ giường   │    │ hàng ngày│    │(MedOrder)│              │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘              │
│                                        │                                    │
│                                        ▼                                    │
│                              ┌─────────────────────────────┐                │
│                              │   TÍCH LŨY CHI PHÍ HÀNG NGÀY │               │
│                              │  ✅ Phí giường + dịch vụ    │                │
│                              │  ✅ Tiền thuốc (Y lệnh)     │                │
│                              │  ✅ Vật tư y tế + phẫu thuật│                │
│                              └─────────────────────────────┘                │
│                                        │                                    │
│                                        ▼                                    │
│                              ┌─────────────────┐                            │
│                              │  THANH TOÁN     │                            │
│                              │  KHI XUẤT VIỆN  │                            │
│                              └─────────────────┘                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2. Đặc điểm

- Thuốc được kê qua **MedicationOrder** (Y lệnh), không phải Prescription
- Dược sĩ cấp thuốc từ kho bệnh viện → **TÍNH vào hóa đơn**
- Y tá cấp phát thuốc cho bệnh nhân hàng ngày (MedicationAdministration)
- Thanh toán tổng hợp khi xuất viện

### 2.2.1. Quy trình nhập viện thực tế

```
┌─────────────────────────────────────────────────────────────────┐
│  1. Bác sĩ chỉ định nhập viện (AdmissionRequest)               │
├─────────────────────────────────────────────────────────────────┤
│  2. Thu ngân yêu cầu TẠM ỨNG (30-50% chi phí dự kiến)          │
│     → Bệnh nhân không có BHYT: tạm ứng cao hơn                 │
│     → Bệnh nhân có BHYT: tạm ứng phần đồng chi trả             │
├─────────────────────────────────────────────────────────────────┤
│  3. Phân giường (BedAssignment)                                │
├─────────────────────────────────────────────────────────────────┤
│  4. Điều trị hàng ngày - Chi phí tích lũy                      │
├─────────────────────────────────────────────────────────────────┤
│  5. Xuất viện - Tạo hóa đơn tổng - Thanh toán/Hoàn tạm ứng     │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2.2. Tạm ứng nội trú chi tiết (Inpatient Deposit) 💰

**Quy trình tạm ứng khi nhập viện:**

```
┌─────────────────────────────────────────────────────────────────┐
│              QUY TRÌNH TẠM ỨNG NỘI TRÚ                         │
├─────────────────────────────────────────────────────────────────┤
│  BƯỚC 1: Ước tính chi phí điều trị                             │
│  → Dựa trên chẩn đoán, số ngày nằm viện dự kiến               │
│  → Có phẫu thuật hay không                                     │
│  → Loại giường (thường/VIP)                                    │
├─────────────────────────────────────────────────────────────────┤
│  BƯỚC 2: Tính mức tạm ứng                                      │
│  → Có BHYT: Tạm ứng = Chi phí dự kiến × (100% - BHYT%)        │
│  → Không BHYT: Tạm ứng = 50-100% chi phí dự kiến              │
├─────────────────────────────────────────────────────────────────┤
│  BƯỚC 3: Thu tiền tạm ứng                                      │
│  → Tạo transaction: ADVANCE_PAYMENT                            │
│  → In phiếu thu tạm ứng                                        │
├─────────────────────────────────────────────────────────────────┤
│  BƯỚC 4: Theo dõi trong quá trình điều trị                     │
│  → Nếu chi phí vượt tạm ứng → Yêu cầu nộp thêm                │
│  → Cảnh báo khi số dư tạm ứng < 20% chi phí tích lũy          │
├─────────────────────────────────────────────────────────────────┤
│  BƯỚC 5: Quyết toán khi xuất viện                              │
│  → Tạo hóa đơn tổng                                            │
│  → Trừ tiền tạm ứng (ADVANCE_USED)                             │
│  → Thu thêm nếu thiếu / Hoàn trả nếu thừa                      │
└─────────────────────────────────────────────────────────────────┘
```

**Mức tạm ứng theo loại điều trị:**

| Loại điều trị | Có BHYT | Không BHYT |
|---------------|---------|------------|
| Nội khoa thông thường | 2-5 triệu | 10-20 triệu |
| Ngoại khoa nhỏ | 5-10 triệu | 20-50 triệu |
| Phẫu thuật lớn | 10-30 triệu | 50-200 triệu |
| ICU/Hồi sức | 20-50 triệu | 100-500 triệu |
| Sản khoa (đẻ thường) | 3-5 triệu | 15-25 triệu |
| Sản khoa (mổ đẻ) | 5-10 triệu | 25-50 triệu |

**API tạm ứng nội trú:**
```bash
# Bước 1: Nộp tạm ứng khi nhập viện
POST /api/v1/transactions/advance-payment?patientId=30&amount=20000000&paymentMethod=CASH

# Bước 2: Kiểm tra số dư tạm ứng (trong quá trình điều trị)
GET /api/v1/transactions/patient/30/advance-balance
# Response: 20000000

# Bước 3: Nộp thêm tạm ứng (nếu cần)
POST /api/v1/transactions/advance-payment?patientId=30&amount=10000000&paymentMethod=BANK_TRANSFER

# Bước 4: Khi xuất viện - Tạo hóa đơn
POST /api/v1/payments/generate-invoice
{ "encounter_id": 456, "health_insurance_id": 10 }
# Response: total_amount = 25,000,000, patient_responsible = 5,000,000 (sau BHYT)

# Bước 5: Sử dụng tạm ứng để thanh toán
POST /api/v1/transactions/process-payment
{
  "patient_id": 30,
  "invoice_id": 789,
  "transaction_type": "ADVANCE_USED",
  "amount": 5000000,
  "payment_method": "ADVANCE"
}

# Bước 6: Hoàn trả tạm ứng thừa (nếu có)
# Số dư còn: 30,000,000 - 5,000,000 = 25,000,000
POST /api/v1/transactions/process-refund
{
  "original_payment_id": 567,
  "amount": 25000000,
  "reason": "Hoàn tạm ứng sau xuất viện",
  "refund_method": "CASH"
}
```

**Cảnh báo tạm ứng:**
- ⚠️ Khi số dư < 30% chi phí tích lũy → Nhắc nhở nộp thêm
- 🔴 Khi số dư < 10% chi phí tích lũy → Cảnh báo khẩn cấp
- 🚫 Khi số dư = 0 → Tạm dừng dịch vụ không khẩn cấp (trừ cấp cứu)

### 2.3. Hóa đơn nội trú bao gồm

| Loại chi phí | Tính vào hóa đơn? | Source |
|--------------|-------------------|--------|
| Phí giường bệnh | ✅ Có | InpatientStay |
| Phí dịch vụ y tế | ✅ Có | Services |
| Tiền thuốc (Y lệnh) | ✅ Có | MedicationOrder |
| Vật tư y tế | ✅ Có | MaterialUsageOrder |
| Phí phẫu thuật | ✅ Có | Surgery |
| Phí truyền máu | ✅ Có | BloodOrder |
| Phí CĐHA | ✅ Có | ImagingOrder |
| Phí xét nghiệm | ✅ Có | LabTestOrder |

---

## 3️⃣ LUỒNG XUẤT VIỆN (DISCHARGE BILLING)

### 3.1. Sơ đồ luồng

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LUỒNG XUẤT VIỆN (DISCHARGE)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ Bác sĩ   │───▶│ Kê đơn   │───▶│ Dược sĩ  │───▶│ Tạo hóa  │              │
│  │ ra y lệnh│    │ DISCHARGE│    │ cấp thuốc│    │ đơn tổng │              │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘              │
│                                                        │                    │
│                                                        ▼                    │
│                              ┌─────────────────────────────┐                │
│                              │      HÓA ĐƠN XUẤT VIỆN      │                │
│                              │  ✅ Chi phí nội trú tích lũy │               │
│                              │  ✅ Thuốc mang về (DISCHARGE)│               │
│                              └─────────────────────────────┘                │
│                                        │                                    │
│                                        ▼                                    │
│                              ┌─────────────────┐                            │
│                              │   THANH TOÁN    │                            │
│                              │   + TRẢ GIƯỜNG  │                            │
│                              └─────────────────┘                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Chi tiết API

```bash
# Kê đơn thuốc xuất viện (DISCHARGE - bệnh viện cấp)
POST /api/v1/prescriptions
{
  "encounter_id": 456,
  "prescription_category": "DISCHARGE",
  "items": [{"medicine_id": 1, "quantity": 30, "dosage": "1 viên x 2 lần/ngày"}]
}

# Tạo hóa đơn xuất viện
POST /api/v1/payments/generate-invoice
{ "encounter_id": 456, "health_insurance_id": 10 }
```

### 3.3. Phân biệt OUTPATIENT vs DISCHARGE

| Loại đơn | prescription_category | Bệnh viện cấp thuốc? | Tính vào hóa đơn? |
|----------|----------------------|---------------------|-------------------|
| Ngoại trú | `OUTPATIENT` | ❌ Không | ❌ Không |
| Xuất viện | `DISCHARGE` | ✅ Có | ✅ Có |

---

## 4️⃣ LUỒNG CẤP CỨU (EMERGENCY BILLING)

### 4.1. Sơ đồ luồng

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          LUỒNG CẤP CỨU (EMERGENCY)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ Tiếp nhận│───▶│ Phân loại│───▶│ Điều trị │───▶│ Ổn định  │              │
│  │ cấp cứu  │    │ (Triage) │    │ khẩn cấp │    │ bệnh nhân│              │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘              │
│                                                        │                    │
│                                        ┌───────────────┴───────────────┐    │
│                                        ▼                               ▼    │
│                              ┌─────────────────┐             ┌─────────────┐│
│                              │  Chuyển nội trú │             │ Về nhà      ││
│                              │  (Admission)    │             │ (Discharge) ││
│                              └─────────────────┘             └─────────────┘│
│                                        │                           │        │
│                                        ▼                           ▼        │
│                              ┌─────────────────────────────────────────┐    │
│                              │         THANH TOÁN SAU ĐIỀU TRỊ         │    │
│                              └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2. Đặc điểm

- **Điều trị trước, thanh toán sau** - Ưu tiên cứu người
- Sử dụng `EmergencyEncounter` thay vì `Encounter` thông thường
- Có thể chuyển sang nội trú nếu cần nằm viện
- Chi phí tính tương tự ngoại trú/nội trú tùy kết quả

### 4.3. Chi tiết API

```bash
# Tạo encounter cấp cứu
POST /api/v1/emergency-encounters
{
  "patient_id": 30,
  "triage_level": "CRITICAL",
  "chief_complaint": "Đau ngực dữ dội",
  "arrival_mode": "AMBULANCE"
}

# Chỉ định xét nghiệm khẩn
POST /api/v1/emergency-diagnostic-orders
{ "emergency_encounter_id": 123, "order_type": "LAB", "priority": "STAT" }
```

---

## 5️⃣ (BỎ) LUỒNG TRẢ GÓP (INSTALLMENT PAYMENT)

### 5.1. Sơ đồ luồng

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LUỒNG TRẢ GÓP (INSTALLMENT)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ Hóa đơn  │───▶│ Tạo kế   │───▶│ Thanh toán│───▶│ Theo dõi │             │
│  │ lớn     │    │ hoạch    │    │ từng kỳ  │    │ quá hạn  │              │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘              │
│                       │                                                     │
│                       ▼                                                     │
│              ┌─────────────────────────────────────┐                        │
│              │         PAYMENT PLAN                │                        │
│              │  • Số kỳ: 2-12 kỳ                  │                        │
│              │  • Tần suất: WEEKLY/MONTHLY/...    │                        │
│              │  • Lãi suất: 0-2%/kỳ               │                        │
│              │  • Phí trễ hạn: 50k-100k/kỳ        │                        │
│              └─────────────────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2. Các trạng thái Payment Plan

| Status | Mô tả |
|--------|-------|
| `ACTIVE` | Đang trả góp, chưa hoàn thành |
| `COMPLETED` | Đã trả hết tất cả các kỳ |
| `DEFAULTED` | Vi phạm - quá nhiều kỳ trễ hạn |
| `CANCELLED` | Đã hủy (VD: bệnh nhân trả một lần) |

### 5.3. Tần suất thanh toán

| Frequency | Mô tả |
|-----------|-------|
| `WEEKLY` | Hàng tuần |
| `BIWEEKLY` | 2 tuần/lần |
| `MONTHLY` | Hàng tháng |
| `QUARTERLY` | Hàng quý (3 tháng) |

### 5.4. Chi tiết API

```bash
# Tạo kế hoạch trả góp
POST /api/v1/payment-plans
{
  "invoice_id": 180,
  "patient_id": 30,
  "total_installments": 6,
  "installment_amount": 500000,
  "payment_frequency": "MONTHLY",
  "next_due_date": "2025-12-15",
  "interest_rate": 0.5,
  "notes": "Trả góp viện phí phẫu thuật"
}

# Ghi nhận thanh toán một kỳ (dùng query param)
POST /api/v1/payment-plans/{id}/payment?amount=500000

# Lấy danh sách kế hoạch quá hạn
GET /api/v1/payment-plans/overdue

# Lấy kế hoạch sắp đến hạn (7 ngày tới)
GET /api/v1/payment-plans/due-soon?daysAhead=7

# Hoàn thành sớm (trả hết một lần)
POST /api/v1/payment-plans/{id}/complete-early
```

---

## 6️⃣ LUỒNG TẠM ỨNG (ADVANCE PAYMENT) 🆕

### 6.1. Sơ đồ luồng

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       LUỒNG TẠM ỨNG (ADVANCE PAYMENT)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ Bệnh nhân│───▶│ Nộp tiền │───▶│ Sử dụng  │───▶│ Hoàn trả │              │
│  │ nhập viện│    │ tạm ứng  │    │ khi xuất │    │ nếu thừa │              │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘              │
│                       │                │                                    │
│                       ▼                ▼                                    │
│              ┌─────────────────────────────────────┐                        │
│              │      ADVANCE BALANCE (Số dư)        │                        │
│              │  + ADVANCE_PAYMENT (nộp vào)        │                        │
│              │  - ADVANCE_USED (sử dụng)           │                        │
│              │  = Số dư còn lại                    │                        │
│              └─────────────────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2. Các loại Transaction liên quan

| Transaction Type | Mô tả | Amount |
|-----------------|-------|--------|
| `ADVANCE_PAYMENT` | Nộp tiền tạm ứng | + (dương) |
| `ADVANCE_TRANSFER_IN` | Chuyển tiền tạm ứng vào | + (dương) |
| `ADVANCE_USED` | Sử dụng tiền tạm ứng | - (âm) |
| `ADVANCE_TRANSFER_OUT` | Chuyển tiền tạm ứng ra | - (âm) |

### 6.3. Chi tiết API

```bash
# Nộp tiền tạm ứng (dùng query params)
POST /api/v1/transactions/advance-payment?patientId=30&amount=10000000&paymentMethod=CASH

# Response:
{
  "transaction_id": 567,
  "receipt_number": "RCP-20251126-00001",
  "transaction_type": "ADVANCE_PAYMENT",
  "amount": 10000000,
  "status": "COMPLETED"
}

# Kiểm tra số dư tạm ứng
GET /api/v1/transactions/patient/{patientId}/advance-balance

# Response: 10000000

# Sử dụng tiền tạm ứng để thanh toán hóa đơn
POST /api/v1/transactions/process-payment
{
  "patient_id": 30,
  "invoice_id": 345,
  "transaction_type": "ADVANCE_USED",
  "amount": 5000000,
  "payment_method": "ADVANCE"
}
```

### 6.4. Khi nào cần tạm ứng?

| Trường hợp | Mức tạm ứng đề xuất |
|------------|---------------------|
| Nhập viện nội trú | 30-50% chi phí dự kiến |
| Phẫu thuật lớn | 50-70% chi phí dự kiến |
| Bệnh nhân không có BHYT | 100% chi phí dự kiến |
| Bệnh nhân VIP | Không bắt buộc |

---

## 7️⃣ LUỒNG HOÀN TIỀN (REFUND) 🆕

### 7.1. Sơ đồ luồng

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          LUỒNG HOÀN TIỀN (REFUND)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ Yêu cầu  │───▶│ Xác minh │───▶│ Phê duyệt│───▶│ Hoàn tiền│              │
│  │ hoàn tiền│    │ giao dịch│    │ (Manager)│    │ cho BN   │              │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘              │
│                                                        │                    │
│                                                        ▼                    │
│                              ┌─────────────────────────────┐                │
│                              │      REFUND TRANSACTION     │                │
│                              │  • Amount: số âm (-)        │                │
│                              │  • Cập nhật Invoice         │                │
│                              │  • Ghi nhận lý do           │                │
│                              └─────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2. Các trường hợp hoàn tiền

| Trường hợp | Mô tả |
|------------|-------|
| Hủy dịch vụ | Bệnh nhân hủy xét nghiệm/CĐHA đã thanh toán |
| Thanh toán dư | Thanh toán nhiều hơn số tiền cần trả |
| Lỗi thu ngân | Thu ngân nhập sai số tiền |
| Hoàn tạm ứng | Hoàn tiền tạm ứng còn thừa sau xuất viện |
| BHYT chi trả sau | BHYT thanh toán sau khi BN đã trả tiền mặt |

### 7.3. Chi tiết API

```bash
# Hoàn tiền
POST /api/v1/transactions/process-refund
{
  "original_payment_id": 567,
  "amount": 500000,
  "reason": "Hủy xét nghiệm theo yêu cầu bệnh nhân",
  "refund_method": "CASH"
}

# Response:
{
  "transaction_id": 568,
  "receipt_number": "RCP-20251126-00002",
  "transaction_type": "REFUND",
  "amount": -500000,
  "status": "COMPLETED",
  "notes": "Refund for transaction #567: Hủy xét nghiệm theo yêu cầu bệnh nhân"
}

# Lấy danh sách giao dịch hoàn tiền của hóa đơn
GET /api/v1/transactions/invoice/{invoiceId}/refunds
```

### 7.4. Quy tắc hoàn tiền

- ❌ Không thể hoàn tiền nhiều hơn số tiền gốc
- ❌ Không thể hoàn tiền giao dịch chưa COMPLETED
- ✅ Tự động cập nhật lại Invoice (giảm amount_paid)
- ✅ Ghi nhận đầy đủ lý do và người thực hiện

---

## 8️⃣ (BỎ) LUỒNG CA THU NGÂN (CASHIER SHIFT) 🆕

### 8.1. Sơ đồ luồng

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       LUỒNG CA THU NGÂN (CASHIER SHIFT)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ Mở ca    │───▶│ Thu tiền │───▶│ Đóng ca  │───▶│ Đối soát │              │
│  │ (OPEN)   │    │ trong ca │    │ (CLOSED) │    │(RECONCILED)│            │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘              │
│       │                │                │                │                  │
│       ▼                ▼                ▼                ▼                  │
│  ┌─────────┐    ┌─────────────┐  ┌───────────┐   ┌────────────┐            │
│  │Tiền đầu │    │ Giao dịch   │  │ Kiểm tiền │   │ Kế toán    │            │
│  │ca (5tr) │    │ link shift  │  │ thực tế   │   │ xác nhận   │            │
│  └─────────┘    └─────────────┘  └───────────┘   └────────────┘            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2. Các trạng thái ca

| Status | Mô tả |
|--------|-------|
| `OPEN` | Ca đang mở, thu ngân đang làm việc |
| `CLOSED` | Ca đã đóng, chờ đối soát |
| `RECONCILED` | Đã đối soát xong bởi kế toán |

### 8.3. Thông tin theo dõi trong ca

| Field | Mô tả |
|-------|-------|
| `opening_cash_amount` | Tiền mặt đầu ca |
| `expected_cash_amount` | Tiền mặt dự kiến cuối ca |
| `actual_cash_amount` | Tiền mặt thực tế đếm được |
| `cash_difference` | Chênh lệch (thừa/thiếu) |
| `total_transactions_count` | Tổng số giao dịch |
| `total_cash_transactions` | Tổng tiền mặt |
| `total_card_transactions` | Tổng thẻ |
| `total_bank_transfer_transactions` | Tổng chuyển khoản |
| `total_ewallet_transactions` | Tổng ví điện tử |

### 8.4. Chi tiết API

```bash
# Mở ca mới
POST /api/v1/cashier-shifts/open
{
  "opening_cash_amount": 5000000,
  "notes": "Ca sáng - Nguyễn Văn A"
}

# Response:
{
  "shift_id": 123,
  "shift_number": "SHIFT-20251126-001",
  "shift_status": "OPEN",
  "shift_start_time": "2025-11-26T07:00:00",
  "opening_cash_amount": 5000000
}

# Lấy ca hiện tại của thu ngân
GET /api/v1/cashier-shifts/current

# Đóng ca
POST /api/v1/cashier-shifts/{shiftId}/close
{
  "actual_cash_amount": 21367580,
  "notes": "Đã kiểm tiền đầy đủ"
}

# Response:
{
  "shift_id": 123,
  "shift_status": "CLOSED",
  "expected_cash_amount": 21367580,
  "actual_cash_amount": 21367580,
  "cash_difference": 0,
  "total_transactions_count": 25
}

# Đối soát ca (Kế toán)
POST /api/v1/cashier-shifts/{shiftId}/reconcile

# Lấy danh sách ca theo trạng thái
GET /api/v1/cashier-shifts/status/CLOSED

# Lấy ca theo khoảng thời gian
GET /api/v1/cashier-shifts/date-range?startDate=2025-11-20T00:00:00&endDate=2025-11-26T23:59:59

# Lấy ca của mình
GET /api/v1/cashier-shifts/my-shifts

# Lấy ca theo cashier ID (supervisor only)
GET /api/v1/cashier-shifts/cashier/{cashierId}
```

### 8.5. Quy trình đối soát

1. **Thu ngân đóng ca**: Đếm tiền mặt thực tế, nhập vào hệ thống
2. **Hệ thống tính toán**: So sánh tiền dự kiến vs thực tế
3. **Kế toán kiểm tra**: Xem xét chênh lệch (nếu có)
4. **Đối soát**: Kế toán xác nhận ca đã đúng

### 8.6. Xử lý chênh lệch

| Chênh lệch | Xử lý |
|------------|-------|
| = 0 | OK, đối soát bình thường |
| > 0 (thừa) | Ghi nhận, có thể là tiền tip |
| < 0 (thiếu) | Cần điều tra, thu ngân chịu trách nhiệm |

---

## 📊 TỔNG HỢP CÁC LOẠI TRANSACTION

| Transaction Type | Mô tả | Amount |
|-----------------|-------|--------|
| `INVOICE_PAYMENT` | Thanh toán hóa đơn | + |
| `PAYMENT` | Thanh toán chung | + |
| `ADVANCE_PAYMENT` | Nộp tiền tạm ứng | + |
| `ADVANCE_TRANSFER_IN` | Chuyển tiền tạm ứng vào | + |
| `ADVANCE_USED` | Sử dụng tiền tạm ứng | - |
| `ADVANCE_TRANSFER_OUT` | Chuyển tiền tạm ứng ra | - |
| `REFUND` | Hoàn tiền | - |

---

## 💳 CÁC PHƯƠNG THỨC THANH TOÁN

| Payment Method | Mô tả |
|---------------|-------|
| `CASH` | Tiền mặt |
| `CARD` | Thẻ ngân hàng (ATM/Visa/Master) |
| `BANK_TRANSFER` | Chuyển khoản ngân hàng |
| `EWALLET` | Ví điện tử (MoMo, ZaloPay, VNPay) |
| `INSURANCE` | Bảo hiểm y tế chi trả |
| `ADVANCE` | Sử dụng tiền tạm ứng |

---

## 🔗 LIÊN KẾT GIỮA CÁC ENTITY

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BILLING ENTITY RELATIONSHIPS                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Encounter ──────┬──────────────────────────────────────────────────────┐   │
│      │           │                                                      │   │
│      │     ┌─────▼─────┐                                               │   │
│      │     │  Invoice  │◄────────────────────────────────────────┐     │   │
│      │     └─────┬─────┘                                         │     │   │
│      │           │                                               │     │   │
│      │     ┌─────┴─────────────────────────────────────┐         │     │   │
│      │     │                                           │         │     │   │
│      │     ▼                                           ▼         │     │   │
│      │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │     │   │
│      │  │InvoiceService│  │InvoiceMedicine│ │InvoiceMaterial│   │     │   │
│      │  │    Item      │  │    Item      │  │    Item      │    │     │   │
│      │  └──────────────┘  └──────────────┘  └──────────────┘    │     │   │
│      │                                                           │     │   │
│      │                                                           │     │   │
│      │  ┌──────────────┐                    ┌──────────────┐    │     │   │
│      └─▶│ Transaction  │◄───────────────────│ PaymentPlan  │────┘     │   │
│         └──────┬───────┘                    └──────────────┘          │   │
│                │                                   │                   │   │
│                │                                   ▼                   │   │
│                │                          ┌──────────────────┐        │   │
│                │                          │PaymentPlanInstall│        │   │
│                │                          │     ment         │        │   │
│                │                          └──────────────────┘        │   │
│                │                                                      │   │
│                ▼                                                      │   │
│         ┌──────────────┐                                              │   │
│         │ CashierShift │                                              │   │
│         └──────────────┘                                              │   │
│                                                                       │   │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 🏥 QUY TRÌNH BHYT (BẢO HIỂM Y TẾ)

### Các bước xác nhận BHYT

```
┌─────────────────────────────────────────────────────────────────┐
│  1. Tiếp nhận kiểm tra thẻ BHYT (HealthInsurance)              │
│     → Kiểm tra còn hiệu lực (expiry_date)                      │
│     → Kiểm tra đúng tuyến (facility_level)                     │
├─────────────────────────────────────────────────────────────────┤
│  2. Xác định tỷ lệ chi trả (coverage_percentage)               │
│     → Đúng tuyến: 80-100%                                      │
│     → Trái tuyến cấp cứu: 80%                                  │
│     → Trái tuyến thông thường: 40-70%                          │
├─────────────────────────────────────────────────────────────────┤
│  3. Tạo hóa đơn với BHYT                                       │
│     → insurance_covered_amount = total × coverage_percentage   │
│     → patient_responsible_amount = total - insurance_covered   │
├─────────────────────────────────────────────────────────────────┤
│  4. Bệnh nhân chỉ thanh toán phần đồng chi trả                 │
└─────────────────────────────────────────────────────────────────┘
```

### Tỷ lệ chi trả BHYT theo quy định

| Đối tượng | Tỷ lệ BHYT chi trả |
|-----------|-------------------|
| Đúng tuyến | 80% - 100% |
| Trái tuyến cấp cứu | 80% |
| Trái tuyến tỉnh | 70% |
| Trái tuyến huyện | 60% |
| Trái tuyến xã | 40% |

---

## 📝 GHI CHÚ QUAN TRỌNG

1. **Đơn thuốc OUTPATIENT không tính tiền** - Bệnh nhân tự mua ngoài (Thông tư 30/2018/TT-BYT)
2. **Đơn thuốc DISCHARGE tính tiền** - Bệnh viện cấp thuốc từ kho
3. **MedicationOrder luôn tính tiền** - Thuốc nội trú từ kho bệnh viện
4. **Mỗi giao dịch phải có receipt_number** - Theo Thông tư 200/2014/TT-BTC
5. **Giao dịch link với CashierShift** - Để đối soát cuối ca theo quy định kế toán
6. **BHYT tính theo coverage_percentage** - Theo Luật BHYT và Nghị định 146/2018/NĐ-CP
7. **Tạm ứng nội trú** - Thường 30-50% chi phí dự kiến, tùy quy định BV
8. **Cấp cứu ưu tiên điều trị** - Thanh toán sau theo Luật Khám chữa bệnh 2023

---

> **Tài liệu được tạo tự động từ source code**
> 
> Cập nhật lần cuối: 26/11/2025
