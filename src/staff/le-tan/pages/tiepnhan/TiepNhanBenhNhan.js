import React, { useState } from 'react';
import './TiepNhanBenhNhan.css';

import { FiUserPlus, FiSearch, FiUser, FiCalendar, FiArrowLeft } from 'react-icons/fi';

const patientDatabase = [
    { id: 'BN001', name: 'Nguyễn Văn An', phone: '0901234567', dob: '1985-05-15', gender: 'Nam', bhyt: 'HS4010012345678' },
    { id: 'BN002', name: 'Trần Thị Bình', phone: '0907654321', dob: '1992-11-20', gender: 'Nữ', bhyt: 'HN2010098765432' },
];

// --- Sub-component for Confirmation View (Unchanged) ---
const ConfirmationView = ({ patient, onBack, onConfirm }) => {
    return (
        <div className="card confirmation-card">
            <div className="confirmation-header"><h2>Xác nhận thông tin</h2><button onClick={onBack} className="back-button"><FiArrowLeft /> Quay lại</button></div>
            <div className="patient-info-box">
                <h4>Thông tin bệnh nhân</h4>
                <div className="info-grid">
                    <div className="info-item"><span>Mã bệnh nhân</span><strong>{patient.id}</strong></div>
                    <div className="info-item"><span>Họ và tên</span><strong>{patient.name}</strong></div>
                    <div className="info-item"><span>Số điện thoại</span><strong>{patient.phone}</strong></div>
                    <div className="info-item"><span>Ngày sinh</span><strong>{patient.dob}</strong></div>
                    <div className="info-item"><span>Giới tính</span><strong>{patient.gender}</strong></div>
                    <div className="info-item"><span>Số BHYT</span><strong>{patient.bhyt}</strong></div>
                </div>
            </div>
            <div className="confirmation-actions"><button className="cancel-btn" onClick={onBack}>Hủy</button><button className="confirm-btn" onClick={onConfirm}>Xác nhận và tiếp tục</button></div>
        </div>
    );
};

// --- NEW: Sub-component for the final Check-in Form ---
const CheckinForm = ({ patient, onBack, onFinish }) => {
    const [formData, setFormData] = useState({
        specialty: '', doctor: '', reason: '', symptoms: '',
        height: '', weight: '', bloodPressure: '', temperature: '', heartRate: '',
        useInsurance: true, notes: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Final Check-in Data:", { patient, ...formData });
        alert(`Hoàn tất check-in cho bệnh nhân ${patient.name}`);
        onFinish();
    };

    return (
        <div className="card checkin-details-card">
            <div className="edit-form-header"><h3>Nhập thông tin khám bệnh</h3><button onClick={onBack} className="back-button"><FiArrowLeft /> Quay lại</button></div>
            <div className="patient-info-banner">
                <strong>{patient.name}</strong> - {patient.id} - {patient.phone}
            </div>
            <form onSubmit={handleSubmit}>
                <div className="form-section">
                    <h4>Thông tin khám bệnh</h4>
                    <div className="form-grid">
                        <div className="form-group"><label>Khoa khám *</label><select name="specialty" value={formData.specialty} onChange={handleChange} required><option value="">Chọn...</option><option>Tim mạch</option><option>Nội tổng quát</option></select></div>
                        <div className="form-group"><label>Bác sĩ khám</label><input type="text" name="doctor" value={formData.doctor} onChange={handleChange} placeholder="Nhập tên bác sĩ" /></div>
                        <div className="form-group full-width"><label>Lý do khám *</label><input type="text" name="reason" value={formData.reason} onChange={handleChange} required /></div>
                        <div className="form-group full-width"><label>Triệu chứng hiện tại</label><textarea name="symptoms" rows="3" value={formData.symptoms} onChange={handleChange}></textarea></div>
                    </div>
                </div>
                <div className="form-section">
                    <h4>Chỉ số sinh tồn</h4>
                    <div className="vitals-grid">
                        <div className="form-group"><label>Chiều cao (cm)</label><input type="number" name="height" value={formData.height} onChange={handleChange} /></div>
                        <div className="form-group"><label>Cân nặng (kg)</label><input type="number" name="weight" value={formData.weight} onChange={handleChange} /></div>
                        <div className="form-group"><label>Huyết áp (mmHg)</label><input type="text" name="bloodPressure" value={formData.bloodPressure} onChange={handleChange} placeholder="VD: 120/80" /></div>
                        <div className="form-group"><label>Nhiệt độ (°C)</label><input type="number" name="temperature" value={formData.temperature} onChange={handleChange} placeholder="VD: 36.5" /></div>
                        <div className="form-group"><label>Nhịp tim (lần/phút)</label><input type="number" name="heartRate" value={formData.heartRate} onChange={handleChange} placeholder="VD: 72" /></div>
                    </div>
                </div>
                <div className="form-section">
                    <h4>Thông tin bảo hiểm</h4>
                    <div className="form-group checkbox-group"><input type="checkbox" id="useInsurance" name="useInsurance" checked={formData.useInsurance} onChange={handleChange} /><label htmlFor="useInsurance">Sử dụng bảo hiểm y tế ({patient.bhyt})</label></div>
                    <div className="form-group full-width"><label>Ghi chú thêm</label><textarea name="notes" rows="3" value={formData.notes} onChange={handleChange} placeholder="Ghi chú thêm (nếu có)"></textarea></div>
                </div>
                <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={onBack}>Quay lại</button>
                    <button type="submit" className="confirm-btn">Hoàn tất Check-in</button>
                </div>
            </form>
        </div>
    );
};


// --- Main Page Component ---
const TiepNhanPage = () => {
    const [viewMode, setViewMode] = useState('search'); // 'search', 'confirm', or 'checkin-form'
    const [foundPatient, setFoundPatient] = useState(null);
    // ... (other state like searchQuery, searchType) ...
    const [searchType, setSearchType] = useState('ho-ten');
    const [searchQuery, setSearchQuery] = useState('');

    const handleSubmitSearch = (e) => {
        e.preventDefault();
        const result = patientDatabase.find(p => p.name.toLowerCase() === searchQuery.toLowerCase().trim() || p.phone === searchQuery.trim());
        if (result) {
            setFoundPatient(result);
            setViewMode('confirm');
        } else {
            alert('Không tìm thấy thông tin bệnh nhân.');
        }
    };

    const handleProceedToCheckinForm = () => {
        setViewMode('checkin-form');
    };

    const handleBackToConfirm = () => {
        setViewMode('confirm');
    };

    const handleFinishAndReset = () => {
        setViewMode('search');
        setFoundPatient(null);
        setSearchQuery('');
    };

    return (
        <div className="checkin-page">
            <div className="page-header"><div><h2>Tiếp nhận Khám bệnh</h2><p>Tiếp nhận và xử lý check-in bệnh nhân</p></div></div>
            <div className="checkin-container">
                {viewMode === 'search' && (
                    <div className="card checkin-card">
                        <div className="checkin-icon-wrapper"><FiUserPlus /></div>
                        <h2>Tiếp nhận Khám bệnh</h2><p className="subtitle">Tìm kiếm bệnh nhân hoặc lịch hẹn để bắt đầu quá trình check-in</p>
                        <form onSubmit={handleSubmitSearch} className="checkin-form">
                            <div className="form-group"><label>Loại tìm kiếm</label><select value={searchType} onChange={(e) => setSearchType(e.target.value)}><option value="ho-ten">Họ tên</option><option value="sdt">Số điện thoại</option></select></div>
                            <div className="form-group"><label>Thông tin tìm kiếm</label><input type="text" placeholder="Nhập thông tin..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
                            <button type="submit" className="search-button"><FiSearch /> Tìm kiếm</button>
                        </form>
                        <hr />
                        <div className="guide-section"><h4>Hướng dẫn sử dụng</h4><div className="guide-boxes"><div className="guide-box patient-search"><div className="guide-icon"><FiUser /></div><div className="guide-text"><strong>Tìm bệnh nhân</strong><span>Tìm kiếm theo tên, số điện thoại hoặc mã bệnh nhân để check-in khi làm thủ tục</span></div></div><div className="guide-box appointment-search"><div className="guide-icon"><FiCalendar /></div><div className="guide-text"><strong>Tìm lịch hẹn</strong><span>Tìm kiếm theo mã lịch hẹn hoặc tên bệnh nhân có lịch hẹn sẵn</span></div></div></div></div>
                    </div>
                )}
                {viewMode === 'confirm' && <ConfirmationView patient={foundPatient} onBack={handleFinishAndReset} onConfirm={handleProceedToCheckinForm} />}
                {viewMode === 'checkin-form' && <CheckinForm patient={foundPatient} onBack={handleBackToConfirm} onFinish={handleFinishAndReset} />}
            </div>
        </div>
    );
};

export default TiepNhanPage;