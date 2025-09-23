import React from 'react';
import './AdminDashboardPage.css';

// STEP 1: Import Chart.js components and the chart types you will use
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// STEP 2: Register the components you are using
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// --- Chart Configuration and Data ---

// Options for the line and bar charts
export const commonChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      font: {
        size: 16,
      }
    },
  },
};

// Data for the Revenue Line Chart
const revenueData = {
  labels: ['Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9'],
  datasets: [
    {
      label: 'Doanh thu (triệu VND)',
      data: [65, 59, 80, 81, 56, 55, 90],
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
  ],
};

// Data for the Patient by Department Bar Chart
const patientByDeptData = {
    labels: ['Tim mạch', 'Nội tổng quát', 'Da liễu', 'Răng hàm mặt', 'Tai mũi họng'],
    datasets: [
        {
            label: 'Số lượng bệnh nhân',
            data: [250, 180, 95, 130, 155],
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
        }
    ]
};

// Data for the Appointment Status Doughnut Chart
const appointmentStatusData = {
    labels: ['Đã xác nhận', 'Chờ xác nhận', 'Đã hủy'],
    datasets: [
        {
            label: 'Tình trạng lịch hẹn',
            data: [300, 50, 100],
            backgroundColor: [
                'rgba(75, 192, 192, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(255, 99, 132, 0.6)',
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(255, 99, 132, 1)',
            ],
            borderWidth: 1,
        }
    ]
}


// --- Main Dashboard Component ---
const AdminDashboardPage = () => {
    return (
        <div className="admin-dashboard">
            <div className="page-header">
                <div>
                    <h2>Dashboard Quản trị</h2>
                    <p>Thống kê và tổng quan hoạt động của hệ thống</p>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="chart-card large">
                    <Line options={{...commonChartOptions, plugins: {...commonChartOptions.plugins, title: {...commonChartOptions.plugins.title, text: 'Doanh thu 6 tháng gần nhất'}}}} data={revenueData} />
                </div>

                <div className="chart-card">
                    <Doughnut options={{...commonChartOptions, plugins: {...commonChartOptions.plugins, title: {...commonChartOptions.plugins.title, text: 'Tình trạng Lịch hẹn'}}}} data={appointmentStatusData} />
                </div>

                <div className="chart-card full-width">
                     <Bar options={{...commonChartOptions, plugins: {...commonChartOptions.plugins, title: {...commonChartOptions.plugins.title, text: 'Số lượng bệnh nhân theo Khoa'}}}} data={patientByDeptData} />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;