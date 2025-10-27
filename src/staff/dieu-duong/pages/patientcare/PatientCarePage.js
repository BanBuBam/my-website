import React, { useState } from 'react';
import './PatientCarePage.css';

// Import icons
import { FiSearch, FiUser, FiPlus, FiCheck, FiX } from 'react-icons/fi';

// --- Mock Data with Nurse Notes ---
const mockPatients = [
    {
        id: 'BN-123',
        name: 'Nguyễn Văn A',
        room: 'P302-G2',
        orders: [
            { id: 1, text: 'Thuốc: Paracetamol 500mg', detail: 'Liều dùng: 1 viên x 3 lần/ngày', doctor: 'BS. Nguyễn Văn A - 10:30 15/06/2023', status: 'pending' },
            { id: 2, text: 'Dịch vụ: Thay băng vết thương', detail: 'Thực hiện mỗi 24 giờ', doctor: 'BS. Trần Thị B - 09:00 16/06/2023', status: 'pending' },
        ],
        nurseNotes: [
            { id: 1, title: 'Theo dõi buổi sáng', content: 'Bệnh nhân tỉnh táo, tiếp xúc tốt, không sốt.', author: 'ĐD. Nguyễn Thị Lan', timestamp: '08:00 06/10/2025' },
            { id: 2, title: 'Thực hiện y lệnh', content: 'Đã cho bệnh nhân uống thuốc theo y lệnh của bác sĩ.', author: 'ĐD. Nguyễn Thị Lan', timestamp: '09:30 06/10/2025' },
        ]
    },
    { 
        id: 'BN-456', 
        name: 'Trần Thị B', 
        room: 'P305-G1', 
        orders: [], 
        nurseNotes: [] 
    },
    { 
        id: 'BN-789', 
        name: 'Lê Văn C', 
        room: 'P308-G2', 
        orders: [], 
        nurseNotes: [] 
    },
];

const PatientCarePage = () => {
    const [patients, setPatients] = useState(mockPatients);
    const [selectedPatientId, setSelectedPatientId] = useState(mockPatients[0].id); // Select the first patient by default

    const selectedPatient = patients.find(p => p.id === selectedPatientId);

    const handleSelectPatient = (patientId) => {
        setSelectedPatientId(patientId);
    };

    const handleOrderStatusChange = (patientId, orderId, newStatus) => {
        setPatients(currentPatients => currentPatients.map(p => {
            if (p.id === patientId) {
                return {
                    ...p,
                    orders: p.orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
                };
            }
            return p;
        }));
    };

    return (
        <div className="patient-care-page">
            <div className="page-header">
                <h2>Chăm sóc bệnh nhân</h2>
            </div>
            <div className="patient-care-layout">
                {/* --- Left Column: Patient List --- */}
                <aside className="patient-list-sidebar">
                    <div className="search-bar">
                        <input type="text" placeholder="Tìm kiếm bệnh nhân..." />
                        <FiSearch />
                    </div>
                    <div className="patient-list">
                        <h4>Danh sách bệnh nhân</h4>
                        {patients.map(patient => (
                            <div
                                key={patient.id}
                                className={`patient-list-item ${selectedPatientId === patient.id ? 'active' : ''}`}
                                onClick={() => handleSelectPatient(patient.id)}
                            >
                                <div className="patient-icon"><FiUser /></div>
                                <div className="patient-info">
                                    <span className="name">{patient.name}</span>
                                    <span className="meta">{patient.id} - {patient.room}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* --- Right Column: Care Details --- */}
                <main className="care-details-content">
                    {selectedPatient ? (
                        <>
                            <h3>Thông tin bệnh nhân: {selectedPatient.name}</h3>
                            
                            {/* Doctor's Orders */}
                            <div className="care-section">
                                <div className="section-header">
                                    <h4>Y lệnh từ bác sĩ:</h4>
                                    <button className="btn-add-order"><FiPlus /> Thêm y lệnh</button>
                                </div>
                                <ul className="order-list">
                                    {selectedPatient.orders.length > 0 ? selectedPatient.orders.map(order => (
                                        <li key={order.id} className="order-item">
                                            <div className="order-info">
                                                <span className="order-text">{order.text}</span>
                                                <span className="order-detail">{order.detail}</span>
                                                <span className="order-doctor">{order.doctor}</span>
                                            </div>
                                            <div className="order-actions">
                                                <button onClick={() => handleOrderStatusChange(selectedPatient.id, order.id, 'done')} className="icon-btn success"><FiCheck /></button>
                                                <button onClick={() => handleOrderStatusChange(selectedPatient.id, order.id, 'rejected')} className="icon-btn danger"><FiX /></button>
                                            </div>
                                        </li>
                                    )) : <p className="no-items">Không có y lệnh nào.</p>}
                                </ul>
                            </div>

                            {/* Vitals Form */}
                            <div className="care-section">
                                <h4>Chỉ số sinh tồn</h4>
                                <form className="vitals-form">
                                    <div className="form-group"><label>Nhiệt độ (OC)</label><input type="text" /></div>
                                    <div className="form-group"><label>Huyết áp (mmHg)</label><input type="text" /></div>
                                    <div className="form-group"><label>Mạch (lần/phút)</label><input type="text" /></div>
                                    <div className="form-group"><label>Nhịp thở (lần/phút)</label><input type="text" /></div>
                                    <div className="form-group full-width"><label>Ghi chú</label><textarea rows="3"></textarea></div>
                                    <button type="submit" className="btn-primary">Lưu chỉ số</button>
                                </form>
                            </div>

                            {/* Nurse's Notes Form */}
                            <div className="care-section">
                                <h4>Ghi chú điều dưỡng</h4>
                                
                                <div className="previous-notes-list">
                                    {selectedPatient.nurseNotes && selectedPatient.nurseNotes.length > 0 ? (
                                        selectedPatient.nurseNotes.map(note => (
                                            <div key={note.id} className="note-item">
                                                <strong className="note-title">{note.title}</strong>
                                                <p className="note-content">{note.content}</p>
                                                <div className="note-meta">
                                                    <span>{note.author}</span>
                                                    <span>{note.timestamp}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-items">Chưa có ghi chú nào.</p>
                                    )}
                                </div>
                                
                                <form className="notes-form">
                                    <div className="form-group"><label>Tiêu đề</label><input type="text" /></div>
                                    <div className="form-group full-width"><label>Ghi chú</label><textarea rows="4"></textarea></div>
                                    <button type="submit" className="btn-success">Lưu ghi chú</button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <p>Chọn một bệnh nhân từ danh sách để xem chi tiết.</p>
                    )}
                </main>
            </div>
        </div>
    );
};

export default PatientCarePage;