import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './EncounterVitalPage.css';
import {
    FiSearch, FiUser, FiClock, FiActivity, FiThermometer,
    FiPlus, FiList, FiX, FiAlertCircle, FiCheckCircle, FiFileText, FiEdit, FiCheck, FiShoppingCart, FiTrash2
} from 'react-icons/fi';
import { doctorEncounterAPI, icdDiseaseAPI, medicineAPI } from '../../../../services/staff/doctorAPI';

const EncounterVitalPage = () => {
    const location = useLocation();
    const [encounterId, setEncounterId] = useState('');
    const [encounter, setEncounter] = useState(null);
    const [vitalSigns, setVitalSigns] = useState([]);
    const [clinicalNotes, setClinicalNotes] = useState([]);
    const [icdDiseases, setIcdDiseases] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingVitals, setLoadingVitals] = useState(false);
    const [loadingNotes, setLoadingNotes] = useState(false);
    const [error, setError] = useState(null);
    const [showVitalModal, setShowVitalModal] = useState(false);
    const [showVitalListModal, setShowVitalListModal] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [showNoteListModal, setShowNoteListModal] = useState(false);
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Vital signs form data
    const [vitalFormData, setVitalFormData] = useState({
        temperature: '',
        heartRate: '',
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        spO2: '',
        respiratoryRate: '',
        heightCm: '',
        weightKg: '',
        painScore: '',
        notes: ''
    });

    // Clinical note form data
    const [noteFormData, setNoteFormData] = useState({
        diagnosis: '',
        icdDiseaseId: '',
        noteType: '',
        notes: ''
    });

    // Prescription form data
    const [prescriptionFormData, setPrescriptionFormData] = useState({
        prescriptionDate: new Date().toISOString().split('T')[0],
        items: []
    });

    // Current prescription item being added
    const [currentPrescriptionItem, setCurrentPrescriptionItem] = useState({
        medicineId: '',
        dosage: '',
        quantity: '',
        notes: ''
    });

    const loadEncounterById = async (id) => {
        if (!id || !id.trim()) return;

        try {
            setLoading(true);
            setError(null);
            setEncounter(null);

            const response = await doctorEncounterAPI.getEncounterStatus(id.trim());

            if (response && response.data) {
                setEncounter(response.data);
            } else {
                setError('Không tìm thấy encounter');
            }
        } catch (err) {
            console.error('Error fetching encounter:', err);
            setError(err.message || 'Không thể tải thông tin encounter');
        } finally {
            setLoading(false);
        }
    };

    // Load ICD diseases and medicines on component mount
    useEffect(() => {
        const fetchICDDiseases = async () => {
            try {
                const response = await icdDiseaseAPI.getICDDiseases();
                if (response && response.data) {
                    setIcdDiseases(response.data);
                }
            } catch (err) {
                console.error('Error loading ICD diseases:', err);
            }
        };

        const fetchMedicines = async () => {
            try {
                const response = await medicineAPI.getMedicines();
                if (response && response.content) {
                    setMedicines(response.content);
                }
            } catch (err) {
                console.error('Error loading medicines:', err);
            }
        };

        fetchICDDiseases();
        fetchMedicines();
    }, []);

    // Auto-load encounter if encounterId is passed via navigation state
    useEffect(() => {
        if (location.state?.encounterId) {
            const encounterIdFromState = location.state.encounterId.toString();
            setEncounterId(encounterIdFromState);
            // Auto-trigger search
            loadEncounterById(encounterIdFromState);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state]);

    const handleSearchEncounter = async (e) => {
        e.preventDefault();

        if (!encounterId.trim()) {
            alert('Vui lòng nhập Encounter ID');
            return;
        }

        loadEncounterById(encounterId);
    };

    const handleAddVitalSigns = () => {
        if (!encounter) {
            alert('Vui lòng tìm kiếm encounter trước');
            return;
        }
        setShowVitalModal(true);
        // Reset form
        setVitalFormData({
            temperature: '',
            heartRate: '',
            bloodPressureSystolic: '',
            bloodPressureDiastolic: '',
            spO2: '',
            respiratoryRate: '',
            heightCm: '',
            weightKg: '',
            painScore: '',
            notes: ''
        });
    };

    const handleViewVitalSigns = async () => {
        if (!encounter) {
            alert('Vui lòng tìm kiếm encounter trước');
            return;
        }

        setShowVitalListModal(true);
        setLoadingVitals(true);

        try {
            const response = await doctorEncounterAPI.getVitalSigns(encounter.encounterId);
            if (response && response.data) {
                setVitalSigns(response.data);
            }
        } catch (err) {
            console.error('Error fetching vital signs:', err);
            alert(err.message || 'Không thể tải danh sách vital signs');
        } finally {
            setLoadingVitals(false);
        }
    };

    const handleVitalFormChange = (e) => {
        const { name, value } = e.target;
        setVitalFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitVitalSigns = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!vitalFormData.temperature || !vitalFormData.heartRate) {
            alert('Vui lòng nhập ít nhất nhiệt độ và nhịp tim');
            return;
        }

        try {
            setSubmitting(true);

            // Convert string values to numbers
            const payload = {
                temperature: parseFloat(vitalFormData.temperature) || null,
                heartRate: parseInt(vitalFormData.heartRate) || null,
                bloodPressureSystolic: parseInt(vitalFormData.bloodPressureSystolic) || null,
                bloodPressureDiastolic: parseInt(vitalFormData.bloodPressureDiastolic) || null,
                spO2: parseInt(vitalFormData.spO2) || null,
                respiratoryRate: parseInt(vitalFormData.respiratoryRate) || null,
                heightCm: parseFloat(vitalFormData.heightCm) || null,
                weightKg: parseFloat(vitalFormData.weightKg) || null,
                painScore: parseInt(vitalFormData.painScore) || null,
                notes: vitalFormData.notes || null
            };

            const response = await doctorEncounterAPI.addVitalSigns(encounter.encounterId, payload);

            if (response && response.data) {
                alert('Thêm vital signs thành công!');
                setShowVitalModal(false);
            }
        } catch (err) {
            console.error('Error adding vital signs:', err);
            alert(err.message || 'Không thể thêm vital signs');
        } finally {
            setSubmitting(false);
        }
    };

    // Clinical Note handlers
    const handleAddClinicalNote = () => {
        setNoteFormData({
            diagnosis: '',
            icdDiseaseId: '',
            noteType: '',
            notes: ''
        });
        setShowNoteModal(true);
    };

    const handleViewClinicalNotes = async () => {
        try {
            setLoadingNotes(true);
            setShowNoteListModal(true);

            const response = await doctorEncounterAPI.getClinicalNotes(encounter.encounterId);

            if (response && response.data) {
                setClinicalNotes(response.data);
            }
        } catch (err) {
            console.error('Error loading clinical notes:', err);
            alert(err.message || 'Không thể tải danh sách clinical notes');
        } finally {
            setLoadingNotes(false);
        }
    };

    const handleNoteFormChange = (e) => {
        const { name, value } = e.target;
        setNoteFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitClinicalNote = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!noteFormData.diagnosis || !noteFormData.icdDiseaseId || !noteFormData.noteType) {
            alert('Vui lòng nhập đầy đủ chẩn đoán, ICD disease và loại y lệnh');
            return;
        }

        try {
            setSubmitting(true);

            const payload = {
                diagnosis: noteFormData.diagnosis,
                icdDiseaseId: parseInt(noteFormData.icdDiseaseId),
                noteType: noteFormData.noteType,
                notes: noteFormData.notes || null
            };

            const response = await doctorEncounterAPI.createClinicalNote(encounter.encounterId, payload);

            if (response && response.data) {
                alert('Tạo y lệnh thành công!');
                setShowNoteModal(false);
                setNoteFormData({
                    diagnosis: '',
                    icdDiseaseId: '',
                    noteType: '',
                    notes: ''
                });
            }
        } catch (err) {
            console.error('Error creating clinical note:', err);
            alert(err.message || 'Không thể tạo y lệnh');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSignClinicalNote = async (noteId) => {
        if (!window.confirm('Bạn có chắc chắn muốn ký y lệnh này?')) {
            return;
        }

        try {
            const response = await doctorEncounterAPI.signClinicalNote(noteId);

            if (response && response.data) {
                alert('Ký y lệnh thành công!');
                // Refresh clinical notes list
                const notesResponse = await doctorEncounterAPI.getClinicalNotes(encounter.encounterId);
                if (notesResponse && notesResponse.data) {
                    setClinicalNotes(notesResponse.data);
                }
            }
        } catch (err) {
            console.error('Error signing clinical note:', err);
            alert(err.message || 'Không thể ký y lệnh');
        }
    };

    // Prescription handlers
    const handleAddPrescription = () => {
        setPrescriptionFormData({
            prescriptionDate: new Date().toISOString().split('T')[0],
            items: []
        });
        setCurrentPrescriptionItem({
            medicineId: '',
            dosage: '',
            quantity: '',
            notes: ''
        });
        setShowPrescriptionModal(true);
    };

    const handlePrescriptionItemChange = (e) => {
        const { name, value } = e.target;
        setCurrentPrescriptionItem(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddPrescriptionItem = () => {
        if (!currentPrescriptionItem.medicineId || !currentPrescriptionItem.dosage || !currentPrescriptionItem.quantity) {
            alert('Vui lòng điền đầy đủ thông tin thuốc');
            return;
        }

        setPrescriptionFormData(prev => ({
            ...prev,
            items: [...prev.items, { ...currentPrescriptionItem, quantity: parseInt(currentPrescriptionItem.quantity) }]
        }));

        setCurrentPrescriptionItem({
            medicineId: '',
            dosage: '',
            quantity: '',
            notes: ''
        });
    };

    const handleRemovePrescriptionItem = (index) => {
        setPrescriptionFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleSubmitPrescription = async (e) => {
        e.preventDefault();

        if (prescriptionFormData.items.length === 0) {
            alert('Vui lòng thêm ít nhất một loại thuốc');
            return;
        }

        try {
            setSubmitting(true);

            const response = await doctorEncounterAPI.createPrescription(encounter.encounterId, prescriptionFormData);

            if (response && response.data) {
                alert('Tạo đơn thuốc thành công!');
                setShowPrescriptionModal(false);
                setPrescriptionFormData({
                    prescriptionDate: new Date().toISOString().split('T')[0],
                    items: []
                });
            }
        } catch (err) {
            console.error('Error creating prescription:', err);
            alert(err.message || 'Không thể tạo đơn thuốc');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '';
        const date = new Date(dateTimeString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        const statusColors = {
            'PENDING': '#f59e0b',
            'IN_PROGRESS': '#3b82f6',
            'COMPLETED': '#10b981',
            'CANCELLED': '#ef4444',
        };
        return statusColors[status] || '#6b7280';
    };

    return (
        <div className="encounter-vital-page">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h2>Quản lý Vital Signs</h2>
                    <p>Tìm kiếm encounter và quản lý vital signs</p>
                </div>
            </div>

            {/* Search Section */}
            <div className="search-section">
                <form onSubmit={handleSearchEncounter} className="search-form">
                    <div className="search-input-group">
                        <FiSearch className="search-icon" />
                        <input
                            type="number"
                            className="search-input"
                            placeholder="Nhập Encounter ID để tìm kiếm..."
                            value={encounterId}
                            onChange={(e) => setEncounterId(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn-search" disabled={loading}>
                        {loading ? 'Đang tìm...' : 'Tìm kiếm'}
                    </button>
                </form>
            </div>

            {/* Error State */}
            {error && (
                <div className="error-message">
                    <FiAlertCircle />
                    <span>{error}</span>
                </div>
            )}

            {/* Encounter Details */}
            {encounter && (
                <div className="encounter-detail-card">
                    <div className="encounter-card-header">
                        <div className="patient-info-header">
                            <FiUser className="patient-icon" />
                            <div>
                                <h3>{encounter.patientName}</h3>
                                <span className="patient-code">{encounter.patientCode}</span>
                            </div>
                        </div>
                        <span className="encounter-id-badge">Encounter #{encounter.encounterId}</span>
                    </div>

                    <div className="encounter-card-body">
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="label">Loại:</span>
                                <span className="value">{encounter.encounterType}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Trạng thái:</span>
                                <span className="value badge-completed"><strong>{encounter.status || 'UNKNOWN'}</strong></span>
                            </div>
                            <div className="info-item">
                                <span className="label">Thời gian bắt đầu:</span>
                                <span className="value">{formatDateTime(encounter.startDatetime)}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Người tạo:</span>
                                <span className="value">{encounter.createdByEmployeeName || '-'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="encounter-footer">
                        <button className="btn-add-vital" onClick={handleAddVitalSigns}>
                            <FiPlus /> Thêm Vital Sign
                        </button>
                        <button className="btn-view-vital" onClick={handleViewVitalSigns}>
                            <FiList /> Xem Vital Signs
                        </button>
                        {/*<button className="btn-add-note" onClick={handleAddClinicalNote}>*/}
                        {/*    <FiFileText /> Tạo Y lệnh*/}
                        {/*</button>*/}
                        {/*<button className="btn-view-note" onClick={handleViewClinicalNotes}>*/}
                        {/*    <FiEdit /> Xem Y lệnh*/}
                        {/*</button>*/}
                        {/*<button className="btn-add-prescription" onClick={handleAddPrescription}>*/}
                        {/*    <FiShoppingCart /> Kê đơn thuốc*/}
                        {/*</button>*/}
                    </div>
                </div>
            )}


            {/* Add Vital Signs Modal */}
            {showVitalModal && (
                <div className="modal-overlay" onClick={() => setShowVitalModal(false)}>
                    <div className="modal-content vital-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Thêm Vital Signs</h3>
                            <button className="modal-close" onClick={() => setShowVitalModal(false)}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="patient-summary">
                                <strong>{encounter?.patientName}</strong> - {encounter?.patientCode}
                            </div>
                            <form onSubmit={handleSubmitVitalSigns}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Nhiệt độ (°C) <span className="required">*</span></label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            name="temperature"
                                            value={vitalFormData.temperature}
                                            onChange={handleVitalFormChange}
                                            placeholder="36.5"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Nhịp tim (bpm) <span className="required">*</span></label>
                                        <input
                                            type="number"
                                            name="heartRate"
                                            value={vitalFormData.heartRate}
                                            onChange={handleVitalFormChange}
                                            placeholder="75"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Huyết áp tâm thu (mmHg)</label>
                                        <input
                                            type="number"
                                            name="bloodPressureSystolic"
                                            value={vitalFormData.bloodPressureSystolic}
                                            onChange={handleVitalFormChange}
                                            placeholder="120"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Huyết áp tâm trương (mmHg)</label>
                                        <input
                                            type="number"
                                            name="bloodPressureDiastolic"
                                            value={vitalFormData.bloodPressureDiastolic}
                                            onChange={handleVitalFormChange}
                                            placeholder="80"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>SpO2 (%)</label>
                                        <input
                                            type="number"
                                            name="spO2"
                                            value={vitalFormData.spO2}
                                            onChange={handleVitalFormChange}
                                            placeholder="98"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Nhịp thở (lần/phút)</label>
                                        <input
                                            type="number"
                                            name="respiratoryRate"
                                            value={vitalFormData.respiratoryRate}
                                            onChange={handleVitalFormChange}
                                            placeholder="16"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Chiều cao (cm)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            name="heightCm"
                                            value={vitalFormData.heightCm}
                                            onChange={handleVitalFormChange}
                                            placeholder="170"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Cân nặng (kg)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            name="weightKg"
                                            value={vitalFormData.weightKg}
                                            onChange={handleVitalFormChange}
                                            placeholder="65"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Điểm đau (0-10)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            name="painScore"
                                            value={vitalFormData.painScore}
                                            onChange={handleVitalFormChange}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div className="form-group full-width">
                                    <label>Ghi chú</label>
                                    <textarea
                                        name="notes"
                                        value={vitalFormData.notes}
                                        onChange={handleVitalFormChange}
                                        placeholder="Nhập ghi chú..."
                                        rows="3"
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => setShowVitalModal(false)}
                                        disabled={submitting}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={submitting}
                                    >
                                        <FiPlus /> {submitting ? 'Đang lưu...' : 'Lưu Vital Signs'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* View Vital Signs Modal */}
            {showVitalListModal && (
                <div className="modal-overlay" onClick={() => setShowVitalListModal(false)}>
                    <div className="modal-content vital-list-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Danh sách Vital Signs</h3>
                            <button className="modal-close" onClick={() => setShowVitalListModal(false)}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="patient-summary">
                                <strong>{encounter?.patientName}</strong> - {encounter?.patientCode}
                            </div>
                            {loadingVitals ? (
                                <div className="loading-state-small">
                                    <div className="spinner-small"></div>
                                    <p>Đang tải vital signs...</p>
                                </div>
                            ) : vitalSigns.length === 0 ? (
                                <div className="empty-state-small">
                                    <FiThermometer />
                                    <p>Chưa có vital signs nào</p>
                                </div>
                            ) : (
                                <div className="vital-signs-list">
                                    {vitalSigns.map((vital) => (
                                        <div key={vital.vitalSignId} className="vital-card">
                                            <div className="vital-header">
                                                <span className="vital-time">
                                                    <FiClock /> {formatDateTime(vital.recordDatetime)}
                                                </span>
                                                <span className="vital-recorder">
                                                    Ghi nhận bởi: {vital.recorderEmployeeName || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="vital-grid">
                                                <div className="vital-item">
                                                    <span className="vital-label">Nhiệt độ:</span>
                                                    <span className="vital-value">{vital.temperature}°C</span>
                                                </div>
                                                <div className="vital-item">
                                                    <span className="vital-label">Nhịp tim:</span>
                                                    <span className="vital-value">{vital.heartRate} bpm</span>
                                                </div>
                                                <div className="vital-item">
                                                    <span className="vital-label">Huyết áp:</span>
                                                    <span className="vital-value">
                                                        {vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic} mmHg
                                                    </span>
                                                </div>
                                                <div className="vital-item">
                                                    <span className="vital-label">SpO2:</span>
                                                    <span className="vital-value">{vital.spO2}%</span>
                                                </div>
                                                <div className="vital-item">
                                                    <span className="vital-label">Nhịp thở:</span>
                                                    <span className="vital-value">{vital.respiratoryRate} lần/phút</span>
                                                </div>
                                                <div className="vital-item">
                                                    <span className="vital-label">Chiều cao:</span>
                                                    <span className="vital-value">{vital.heightCm} cm</span>
                                                </div>
                                                <div className="vital-item">
                                                    <span className="vital-label">Cân nặng:</span>
                                                    <span className="vital-value">{vital.weightKg} kg</span>
                                                </div>
                                                <div className="vital-item">
                                                    <span className="vital-label">BMI:</span>
                                                    <span className="vital-value">{vital.bmi}</span>
                                                </div>
                                                <div className="vital-item">
                                                    <span className="vital-label">Điểm đau:</span>
                                                    <span className="vital-value">{vital.painScore}/10</span>
                                                </div>
                                            </div>
                                            {vital.notes && (
                                                <div className="vital-notes">
                                                    <strong>Ghi chú:</strong> {vital.notes}
                                                </div>
                                            )}
                                            {vital.abnormalFlags && (
                                                <div className="vital-abnormal">
                                                    <FiAlertCircle /> <strong>Cảnh báo:</strong> {vital.abnormalFlags}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Clinical Note Modal */}
            {showNoteModal && (
                <div className="modal-overlay" onClick={() => setShowNoteModal(false)}>
                    <div className="modal-content note-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Tạo Y lệnh (Clinical Note)</h3>
                            <button className="modal-close" onClick={() => setShowNoteModal(false)}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="patient-summary">
                                <strong>{encounter?.patientName}</strong> - {encounter?.patientCode}
                            </div>
                            <form onSubmit={handleSubmitClinicalNote}>
                                <div className="form-group">
                                    <label>Chẩn đoán <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="diagnosis"
                                        value={noteFormData.diagnosis}
                                        onChange={handleNoteFormChange}
                                        placeholder="Nhập chẩn đoán..."
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>ICD Disease <span className="required">*</span></label>
                                    <select
                                        name="icdDiseaseId"
                                        value={noteFormData.icdDiseaseId}
                                        onChange={handleNoteFormChange}
                                        required
                                    >
                                        <option value="">-- Chọn ICD Disease --</option>
                                        {icdDiseases.map((disease) => (
                                            <option key={disease.icdDiseaseId} value={disease.icdDiseaseId}>
                                                {disease.icdCode} - {disease.diseaseName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Loại Y lệnh <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="noteType"
                                        value={noteFormData.noteType}
                                        onChange={handleNoteFormChange}
                                        placeholder="Nhập loại y lệnh (VD: ADMISSION, DISCHARGE, CONSULTATION...)"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Ghi chú</label>
                                    <textarea
                                        name="notes"
                                        value={noteFormData.notes}
                                        onChange={handleNoteFormChange}
                                        placeholder="Nhập ghi chú..."
                                        rows="4"
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => setShowNoteModal(false)}
                                        disabled={submitting}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={submitting}
                                    >
                                        <FiFileText /> {submitting ? 'Đang lưu...' : 'Tạo Y lệnh'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* View Clinical Notes Modal */}
            {showNoteListModal && (
                <div className="modal-overlay" onClick={() => setShowNoteListModal(false)}>
                    <div className="modal-content note-list-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Danh sách Y lệnh (Clinical Notes)</h3>
                            <button className="modal-close" onClick={() => setShowNoteListModal(false)}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="patient-summary">
                                <strong>{encounter?.patientName}</strong> - {encounter?.patientCode}
                            </div>
                            {loadingNotes ? (
                                <div className="loading-state-small">
                                    <div className="spinner-small"></div>
                                    <p>Đang tải y lệnh...</p>
                                </div>
                            ) : clinicalNotes.length === 0 ? (
                                <div className="empty-state-small">
                                    <FiFileText />
                                    <p>Chưa có y lệnh nào</p>
                                </div>
                            ) : (
                                <div className="clinical-notes-list">
                                    {clinicalNotes.map((note) => (
                                        <div key={note.clinicalNoteId} className="note-card">
                                            <div className="note-header">
                                                <div className="note-title">
                                                    <FiFileText />
                                                    <strong>Y lệnh #{note.clinicalNoteId}</strong>
                                                    <span className={`note-status-badge ${note.status?.toLowerCase()}`}>
                                                        {note.status}
                                                    </span>
                                                </div>
                                                <span className="note-type-badge">{note.noteType}</span>
                                            </div>
                                            <div className="note-body">
                                                <div className="note-info-grid">
                                                    <div className="note-info-item">
                                                        <span className="note-label">Chẩn đoán:</span>
                                                        <span className="note-value">{note.diagnosis}</span>
                                                    </div>
                                                    <div className="note-info-item">
                                                        <span className="note-label">ICD Code:</span>
                                                        <span className="note-value">{note.icdCode}</span>
                                                    </div>
                                                    <div className="note-info-item full-width">
                                                        <span className="note-label">Tên bệnh:</span>
                                                        <span className="note-value">{note.diseaseName}</span>
                                                    </div>
                                                    <div className="note-info-item">
                                                        <span className="note-label">Người tạo:</span>
                                                        <span className="note-value">{note.createdByEmployeeName || '-'}</span>
                                                    </div>
                                                    <div className="note-info-item">
                                                        <span className="note-label">Ngày tạo:</span>
                                                        <span className="note-value">{formatDateTime(note.createdAt)}</span>
                                                    </div>
                                                    {note.signedByEmployeeName && (
                                                        <>
                                                            <div className="note-info-item">
                                                                <span className="note-label">Người ký:</span>
                                                                <span className="note-value">{note.signedByEmployeeName}</span>
                                                            </div>
                                                            <div className="note-info-item">
                                                                <span className="note-label">Ngày ký:</span>
                                                                <span className="note-value">{formatDateTime(note.signedAt)}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                {note.notes && (
                                                    <div className="note-notes">
                                                        <strong>Ghi chú:</strong>
                                                        <p>{note.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                            {note.status !== 'SIGNED' && (
                                                <div className="note-footer">
                                                    <button
                                                        className="btn-sign-note"
                                                        onClick={() => handleSignClinicalNote(note.clinicalNoteId)}
                                                    >
                                                        <FiCheck /> Ký Y lệnh
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Prescription Modal */}
            {showPrescriptionModal && (
                <div className="modal-overlay" onClick={() => setShowPrescriptionModal(false)}>
                    <div className="modal-content prescription-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Kê đơn thuốc</h3>
                            <button className="modal-close" onClick={() => setShowPrescriptionModal(false)}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="patient-summary">
                                <strong>{encounter?.patientName}</strong> - {encounter?.patientCode}
                            </div>
                            <form onSubmit={handleSubmitPrescription}>
                                <div className="form-group">
                                    <label>Ngày kê đơn <span className="required">*</span></label>
                                    <input
                                        type="date"
                                        value={prescriptionFormData.prescriptionDate}
                                        onChange={(e) => setPrescriptionFormData(prev => ({ ...prev, prescriptionDate: e.target.value }))}
                                        required
                                    />
                                </div>

                                {/* Add Medicine Item Section */}
                                <div className="add-medicine-section">
                                    <h4>Thêm thuốc vào đơn</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Thuốc <span className="required">*</span></label>
                                            <select
                                                name="medicineId"
                                                value={currentPrescriptionItem.medicineId}
                                                onChange={handlePrescriptionItemChange}
                                            >
                                                <option value="">-- Chọn thuốc --</option>
                                                {medicines.map((medicine) => (
                                                    <option key={medicine.medicineId} value={medicine.medicineId}>
                                                        {medicine.medicineName} {medicine.sku ? `(${medicine.sku})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Liều lượng <span className="required">*</span></label>
                                            <input
                                                type="text"
                                                name="dosage"
                                                value={currentPrescriptionItem.dosage}
                                                onChange={handlePrescriptionItemChange}
                                                placeholder="VD: 500mg, 2 viên/lần"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Số lượng <span className="required">*</span></label>
                                            <input
                                                type="number"
                                                name="quantity"
                                                value={currentPrescriptionItem.quantity}
                                                onChange={handlePrescriptionItemChange}
                                                placeholder="10"
                                                min="1"
                                            />
                                        </div>
                                        <div className="form-group full-width">
                                            <label>Ghi chú</label>
                                            <input
                                                type="text"
                                                name="notes"
                                                value={currentPrescriptionItem.notes}
                                                onChange={handlePrescriptionItemChange}
                                                placeholder="VD: Uống sau ăn, ngày 2 lần"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-add-item"
                                        onClick={handleAddPrescriptionItem}
                                    >
                                        <FiPlus /> Thêm vào đơn
                                    </button>
                                </div>

                                {/* Prescription Items List */}
                                {prescriptionFormData.items.length > 0 && (
                                    <div className="prescription-items-list">
                                        <h4>Danh sách thuốc trong đơn ({prescriptionFormData.items.length})</h4>
                                        <div className="items-table">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Thuốc</th>
                                                        <th>Liều lượng</th>
                                                        <th>Số lượng</th>
                                                        <th>Ghi chú</th>
                                                        <th>Xóa</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {prescriptionFormData.items.map((item, index) => {
                                                        const medicine = medicines.find(m => m.medicineId === parseInt(item.medicineId));
                                                        return (
                                                            <tr key={index}>
                                                                <td>{medicine?.medicineName || 'N/A'}</td>
                                                                <td>{item.dosage}</td>
                                                                <td>{item.quantity}</td>
                                                                <td>{item.notes || '-'}</td>
                                                                <td>
                                                                    <button
                                                                        type="button"
                                                                        className="btn-remove-item"
                                                                        onClick={() => handleRemovePrescriptionItem(index)}
                                                                    >
                                                                        <FiTrash2 />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => setShowPrescriptionModal(false)}
                                        disabled={submitting}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={submitting || prescriptionFormData.items.length === 0}
                                    >
                                        {submitting ? 'Đang tạo...' : 'Tạo đơn thuốc'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EncounterVitalPage;



