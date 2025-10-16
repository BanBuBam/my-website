import React, { useState } from 'react';
import './DashboardPage.css';

// --- UPDATED: Import more icons ---
import { 
    FiUsers, FiGrid, FiLogOut, FiLogIn, FiBell, FiSearch
} from 'react-icons/fi';

const mockNurseData = {
    stats: {
        totalPatients: 75,
        bedsAvailable: 357,
        dischargedToday: 65,
        newAdmissions: 128,
    },
    specialCarePatients: [
        { id: 1, patientId: 'BN001', name: 'Nguyễn Văn A', room: 'P.302 - G.2', diagnosis: 'Viêm phổi', order: 'Khẩn', action: 'Xem' },
        { id: 2, patientId: 'BN001', name: 'Nguyễn Văn A', room: 'P.302 - G.2', diagnosis: 'Viêm phổi', order: 'Theo dõi', action: 'Xem' },
        { id: 3, patientId: 'BN001', name: 'Nguyễn Văn A', room: 'P.302 - G.2', diagnosis: 'Viêm phổi', order: 'Khẩn', action: 'Xem' },
    ]
};

const NurseDashboardPage = () => {
    const [data, setData] = useState(mockNurseData);

    return (
        <div className="nurse-dashboard">
            <div className="page-header">
                <div>
                    <h2>Dashboard Điều dưỡng</h2>
                    <p>Tổng quan công việc và bệnh nhân cần chăm sóc</p>
                </div>
            </div>

            {/* --- UPDATED: Stats Cards with Icons --- */}
            <div className="stats-grid">
                <div className="stats-card">
                    <div className="card-icon blue"><FiUsers /></div>
                    <div className="card-info">
                        <span className="card-title">Bệnh nhân nội trú</span>
                        <span className="card-value">{data.stats.totalPatients}</span>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="card-icon green"><FiGrid /></div>
                    <div className="card-info">
                        <span className="card-title">Giường trống</span>
                        <span className="card-value">{data.stats.bedsAvailable}</span>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="card-icon orange"><FiLogOut /></div>
                    <div className="card-info">
                        <span className="card-title">Ra viện hôm nay</span>
                        <span className="card-value">{data.stats.dischargedToday}</span>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="card-icon purple"><FiLogIn /></div>
                    <div className="card-info">
                        <span className="card-title">Nhập viện mới</span>
                        <span className="card-value">{data.stats.newAdmissions}</span>
                    </div>
                </div>
            </div>

            {/* Special Care Patient List */}
            <div className="card patient-list-card">
                <h3>Bệnh nhân cần chăm sóc đặc biệt</h3>
                <div className="patient-list">
                    <div className="list-header">
                        <span>Mã BN</span>
                        <span>Tên BN</span>
                        <span>Giường</span>
                        <span>Chẩn đoán</span>
                        <span>Y lệnh</span>
                        <span>Hành động</span>
                    </div>
                    {data.specialCarePatients.map(patient => (
                        <div key={patient.id} className="list-row">
                            <span className="patient-id">{patient.patientId}</span>
                            <span>{patient.name}</span>
                            <span>{patient.room}</span>
                            <span>{patient.diagnosis}</span>
                            <span>{patient.order}</span>
                            <span>
                                <button className="view-btn">{patient.action}</button>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NurseDashboardPage;