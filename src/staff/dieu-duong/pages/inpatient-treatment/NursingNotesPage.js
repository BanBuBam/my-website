import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { nurseInpatientStayAPI } from '../../../../services/staff/nurseAPI';
import { 
    FiArrowLeft, FiAlertCircle, FiActivity, FiPlus, FiX,
    FiUser, FiCalendar, FiFileText, FiAlertTriangle 
} from 'react-icons/fi';
import './NursingNotesPage.css';

const NursingNotesPage = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    const { stayId } = useParams();
    const navigate = useNavigate();
    
    // Form state
    const [formData, setFormData] = useState({
        shiftDate: new Date().toISOString().split('T')[0],
        shiftType: 'MORNING',
        patientConditionAssessment: '',
        nursingInterventions: '',
        patientResponseToCare: '',
        handoverInformation: '',
        fallRiskLevel: 'LOW',
        painScore: 0,
    });
    
    useEffect(() => {
        fetchNursingNotes();
    }, [stayId]);
    
    const fetchNursingNotes = async () => {
        if (!stayId) {
            setError('Không tìm thấy ID điều trị');
            setLoading(false);
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await nurseInpatientStayAPI.getNursingNotes(stayId);
            if (response && response.data) {
                // Sắp xếp theo thời gian mới nhất trước
                const sortedNotes = response.data.sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setNotes(sortedNotes);
            } else {
                setNotes([]);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải nursing notes');
            setNotes([]);
        } finally {
            setLoading(false);
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.patientConditionAssessment.trim()) {
            alert('Vui lòng nhập đánh giá tình trạng bệnh nhân');
            return;
        }
        if (!formData.nursingInterventions.trim()) {
            alert('Vui lòng nhập can thiệp điều dưỡng');
            return;
        }
        
        setSubmitting(true);
        
        try {
            const noteData = {
                shiftDate: formData.shiftDate,
                shiftType: formData.shiftType,
                patientConditionAssessment: formData.patientConditionAssessment,
                nursingInterventions: formData.nursingInterventions,
                patientResponseToCare: formData.patientResponseToCare,
                handoverInformation: formData.handoverInformation,
                fallRiskLevel: formData.fallRiskLevel,
                painScore: parseInt(formData.painScore),
            };
            
            await nurseInpatientStayAPI.createNursingNote(stayId, noteData);
            
            alert('Tạo nursing note thành công!');
            
            // Reset form
            setFormData({
                shiftDate: new Date().toISOString().split('T')[0],
                shiftType: 'MORNING',
                patientConditionAssessment: '',
                nursingInterventions: '',
                patientResponseToCare: '',
                handoverInformation: '',
                fallRiskLevel: 'LOW',
                painScore: 0,
            });
            
            setShowForm(false);
            
            // Refresh danh sách
            fetchNursingNotes();
        } catch (err) {
            alert(err.message || 'Không thể tạo nursing note');
        } finally {
            setSubmitting(false);
        }
    };
    
    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };
    
    const getFallRiskBadgeClass = (riskLevel) => {
        const riskMap = {
            'LOW': 'risk-low',
            'MEDIUM': 'risk-medium',
            'HIGH': 'risk-high',
        };
        return riskMap[riskLevel] || 'risk-low';
    };
    
    const getPainScoreBadgeClass = (score) => {
        if (score <= 3) return 'pain-low';
        if (score <= 6) return 'pain-medium';
        return 'pain-high';
    };
    
    if (loading) {
        return (
            <div className="nursing-notes-loading">
                <FiActivity className="spinner" />
                <p>Đang tải nursing notes...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="nursing-notes-error">
                <FiAlertCircle />
                <p>{error}</p>
                <button onClick={() => navigate(-1)} className="btn-back-error">
                    Quay lại
                </button>
            </div>
        );
    }
    
    return (
        <div className="nursing-notes-page">
            {/* Header */}
            <div className="nursing-notes-header">
                <button className="btn-back" onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-content">
                    <h1>Ghi chú điều dưỡng Notes - Lượt điều trị #{stayId}</h1>
                    <p>Ghi chép điều dưỡng theo ca trực</p>
                </div>
                <button className="btn-create" onClick={() => setShowForm(true)}>
                    <FiPlus /> Tạo Ghi chú điều dưỡng mới
                </button>
            </div>
            
            {/* Create Form Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Tạo Ghi chú điều dưỡng mới</h2>
                            <button className="btn-close" onClick={() => setShowForm(false)}>
                                <FiX />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="nursing-note-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ngày ca trực <span className="required">*</span></label>
                                    <input
                                        type="date"
                                        name="shiftDate"
                                        value={formData.shiftDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Ca trực <span className="required">*</span></label>
                                    <select
                                        name="shiftType"
                                        value={formData.shiftType}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="MORNING">Ca sáng</option>
                                        <option value="AFTERNOON">Ca chiều</option>
                                        <option value="NIGHT">Ca tối</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Đánh giá tình trạng bệnh nhân <span className="required">*</span></label>
                                <textarea
                                    name="patientConditionAssessment"
                                    value={formData.patientConditionAssessment}
                                    onChange={handleInputChange}
                                    rows="4"
                                    placeholder="Nhập đánh giá tình trạng bệnh nhân..."
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Can thiệp điều dưỡng <span className="required">*</span></label>
                                <textarea
                                    name="nursingInterventions"
                                    value={formData.nursingInterventions}
                                    onChange={handleInputChange}
                                    rows="4"
                                    placeholder="Nhập các can thiệp điều dưỡng đã thực hiện..."
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Phản ứng của bệnh nhân</label>
                                <textarea
                                    name="patientResponseToCare"
                                    value={formData.patientResponseToCare}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Nhập phản ứng của bệnh nhân với chăm sóc..."
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Thông tin bàn giao</label>
                                <textarea
                                    name="handoverInformation"
                                    value={formData.handoverInformation}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Nhập thông tin cần bàn giao cho ca tiếp theo..."
                                />
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Mức độ nguy cơ té ngã <span className="required">*</span></label>
                                    <select
                                        name="fallRiskLevel"
                                        value={formData.fallRiskLevel}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="LOW">Thấp</option>
                                        <option value="MEDIUM">Trung bình</option>
                                        <option value="HIGH">Cao</option>
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label>Điểm đau (0-10) <span className="required">*</span></label>
                                    <input
                                        type="number"
                                        name="painScore"
                                        value={formData.painScore}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="10"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="form-actions">
                                <button 
                                    type="button" 
                                    className="btn-cancel"
                                    onClick={() => setShowForm(false)}
                                    disabled={submitting}
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-submit"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Đang tạo...' : 'Tạo Nursing Note'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Notes List */}
            <div className="notes-container">
                {notes.length === 0 ? (
                    <div className="empty-state">
                        <FiFileText />
                        <p>Chưa có Ghi chú điều dưỡng nào</p>
                        <button className="btn-create-empty" onClick={() => setShowForm(true)}>
                            <FiPlus /> Tạo Ghi chú điều dưỡng đầu tiên
                        </button>
                    </div>
                ) : (
                    <div className="notes-list">
                        {notes.map((note) => (
                            <div 
                                key={note.nursingNoteId} 
                                className={`note-card ${note.highRisk ? 'high-risk' : ''}`}
                            >
                                {note.highRisk && (
                                    <div className="high-risk-banner">
                                        <FiAlertTriangle /> Bệnh nhân có nguy cơ cao
                                    </div>
                                )}
                                
                                <div className="note-header">
                                    <div className="note-title">
                                        <h3>
                                            {note.shiftDisplay || note.shiftType} - {formatDate(note.shiftDate)}
                                        </h3>
                                        {note.currentShift && (
                                            <span className="badge badge-current">Ca hiện tại</span>
                                        )}
                                    </div>
                                    <div className="note-meta">
                                        <span className="meta-item">
                                            <FiUser /> {note.nurseName || `ID: ${note.nurseId}`}
                                        </span>
                                        <span className="meta-item">
                                            <FiCalendar /> {formatDateTime(note.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="note-content">
                                    <div className="content-section">
                                        <h4>Đánh giá tình trạng bệnh nhân</h4>
                                        <p>{note.patientConditionAssessment}</p>
                                    </div>
                                    
                                    <div className="content-section">
                                        <h4>Can thiệp điều dưỡng</h4>
                                        <p>{note.nursingInterventions}</p>
                                    </div>
                                    
                                    {note.patientResponseToCare && (
                                        <div className="content-section">
                                            <h4>Phản ứng của bệnh nhân</h4>
                                            <p>{note.patientResponseToCare}</p>
                                        </div>
                                    )}
                                    
                                    {note.handoverInformation && (
                                        <div className="content-section">
                                            <h4>Thông tin bàn giao</h4>
                                            <p>{note.handoverInformation}</p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="note-footer">
                                    <div className="footer-badges">
                                        <span className={`badge ${getFallRiskBadgeClass(note.fallRiskLevel)}`}>
                                            Nguy cơ té ngã: {note.riskLevelDisplay || note.fallRiskLevel}
                                        </span>
                                        <span className={`badge ${getPainScoreBadgeClass(note.painScore)}`}>
                                            Điểm đau: {note.painScoreDisplay || note.painScore}/10
                                        </span>
                                    </div>
                                    <div className="footer-info">
                                        <span>Bệnh nhân: {note.patientName} ({note.patientCode})</span>
                                        <span>Giường: {note.bedNumber} - Phòng: {note.roomNumber}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NursingNotesPage;

