# Time Off Request Feature

## Overview

The Time Off Request feature allows employees to request time off and HR managers to approve/reject these requests. It includes comprehensive management tools with filtering, searching, and leave balance tracking.

## Features

### For Employees
- Create new time off requests
- Edit pending requests
- Delete pending requests
- Withdraw approved requests
- View request history
- Check personal leave balance
- View detailed request information

### For HR Managers
- View all time off requests
- Filter by status (pending, approved, rejected, etc.)
- Filter by leave type
- Filter by date range
- Search by reason or employee name
- Approve requests with notes
- Reject requests with reasons
- View employee leave balance
- View employees currently on leave

## File Structure

```
time-off-requests/
├── TimeOffRequestPage.js          # Main page component
├── TimeOffRequestPage.css         # Main page styles
├── IMPLEMENTATION_PLAN.md         # Implementation details
├── TESTING_GUIDE.md              # Testing procedures
└── README.md                      # This file

../components/
├── AddTimeOffRequestModal.js      # Create request modal
├── AddTimeOffRequestModal.css
├── EditTimeOffRequestModal.js     # Edit request modal
├── EditTimeOffRequestModal.css
├── TimeOffRequestDetailModal.js   # View details modal
├── TimeOffRequestDetailModal.css
├── TimeOffRequestCard.js          # Request card component
├── TimeOffRequestCard.css
├── LeaveBalanceWidget.js          # Leave balance widget
└── LeaveBalanceWidget.css
```

## API Endpoints

### Create/Update/Delete
- `POST /api/v1/time-off-requests` - Create request
- `PUT /api/v1/time-off-requests/:id` - Update request
- `DELETE /api/v1/time-off-requests/:id` - Delete request

### Retrieve
- `GET /api/v1/time-off-requests` - Get all requests
- `GET /api/v1/time-off-requests/:id` - Get by ID
- `GET /api/v1/time-off-requests/employee/:employeeId` - Get by employee
- `GET /api/v1/time-off-requests/status/:status` - Get by status
- `GET /api/v1/time-off-requests/pending` - Get pending
- `GET /api/v1/time-off-requests/approved` - Get approved
- `GET /api/v1/time-off-requests/current` - Get current leaves
- `GET /api/v1/time-off-requests/upcoming` - Get upcoming leaves

### Actions
- `POST /api/v1/time-off-requests/:id/approve` - Approve request
- `POST /api/v1/time-off-requests/:id/reject` - Reject request
- `POST /api/v1/time-off-requests/:id/withdraw` - Withdraw request

### Leave Balance
- `GET /api/v1/time-off-requests/employee/:employeeId/balance/:year` - Get total balance
- `GET /api/v1/time-off-requests/employee/:employeeId/balance/:year/type/:type` - Get balance by type
- `GET /api/v1/time-off-requests/employees-on-leave?date=:date` - Get employees on leave

## Usage

### Accessing the Feature

1. Navigate to HR Management module
2. Click on "Nghỉ phép" (Time Off) in the sidebar
3. You'll see the Time Off Request page

### Creating a Request

1. Click "Tạo Đơn Mới" (Create New Request) button
2. Fill in the form:
   - Leave Type (required)
   - Start Date (required)
   - End Date (required)
   - Start Time (optional)
   - End Time (optional)
   - Reason (required)
   - Contact Phone (required)
   - Emergency Contact (optional)
   - Half Day (checkbox)
   - Paid Leave (checkbox)
3. Click "Tạo Đơn" (Create Request)

### Viewing Requests

Use the tabs to view different request statuses:
- **Tất Cả** - All requests
- **Chờ Duyệt** - Pending approval
- **Đã Duyệt** - Approved
- **Đang Nghỉ** - Currently on leave
- **Sắp Tới** - Upcoming leaves

### Filtering Requests

1. Use the search box to find by reason or employee name
2. Filter by leave type using the dropdown
3. Filter by date range using the date inputs
4. Click "Xóa Bộ Lọc" (Clear Filters) to reset

### Approving/Rejecting Requests

1. Find a pending request
2. Click the approve (✓) or reject (✗) button
3. Enter approval note or rejection reason
4. Confirm the action

### Viewing Leave Balance

The sidebar shows your leave balance for the current year:
- Total days available
- Days used
- Days remaining
- Progress bar for each leave type

## Leave Types

- **ANNUAL_LEAVE** - Nghỉ phép năm (Annual vacation)
- **SICK_LEAVE** - Nghỉ ốm (Medical leave)
- **PERSONAL_LEAVE** - Nghỉ cá nhân (Personal leave)
- **MATERNITY_LEAVE** - Nghỉ thai sản (Maternity leave)
- **UNPAID_LEAVE** - Nghỉ không lương (Unpaid leave)
- **EMERGENCY_LEAVE** - Nghỉ khẩn cấp (Emergency leave)

## Request Status

- **PENDING** - Chờ duyệt (Awaiting approval)
- **APPROVED** - Đã duyệt (Approved)
- **REJECTED** - Từ chối (Rejected)
- **WITHDRAWN** - Đã rút lại (Withdrawn by employee)
- **CANCELLED** - Đã hủy (Cancelled)

## Troubleshooting

### Issue: Modal doesn't open
- Check browser console for errors
- Verify API endpoints are correct
- Check network tab for failed requests

### Issue: Data not loading
- Verify API endpoints are accessible
- Check authentication token
- Check network connection

### Issue: Buttons not working
- Verify user role has permission
- Check browser console for errors
- Verify API responses

## Testing

See TESTING_GUIDE.md for comprehensive testing procedures.

## Support

For issues or questions:
1. Check the documentation files
2. Review TESTING_GUIDE.md
3. Check browser console for errors
4. Verify API endpoints are correct

## Version

- **Version:** 1.0.0
- **Last Updated:** 2025-10-29
- **Status:** Production Ready

