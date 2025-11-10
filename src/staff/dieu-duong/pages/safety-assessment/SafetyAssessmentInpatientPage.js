import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { nurseSafetyAssessmentAPI } from '../../../../services/staff/nurseAPI';
import {
    FiArrowLeft, FiAlertCircle, FiPlus, FiCheck, FiX,
    FiShield, FiActivity, FiUser, FiCalendar, FiLoader
} from 'react-icons/fi';
import './SafetyAssessmentInpatientPage.css';

const SafetyAssessmentInpatientPage = () => {
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    const { stayId } = useParams();
    const navigate = useNavigate();
    
    // Dùng useCallback để hàm fetch có thể được dùng trong onSuccess
    const fetchAssessments = useCallback(async () => {
        if (!stayId) {
            setError('Không tìm thấy ID điều trị');
            setLoading(false);
            return;
        }
        
        setLoading(true);
        setError(null);
        try {
            const response = await nurseSafetyAssessmentAPI.getAssessmentsByStay(stayId);
            if (response && response.data) {
                setAssessments(response.data);
            } else {
                setAssessments([]);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách đánh giá');
        } finally {
            setLoading(false);
        }
    }, [stayId]);
    
    // Tải dữ liệu khi component mount
    useEffect(() => {
        fetchAssessments();
    }, [fetchAssessments]);
    
    // Xử lý khi tạo thành công
    const handleCreateSuccess = () => {
        setShowCreateModal(false);
        fetchAssessments(); // Tải lại danh sách
    };
    
    if (loading) {
        return (
            <div className="sa-loading">
                <FiActivity className="spinner" />
                <p>Đang tải danh sách đánh giá...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="sa-error">
                <FiAlertCircle />
                <p>{error}</p>
                <button onClick={() => navigate(-1)} className="btn-back-error">
                    Quay lại
                </button>
            </div>
        );
    }
    
    return (
        <div className="safety-assessment-page">
            {/* Header */}
            <div className="sa-header">
                <button className="btn-back" onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-content">
                    <h1>Đánh giá An toàn Bệnh nhân</h1>
                    <p>Lượt điều trị nội trú #{stayId}</p>
                </div>
                <button className="btn-create" onClick={() => setShowCreateModal(true)}>
                    <FiPlus /> Tạo đánh giá mới
                </button>
            </div>
            
            {/* Danh sách đánh giá */}
            <div className="sa-list-container">
                {assessments.length === 0 ? (
                    <div className="sa-no-data">
                        <FiShield />
                        <p>Chưa có đánh giá an toàn nào.</p>
                    </div>
                ) : (
                    <div className="sa-list-grid">
                        {assessments.map(assessment => (
                            <AssessmentCard
                                key={assessment.assessmentId}
                                assessment={assessment}
                            />
                        ))}
                    </div>
                )}
            </div>
            
            {/* Modal tạo mới */}
            {showCreateModal && (
                <CreateAssessmentModal
                    stayId={stayId}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleCreateSuccess}
                />
            )}
        </div>
    );
};

// --- Component Thẻ Đánh giá ---
const AssessmentCard = ({ assessment }) => {
    
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('vi-VN');
    };
    
    return (
        <div className="sa-card">
            <div className="sa-card-header">
                <h3>{assessment.assessmentType}</h3>
                <span
                    className="sa-risk-badge"
                    style={{ '--risk-color': assessment.riskLevelColor || '#6b7280' }}
                >
                    {assessment.riskLevelDisplay || assessment.riskLevel}
                </span>
            </div>
            
            <div className="sa-card-body">
                <div className="sa-info-grid">
                    <div className="sa-info-item">
                        <label>Điểm rủi ro:</label>
                        <span>{assessment.riskScore}</span>
                    </div>
                    <div className="sa-info-item">
                        <label>Nguy cơ té ngã:</label>
                        <span>{assessment.fallRiskDisplay || assessment.fallRisk}</span>
                    </div>
                    <div className="sa-info-item">
                        <label>Nguy cơ loét:</label>
                        <span>{assessment.pressureUlcerRiskDisplay || assessment.pressureUlcerRisk}</span>
                    </div>
                    <div className="sa-info-item">
                        <label>Nguy cơ nhiễm trùng:</label>
                        <span>{assessment.infectionRiskDisplay || assessment.infectionRisk}</span>
                    </div>
                </div>
                
                {assessment.safetyPrecautionsCount > 0 && (
                    <div className="sa-tags-section">
                        <label>Biện pháp phòng ngừa:</label>
                        <div className="sa-tags-list">
                            {assessment.safetyPrecautions.map((item, index) => (
                                <span key={index} className="sa-tag">{item}</span>
                            ))}
                        </div>
                    </div>
                )}
                
                {assessment.recommendations && (
                    <div className="sa-info-full">
                        <label>Khuyến nghị:</label>
                        <p>{assessment.recommendations}</p>
                    </div>
                )}
            </div>
            
            <div className="sa-card-footer">
                <div className="sa-footer-item">
                    <FiUser />
                    <span>{assessment.assessedByEmployeeName || 'N/A'}</span>
                </div>
                <div className="sa-footer-item">
                    <FiCalendar />
                    <span>{formatDate(assessment.assessmentDate)}</span>
                </div>
            </div>
        </div>
    );
};

// --- Component Modal Tạo mới ---
const CreateAssessmentModal = ({ stayId, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        assessmentType: 'FALL_RISK',
        assessmentDate: new Date().toISOString().slice(0, 16), // Mặc định là_hiện tại
        riskScore: 0,
        riskLevel: 'LOW',
        riskFactors: '',
        interventions: '',
        nextAssessmentDue: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            const dataToSubmit = {
                ...formData,
                inpatientStayId: parseInt(stayId),
                riskScore: parseInt(formData.riskScore),
                // Đảm bảo ngày có định dạng ISO
                assessmentDate: new Date(formData.assessmentDate).toISOString(),
                nextAssessmentDue: formData.nextAssessmentDue ? new Date(formData.nextAssessmentDue).toISOString() : null,
            };
            
            await nurseSafetyAssessmentAPI.createAssessment(dataToSubmit);
            onSuccess(); // Gọi callback thành công
        } catch (err) {
            setError(err.message || 'Tạo đánh giá thất bại');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="modal-overlay">
            <div className="modal-content modal-lg">
                <div className="modal-header">
                    <h3>Tạo Đánh giá An toàn</h3>
                    <button className="btn-close" onClick={onClose}><FiX /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Loại đánh giá *</label>
                                <select name="assessmentType" value={formData.assessmentType} onChange={handleChange}>
                                    <option value="FALL_RISK">Nguy cơ té ngã</option>
                                    <option value="PRESSURE_ULCER_RISK">Nguy cơ loét</option>
                                    <option value="INFECTION_RISK">Nguy cơ nhiễm trùng</option>
                                    <option value="GENERAL">Đánh giá chung</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Mức độ rủi ro *</label>
                                <select name="riskLevel" value={formData.riskLevel} onChange={handleChange}>
                                    <option value="LOW">Thấp</option>
                                    <option value="MEDIUM">Trung bình</option>
                                    <option value="HIGH">Cao</option>
                                    <option value="CRITICAL">Rất cao</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Điểm rủi ro *</label>
                                <input
                                    type="number"
                                    name="riskScore"
                                    value={formData.riskScore}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Ngày đánh giá *</label>
                                <input
                                    type="datetime-local"
                                    name="assessmentDate"
                                    value={formData.assessmentDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>Yếu tố rủi ro</label>
                                <textarea
                                    name="riskFactors"
                                    value={formData.riskFactors}
                                    onChange={handleChange}
                                    rows="3"
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>Can thiệp/Phòng ngừa</label>
                                <textarea
                                    name="interventions"
                                    value={formData.interventions}
                                    onChange={handleChange}
                                    rows="3"
                                />
                            </div>
                            <div className="form-group">
                                <label>Ngày đánh giá tiếp theo</label>
                                <input
                                    type="datetime-local"
                                    name="nextAssessmentDue"
                                    value={formData.nextAssessmentDue}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        {error && <div className="error-state modal-error">{error}</div>}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
                            Hủy
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Đang lưu...' : <><FiCheck /> Lưu đánh giá</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SafetyAssessmentInpatientPage;