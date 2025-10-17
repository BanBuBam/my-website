import React, { useState, useMemo } from 'react';
import './BedTransferPage.css';
import { FiRepeat, FiSearch, FiArrowLeft } from 'react-icons/fi';

// --- Mock Data ---
const allInpatients = [
    { id: 'BN001', name: 'Nguyễn Văn An', department: 'Khoa Nội tổng hợp', room: 'P.301', bed: 'P.301-G.2' },
    { id: 'BN002', name: 'Trần Thị Bình', department: 'Khoa Nội tổng hợp', room: 'P.301', bed: 'P.301-G.4' },
    { id: 'BN003', name: 'Lê Văn Cường', department: 'Khoa Tim mạch', room: 'P.502', bed: 'P.502-G.1' },
];

const mockTransferHistory = [
    { id: 1, patientName: 'Nguyễn Văn An', from: 'P.301-G.2', to: 'P.302-G.2', date: '25/10/2025 10:30', reason: 'Theo yêu cầu điều trị' },
];

const BedTransferPage = () => {
    // --- State Management ---
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [transferData, setTransferData] = useState({ newRoom: '', newBed: '', transferDate: '', reason: '' });
    const [patientIdSearch, setPatientIdSearch] = useState('');

    // --- Handlers ---
    const handleSelectPatient = (patientId) => {
        const patient = allInpatients.find(p => p.id.toLowerCase() === patientId.toLowerCase().trim());
        if (patient) {
            setSelectedPatient(patient);
        } else {
            alert('Không tìm thấy bệnh nhân với mã này.');
        }
    };

    const handleTransferChange = (e) => {
        setTransferData({ ...transferData, [e.target.name]: e.target.value });
    };

    const handleTransferSubmit = (e) => {
        e.preventDefault();
        console.log("Performing transfer for:", selectedPatient.name, "to", transferData.newBed);
        alert('Thực hiện chuyển giường thành công!');
        setSelectedPatient(null); // Go back to the selection screen
        setTransferData({ newRoom: '', newBed: '', transferDate: '', reason: '' }); // Reset form
    };

    return (
        <div className="bed-transfer-page">
            <div className="page-header">
                <div>
                    <h2>Chuyển giường bệnh</h2>
                    <p>Chọn bệnh nhân và thực hiện chuyển giường</p>
                </div>
            </div>

            {/* --- Conditional Rendering: Show Selection or Transfer Form --- */}
            {!selectedPatient ? (
                // Step 1: Patient Selection View
                <div className="card patient-selection-card">
                    <h3>Chọn bệnh nhân cần chuyển giường</h3>
                    <div className="search-by-id">
                        <input 
                            type="text" 
                            placeholder="Nhập Mã bệnh nhân để tìm kiếm..." 
                            value={patientIdSearch}
                            onChange={(e) => setPatientIdSearch(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSelectPatient(patientIdSearch)}
                        />
                        <button className="btn-primary" onClick={() => handleSelectPatient(patientIdSearch)}>
                            <FiSearch/> Tìm
                        </button>
                    </div>
                    {/* You can add more complex filters (by department, room) here if needed */}
                </div>
            ) : (
                // Step 2: Bed Transfer Form View
                <div className="card">
                    <div className="transfer-header">
                        <h3>Thực hiện chuyển giường</h3>
                        <button className="back-button" onClick={() => setSelectedPatient(null)}>
                            <FiArrowLeft /> Chọn bệnh nhân khác
                        </button>
                    </div>
                    <form onSubmit={handleTransferSubmit} className="transfer-form-grid">
                        <div className="form-column">
                            <h4>Giường hiện tại</h4>
                            <div className="form-group"><label>Mã bệnh nhân</label><input type="text" value={selectedPatient.id} readOnly /></div>
                            <div className="form-group"><label>Họ tên bệnh nhân</label><input type="text" value={selectedPatient.name} readOnly /></div>
                            <div className="form-group"><label>Giường hiện tại</label><input type="text" value={selectedPatient.bed} readOnly /></div>
                            <div className="form-group"><label>Phòng hiện tại</label><input type="text" value={selectedPatient.room} readOnly /></div>
                        </div>
                        <div className="form-column">
                            <h4>Giường mới</h4>
                            <div className="form-group"><label>Chọn phòng</label><select name="newRoom" value={transferData.newRoom} onChange={handleTransferChange} required><option value="">Chọn phòng</option><option value="P302">Phòng 302</option><option value="P303">Phòng 303</option></select></div>
                            <div className="form-group"><label>Chọn giường</label><select name="newBed" value={transferData.newBed} onChange={handleTransferChange} required><option value="">Chọn giường</option><option value="P302-G.1">P302-G.1</option><option value="P302-G.2">P302-G.2</option></select></div>
                            <div className="form-group"><label>Ngày chuyển</label><input type="datetime-local" name="transferDate" value={transferData.transferDate} onChange={handleTransferChange} required /></div>
                            <div className="form-group"><label>Lý do chuyển</label><textarea name="reason" rows="4" value={transferData.reason} onChange={handleTransferChange}></textarea></div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-primary">
                                <FiRepeat /> Thực hiện chuyển giường
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            {/* Transfer History Card */}
            <div className="card">
                <h4>Lịch sử chuyển giường gần đây</h4>
                <div className="history-list">
                    <div className="history-header">
                        <span>Bệnh nhân</span>
                        <span>Từ</span>
                        <span>Đến</span>
                        <span>Ngày</span>
                        <span>Lý do</span>
                    </div>
                    {mockTransferHistory.map(item => (
                        <div key={item.id} className="history-row">
                            <span>{item.patientName}</span>
                            <span>{item.from}</span>
                            <span>{item.to}</span>
                            <span>{item.date}</span>
                            <span>{item.reason}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BedTransferPage;