import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HRLayout from './layout/HRLayout';
import HRDashboardPage from './pages/dashboard/HRDashboardPage';
import EmployeeManagementPage from './pages/employees/EmployeeManagementPage';
import AccountManagementPage from './pages/accounts/AccountManagementPage';
import DoctorSchedulePage from './pages/doctor-schedules/DoctorSchedulePage';
import EmployeeSchedulePage from './pages/employee-schedules/EmployeeSchedulePage';
import WorkShiftPage from './pages/work-shifts/WorkShiftPage';
import EmployeeStatusPage from './pages/employee-status/EmployeeStatusPage';
import TimeOffRequestPage from './pages/time-off-requests/TimeOffRequestPage';

const HRRoutes = () => {
  return (
    <Routes>
      <Route element={<HRLayout />}>
        {/* Default route for /staff/hr */}
        <Route index element={<HRDashboardPage />} />
        <Route path="dashboard" element={<HRDashboardPage />} />
        <Route path="employees" element={<EmployeeManagementPage />} />
        <Route path="accounts" element={<AccountManagementPage />} />
        <Route path="doctor-schedules" element={<DoctorSchedulePage />} />
        <Route path="employee-schedules" element={<EmployeeSchedulePage />} />
        <Route path="work-shifts" element={<WorkShiftPage />} />
        <Route path="employee-status" element={<EmployeeStatusPage />} />
        <Route path="time-off-requests" element={<TimeOffRequestPage />} />
      </Route>
    </Routes>
  );
};

export default HRRoutes;

