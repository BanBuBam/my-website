import React, { useState, useEffect } from 'react';
import './InpatientPage.css';

// --- Mock Data ---
const mockInpatients = [
    { 
        id: 'BN005', 
        name: 'Nguyễn Văn A', 
        room: '201', 
        admissionDate: '2025-10-26', 
        diagnosis: 'Viêm phổi nặng (J18.9)',
        progressNotes: 'Ngày 5: Bệnh nhân tỉnh táo, ho ít hơn, sốt giảm. Tiếp tục kháng sinh và hỗ trợ hô hấp.',
        vitals: {
            bloodPressure: '120/80 mmHg',
            heartRate: '72 bpm',
            temperature: '36.8 °C',
            spo2: '98%',
        },
        orders: ['Kháng sinh IV', 'Oxy liệu pháp', 'Vật lý trị liệu hô hấp']
    },
];

// --- Sub-component for the Detail Modal ---
const InpatientDetailModal = ({ isOpen, onClose, patientData, onUpdate }) => {
    // --- NEW: State for managing edit mode and form data ---
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(null);

    // When the modal opens or patient data changes, reset the form
    useEffect(() => {
        setFormData(patientData);
        setIsEditing(false); // Default to view mode
    }, [patientData]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setFormData(patientData); // Revert any changes
        setIsEditing(false);
    };

    const handleSave = () => {
        onUpdate(formData); // Pass updated data to the parent
        setIsEditing(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Handle nested vitals object
        if (['bloodPressure', 'heartRate', 'temperature', 'spo2'].includes(name)) {
            setFormData(prev => ({
                ...prev,
                vitals: { ...prev.vitals, [name]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    if (!isOpen || !formData) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Chi tiết bệnh nhân nội trú: {formData.name}</h3>
                </div>
                <div className="modal-body">
                    <div className="modal-info-header">
                        <div className="info-item"><span>Mã BN:</span><strong>{formData.id}</strong></div>
                        <div className="info-item"><span>Phòng:</span><strong>{formData.room}</strong></div>
                        <div className="info-item"><span>Ngày nhập viện:</span><strong>{formData.admissionDate}</strong></div>
                        <div className="info-item">
                            <span>Chẩn đoán:</span>
                            {isEditing ? (
                                <input className="inline-edit" name="diagnosis" value={formData.diagnosis} onChange={handleChange} />
                            ) : (
                                <strong>{formData.diagnosis}</strong>
                            )}
                        </div>
                    </div>

                    <div className="info-section">
                        <h4>Diễn biến bệnh:</h4>
                        {isEditing ? (
                            <textarea className="info-box" name="progressNotes" value={formData.progressNotes} onChange={handleChange} rows="4"></textarea>
                        ) : (
                            <div className="info-box">{formData.progressNotes}</div>
                        )}
                    </div>
                    
                    {/* Other sections would follow the same edit/view pattern */}
                    <div className="info-section">
                        <h4>Biểu đồ sinh tồn:</h4>
                        <div className="info-box vitals-box">
                           {/* For simplicity, this example doesn't make vitals editable, but you could add inputs here */}
                           <div>Huyết áp: {formData.vitals.bloodPressure}</div>
                           <div>Nhịp tim: {formData.vitals.heartRate}</div>
                           <div>Nhiệt độ: {formData.vitals.temperature}</div>
                           <div>SpO2: {formData.vitals.spo2}</div>
                        </div>
                    </div>
                    <div className="info-section">
                        <h4>Y lệnh:</h4>
                        <div className="info-box orders-list">
                            {isEditing ? (
                                <textarea className="info-box" value={formData.orders.join('\n')} onChange={(e) => setFormData({...formData, orders: e.target.value.split('\n')})} rows="3"></textarea>
                            ) : (
                                <ul>{formData.orders.map((order, index) => <li key={index}>{order}</li>)}</ul>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* --- NEW: Conditional buttons in the footer --- */}
                <div className="modal-footer">
                    {isEditing ? (
                        <>
                            <button onClick={handleSave} className="btn-primary">Lưu</button>
                            <button onClick={handleCancel} className="btn-secondary">Hủy</button>
                        </>
                    ) : (
                        <>
                            <button onClick={handleEdit} className="btn-primary">Cập nhật</button>
                            <button onClick={onClose} className="btn-secondary">Đóng</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Main Page Component ---
const InpatientPage = () => {
    const [inpatients, setInpatients] = useState(mockInpatients);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    const handleOpenModal = (patient) => {
        setSelectedPatient(patient);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPatient(null);
    };

    // --- NEW: Handler to update the main list after saving ---
    const handleUpdatePatient = (updatedData) => {
        setInpatients(inpatients.map(p => p.id === updatedData.id ? updatedData : p));
        // You would also make an API call here to save to the database
    };

    return (
        <div className="inpatient-page">
            <div className="page-header"><div><h2>Bệnh nhân nội trú</h2><p>Danh sách và quản lý các bệnh nhân đang điều trị nội trú</p></div></div>
            <div className="card">
                <h3>Danh sách bệnh nhân nội trú</h3>
                <div className="inpatient-list">
                    <div className="list-header"><span>Mã BN</span><span>Tên BN</span><span>Phòng</span><span>Ngày nhập viện</span><span>Hành động</span></div>
                    {inpatients.map(patient => (
                        <div key={patient.id} className="list-row">
                            <span className="patient-id">{patient.id}</span>
                            <span>{patient.name}</span>
                            <span>{patient.room}</span>
                            <span>{patient.admissionDate}</span>
                            <span><button className="detail-btn" onClick={() => handleOpenModal(patient)}>Chi tiết</button></span>
                        </div>
                    ))}
                </div>
            </div>

            <InpatientDetailModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                patientData={selectedPatient}
                onUpdate={handleUpdatePatient} // Pass the update handler to the modal
            />
        </div>
    );
};

export default InpatientPage;