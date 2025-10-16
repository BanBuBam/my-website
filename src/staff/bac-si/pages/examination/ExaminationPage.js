import React, { useState } from 'react';
import './ExaminationPage.css';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

// --- Mock Data ---
const mockPatientVisitData = {
    patientInfo: { id: 'BN001', name: 'Nguyễn Văn An', dob: '1985-05-15', gender: 'Nam', address: 'Số 123, Đường ABC, Quận 1, TP.HCM' },
    visitInfo: { id: 'LK00123', date: '2025-10-04', doctor: 'BS. Trần Minh Hoàng' },
    medicalHistory: 'Bệnh nhân có tiền sử cao huyết áp, không dị ứng thuốc.',
    prescription: [
        { id: 1, name: 'Paracetamol 500mg', dosage: 'Uống 1 viên khi sốt', quantity: 20, usage: 'Uống sau ăn' },
    ]
};

// --- Tab Content Components ---

const MedicalHistoryTab = ({ data }) => (
    <div className="tab-pane">
        <h4>Lịch sử khám bệnh</h4>
        <p>{data}</p>
    </div>
);

const DiagnosisTab = () => {
    const [formData, setFormData] = useState({ symptoms: '', vitals: '', progression: '', icd: '', secondaryDiagnosis: '' });
    const handleChange = e => setFormData({...formData, [e.target.name]: e.target.value });
    return (
        <div className="tab-pane">
            <h4>Khám & chẩn đoán</h4>
            <form className="form-section">
                <div className="form-grid">
                    <div className="form-group"><label>Triệu chứng</label><textarea name="symptoms" rows="3" onChange={handleChange}></textarea></div>
                    <div className="form-group"><label>Dấu hiệu sinh tồn</label><textarea name="vitals" rows="3" onChange={handleChange}></textarea></div>
                    <div className="form-group full-width"><label>Diễn biến bệnh</label><textarea name="progression" rows="4" onChange={handleChange}></textarea></div>
                    <div className="form-group"><label>Chẩn đoán (ICD)</label><input type="text" name="icd" onChange={handleChange} /></div>
                    <div className="form-group"><label>Chẩn đoán kèm theo</label><input type="text" name="secondaryDiagnosis" onChange={handleChange} /></div>
                </div>
                <button type="submit" className="btn-primary">Lưu chẩn đoán</button>
            </form>
        </div>
    );
};

const PrescriptionTab = ({ initialDrugs }) => {
    const [drugs, setDrugs] = useState(initialDrugs);
    const handleAddDrug = () => alert('Thêm thuốc');
    const handleRemoveDrug = (id) => setDrugs(drugs.filter(d => d.id !== id));
    return (
        <div className="tab-pane">
            <h4>Kê đơn thuốc</h4>
            <form className="form-section">
                <div className="form-grid four-cols">
                    <div className="form-group"><label>Tìm kiếm thuốc</label><input type="text" /></div>
                    <div className="form-group"><label>Chẩn đoán kèm theo</label><input type="text" /></div>
                    <div className="form-group"><label>Số lượng</label><input type="number" /></div>
                    <div className="form-group"><label>Cách dùng</label><input type="text" /></div>
                </div>
                <button type="button" onClick={handleAddDrug} className="btn-primary green">Thêm thuốc</button>
            </form>
            <h4>Đơn thuốc hiện tại</h4>
            <div className="prescription-table">
                <div className="table-header"><span>Thuốc</span><span>Liều dùng</span><span>Số lượng</span><span>Cách dùng</span><span>Hành động</span></div>
                {drugs.length > 0 ? drugs.map(drug => (
                    <div key={drug.id} className="table-row">
                        <span>{drug.name}</span>
                        <span>{drug.dosage}</span>
                        <span>{drug.quantity}</span>
                        <span>{drug.usage}</span>
                        <span><button onClick={() => handleRemoveDrug(drug.id)} className="icon-btn danger"><FiTrash2 /></button></span>
                    </div>
                )) : <div className="empty-state">Chưa có thuốc trong đơn</div>}
            </div>
        </div>
    );
};

const LabOrderTab = () => {
    return (
        <div className="tab-pane">
            <h4>Chỉ định CLS</h4>
            <form className="form-section">
                <div className="form-grid">
                    <div className="form-group"><label>Danh mục dịch vụ/ xét nghiệm</label><textarea rows="5"></textarea></div>
                    <div className="form-group"><label>Các chỉ định đã chọn</label><textarea rows="5"></textarea></div>
                </div>
                <button type="submit" className="btn-primary">Lưu chỉ định</button>
            </form>
        </div>
    );
};

const FollowUpTab = () => {
    return (
        <div className="tab-pane">
            <h4>Hẹn tái khám</h4>
            <form className="form-section">
                <div className="form-group"><label>Ngày tái khám</label><input type="date" /></div>
                <div className="form-group"><label>Thời gian tái khám</label><input type="time" /></div>
                <div className="form-group"><label>Lý do tái khám</label><textarea rows="4"></textarea></div>
                <button type="submit" className="btn-primary">Tạo lịch hẹn</button>
            </form>
        </div>
    );
};


// --- Main Examination Page Component ---
const ExaminationPage = () => {
    const [activeTab, setActiveTab] = useState('benh-su');
    const [visitData, setVisitData] = useState(mockPatientVisitData);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'benh-su': return <MedicalHistoryTab data={visitData.medicalHistory} />;
            case 'kham-chan-doan': return <DiagnosisTab />;
            case 'ke-don-thuoc': return <PrescriptionTab initialDrugs={visitData.prescription} />;
            case 'chi-dinh-cls': return <LabOrderTab />;
            case 'hen-tai-kham': return <FollowUpTab />;
            default: return null;
        }
    };

    return (
        <div className="examination-page">
            <div className="card patient-info-header">
                <h3>Thông tin bệnh nhân & Lượt khám</h3>
                <div className="info-grid">
                    <span><strong>Mã BN:</strong> {visitData.patientInfo.id}</span>
                    <span><strong>Tên BN:</strong> {visitData.patientInfo.name}</span>
                    <span><strong>Ngày sinh:</strong> {visitData.patientInfo.dob}</span>
                    <span><strong>Giới tính:</strong> {visitData.patientInfo.gender}</span>
                    <span><strong>Địa chỉ:</strong> {visitData.patientInfo.address}</span>
                    <span><strong>Mã lượt khám:</strong> {visitData.visitInfo.id}</span>
                    <span><strong>Ngày khám:</strong> {visitData.visitInfo.date}</span>
                    <span><strong>Bác sĩ:</strong> {visitData.visitInfo.doctor}</span>
                </div>
            </div>

            <div className="card examination-content">
                <div className="tabs-container">
                    <button onClick={() => setActiveTab('benh-su')} className={`tab-button ${activeTab === 'benh-su' && 'active'}`}>Bệnh sử</button>
                    <button onClick={() => setActiveTab('kham-chan-doan')} className={`tab-button ${activeTab === 'kham-chan-doan' && 'active'}`}>Khám & chẩn đoán</button>
                    <button onClick={() => setActiveTab('ke-don-thuoc')} className={`tab-button ${activeTab === 'ke-don-thuoc' && 'active'}`}>Kê đơn thuốc</button>
                    <button onClick={() => setActiveTab('chi-dinh-cls')} className={`tab-button ${activeTab === 'chi-dinh-cls' && 'active'}`}>Chỉ định CLS</button>
                    <button onClick={() => setActiveTab('hen-tai-kham')} className={`tab-button ${activeTab === 'hen-tai-kham' && 'active'}`}>Hẹn tái khám</button>
                </div>
                <div className="tab-content">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default ExaminationPage;