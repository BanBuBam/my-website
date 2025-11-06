import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { admissionRequestAPI, doctorEncounterAPI } from '../../../../services/staff/doctorAPI';
import { FiArrowLeft, FiSave, FiAlertCircle, FiClipboard } from 'react-icons/fi';
import './CreateAdmissionRequestPage.css';

const CreateAdmissionRequestPage = () => {
    const { encounterId } = useParams();
    const navigate = useNavigate();
    const [encounter, setEncounter] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        admissionType: 'ELECTIVE',
        priorityLevel: 3,
        admissionDiagnosis: '',
        specialRequirements: '',
        bedTypeRequired: 'GENERAL',
        requestedDepartmentId: '',
        expectedAdmissionDate: '',
        estimatedLengthOfStay: 1,
        isolationRequired: false,
        requiresIcu: false,
        oxygenRequired: false,
        monitoringLevel: 'BASIC',
    });

    useEffect(() => {
        fetchEncounter();
    }, [encounterId]);

    const fetchEncounter = async () => {
        try {
            setLoading(true);
            const response = await doctorEncounterAPI.getEncounterDetail(encounterId);
            if (response && response.data) {
                setEncounter(response.data);
            }
        } catch (err) {
            console.error('Error loading encounter:', err);
            setError('Không thể tải thông tin encounter');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.requestedDepartmentId) {
            alert('Vui lòng nhập ID khoa yêu cầu');
            return;
        }

        if (!formData.admissionDiagnosis) {
            alert('Vui lòng nhập chẩn đoán nhập viện');
            return;
        }

        try {
            setSubmitting(true);

            // Get doctor ID from localStorage
            const userInfo = JSON.parse(localStorage.getItem('staffUserInfo') || '{}');
            const requestedByEmployeeId = userInfo.employeeId;

            if (!requestedByEmployeeId) {
                throw new Error('Không tìm thấy thông tin bác sĩ');
            }

            const requestData = {
                encounterId: parseInt(encounterId),
                requestedByEmployeeId: requestedByEmployeeId,
                admissionType: formData.admissionType,
                priorityLevel: parseInt(formData.priorityLevel),
                admissionDiagnosis: formData.admissionDiagnosis,
                specialRequirements: formData.specialRequirements || null,
                bedTypeRequired: formData.bedTypeRequired,
                requestedDepartmentId: parseInt(formData.requestedDepartmentId),
                expectedAdmissionDate: formData.expectedAdmissionDate || null,
                estimatedLengthOfStay: parseInt(formData.estimatedLengthOfStay),
                isolationRequired: formData.isolationRequired,
                requiresIcu: formData.requiresIcu,
                oxygenRequired: formData.oxygenRequired,
                monitoringLevel: formData.monitoringLevel,
            };

            const response = await admissionRequestAPI.createAdmissionRequest(requestData);

            if (response && response.data) {
                alert('Tạo yêu cầu nhập viện thành công!');
                navigate('/staff/bac-si/yeu-cau-nhap-vien');
            }
        } catch (err) {
            console.error('Error creating admission request:', err);
            alert(err.message || 'Không thể tạo yêu cầu nhập viện');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="create-admission-request-page">
                <div className="loading-state">Đang tải...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="create-admission-request-page">
                <div className="error-state">
                    <FiAlertCircle />
                    <p>{error}</p>
                    <button onClick={() => navigate(-1)} className="btn-back">
                        <FiArrowLeft /> Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="create-admission-request-page">
            {/* Header */}
            <div className="page-header">
                <button onClick={() => navigate(-1)} className="btn-back">
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-content">
                    <FiClipboard className="header-icon" />
                    <div>
                        <h1>Tạo yêu cầu nhập viện</h1>
                        <p>Encounter #{encounterId} - {encounter?.patientName}</p>
                    </div>
                </div>
            </div>

            {/* Encounter Info */}
            {encounter && (
                <div className="encounter-info">
                    <h3>Thông tin Encounter</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Bệnh nhân:</label>
                            <span>{encounter.patientName}</span>
                        </div>
                        <div className="info-item">
                            <label>Mã bệnh nhân:</label>
                            <span>{encounter.patientCode}</span>
                        </div>
                        <div className="info-item">
                            <label>Khoa:</label>
                            <span>{encounter.departmentName || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <label>Trạng thái:</label>
                            <span>{encounter.status}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="admission-form">
                <div className="form-section">
                    <h3>Thông tin nhập viện</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Loại nhập viện <span className="required">*</span></label>
                            <select name="admissionType" value={formData.admissionType} onChange={handleChange} required>
                                <option value="ELECTIVE">Nhập viện theo kế hoạch</option>
                                <option value="EMERGENCY">Cấp cứu</option>
                                <option value="URGENT">Khẩn cấp</option>
                                <option value="OBSERVATION">Theo dõi</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Mức độ ưu tiên <span className="required">*</span></label>
                            <select name="priorityLevel" value={formData.priorityLevel} onChange={handleChange} required>
                                <option value="1">1 - Cực kỳ khẩn cấp</option>
                                <option value="2">2 - Khẩn cấp</option>
                                <option value="3">3 - Trung bình</option>
                                <option value="4">4 - Thấp</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Loại giường <span className="required">*</span></label>
                            <select name="bedTypeRequired" value={formData.bedTypeRequired} onChange={handleChange} required>
                                <option value="STANDARD">Giường thường</option>
                                <option value="ICU">ICU</option>
                                <option value="ISOLATION">Cách ly</option>
                                {/*<option value="PRIVATE">Phòng riêng</option>*/}
                                <option value="VIP">VIP</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>ID Khoa yêu cầu <span className="required">*</span></label>
                            <input
                                type="number"
                                name="requestedDepartmentId"
                                value={formData.requestedDepartmentId}
                                onChange={handleChange}
                                placeholder="Nhập ID khoa..."
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Ngày dự kiến nhập viện</label>
                            <input
                                type="date"
                                name="expectedAdmissionDate"
                                value={formData.expectedAdmissionDate}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Thời gian lưu trú dự kiến (ngày)</label>
                            <input
                                type="number"
                                name="estimatedLengthOfStay"
                                value={formData.estimatedLengthOfStay}
                                onChange={handleChange}
                                min="1"
                            />
                        </div>

                        <div className="form-group">
                            <label>Mức độ theo dõi</label>
                            <select name="monitoringLevel" value={formData.monitoringLevel} onChange={handleChange}>
                                <option value="BASIC">Cơ bản</option>
                                <option value="INTERMEDIATE">Trung bình</option>
                                <option value="INTENSIVE">Tích cực</option>
                                <option value="CRITICAL">Nguy kịch</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Chẩn đoán & Yêu cầu</h3>
                    <div className="form-group full-width">
                        <label>Chẩn đoán nhập viện <span className="required">*</span></label>
                        <textarea
                            name="admissionDiagnosis"
                            value={formData.admissionDiagnosis}
                            onChange={handleChange}
                            placeholder="Nhập chẩn đoán..."
                            rows="3"
                            required
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Yêu cầu đặc biệt</label>
                        <textarea
                            name="specialRequirements"
                            value={formData.specialRequirements}
                            onChange={handleChange}
                            placeholder="Nhập yêu cầu đặc biệt (nếu có)..."
                            rows="3"
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h3>Yêu cầu y tế</h3>
                    <div className="checkbox-grid">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="isolationRequired"
                                checked={formData.isolationRequired}
                                onChange={handleChange}
                            />
                            <span>Yêu cầu cách ly</span>
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="requiresIcu"
                                checked={formData.requiresIcu}
                                onChange={handleChange}
                            />
                            <span>Yêu cầu ICU</span>
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="oxygenRequired"
                                checked={formData.oxygenRequired}
                                onChange={handleChange}
                            />
                            <span>Yêu cầu oxy</span>
                        </label>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                    <button type="button" onClick={() => navigate(-1)} className="btn-cancel">
                        Hủy
                    </button>
                    <button type="submit" className="btn-submit" disabled={submitting}>
                        <FiSave /> {submitting ? 'Đang tạo...' : 'Tạo yêu cầu nhập viện'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateAdmissionRequestPage;

