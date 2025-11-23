import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './VitalSignsPage.css';
import {
    FiSearch, FiUser, FiClock, FiThermometer,
    FiPlus, FiList, FiX, FiAlertCircle
} from 'react-icons/fi';
import { nurseEncounterAPI } from '../../../../services/staff/nurseAPI';

const VitalSignsPage = () => {
    const location = useLocation();
    const [encounterId, setEncounterId] = useState('');
    const [encounter, setEncounter] = useState(null);
    const [vitalSigns, setVitalSigns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingVitals, setLoadingVitals] = useState(false);
    const [error, setError] = useState(null);
    const [showVitalModal, setShowVitalModal] = useState(false);
    const [showVitalListModal, setShowVitalListModal] = useState(false);
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

    const loadEncounterById = async (id) => {
        if (!id || !id.trim()) return;

        try {
            setLoading(true);
            setError(null);
            setEncounter(null);

            const response = await nurseEncounterAPI.getEncounterStatus(id.trim());

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

    // Auto-load encounter if encounterId is passed via navigation state
    useEffect(() => {
        if (location.state?.encounterId) {
            const encounterIdFromState = location.state.encounterId.toString();
            setEncounterId(encounterIdFromState);
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
            const response = await nurseEncounterAPI.getVitalSigns(encounter.encounterId);
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

        if (!vitalFormData.temperature || !vitalFormData.heartRate) {
            alert('Vui lòng nhập ít nhất nhiệt độ và nhịp tim');
            return;
        }

        try {
            setSubmitting(true);

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

            const response = await nurseEncounterAPI.addVitalSigns(encounter.encounterId, payload);

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

    return (
        <div className="vital-signs-page">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h2>Quản lý Dấu hiệu Sinh tồn</h2>
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
        </div>
    );
};

export default VitalSignsPage;

