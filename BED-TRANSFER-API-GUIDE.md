# Bed Transfer API Guide

## Tổng quan - 8 Endpoints

| # | Method | Endpoint | Permission | Mô tả |
|---|--------|----------|------------|-------|
| 1 | `GET` | `/api/v1/bed-transfers` | `bed.view` | List với filter |
| 2 | `GET` | `/api/v1/bed-transfers/{id}` | `bed.view` | Get by ID |
| 3 | `DELETE` | `/api/v1/bed-transfers/{id}` | `bed.transfer` | Soft delete |
| 4 | `POST` | `/api/v1/bed-transfers/{id}:restore` | `bed.transfer` | Restore |
| 5 | `GET` | `/api/v1/bed-transfers:statistics` | `bed.view` | Statistics |
| 6 | `POST` | `/api/v1/inpatient-stays/{stayId}/bed-transfers` | `bed.transfer` | Create |
| 7 | `GET` | `/api/v1/inpatient-stays/{stayId}/bed-transfers` | `bed.view` | List by stay |
| 8 | `GET` | `/api/v1/inpatient-stays/{stayId}/bed-transfers:count` | `bed.view` | Count |

---

## 1. List Bed Transfers

```http
GET /api/v1/bed-transfers
Authorization: Bearer <token>
```

**Query Parameters:**

| Param | Type | Default | Mô tả |
|-------|------|---------|-------|
| `startDate` | date | - | YYYY-MM-DD |
| `endDate` | date | - | YYYY-MM-DD |
| `recentHours` | int | - | 1-720 |
| `includeDeleted` | bool | false | Lấy đã xóa |
| `page` | int | 0 | Trang |
| `size` | int | 20 | 1-100 |
| `sortBy` | string | transferDatetime | Field sort |
| `sortDir` | string | desc | asc/desc |

**Response:**
```json
{
  "message": "Bed transfers retrieved successfully.",
  "status": "OK",
  "data": {
    "content": [...],
    "totalElements": 10,
    "totalPages": 1
  }
}
```

---

## 2. Get Transfer by ID

```http
GET /api/v1/bed-transfers/1
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": {
    "bedTransferId": 1,
    "inpatientStayId": 1,
    "fromBedId": 1,
    "fromBedNumber": "D1-R1-B1",
    "toBedId": 54,
    "toBedNumber": "D4-R2-B4",
    "transferDatetime": "2025-12-03T14:28:20",
    "reason": "Chuyển sang phòng VIP",
    "approvedByEmployeeId": 106
  }
}
```

---

## 3. Delete Transfer

```http
DELETE /api/v1/bed-transfers/1
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Bed transfer deleted successfully.",
  "status": "OK"
}
```

---

## 4. Restore Transfer

```http
POST /api/v1/bed-transfers/1:restore
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Bed transfer restored successfully.",
  "status": "OK"
}
```

---

## 5. Statistics

```http
GET /api/v1/bed-transfers:statistics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": {
    "activeCount": 10,
    "deletedCount": 2,
    "totalCount": 12
  }
}
```

---

## 6. Create Transfer

```http
POST /api/v1/inpatient-stays/1/bed-transfers
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "toBedId": 54,
  "reason": "Chuyển sang phòng VIP theo yêu cầu bệnh nhân"
}
```

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `toBedId` | int | ✅ | ID giường đích |
| `reason` | string | ❌ | Lý do chuyển |

**Response (201):**
```json
{
  "message": "Bed transfer completed successfully.",
  "status": "CREATED",
  "data": {
    "bedTransferId": 2,
    "inpatientStayId": 1,
    "fromBedId": 1,
    "fromBedNumber": "D1-R1-B1",
    "toBedId": 54,
    "toBedNumber": "D4-R2-B4",
    "transferDatetime": "2025-12-03T16:30:00",
    "reason": "Chuyển sang phòng VIP theo yêu cầu bệnh nhân"
  }
}
```

---

## 7. List Transfers by Stay

```http
GET /api/v1/inpatient-stays/1/bed-transfers
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "bedTransferId": 1,
      "fromBedNumber": "D1-R1-B1",
      "toBedNumber": "D4-R2-B4",
      "transferDatetime": "2025-12-03T14:28:20"
    }
  ]
}
```

---

## 8. Count Transfers by Stay

```http
GET /api/v1/inpatient-stays/1/bed-transfers:count
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": 3
}
```

---

## Error Responses

```json
{
  "message": "Inpatient stay not found: 999",
  "status": "BAD_REQUEST",
  "code": 400
}
```

```json
{
  "message": "Target bed is not available. Current status: OCCUPIED",
  "status": "BAD_REQUEST",
  "code": 400
}
```
