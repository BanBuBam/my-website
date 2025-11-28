# API Refactor: Gộp getAll và search endpoints

## ✅ HOÀN THÀNH - Ngày 26/11/2025 (Refactored lại)

## Tổng quan

Theo chuẩn RESTful API design, đã gộp 2 endpoint `getAll` và `search` thành 1 endpoint duy nhất với optional query parameter.

**Lý do:**
- Giảm số lượng endpoints
- Code dễ maintain hơn
- Client chỉ cần biết 1 endpoint
- Tuân theo RESTful conventions (GitHub, Stripe, Shopify APIs đều dùng pattern này)

---

## Danh sách 10 Controller đã refactor

### 1. ✅ MedicineController
**File:** `src/main/java/com/his/hospital/controller/MedicineController.java`

| Endpoint cũ | Endpoint mới |
|-------------|--------------|
| `GET /api/v1/medicines` | ✅ `GET /api/v1/medicines?keyword={optional}` |
| `GET /api/v1/medicines/all` | Giữ nguyên (cho dropdown) |
| `GET /api/v1/medicines/search?keyword=` | ⚠️ DEPRECATED |

**Endpoint mới:**
```java
GET /api/v1/medicines?keyword={optional}&page=0&size=20
```

---

### 2. ✅ PatientController
**File:** `src/main/java/com/his/hospital/controller/PatientController.java`

| Endpoint cũ | Endpoint mới |
|-------------|--------------|
| `GET /api/v1/patient/admin/active` | ⚠️ DEPRECATED |
| `GET /api/v1/patient/admin/search?name=` | ⚠️ DEPRECATED |

**Endpoint mới:**
```java
GET /api/v1/patient/admin?name={optional}&page=0&size=10
```

---

### 3. ✅ EmployeeController
**File:** `src/main/java/com/his/hospital/controller/EmployeeController.java`

| Endpoint cũ | Endpoint mới |
|-------------|--------------|
| `GET /api/v1/employees` | ✅ `GET /api/v1/employees?name={optional}` |
| `GET /api/v1/employees/page` | ⚠️ DEPRECATED |
| `GET /api/v1/employees/search?name=` | ⚠️ DEPRECATED |

**Endpoint mới:**
```java
GET /api/v1/employees?name={optional}&page=0&size=10
```

---

### 4. ✅ ServiceController
**File:** `src/main/java/com/his/hospital/controller/ServiceController.java`

| Endpoint cũ | Endpoint mới |
|-------------|--------------|
| `GET /api/v1/services` | ✅ `GET /api/v1/services?keyword={optional}` |
| `GET /api/v1/services/search?keyword=` | ⚠️ DEPRECATED |

**Endpoint mới:**
```java
GET /api/v1/services?keyword={optional}&page=0&size=20
```

---

### 5. ✅ DepartmentController
**File:** `src/main/java/com/his/hospital/controller/DepartmentController.java`

| Endpoint cũ | Endpoint mới |
|-------------|--------------|
| `GET /api/v1/departments` | ✅ `GET /api/v1/departments?name={optional}` |
| `GET /api/v1/departments/page` | ⚠️ DEPRECATED |
| `GET /api/v1/departments/search?name=` | ⚠️ DEPRECATED |

**Endpoint mới:**
```java
GET /api/v1/departments?name={optional}&page=0&size=10
```

---

### 6. ✅ ClinicController
**File:** `src/main/java/com/his/hospital/controller/ClinicController.java`

| Endpoint cũ | Endpoint mới |
|-------------|--------------|
| `GET /api/v1/clinics` | ✅ `GET /api/v1/clinics?keyword={optional}` |
| `GET /api/v1/clinics/search?keyword=` | ⚠️ DEPRECATED |

**Endpoint mới:**
```java
GET /api/v1/clinics?keyword={optional}&page=0&size=20
```

---

### 7. ✅ SupplierController
**File:** `src/main/java/com/his/hospital/controller/SupplierController.java`

| Endpoint cũ | Endpoint mới |
|-------------|--------------|
| `GET /api/v1/suppliers` | ✅ `GET /api/v1/suppliers?searchTerm={optional}` |
| `GET /api/v1/suppliers/search?searchTerm=` | ⚠️ DEPRECATED |

**Endpoint mới:**
```java
GET /api/v1/suppliers?searchTerm={optional}
```

---

### 8. ✅ IcdDiseaseController
**File:** `src/main/java/com/his/hospital/controller/IcdDiseaseController.java`

| Endpoint cũ | Endpoint mới |
|-------------|--------------|
| `GET /api/v1/icd-diseases` | ✅ `GET /api/v1/icd-diseases?keyword={optional}` |
| `GET /api/v1/icd-diseases/search?keyword=` | ⚠️ DEPRECATED |

**Endpoint mới:**
```java
GET /api/v1/icd-diseases?keyword={optional}
```

---

### 9. ✅ EquipmentController
**File:** `src/main/java/com/his/hospital/controller/EquipmentController.java`

| Endpoint cũ | Endpoint mới |
|-------------|--------------|
| `GET /api/v1/equipment` | ✅ `GET /api/v1/equipment?keyword={optional}` |
| `GET /api/v1/equipment/search?keyword=` | ⚠️ DEPRECATED |

**Endpoint mới:**
```java
GET /api/v1/equipment?keyword={optional}
```

---

### 10. ✅ LabTestController
**File:** `src/main/java/com/his/hospital/controller/LabTestController.java`

| Endpoint cũ | Endpoint mới |
|-------------|--------------|
| `GET /api/v1/medical-tests` | ✅ `GET /api/v1/medical-tests?searchTerm={optional}` |
| `GET /api/v1/medical-tests/search?searchTerm=` | ⚠️ DEPRECATED |

**Endpoint mới:**
```java
GET /api/v1/medical-tests?searchTerm={optional}
```

---

## Tổng kết

| Metric | Số lượng |
|--------|----------|
| **Tổng số cặp đã gộp** | **10 cặp** ✅ |
| **Tổng số endpoint deprecated** | **10+ endpoints** |
| **Controllers đã refactor** | **10 controllers** ✅ |

---

## Pattern refactor

### TRƯỚC (2 endpoints riêng biệt):
```java
@GetMapping
public ResponseEntity<Page<Response>> getAll(Pageable pageable) {
    return service.findAll(pageable);
}

@GetMapping("/search")
public ResponseEntity<List<Response>> search(@RequestParam String keyword) {
    return service.search(keyword);
}
```

### SAU (1 endpoint gộp):
```java
@GetMapping
public ResponseEntity<Page<Response>> getAll(
    @RequestParam(required = false) String keyword,  // optional
    @PageableDefault(size = 20) Pageable pageable) {
    
    if (keyword == null || keyword.isBlank()) {
        return service.findAll(pageable);
    }
    return service.search(keyword, pageable);
}
```

---

## Ghi chú quan trọng

### Backward Compatibility
- Các endpoint cũ (`/search`) vẫn hoạt động nhưng đã được đánh dấu `@Deprecated`
- Frontend có thể tiếp tục sử dụng endpoint cũ trong thời gian chuyển đổi
- Khuyến nghị chuyển sang endpoint mới càng sớm càng tốt

### Thay đổi đã thực hiện
1. ✅ Gộp getAll và search thành 1 endpoint với optional query param
2. ✅ Thêm method mới vào Service layer (MedicineService, EmployeeService)
3. ✅ Thêm query method vào Repository (MedicineRepository)
4. ✅ Đánh dấu endpoint cũ là `@Deprecated` với hướng dẫn sử dụng endpoint mới
5. ✅ Update Swagger documentation

### Cách sử dụng endpoint mới

```bash
# Lấy tất cả (không search)
GET /api/v1/medicines?page=0&size=20

# Search theo keyword
GET /api/v1/medicines?keyword=paracetamol&page=0&size=20

# Lấy tất cả employees
GET /api/v1/employees?page=0&size=10

# Search employees theo tên
GET /api/v1/employees?name=Nguyen&page=0&size=10
```


---

## Kết quả Test (2025-11-26)

| # | Controller | Endpoint mới | Kết quả | Ghi chú |
|---|------------|--------------|---------|---------|
| 1 | DepartmentController | GET /departments?name= | ✅ PASS | Hoạt động tốt |
| 2 | SupplierController | GET /suppliers?searchTerm= | ✅ PASS | Hoạt động tốt |
| 3 | IcdDiseaseController | GET /icd-diseases?keyword= | ✅ PASS | Hoạt động tốt |
| 4 | LabTestController | GET /medical-tests?searchTerm= | ✅ PASS | Hoạt động tốt |
| 5 | EmployeeController | GET /employees?name= | ✅ PASS | Hoạt động tốt |
| 6 | ServiceController | GET /services?keyword= | ✅ PASS | Hoạt động (data trống) |
| 7 | ClinicController | GET /clinics?keyword= | ✅ PASS | Hoạt động (data trống) |
| 8 | MedicineController | GET /medicines?keyword= | ✅ PASS | Hoạt động tốt |
| 9 | PatientController | GET /patient/admin?name= | ✅ PASS | Đã fix 3 files (SecurityConfig, PatientPreFilter, EnhancedJwtFilter) |
| 10 | EquipmentController | GET /equipment?keyword= | ✅ PASS | Đã fix Entity table name |

### Deprecated Endpoints (vẫn hoạt động)
- ✅ GET /departments/search?name=
- ✅ GET /suppliers/search?searchTerm=
- ✅ GET /icd-diseases/search?keyword=

### Tổng kết
- **10/10 API hoạt động tốt** ✅ 🎉

### Chi tiết các fix đã thực hiện

#### Fix 1: Equipment API (Table case-sensitive)
- **File**: `src/main/java/com/his/hospital/model/equipment/Equipment.java`
- **Vấn đề**: PostgreSQL table `Materials` có tên mixed-case, Hibernate query với lowercase
- **Fix**: `@Table(name = "\"Materials\"")` - thêm escape quotes
- **Kết quả**: ✅ Hoạt động tốt

#### Fix 2: Patient /admin API (Security & Filter patterns)
- **Vấn đề**: Pattern `/api/v1/patient/admin/` (có trailing slash) không match `/api/v1/patient/admin` (không có trailing slash)
- **Files đã fix**:
  1. `SecurityConfig.java` - Thêm pattern `/api/v1/patient/admin`
  2. `PatientPreFilter.java` - Fix pattern để skip admin paths đúng
  3. `EnhancedJwtFilter.java` - Fix pattern để handle admin paths đúng
- **Kết quả**: ✅ Hoạt động tốt
