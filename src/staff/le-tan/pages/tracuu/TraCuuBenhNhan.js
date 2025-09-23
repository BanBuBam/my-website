import React, { useState } from 'react';
import './TraCuuBenhNhan.css';

import { FiSearch, FiUser, FiFileText, FiShield, FiCreditCard, FiCheckCircle, FiEdit, FiInfo, FiCalendar, FiArrowLeft } from 'react-icons/fi';

// Mock data for a single patient to be "found"
const mockPatientData = {
    id: 'BN001',
    name: 'Nguyễn Văn An',
    phone: '0901234567',
    age: 40, 
    cccd: '123456789012',
    dob: '15/5/1985',
    gender: 'Nam',
    address: 'Số 123, Đường ABC, Quận 1, TP.HCM',
    email: 'nguyenvanan@email.com',
    bhyt: 'HS4010012345678',
    insuranceStatus: 'Hết hiệu lực',
    stats: {
        totalVisits: 2,
        totalCost: '160.000 đ',
        completedVisits: 2,
    },
    history: [
        { 
            id: 1, 
            specialty: 'Tim mạch', 
            doctor: 'BS. Trần Minh Hoàng', 
            reason: 'Khám định kỳ tim mạch', 
            diagnosis: 'Cao huyết áp độ 1',
            status: 'Hoàn thành',
            cost: '100.000 đ',
            date: '10/1/2024 - 10:00'
        },
        { 
            id: 2, 
            specialty: 'Nội tổng quát', 
            doctor: 'BS. Nguyễn Thị An', 
            reason: 'Khám sức khỏe tổng quát', 
            diagnosis: 'Sức khỏe bình thường',
            status: 'Hoàn thành',
            cost: '60.000 đ',
            date: '15/1/2024 - 14:30'
        },
    ],
    registrationDate: '15/1/2023',
    workplace: 'Công ty ABC',
    occupation: 'Kỹ sư',
    emergencyContactName: 'Nguyễn Thị Bình',
    emergencyContactPhone: '0907654321',
};


// --- Sub-component for the initial Search View ---
const SearchView = ({ onSearch }) => {
    const [searchType, setSearchType] = useState('ho-ten');
    const [searchQuery, setSearchQuery] = useState('Nguyễn Văn An');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(searchQuery);
    };

    return (
        <div className="lookup-container">
            <div className="card search-card">
                <div className="search-icon-wrapper"><FiSearch /></div>
                <h2>Tra cứu Hành chính</h2>
                <p className="subtitle">Tra cứu thông tin bệnh nhân, lịch sử khám bệnh và bảo hiểm y tế</p>
                <form onSubmit={handleSubmit} className="lookup-form">
                    <div className="form-group"><label>Loại tra cứu</label><select value={searchType} onChange={e => setSearchType(e.target.value)}><option value="ho-ten">Họ tên</option><option value="sdt">Số điện thoại</option></select></div>
                    <div className="form-group"><label>Thông tin tra cứu</label><input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
                    <button type="submit" className="search-button"><FiSearch /> Tìm kiếm</button>
                </form>
            </div>
            <div className="lookup-types-section">
                <h4>Các loại tra cứu</h4>
                <div className="lookup-types-grid">
                    <div className="lookup-type-card blue"><div className="type-icon"><FiUser/></div><div><strong>Thông tin bệnh nhân</strong><span>Tra cứu thông tin cá nhân, liên hệ và thống kê khám bệnh</span></div></div>
                    <div className="lookup-type-card green"><div className="type-icon"><FiFileText/></div><div><strong>Lịch sử khám bệnh</strong><span>Xem chi tiết các lần khám, chẩn đoán và điều trị</span></div></div>
                    <div className="lookup-type-card purple"><div className="type-icon"><FiShield/></div><div><strong>Bảo hiểm Y tế</strong><span>Kiểm tra thông tin BHYT và thống kê sử dụng</span></div></div>
                    <div className="lookup-type-card orange"><div className="type-icon"><FiCreditCard/></div><div><strong>Thanh toán</strong><span>Tra cứu lịch sử thanh toán và công nợ</span></div></div>
                </div>
            </div>
        </div>
    );
};


// --- Sub-component for the Results View ---
const ResultsView = ({ patient, onNewSearch, onShowDetails }) => {
    return (
        <div className="results-container">
            <div className="success-banner">
                <span><FiCheckCircle /> <strong>Tìm thấy bệnh nhân!</strong> Kết quả tìm kiếm cho "{patient.name}"</span>
                <button onClick={onNewSearch} className="new-search-btn"><FiSearch /> Tìm kiếm khác</button>
            </div>
            <div className="results-grid">
                {/* Left Column */}
                <div className="results-main">
                    <div className="card patient-header-card">
                        <div>
                            <h3>{patient.name}</h3>
                            <div className="patient-meta"><span>{patient.id}</span><span>{patient.phone}</span><span>{patient.age} tuổi</span></div>
                        </div>
                        <div className="patient-actions">
                            <button className="btn-primary" onClick={() => onShowDetails(patient)}><FiInfo/> Chi tiết</button>
                            <button className="btn-secondary"><FiEdit/> Sửa</button>
                        </div>
                    </div>
                    <div className="card patient-details-card">
                        <div className="detail-group"><h4>Thông tin cơ bản</h4><span><strong>CCCD:</strong> {patient.cccd}</span><span><strong>Ngày sinh:</strong> {patient.dob}</span><span><strong>Giới tính:</strong> {patient.gender}</span></div>
                        <div className="detail-group"><h4>Liên hệ</h4><span><strong>Địa chỉ:</strong> {patient.address}</span><span><strong>Email:</strong> {patient.email}</span></div>
                        <div className="detail-group"><h4>Bảo hiểm</h4><span><strong>Số BHYT:</strong> {patient.bhyt}</span><span className={`insurance-status ${patient.insuranceStatus === 'Hết hiệu lực' && 'expired'}`}><strong>Trạng thái:</strong> {patient.insuranceStatus}</span></div>
                    </div>
                    <div className="card history-card">
                        <div className="list-header"><h4>Lịch sử khám gần đây</h4><button className="btn-view-all">Xem tất cả ({patient.history.length})</button></div>
                        <ul className="history-list">
                            {patient.history.map(item => (
                                <li key={item.id} className="history-item">
                                    <div className="history-details">
                                        <div className="specialty-header">
                                            <span className="specialty">{item.specialty}</span>
                                            <span className="status status-hoan-thanh">{item.status}</span>
                                        </div>
                                        <span className="doctor">{item.doctor}</span>
                                        <span className="reason">{item.reason}</span>
                                        <span className="diagnosis">Chẩn đoán: {item.diagnosis}</span>
                                    </div>
                                    <div className="history-meta">
                                        <span className="cost">{item.cost}</span>
                                        <span className="date">{item.date}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                {/* Right Column */}
                <div className="results-sidebar">
                    <div className="card overview-card">
                        <h4>Thông tin tổng quan</h4>
                        <div className="overview-item"><span>{patient.stats.totalVisits}</span><span>Lần khám</span></div>
                        <div className="overview-item"><span>{patient.stats.totalCost}</span><span>Tổng chi phí</span></div>
                        <div className="overview-item"><span>{patient.stats.completedVisits}</span><span>Khám hoàn thành</span></div>
                    </div>
                    <div className="card quick-actions-card">
                        <h4>Thao tác nhanh</h4>
                        <button className="primary-action"><FiUser /> Check-in khám bệnh</button>
                        <button><FiCalendar /> Đặt lịch hẹn</button>
                        <button><FiFileText /> In thông tin</button>
                        <button><FiShield /> Chi tiết BHYT</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Sub-component for the Patient Detail View ---
const PatientDetailView = ({ patient, onBack }) => {
    const [activeTab, setActiveTab] = useState('history'); // 'history', 'checkin', 'booking'

    return (
        <div className="details-container">
            <div className="details-header">
                <h3>Thông tin Bệnh nhân</h3>
                <button onClick={onBack} className="new-search-btn"><FiSearch /> Tìm kiếm khác</button>
            </div>
            <div className="details-grid">
                {/* Left Column */}
                <div className="details-main">
                    <div className="card patient-full-details-card">
                        <div className="info-grid-detailed">
                            <div className="info-item"><span>Mã bệnh nhân</span><strong>{patient.id}</strong></div>
                            <div className="info-item"><span>Họ và tên</span><strong>{patient.name}</strong></div>
                            <div className="info-item"><span>Số điện thoại</span><strong>{patient.phone}</strong></div>
                            <div className="info-item"><span>Số CCCD</span><strong>{patient.cccd}</strong></div>
                            <div className="info-item"><span>Ngày sinh</span><strong>{patient.dob}</strong></div>
                            <div className="info-item"><span>Giới tính</span><strong>{patient.gender}</strong></div>
                            <div className="info-item full-span"><span>Địa chỉ</span><strong>{patient.address}</strong></div>
                            <div className="info-item"><span>Email</span><strong>{patient.email}</strong></div>
                            <div className="info-item"><span>Nơi làm việc</span><strong>{patient.workplace}</strong></div>
                            <div className="info-item"><span>Nghề nghiệp</span><strong>{patient.occupation}</strong></div>
                            <div className="info-item"><span>Ngày đăng ký</span><strong>{patient.registrationDate}</strong></div>
                            <div className="info-item"><span>Người liên hệ</span><strong>{patient.emergencyContactName}</strong></div>
                            <div className="info-item"><span>Số điện thoại</span><strong>{patient.emergencyContactPhone}</strong></div>
                        </div>
                    </div>
                    <div className="actions-tabs">
                        <button className={`tab-button ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}><FiFileText /> Lịch sử khám ({patient.history.length})</button>
                        <button className={`tab-button ${activeTab === 'checkin' ? 'active' : ''}`} onClick={() => setActiveTab('checkin')}><FiUser /> Check-in mới</button>
                        <button className={`tab-button ${activeTab === 'booking' ? 'active' : ''}`} onClick={() => setActiveTab('booking')}><FiCalendar /> Đặt lịch hẹn</button>
                    </div>
                    {/* Tab Content */}
                    {activeTab === 'history' && (
                        <div className="card history-card">
                            <div className="list-header"><h4>Lần khám gần đây</h4><button className="btn-view-all">Xem tất cả</button></div>
                            <ul className="history-list">
                                {patient.history.map(item => (
                                <li key={item.id} className="history-item">
                                    <div className="history-details">
                                        <div className="specialty-header"><span className="specialty">{item.specialty}</span><span className="status status-hoan-thanh">{item.status}</span></div>
                                        <span className="doctor">{item.doctor}</span>
                                        <span className="reason">{item.reason}</span>
                                    </div>
                                    <div className="history-meta"><span className="cost">{item.cost}</span><span className="date">{item.date}</span></div>
                                </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {activeTab === 'checkin' && <div className="card"><p>Giao diện Check-in mới sẽ được hiển thị ở đây.</p></div>}
                    {activeTab === 'booking' && <div className="card"><p>Giao diện Đặt lịch hẹn mới sẽ được hiển thị ở đây.</p></div>}
                </div>
                {/* Right Column */}
                <div className="details-sidebar">
                    <div className="card overview-card"><h4>Thống kê</h4><div className="overview-item"><span>{patient.stats.totalVisits}</span><span>Lần khám</span></div><div className="overview-item"><span>{patient.stats.totalCost}</span><span>Tổng chi phí</span></div><div className="overview-item"><span>{patient.stats.completedVisits}</span><span>Lần khám hoàn thành</span></div></div>
                    <div className="card insurance-card"><h4>Bảo hiểm Y tế</h4><div className="info-item"><span>Số thẻ BHYT</span><strong>{patient.bhyt}</strong></div><div className="info-item"><span>Trạng thái</span><strong className={`insurance-status ${patient.insuranceStatus === 'Hết hiệu lực' && 'expired'}`}>{patient.insuranceStatus}</strong></div> <button className="btn-secondary full-width" disabled>Chi tiết BHYT</button></div>
                </div>
            </div>
        </div>
    );
};


// --- Main Page Component ---
const TraCuuBenhNhan = () => {
    const [viewMode, setViewMode] = useState('search'); // 'search', 'results', or 'details'
    const [foundPatient, setFoundPatient] = useState(null);

    const handleSearch = (query) => {
        if (query.toLowerCase() === mockPatientData.name.toLowerCase()) {
            setFoundPatient(mockPatientData);
            setViewMode('results');
        } else {
            alert("Không tìm thấy bệnh nhân.");
        }
    };
    
    const handleShowDetails = (patient) => {
        setFoundPatient(patient);
        setViewMode('details');
    };
    
    const handleBackToSearch = () => {
        setFoundPatient(null);
        setViewMode('search');
    }

    return (
        <div className="lookup-page">
            <div className="page-header">
                <div><h2>Tra cứu Hành chính</h2><p>Tra cứu thông tin hành chính và lịch sử khám</p></div>
            </div>
            
            {viewMode === 'search' && <SearchView onSearch={handleSearch} />}
            {viewMode === 'results' && <ResultsView patient={foundPatient} onNewSearch={handleBackToSearch} onShowDetails={handleShowDetails} />}
            {viewMode === 'details' && <PatientDetailView patient={foundPatient} onBack={handleBackToSearch} />}
        </div>
    );
};

export default TraCuuBenhNhan;