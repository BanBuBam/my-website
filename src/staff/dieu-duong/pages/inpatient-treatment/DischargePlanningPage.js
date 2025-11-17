import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit, FiCheckCircle, FiAlertCircle, FiCalendar, FiHome, FiFileText, FiPackage, FiTruck, FiUsers, FiActivity, FiRefreshCw, FiX, FiCheck } from 'react-icons/fi';
import { nurseDischargePlanningAPI } from '../../../../services/staff/nurseAPI';
import './DischargePlanningPage.css';

const DischargePlanningPage = () => {
    const { stayId } = useParams();
    const navigate = useNavigate();

    // State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dischargePlan, setDischargePlan] = useState(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [approving, setApproving] = useState(false);
    const [showExecuteModal, setShowExecuteModal] = useState(false);
    const [executing, setExecuting] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        expectedDischargeDate: '',
        dischargeDestination: '',
        homeCarePlan: '',
        followUpInstructions: '',
        followUpDate: '',
        medicationReconciliation: '',
        specialInstructions: '',
        equipmentNeeded: '',
        transportationArrangements: '',
        familyEducation: '',
        dischargeReadinessAssessment: '',
        transferDischarge: false
    });

    // Execute discharge form data
    const [executeFormData, setExecuteFormData] = useState({
        dischargeDate: new Date().toISOString().slice(0, 16),
        dischargeDiagnosis: '',
        dischargeInstructions: '',
        followUpInstructions: '',
        followUpDate: '',
        dischargeCondition: 'STABLE',
        dischargeDestination: 'HOME',
        medicationsAtDischarge: '',
        dischargeNotes: '',
        dispositionType: 'ROUTINE',
        expired: false,
        againstMedicalAdvice: false,
        transferDischarge: false
    });

    // Fetch discharge planning data
    useEffect(() => {
        fetchDischargePlan();
    }, [stayId]);

    const fetchDischargePlan = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await nurseDischargePlanningAPI.getDischargePlanningByStay(stayId);
            
            if (response.status === 'OK' && response.data) {
                setDischargePlan(response.data);
            } else {
                setDischargePlan(null);
            }
        } catch (err) {
            console.error('Error fetching discharge plan:', err);
            setError(err.message || 'Không thể tải thông tin kế hoạch xuất viện');
        } finally {
            setLoading(false);
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Handle show create form
    const handleShowCreateForm = () => {
        setIsEditing(false);
        setFormData({
            expectedDischargeDate: '',
            dischargeDestination: '',
            homeCarePlan: '',
            followUpInstructions: '',
            followUpDate: '',
            medicationReconciliation: '',
            specialInstructions: '',
            equipmentNeeded: '',
            transportationArrangements: '',
            familyEducation: '',
            dischargeReadinessAssessment: '',
            transferDischarge: false
        });
        setShowFormModal(true);
    };

    // Handle show edit form
    const handleShowEditForm = () => {
        setIsEditing(true);
        setFormData({
            expectedDischargeDate: dischargePlan.expectedDischargeDate || '',
            dischargeDestination: dischargePlan.dischargeDestination || '',
            homeCarePlan: dischargePlan.homeCarePlan || '',
            followUpInstructions: dischargePlan.followUpInstructions || '',
            followUpDate: dischargePlan.followUpDate || '',
            medicationReconciliation: dischargePlan.medicationReconciliation || '',
            specialInstructions: dischargePlan.specialInstructions || '',
            equipmentNeeded: dischargePlan.equipmentNeeded || '',
            transportationArrangements: dischargePlan.transportationArrangements || '',
            familyEducation: dischargePlan.familyEducation || '',
            dischargeReadinessAssessment: dischargePlan.dischargeReadinessAssessment || '',
            transferDischarge: dischargePlan.transferDischarge || false
        });
        setShowFormModal(true);
    };

    // Handle submit form
    const handleSubmitForm = async () => {
        // Validation
        if (!formData.expectedDischargeDate.trim()) {
            alert('Vui lòng nhập ngày xuất viện dự kiến');
            return;
        }
        if (!formData.dischargeDestination.trim()) {
            alert('Vui lòng nhập điểm đến sau xuất viện');
            return;
        }

        const confirmMessage = isEditing 
            ? 'Bạn có chắc chắn muốn cập nhật kế hoạch xuất viện này?'
            : 'Bạn có chắc chắn muốn tạo kế hoạch xuất viện mới?';
        
        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            setSubmitting(true);
            
            if (isEditing) {
                await nurseDischargePlanningAPI.updateDischargePlanning(dischargePlan.dischargePlanId, formData);
                alert('Cập nhật kế hoạch xuất viện thành công!');
            } else {
                await nurseDischargePlanningAPI.createDischargePlanning(stayId, formData);
                alert('Tạo kế hoạch xuất viện thành công!');
            }
            
            setShowFormModal(false);
            await fetchDischargePlan();
        } catch (err) {
            console.error('Error submitting discharge plan:', err);
            alert(err.message || 'Có lỗi xảy ra khi lưu kế hoạch xuất viện');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle approve
    const handleApprove = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn phê duyệt kế hoạch xuất viện này?')) {
            return;
        }

        try {
            setApproving(true);
            await nurseDischargePlanningAPI.approveDischargePlanning(dischargePlan.dischargePlanId);
            alert('Phê duyệt kế hoạch xuất viện thành công!');
            await fetchDischargePlan();
        } catch (err) {
            console.error('Error approving discharge plan:', err);
            alert(err.message || 'Có lỗi xảy ra khi phê duyệt kế hoạch xuất viện');
        } finally {
            setApproving(false);
        }
    };

    // Handle show execute discharge modal
    const handleShowExecuteModal = () => {
        setShowExecuteModal(true);
    };

    // Handle execute discharge form change
    const handleExecuteFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setExecuteFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle execute discharge
    const handleExecuteDischarge = async () => {
        // Validation
        if (!executeFormData.dischargeDate.trim()) {
            alert('Vui lòng chọn ngày xuất viện');
            return;
        }
        if (!executeFormData.dischargeDiagnosis.trim()) {
            alert('Vui lòng nhập chẩn đoán xuất viện');
            return;
        }
        if (!executeFormData.dischargeCondition.trim()) {
            alert('Vui lòng chọn tình trạng xuất viện');
            return;
        }
        if (!executeFormData.dischargeDestination.trim()) {
            alert('Vui lòng chọn điểm đến sau xuất viện');
            return;
        }
        if (!executeFormData.dispositionType.trim()) {
            alert('Vui lòng chọn loại xuất viện');
            return;
        }

        const confirmMessage = 'Bạn có chắc chắn muốn thực hiện xuất viện cho bệnh nhân này? Hành động này sẽ kết thúc lượt điều trị nội trú.';

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            setExecuting(true);

            // Prepare data for API
            const dischargeData = {
                dischargeDate: new Date(executeFormData.dischargeDate).toISOString(),
                dischargeDiagnosis: executeFormData.dischargeDiagnosis,
                dischargeInstructions: executeFormData.dischargeInstructions,
                followUpInstructions: executeFormData.followUpInstructions,
                followUpDate: executeFormData.followUpDate ? new Date(executeFormData.followUpDate).toISOString() : null,
                dischargeCondition: executeFormData.dischargeCondition,
                dischargeDestination: executeFormData.dischargeDestination,
                medicationsAtDischarge: executeFormData.medicationsAtDischarge,
                dischargeNotes: executeFormData.dischargeNotes,
                dispositionType: executeFormData.dispositionType,
                expired: executeFormData.expired,
                againstMedicalAdvice: executeFormData.againstMedicalAdvice,
                transferDischarge: executeFormData.transferDischarge
            };

            await nurseDischargePlanningAPI.executeDischarge(stayId, dischargeData);
            alert('Đã thực hiện xuất viện thành công!');

            // Navigate back to inpatient stays list
            navigate('/staff/dieu-duong/dieu-tri-noi-tru');
        } catch (err) {
            console.error('Error executing discharge:', err);
            alert(err.message || 'Có lỗi xảy ra khi thực hiện xuất viện');
        } finally {
            setExecuting(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="discharge-planning-page">
                <div className="loading-container">
                    <FiRefreshCw className="spinner" />
                    <p>Đang tải thông tin kế hoạch xuất viện...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="discharge-planning-page">
                <div className="error-container">
                    <FiAlertCircle />
                    <p>{error}</p>
                    <button className="btn-retry" onClick={fetchDischargePlan}>
                        <FiRefreshCw /> Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="discharge-planning-page">
            {/* Header */}
            <div className="discharge-header">
                <div className="header-left">
                    <button className="btn-back" onClick={() => navigate(`/staff/dieu-duong/dieu-tri-noi-tru/${stayId}`)}>
                        <FiArrowLeft /> Quay lại
                    </button>
                    <div className="header-title">
                        <h1>Kế hoạch Xuất viện</h1>
                        {dischargePlan && (
                            <p className="patient-info">
                                Bệnh nhân: <strong>{dischargePlan.patientName}</strong> ({dischargePlan.patientCode})
                            </p>
                        )}
                    </div>
                </div>
                <div className="header-actions">
                    {!dischargePlan && (
                        <button className="btn-create" onClick={handleShowCreateForm}>
                            <FiFileText /> Tạo Kế hoạch Xuất viện
                        </button>
                    )}
                    {dischargePlan && !dischargePlan.approved && (
                        <>
                            <button className="btn-edit" onClick={handleShowEditForm}>
                                <FiEdit /> Chỉnh sửa
                            </button>
                            <button
                                className="btn-approve"
                                onClick={handleApprove}
                                disabled={approving}
                            >
                                <FiCheckCircle /> {approving ? 'Đang phê duyệt...' : 'Phê duyệt'}
                            </button>
                        </>
                    )}
                    {dischargePlan && dischargePlan.approved && (
                        <button
                            className="btn-execute"
                            onClick={handleShowExecuteModal}
                            disabled={executing}
                        >
                            <FiCheckCircle /> Thực hiện Xuất viện
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            {!dischargePlan ? (
                <div className="empty-state">
                    <FiFileText />
                    <h3>Chưa có kế hoạch xuất viện</h3>
                    <p>Nhấn nút "Tạo Kế hoạch Xuất viện" để bắt đầu</p>
                    <button className="btn-create-empty" onClick={handleShowCreateForm}>
                        <FiFileText /> Tạo Kế hoạch Xuất viện
                    </button>
                </div>
            ) : (
                <div className="discharge-plan-content">
                    {/* Status Section */}
                    <div className="plan-status-section">
                        <div className="status-badges">
                            <span className={`badge status-${dischargePlan.planStatus?.toLowerCase()}`}>
                                {dischargePlan.planStatusDisplay || dischargePlan.planStatus}
                            </span>
                            <span className={`badge ${dischargePlan.approved ? 'approved' : 'pending-approval'}`}>
                                {dischargePlan.approved ? 'Đã phê duyệt' : 'Chờ phê duyệt'}
                            </span>
                        </div>
                    </div>

                    {/* Main Information */}
                    <div className="plan-section">
                        <h2><FiCalendar /> Thông tin Xuất viện</h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Ngày xuất viện dự kiến:</label>
                                <span>{formatDate(dischargePlan.expectedDischargeDate)}</span>
                            </div>
                            <div className="info-item">
                                <label>Điểm đến sau xuất viện:</label>
                                <span>{dischargePlan.dischargeDestinationDisplay || dischargePlan.dischargeDestination}</span>
                            </div>
                            <div className="info-item full-width">
                                <label>Chuyển viện:</label>
                                <span className={`badge ${dischargePlan.transferDischarge ? 'transfer-yes' : 'transfer-no'}`}>
                                    {dischargePlan.transferDischarge ? 'Có' : 'Không'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Care Plan Section */}
                    <div className="plan-section">
                        <h2><FiHome /> Kế hoạch Chăm sóc</h2>
                        <div className="info-detail">
                            <label>Kế hoạch chăm sóc tại nhà:</label>
                            <p>{dischargePlan.homeCarePlan || 'Chưa có thông tin'}</p>
                        </div>
                        <div className="info-detail">
                            <label>Giáo dục gia đình:</label>
                            <p>{dischargePlan.familyEducation || 'Chưa có thông tin'}</p>
                        </div>
                    </div>

                    {/* Follow-up Section */}
                    <div className="plan-section">
                        <h2><FiActivity /> Theo dõi và Tái khám</h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Ngày tái khám:</label>
                                <span>{formatDate(dischargePlan.followUpDate)}</span>
                            </div>
                        </div>
                        <div className="info-detail">
                            <label>Hướng dẫn theo dõi:</label>
                            <p>{dischargePlan.followUpInstructions || 'Chưa có thông tin'}</p>
                        </div>
                    </div>

                    {/* Medication Section */}
                    <div className="plan-section">
                        <h2><FiPackage /> Thuốc và Thiết bị</h2>
                        <div className="info-detail">
                            <label>Đối chiếu thuốc:</label>
                            <p>{dischargePlan.medicationReconciliation || 'Chưa có thông tin'}</p>
                        </div>
                        <div className="info-detail">
                            <label>Thiết bị cần thiết:</label>
                            <p>{dischargePlan.equipmentNeeded || 'Chưa có thông tin'}</p>
                        </div>
                    </div>

                    {/* Transportation Section */}
                    <div className="plan-section">
                        <h2><FiTruck /> Vận chuyển và Hướng dẫn</h2>
                        <div className="info-detail">
                            <label>Sắp xếp vận chuyển:</label>
                            <p>{dischargePlan.transportationArrangements || 'Chưa có thông tin'}</p>
                        </div>
                        <div className="info-detail">
                            <label>Hướng dẫn đặc biệt:</label>
                            <p>{dischargePlan.specialInstructions || 'Chưa có thông tin'}</p>
                        </div>
                    </div>

                    {/* Assessment Section */}
                    <div className="plan-section">
                        <h2><FiCheckCircle /> Đánh giá Sẵn sàng Xuất viện</h2>
                        <div className="info-detail">
                            <p>{dischargePlan.dischargeReadinessAssessment || 'Chưa có thông tin'}</p>
                        </div>
                    </div>

                    {/* Metadata Section */}
                    <div className="plan-section metadata-section">
                        <h2><FiUsers /> Thông tin Quản lý</h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Người tạo:</label>
                                <span>{dischargePlan.createdByEmployeeName || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <label>Thời gian tạo:</label>
                                <span>{formatDateTime(dischargePlan.createdAt)}</span>
                            </div>
                            {dischargePlan.approved && (
                                <>
                                    <div className="info-item">
                                        <label>Người phê duyệt:</label>
                                        <span>{dischargePlan.approvedByEmployeeName || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Thời gian phê duyệt:</label>
                                        <span>{formatDateTime(dischargePlan.approvedAt)}</span>
                                    </div>
                                </>
                            )}
                            <div className="info-item">
                                <label>Cập nhật lần cuối:</label>
                                <span>{formatDateTime(dischargePlan.updatedAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Form Modal */}
            {showFormModal && (
                <div className="modal-overlay" onClick={() => setShowFormModal(false)}>
                    <div className="modal-content form-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{isEditing ? 'Chỉnh sửa Kế hoạch Xuất viện' : 'Tạo Kế hoạch Xuất viện'}</h2>
                            <button className="btn-close" onClick={() => setShowFormModal(false)}>
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Ngày xuất viện dự kiến <span className="required">*</span></label>
                                    <input
                                        type="date"
                                        value={formData.expectedDischargeDate}
                                        onChange={(e) => setFormData({...formData, expectedDischargeDate: e.target.value})}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Điểm đến sau xuất viện <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.dischargeDestination}
                                        onChange={(e) => setFormData({...formData, dischargeDestination: e.target.value})}
                                        placeholder="Nhập điểm đến..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Ngày tái khám</label>
                                    <input
                                        type="date"
                                        value={formData.followUpDate}
                                        onChange={(e) => setFormData({...formData, followUpDate: e.target.value})}
                                    />
                                </div>

                                <div className="form-group checkbox-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.transferDischarge}
                                            onChange={(e) => setFormData({...formData, transferDischarge: e.target.checked})}
                                        />
                                        <span>Chuyển viện</span>
                                    </label>
                                </div>

                                <div className="form-group full-width">
                                    <label>Kế hoạch chăm sóc tại nhà</label>
                                    <textarea
                                        value={formData.homeCarePlan}
                                        onChange={(e) => setFormData({...formData, homeCarePlan: e.target.value})}
                                        placeholder="Nhập kế hoạch chăm sóc tại nhà..."
                                        rows="3"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Hướng dẫn theo dõi</label>
                                    <textarea
                                        value={formData.followUpInstructions}
                                        onChange={(e) => setFormData({...formData, followUpInstructions: e.target.value})}
                                        placeholder="Nhập hướng dẫn theo dõi..."
                                        rows="3"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Đối chiếu thuốc</label>
                                    <textarea
                                        value={formData.medicationReconciliation}
                                        onChange={(e) => setFormData({...formData, medicationReconciliation: e.target.value})}
                                        placeholder="Nhập thông tin đối chiếu thuốc..."
                                        rows="3"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Hướng dẫn đặc biệt</label>
                                    <textarea
                                        value={formData.specialInstructions}
                                        onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})}
                                        placeholder="Nhập hướng dẫn đặc biệt..."
                                        rows="3"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Thiết bị cần thiết</label>
                                    <textarea
                                        value={formData.equipmentNeeded}
                                        onChange={(e) => setFormData({...formData, equipmentNeeded: e.target.value})}
                                        placeholder="Nhập thiết bị cần thiết..."
                                        rows="2"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Sắp xếp vận chuyển</label>
                                    <textarea
                                        value={formData.transportationArrangements}
                                        onChange={(e) => setFormData({...formData, transportationArrangements: e.target.value})}
                                        placeholder="Nhập thông tin sắp xếp vận chuyển..."
                                        rows="2"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Giáo dục gia đình</label>
                                    <textarea
                                        value={formData.familyEducation}
                                        onChange={(e) => setFormData({...formData, familyEducation: e.target.value})}
                                        placeholder="Nhập nội dung giáo dục gia đình..."
                                        rows="3"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Đánh giá sẵn sàng xuất viện</label>
                                    <textarea
                                        value={formData.dischargeReadinessAssessment}
                                        onChange={(e) => setFormData({...formData, dischargeReadinessAssessment: e.target.value})}
                                        placeholder="Nhập đánh giá sẵn sàng xuất viện..."
                                        rows="3"
                                    />
                                </div>
                            </div>

                            <div className="dialog-actions">
                                <button
                                    className="btn-cancel"
                                    onClick={() => setShowFormModal(false)}
                                    disabled={submitting}
                                >
                                    Hủy
                                </button>
                                <button
                                    className="btn-confirm"
                                    onClick={handleSubmitForm}
                                    disabled={submitting || !formData.expectedDischargeDate.trim() || !formData.dischargeDestination.trim()}
                                >
                                    <FiCheckCircle /> {submitting ? 'Đang xử lý...' : (isEditing ? 'Cập nhật' : 'Tạo mới')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Execute Discharge Modal */}
            {showExecuteModal && (
                <ExecuteDischargeModal
                    executeFormData={executeFormData}
                    onFormChange={handleExecuteFormChange}
                    onExecute={handleExecuteDischarge}
                    onClose={() => setShowExecuteModal(false)}
                    executing={executing}
                />
            )}
        </div>
    );
};

// Execute Discharge Modal Component
const ExecuteDischargeModal = ({ executeFormData, onFormChange, onExecute, onClose, executing }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content modal-lg">
                <div className="modal-header">
                    <h3>Thực hiện Xuất viện</h3>
                    <button className="btn-close" onClick={onClose} disabled={executing}>
                        <FiX />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="form-grid">
                        {/* Required Fields */}
                        <div className="form-group">
                            <label>Ngày xuất viện <span className="required">*</span></label>
                            <input
                                type="datetime-local"
                                name="dischargeDate"
                                value={executeFormData.dischargeDate}
                                onChange={onFormChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Tình trạng xuất viện <span className="required">*</span></label>
                            <select
                                name="dischargeCondition"
                                value={executeFormData.dischargeCondition}
                                onChange={onFormChange}
                                required
                            >
                                <option value="IMPROVED">Cải thiện</option>
                                <option value="STABLE">Ổn định</option>
                                <option value="DETERIORATED">Xấu đi</option>
                                <option value="DECEASED">Tử vong</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Điểm đến sau xuất viện <span className="required">*</span></label>
                            <select
                                name="dischargeDestination"
                                value={executeFormData.dischargeDestination}
                                onChange={onFormChange}
                                required
                            >
                                <option value="HOME">Về nhà</option>
                                <option value="TRANSFER_HOSPITAL">Chuyển viện</option>
                                <option value="NURSING_HOME">Nhà dưỡng lão</option>
                                <option value="REHABILITATION">Phục hồi chức năng</option>
                                <option value="DECEASED">Tử vong</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Loại xuất viện <span className="required">*</span></label>
                            <select
                                name="dispositionType"
                                value={executeFormData.dispositionType}
                                onChange={onFormChange}
                                required
                            >
                                <option value="ROUTINE">Thường quy</option>
                                <option value="AGAINST_MEDICAL_ADVICE">Trái ý kiến bác sĩ</option>
                                <option value="TRANSFER">Chuyển viện</option>
                                <option value="EXPIRED">Tử vong</option>
                            </select>
                        </div>

                        <div className="form-group full-width">
                            <label>Chẩn đoán xuất viện <span className="required">*</span></label>
                            <textarea
                                name="dischargeDiagnosis"
                                value={executeFormData.dischargeDiagnosis}
                                onChange={onFormChange}
                                placeholder="Nhập chẩn đoán xuất viện..."
                                rows="3"
                                required
                            />
                        </div>

                        {/* Optional Fields */}
                        <div className="form-group full-width">
                            <label>Hướng dẫn xuất viện</label>
                            <textarea
                                name="dischargeInstructions"
                                value={executeFormData.dischargeInstructions}
                                onChange={onFormChange}
                                placeholder="Nhập hướng dẫn xuất viện..."
                                rows="3"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Hướng dẫn tái khám</label>
                            <textarea
                                name="followUpInstructions"
                                value={executeFormData.followUpInstructions}
                                onChange={onFormChange}
                                placeholder="Nhập hướng dẫn tái khám..."
                                rows="3"
                            />
                        </div>

                        <div className="form-group">
                            <label>Ngày tái khám</label>
                            <input
                                type="datetime-local"
                                name="followUpDate"
                                value={executeFormData.followUpDate}
                                onChange={onFormChange}
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Thuốc khi xuất viện</label>
                            <textarea
                                name="medicationsAtDischarge"
                                value={executeFormData.medicationsAtDischarge}
                                onChange={onFormChange}
                                placeholder="Nhập danh sách thuốc khi xuất viện..."
                                rows="3"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Ghi chú xuất viện</label>
                            <textarea
                                name="dischargeNotes"
                                value={executeFormData.dischargeNotes}
                                onChange={onFormChange}
                                placeholder="Nhập ghi chú xuất viện..."
                                rows="3"
                            />
                        </div>

                        {/* Checkboxes */}
                        <div className="form-group full-width">
                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="expired"
                                        checked={executeFormData.expired}
                                        onChange={onFormChange}
                                    />
                                    <span>Bệnh nhân tử vong</span>
                                </label>

                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="againstMedicalAdvice"
                                        checked={executeFormData.againstMedicalAdvice}
                                        onChange={onFormChange}
                                    />
                                    <span>Xuất viện trái ý kiến bác sĩ</span>
                                </label>

                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="transferDischarge"
                                        checked={executeFormData.transferDischarge}
                                        onChange={onFormChange}
                                    />
                                    <span>Chuyển viện</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        className="btn-cancel"
                        onClick={onClose}
                        disabled={executing}
                    >
                        Hủy
                    </button>
                    <button
                        className="btn-execute"
                        onClick={onExecute}
                        disabled={executing}
                    >
                        <FiCheck /> {executing ? 'Đang thực hiện xuất viện...' : 'Thực hiện Xuất viện'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DischargePlanningPage;


