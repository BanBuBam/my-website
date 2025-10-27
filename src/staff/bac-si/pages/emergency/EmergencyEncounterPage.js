import React, { useState, useEffect } from 'react';
import './EmergencyEncounterPage.css';
import {
    FiAlertCircle, FiUser, FiClock, FiActivity, FiHeart,
    FiThermometer, FiRefreshCw, FiPlus, FiList, FiX
} from 'react-icons/fi';
import { doctorEmergencyAPI } from '../../../../services/staff/doctorAPI';

const EmergencyEncounterPage = () => {
    const [encounters, setEncounters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showVitalModal, setShowVitalModal] = useState(false);
    const [showVitalListModal, setShowVitalListModal] = useState(false);
    const [selectedEncounter, setSelectedEncounter] = useState(null);
    const [vitalSigns, setVitalSigns] = useState([]);
    const [loadingVitals, setLoadingVitals] = useState(false);
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

    useEffect(() => {
        fetchEmergencyEncounters();
    }, []);

    const fetchEmergencyEncounters = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get doctorId from localStorage
            const userInfo = JSON.parse(localStorage.getItem('staffUserInfo') || '{}');
            const doctorId = userInfo.employeeId;

            if (!doctorId) {
                throw new Error('Không tìm thấy thông tin bác sĩ');
            }

            const response = await doctorEmergencyAPI.getEmergencyEncountersByDoctor(doctorId);

            if (response && response.data) {
                setEncounters(response.data);
            }
        } catch (err) {
            console.error('Error fetching emergency encounters:', err);
            setError(err.message || 'Không thể tải danh sách emergency encounters');
        } finally {
            setLoading(false);
        }
    };

    const handleAddVitalSigns = (encounter) => {
        setSelectedEncounter(encounter);
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

    const handleViewVitalSigns = async (encounter) => {
        setSelectedEncounter(encounter);
        setShowVitalListModal(true);
        setLoadingVitals(true);

        try {
            const response = await doctorEmergencyAPI.getVitalSigns(encounter.encounterId);
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

            const response = await doctorEmergencyAPI.addVitalSigns(selectedEncounter.encounterId, payload);

            if (response && response.data) {
                alert('Thêm vital signs thành công!');
                setShowVitalModal(false);
                setSelectedEncounter(null);
            }
        } catch (err) {
            console.error('Error adding vital signs:', err);
            alert(err.message || 'Không thể thêm vital signs');
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

    if (loading) {
        return (
            <div className="emergency-encounter-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải danh sách emergency encounters...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="emergency-encounter-page">
                <div className="error-state">
                    <FiAlertCircle />
                    <p>{error}</p>
                    <button className="btn-retry" onClick={fetchEmergencyEncounters}>
                        <FiRefreshCw /> Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="emergency-encounter-page">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h2>Emergency Encounters</h2>
                    <p>Danh sách bệnh nhân cấp cứu được phân công</p>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={fetchEmergencyEncounters}>
                        <FiRefreshCw /> Làm mới
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon emergency">
                        <FiAlertCircle />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Tổng số ca</span>
                        <span className="stat-value">{encounters.length}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon active">
                        <FiActivity />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Đang hoạt động</span>
                        <span className="stat-value">{encounters.filter(e => e.isActive).length}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon critical">
                        <FiHeart />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Nguy kịch</span>
                        <span className="stat-value">{encounters.filter(e => e.isLifeThreatening).length}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon urgent">
                        <FiClock />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Vượt thời gian chờ</span>
                        <span className="stat-value">{encounters.filter(e => e.isWaitTimeExceeded).length}</span>
                    </div>
                </div>
            </div>

            {/* Encounters List */}
            {encounters.length === 0 ? (
                <div className="empty-state">
                    <FiAlertCircle />
                    <p>Không có emergency encounter nào</p>
                </div>
            ) : (
                <div className="encounters-list">
                    {encounters.map((encounter) => (
                        <div key={encounter.emergencyEncounterId} className="encounter-card">
                            <div className="encounter-header">
                                <div className="patient-info">
                                    <h3>
                                        <FiUser /> {encounter.patientName}
                                    </h3>
                                    <span className="patient-code">{encounter.patientCode}</span>
                                </div>
                                <div className="encounter-badges">
                                    <span
                                        className="category-badge"
                                        style={{
                                            backgroundColor: encounter.emergencyCategoryColor,
                                            color: '#fff'
                                        }}
                                    >
                                        {encounter.emergencyCategoryIcon} {encounter.emergencyCategoryDisplay}
                                    </span>
                                    <span
                                        className="status-badge"
                                        style={{ backgroundColor: encounter.statusColor, color: '#fff' }}
                                    >
                                        {encounter.statusDisplay}
                                    </span>
                                </div>
                            </div>

                            <div className="encounter-body">
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="label">Triệu chứng chính:</span>
                                        <span className="value">{encounter.chiefComplaint || '-'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Phương thức đến:</span>
                                        <span className="value">{encounter.arrivalMethod || '-'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Thời gian đến:</span>
                                        <span className="value">{formatDateTime(encounter.arrivalTime)}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Thời gian chờ:</span>
                                        <span className="value">{encounter.waitTimeMinutes} phút</span>
                                    </div>
                                </div>
                            </div>

                            <div className="encounter-footer">
                                <button
                                    className="btn-add-vital"
                                    onClick={() => handleAddVitalSigns(encounter)}
                                >
                                    <FiPlus /> Thêm Vital Sign
                                </button>
                                <button
                                    className="btn-view-vital"
                                    onClick={() => handleViewVitalSigns(encounter)}
                                >
                                    <FiList /> Xem Vital Signs
                                </button>
                            </div>
                        </div>
                    ))}
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
                                <strong>{selectedEncounter?.patientName}</strong> - {selectedEncounter?.patientCode}
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
                                <strong>{selectedEncounter?.patientName}</strong> - {selectedEncounter?.patientCode}
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
        </div>
    );
};

export default EmergencyEncounterPage;

