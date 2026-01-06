import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAdmissionRequestAPI } from '../../../../services/staff/adminAPI';
import {
    FiArrowLeft, FiSave, FiAlertCircle, FiCheckCircle,
    FiUser, FiClipboard, FiActivity, FiEdit
} from 'react-icons/fi';
// Tận dụng lại CSS của trang list hoặc tạo file CSS mới tương tự
import './AdmissionRequestDetailPage.css';

const AdminRequestDetailPage = () => {
    const { id } = useParams(); // Lấy admissionRequestId từ URL, trong route thi phai dung là id như tên biến
    const navigate = useNavigate();
    
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // State cho Form cập nhật
    const [formData, setFormData] = useState({});
    
    useEffect(() => {
        fetchDetail();
    }, [id]);
    
    const fetchDetail = async () => {
        setLoading(true);
        try {
            const response = await adminAdmissionRequestAPI.getRequestDetail(id);
            if (response && response.data) {
                setRequest(response.data);
                // Khởi tạo data cho form
                setFormData({
                    encounterId: response.data.encounterId,
                    admissionType: response.data.admissionType,
                    priorityLevel: response.data.priorityLevel,
                    admissionDiagnosis: response.data.admissionDiagnosis,
                    specialRequirements: response.data.specialRequirements || '',
                    bedTypeRequired: response.data.bedTypeRequired,
                    requestedDepartmentId: response.data.requestedDepartmentId,
                    requestedByEmployeeId: response.data.requestedByEmployeeId,
                    expectedAdmissionDate: response.data.expectedAdmissionDate,
                    estimatedLengthOfStay: response.data.estimatedLengthOfStay,
                    isolationRequired: response.data.isolationRequired,
                    requiresIcu: response.data.requiresIcu,
                    oxygenRequired: response.data.oxygenRequired,
                    monitoringLevel: response.data.monitoringLevel,
                    preAdmissionChecklistCompleted: response.data.preAdmissionChecklistCompleted,
                    insuranceVerified: response.data.insuranceVerified,
                    consentFormSigned: response.data.consentFormSigned,
                    // Các trường khác giữ nguyên hoặc có thể chỉnh sửa tùy nghiệp vụ
                    status: response.data.status
                });
            }
        } catch (err) {
            setError(err.message || 'Lỗi tải chi tiết');
        } finally {
            setLoading(false);
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    
    const handleSave = async () => {
        setSaving(true);
        try {
            await adminAdmissionRequestAPI.updateRequest(id, formData);
            alert('Cập nhật thành công!');
            setIsEditing(false);
            fetchDetail(); // Tải lại dữ liệu mới
        } catch (err) {
            alert('Lỗi cập nhật: ' + err.message);
        } finally {
            setSaving(false);
        }
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };
    
    if (loading) return <div className="loading-state">Đang tải chi tiết...</div>;
    if (error) return <div className="error-state">Lỗi: {error}</div>;
    if (!request) return <div className="error-state">Không tìm thấy dữ liệu</div>;
    
    return (
        <div className="admin-request-detail-page">
            {/* Header */}
            <div className="detail-header">
                <button className="btn-back" onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-title">
                    <h1>Chi tiết Yêu cầu #{request.admissionRequestId}</h1>
                    <span className={`status-badge status-${request.status.toLowerCase()}`}>
                        {request.statusDisplay || request.status}
                    </span>
                </div>
                <div className="header-actions">
                    {/*{!isEditing ? (*/}
                    {/*    <button className="btn-edit" onClick={() => setIsEditing(true)}>*/}
                    {/*        <FiEdit /> Chỉnh sửa*/}
                    {/*    </button>*/}
                    {/*) : (*/}
                    {/*    <>*/}
                    {/*        <button className="btn-cancel" onClick={() => setIsEditing(false)}>Hủy</button>*/}
                    {/*        <button className="btn-save" onClick={handleSave} disabled={saving}>*/}
                    {/*            <FiSave /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}*/}
                    {/*        </button>*/}
                    {/*    </>*/}
                    {/*)}*/}
                </div>
            </div>
            
            {/* Content Grid */}
            <div className="detail-content">
                {/* Thông tin bệnh nhân (Read-only) */}
                <div className="detail-section">
                    <h3><FiUser /> Thông tin Bệnh nhân</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Tên bệnh nhân:</label>
                            <span>{request.patientName}</span>
                        </div>
                        <div className="info-item">
                            <label>Mã bệnh nhân:</label>
                            <span>{request.patientCode}</span>
                        </div>
                        <div className="info-item">
                            <label>Encounter ID:</label>
                            <span>{request.encounterId}</span>
                        </div>
                    </div>
                </div>
                
                {/* Thông tin Yêu cầu (Editable) */}
                <div className="detail-section">
                    <h3><FiClipboard /> Thông tin Yêu cầu</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Loại nhập viện</label>
                            <select
                                name="admissionType"
                                value={formData.admissionType}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            >
                                <option value="EMERGENCY">Cấp cứu</option>
                                <option value="ELECTIVE">Tự chọn</option>
                                <option value="URGENT">Khẩn cấp</option>
                                <option value="NEWBORN">Sơ sinh</option>
                                <option value="TRAUMA">Chấn thương</option>
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label>Mức ưu tiên (1-5)</label>
                            <input
                                type="number"
                                name="priorityLevel"
                                value={formData.priorityLevel}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                min="1" max="5"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Loại giường yêu cầu</label>
                            <input
                                type="text"
                                name="bedTypeRequired"
                                value={formData.bedTypeRequired}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Ngày dự kiến</label>
                            <input
                                type="date"
                                name="expectedAdmissionDate"
                                value={formData.expectedAdmissionDate}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Thời gian lưu trú (ngày)</label>
                            <input
                                type="number"
                                name="estimatedLengthOfStay"
                                value={formData.estimatedLengthOfStay}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                        </div>
                        
                        <div className="form-group full-width">
                            <label>Chẩn đoán</label>
                            <textarea
                                name="admissionDiagnosis"
                                value={formData.admissionDiagnosis}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                rows="3"
                            />
                        </div>
                        
                        <div className="form-group full-width">
                            <label>Yêu cầu đặc biệt</label>
                            <textarea
                                name="specialRequirements"
                                value={formData.specialRequirements}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                rows="2"
                            />
                        </div>
                    </div>
                </div>
                
                {/* Yêu cầu lâm sàng (Checkboxes - Editable) */}
                <div className="detail-section">
                    <h3><FiActivity /> Yêu cầu Lâm sàng & Thủ tục</h3>
                    <div className="checkbox-grid">
                        <label className="checkbox-item">
                            <input
                                type="checkbox"
                                name="isolationRequired"
                                checked={formData.isolationRequired}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                            Cách ly
                        </label>
                        <label className="checkbox-item">
                            <input
                                type="checkbox"
                                name="requiresIcu"
                                checked={formData.requiresIcu}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                            Yêu cầu ICU
                        </label>
                        <label className="checkbox-item">
                            <input
                                type="checkbox"
                                name="oxygenRequired"
                                checked={formData.oxygenRequired}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                            Cần Oxy
                        </label>
                        <label className="checkbox-item">
                            <input
                                type="checkbox"
                                name="insuranceVerified"
                                checked={formData.insuranceVerified}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                            Đã xác minh BHYT
                        </label>
                        <label className="checkbox-item">
                            <input
                                type="checkbox"
                                name="consentFormSigned"
                                checked={formData.consentFormSigned}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                            Đã ký cam kết
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminRequestDetailPage;