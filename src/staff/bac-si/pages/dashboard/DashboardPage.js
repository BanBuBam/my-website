import React from 'react';
import './DashboardPage.css'; // File CSS chúng ta sẽ tạo ở bước tiếp theo

// Import các icon cần thiết
import { FiUsers, FiCalendar, FiBell, FiChevronRight } from 'react-icons/fi';

// Dữ liệu mẫu cho trang Dashboard của Bác sĩ
const mockData = {
    stats: {
        waiting: 2,
        appointmentsToday: 0,
        newResults: 2,
    },
    waitingPatients: [
        { id: 1, name: 'Nguyễn Đình Ban', patientId: 'ABCXYZ', age: 32, status: 'Registered', time: '9:30 AM' },
        { id: 2, name: 'Trần Văn An', patientId: 'DEFGHJ', age: 45, status: 'Registered', time: '9:45 AM' },
        { id: 3, name: 'Lê Thị Cúc', patientId: 'KLMNPQ', age: 28, status: 'Registered', time: '10:00 AM' },
    ]
};

const DoctorDashboardPage = () => {
    return (
        <div className="doctor-dashboard">
            {/* --- Header của trang --- */}
            <div className="page-header">
                <div>
                    <h2>Dashboard Bác sĩ</h2>
                    <p>Tổng quan nhanh về công việc trong ngày</p>
                </div>
            </div>

            {/* --- Các thẻ thống kê --- */}
            <div className="stats-grid">
                <div className="stats-card">
                    <div className="card-icon blue"><FiUsers /></div>
                    <div className="card-info">
                        <span className="card-title">Bệnh nhân chờ khám</span>
                        <span className="card-value">{mockData.stats.waiting}</span>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="card-icon green"><FiCalendar /></div>
                    <div className="card-info">
                        <span className="card-title">Lịch hẹn hôm nay</span>
                        <span className="card-value">{mockData.stats.appointmentsToday}</span>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="card-icon orange"><FiBell /></div>
                    <div className="card-info">
                        <span className="card-title">Kết quả CLS mới</span>
                        <span className="card-value">{mockData.stats.newResults}</span>
                    </div>
                </div>
            </div>

            {/* --- Danh sách bệnh nhân chờ khám --- */}
            <div className="card patient-list-container">
                <div className="list-header">
                    <h4>Danh sách bệnh nhân chờ khám</h4>
                    <span className="patient-count-badge">{mockData.waitingPatients.length} patients</span>
                </div>
                <ul className="patient-list">
                    {mockData.waitingPatients.map(patient => (
                        <li key={patient.id} className="patient-item">
                            <div className="patient-details">
                                <span className="patient-name">{patient.name}</span>
                                <span className="patient-meta">ID: {patient.patientId} | {patient.age} tuổi</span>
                            </div>
                            <div className="patient-meta-right">
                                <span className="status-badge">{patient.status}</span>
                                <span className="time">{patient.time}</span>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="list-footer">
                    <button className="view-all-btn">
                        Xem toàn bộ danh sách <FiChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboardPage;