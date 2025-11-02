# Doctor Schedule Management - Quản lý Lịch làm việc Bác sĩ

## 📋 Tổng quan

Giao diện quản lý lịch làm việc của bác sĩ với đầy đủ tính năng:
- ✅ Xem danh sách lịch làm việc
- ✅ Thêm lịch làm việc mới
- ✅ Chỉnh sửa lịch làm việc
- ✅ Xóa lịch làm việc
- ✅ Lọc theo bác sĩ, phòng khám, ngày, khoảng thời gian
- ✅ Xem slot còn trống
- ✅ Thống kê tổng quan

## 🔌 API Endpoints đã tích hợp

### 1. Quản lý lịch làm việc cơ bản
```javascript
// Lấy tất cả lịch làm việc
GET /api/v1/doctor-schedules

// Lấy lịch làm việc theo ID
GET /api/v1/doctor-schedules/{id}

// Tạo lịch làm việc mới
POST /api/v1/doctor-schedules

// Cập nhật lịch làm việc
PUT /api/v1/doctor-schedules/{id}

// Xóa lịch làm việc
DELETE /api/v1/doctor-schedules/{id}
```

### 2. Lọc theo bác sĩ
```javascript
// Lấy tất cả lịch của 1 bác sĩ
GET /api/v1/doctor-schedules/doctor/{doctorId}

// Lấy lịch của bác sĩ trong 1 ngày
GET /api/v1/doctor-schedules/doctor/{doctorId}/date/{date}

// Lấy lịch của bác sĩ trong khoảng thời gian
GET /api/v1/doctor-schedules/doctor/{doctorId}/date-range?startDate={startDate}&endDate={endDate}

// Lấy lịch hôm nay của bác sĩ
GET /api/v1/doctor-schedules/doctor/{doctorId}/today

// Lấy lịch sắp tới của bác sĩ
GET /api/v1/doctor-schedules/doctor/{doctorId}/upcoming
```

### 3. Lọc theo phòng khám
```javascript
// Lấy lịch của phòng khám trong 1 ngày
GET /api/v1/doctor-schedules/clinic/{clinicId}/date/{date}
```

### 4. Xem slot còn trống
```javascript
// Lấy slot còn trống trong 1 ngày
GET /api/v1/doctor-schedules/doctor/{doctorId}/available-slots?date={date}

// Lấy slot còn trống trong khoảng thời gian
GET /api/v1/doctor-schedules/doctor/{doctorId}/available-slots/range?startDateTime={startDateTime}&endDateTime={endDateTime}
```

### 5. Danh sách phụ trợ
```javascript
// Lấy danh sách phòng khám
GET /api/clinics

// Lấy danh sách bác sĩ theo phòng khám
GET /api/clinics/{clinicId}/doctors
```

## 🎨 Tính năng giao diện

### 1. Bộ lọc thông minh
- **Tất cả lịch làm việc**: Hiển thị toàn bộ lịch
- **Theo bác sĩ**: Chọn phòng khám → Chọn bác sĩ → Xem lịch
- **Theo phòng khám & ngày**: Chọn phòng khám → Chọn ngày → Xem lịch
- **Theo bác sĩ & ngày**: Chọn phòng khám → Chọn bác sĩ → Chọn ngày
- **Theo bác sĩ & khoảng thời gian**: Chọn phòng khám → Chọn bác sĩ → Chọn từ ngày - đến ngày

### 2. Thống kê tổng quan
- Tổng số lịch làm việc
- Số bác sĩ đang làm việc
- Số lịch làm việc hôm nay

### 3. Bảng danh sách lịch làm việc
Hiển thị đầy đủ thông tin:
- ID lịch làm việc
- Tên bác sĩ & mã nhân viên
- Phòng khám
- Ngày làm việc
- Giờ làm việc (bắt đầu - kết thúc)
- Giờ nghỉ (bắt đầu - kết thúc)
- Thời lượng mỗi slot
- Trạng thái (Hoạt động/Không hoạt động, Hôm nay, Đã qua)

### 4. Thao tác
- **Xem slot trống**: Click icon 🔍 để xem các slot còn trống
- **Chỉnh sửa**: Click icon ✏️ để sửa lịch làm việc
- **Xóa**: Click icon 🗑️ để xóa lịch làm việc

### 5. Modal xem slot trống
Hiển thị danh sách các slot còn trống với:
- Thời gian slot (giờ bắt đầu - giờ kết thúc)
- Số lượng còn trống / Tổng số bệnh nhân tối đa

## 📝 Cách sử dụng

### Thêm lịch làm việc mới
1. Click nút "Thêm Lịch làm việc"
2. Chọn phòng khám
3. Chọn bác sĩ (danh sách bác sĩ sẽ load theo phòng khám đã chọn)
4. Chọn ngày làm việc
5. Điền thông tin:
   - Giờ bắt đầu - kết thúc
   - Giờ nghỉ bắt đầu - kết thúc
   - Thời lượng mỗi slot (phút)
   - Thời gian đệm (phút)
   - Số bệnh nhân tối đa/slot
6. Click "Thêm lịch làm việc"

### Lọc lịch làm việc
1. Chọn "Chế độ xem" từ dropdown
2. Điền các thông tin lọc tương ứng
3. Danh sách sẽ tự động cập nhật

### Xem slot còn trống
1. Tìm lịch làm việc cần xem
2. Click icon 🔍 "Xem slot trống"
3. Modal hiển thị danh sách slot còn trống

### Chỉnh sửa lịch làm việc
1. Click icon ✏️ "Chỉnh sửa"
2. Cập nhật thông tin cần thiết
3. Click "Cập nhật"

### Xóa lịch làm việc
1. Click icon 🗑️ "Xóa"
2. Xác nhận xóa

## 🔧 Cấu trúc code

```
doctor-schedules/
├── DoctorSchedulePage.js          # Component chính
├── README.md                       # File này
└── ../components/
    ├── AddDoctorScheduleModal.js  # Modal thêm lịch
    └── EditDoctorScheduleModal.js # Modal sửa lịch
```

## 🎯 Response format từ API

### Schedule Object
```javascript
{
  doctorScheduleId: 1114,
  doctorEmployeeId: 22,
  doctorEmployeeCode: "BS001",
  doctorName: "Nguyễn Văn A",
  clinicId: 1,
  clinicName: "Phòng khám Nội",
  scheduleDate: "2025-11-25",
  startTime: "08:00:00",
  endTime: "17:00:00",
  breakStartTime: "12:00:00",
  breakEndTime: "13:00:00",
  slotDurationMinutes: 15,
  bufferTimeMinutes: 5,
  maxPatientsPerSlot: 5,
  isActive: true,
  isToday: false,
  isPast: false
}
```

### Available Slot Object
```javascript
{
  startTime: "08:00:00",
  endTime: "08:15:00",
  availableSlots: 3,
  maxPatients: 5
}
```

## 🚀 Tính năng sắp tới (có thể mở rộng)
- [ ] Calendar view (lịch dạng tháng/tuần)
- [ ] Drag & drop để thay đổi lịch
- [ ] Export lịch làm việc ra Excel/PDF
- [ ] Thông báo khi có xung đột lịch
- [ ] Bulk create/update/delete
- [ ] Copy lịch từ tuần/tháng trước

## 📞 Liên hệ
Nếu có vấn đề hoặc cần hỗ trợ, vui lòng liên hệ team phát triển.

