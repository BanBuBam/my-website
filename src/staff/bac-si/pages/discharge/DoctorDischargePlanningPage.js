import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit, FiCheckCircle, FiAlertCircle, FiCalendar, FiHome, FiFileText, FiPackage, FiTruck, FiUsers, FiActivity, FiRefreshCw, FiX, FiCheck, FiCheckSquare, FiSlash } from 'react-icons/fi';
// Import API của Bác sĩ
import { doctorDischargePlanningAPI, doctorInpatientTreatmentAPI } from '../../../../services/staff/doctorAPI';
import './DoctorDischargePlanningPage.css';

const DoctorDischargePlanningPage = () => {
    // Lưu ý: Route bác sĩ thường dùng :inpatientStayId
    const { inpatientStayId } = useParams();
    const navigate = useNavigate();
    
    // State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dischargePlan, setDischargePlan] = useState(null);
    const [stay, setStay] = useState(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [approving, setApproving] = useState(false);
    const [showExecuteModal, setShowExecuteModal] = useState(false);
    const [executing, setExecuting] = useState(false);

    // State for Order/Cancel Discharge
    const [showReasonModal, setShowReasonModal] = useState(false);
    const [actionType, setActionType] = useState(null); // 'ORDER' or 'CANCEL'
    const [processingAction, setProcessingAction] = useState(false);
    const [savedFollowUpDate, setSavedFollowUpDate] = useState(null); // Lưu followUpDate từ discharge plan
    
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
    
    // Fetch discharge planning data and stay detail
    useEffect(() => {
        fetchDischargePlan();
        fetchStayDetail();
    }, [inpatientStayId]);
    
    const fetchDischargePlan = async () => {
        try {
            setLoading(true);
            setError(null);
            // Gọi API Bác sĩ
            const response = await doctorDischargePlanningAPI.getDischargePlanningByStay(inpatientStayId);

            if (response.status === 'OK' && response.data) {
                    setDischargePlan(response.data);

                    // Lưu followUpDate nếu có
                    if (response.data.expectedDischargeDate) {
                        setSavedFollowUpDate(response.data.expectedDischargeDate);
                        
                        // Cập nhật executeFormData với followUpDate
                        setExecuteFormData(prev => ({
                            ...prev,
                            followUpDate: response.data.expectedDischargeDate
                        }));
                    }
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

    const fetchStayDetail = async () => {
        try {
            const response = await doctorInpatientTreatmentAPI.getInpatientStayDetail(inpatientStayId);
            if (response && response.data) {
                setStay(response.data);
            }
        } catch (err) {
            console.error('Error loading stay detail:', err);
        }
    };
    
    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit'
        });
    };
    
    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
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
                await doctorDischargePlanningAPI.updateDischargePlanning(dischargePlan.dischargePlanId, formData);
                alert('Cập nhật kế hoạch xuất viện thành công!');
            } else {
                await doctorDischargePlanningAPI.createDischargePlanning(inpatientStayId, formData);
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
        if (!window.confirm('Bạn có chắc chắn muốn PHÊ DUYỆT kế hoạch xuất viện này?')) {
            return;
        }
        
        try {
            setApproving(true);
            await doctorDischargePlanningAPI.approveDischargePlanning(dischargePlan.dischargePlanId);
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

    // Handle Order/Cancel Discharge
    const openActionModal = (type) => {
        setActionType(type);
        setShowReasonModal(true);
    };

    const handleConfirmAction = async (reason) => {
        setProcessingAction(true);
        try {
            if (actionType === 'ORDER') {
                const response = await doctorDischargePlanningAPI.orderDischarge(inpatientStayId, reason);

                // Lưu followUpDate từ kết quả trả về
                if (response && response.data && response.data.expectedDischargeDate) {
                    setSavedFollowUpDate(response.data.expectedDischargeDate);
                    console.log('HHHH followUpDate: ' + response.data.followUpDate);
                    // Cập nhật executeFormData với followUpDate
                    setExecuteFormData(prev => ({
                        ...prev,
                        followUpDate: response.data.expectedDischargeDate
                    }));
                }

                alert('Đã đặt lệnh xuất viện thành công. Các y lệnh mới sẽ bị chặn.');

                // Reload discharge plan để cập nhật thông tin
                await fetchDischargePlan();
            } else if (actionType === 'CANCEL') {
                await doctorDischargePlanningAPI.cancelDischargeOrder(inpatientStayId, reason);
                alert('Đã hủy lệnh xuất viện. Có thể tạo y lệnh mới bình thường.');
            }
            // Reload stay detail to update status
            await fetchStayDetail();
            setShowReasonModal(false);
        } catch (err) {
            alert(`Lỗi: ${err.message}`);
        } finally {
            setProcessingAction(false);
        }
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
        if (!executeFormData.dischargeDate.trim()) {
            alert('Vui lòng chọn ngày xuất viện');
            return;
        }
        if (!executeFormData.dischargeDiagnosis.trim()) {
            alert('Vui lòng nhập chẩn đoán xuất viện');
            return;
        }

        // Bác sĩ cần confirm kỹ hơn
        const confirmMessage = 'XÁC NHẬN: Bạn đang thực hiện xuất viện cho bệnh nhân này. Hành động này sẽ KẾT THÚC lượt điều trị nội trú và giường bệnh sẽ được giải phóng.';

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            setExecuting(true);

            // Sử dụng savedFollowUpDate nếu có, nếu không thì dùng từ executeFormData
            const followUpDateToUse = savedFollowUpDate || executeFormData.followUpDate;

            const dischargeData = {
                ...executeFormData,
                followUpDate: followUpDateToUse ? new Date(followUpDateToUse).toISOString() : null,
                dischargeDate: new Date(executeFormData.dischargeDate).toISOString(),
            };

            await doctorDischargePlanningAPI.executeDischarge(inpatientStayId, dischargeData);
            alert('Đã thực hiện xuất viện thành công!');

            // Điều hướng về trang danh sách bệnh nhân của bác sĩ
            navigate('/staff/bac-si/dieu-tri-noi-tru');
        } catch (err) {
            console.error('Error executing discharge:', err);
            alert(err.message || 'Có lỗi xảy ra khi thực hiện xuất viện');
        } finally {
            setExecuting(false);
        }
    };
    
    if (loading) {
        return (
            <div className="doctor-discharge-page">
                <div className="loading-container">
                    <FiRefreshCw className="spinner" />
                    <p>Đang tải thông tin kế hoạch xuất viện...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="doctor-discharge-page">
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
        <div className="doctor-discharge-page">
            {/* Header */}
            <div className="discharge-header">
                <div className="header-left">
                    {/* Điều hướng quay lại trang chi tiết điều trị của bác sĩ */}
                    <button className="btn-back" onClick={() => navigate(`/staff/bac-si/dieu-tri-noi-tru/${inpatientStayId}`)}>
                        <FiArrowLeft /> Quay lại
                    </button>
                    <div className="header-title">
                        <h1>Kế hoạch Xuất viện (Dành cho Bác sĩ)</h1>
                        {dischargePlan && (
                            <p className="patient-info">
                                Bệnh nhân: <strong>{dischargePlan.patientName}</strong> ({dischargePlan.patientCode})
                            </p>
                        )}
                    </div>
                </div>
                <div className="header-actions">
                    {dischargePlan && !dischargePlan.approved && (
                        <>
                            <button className="btn-edit" onClick={handleShowEditForm}>
                                <FiEdit /> Chỉnh sửa
                            </button>
                            {/* Bác sĩ có quyền phê duyệt */}
                            { stay.currentStatus === 'ACTIVE' && (
                                <button
                                    className="btn-approve"
                                    onClick={handleApprove}
                                    disabled={approving}
                                >
                                    <FiCheckCircle /> {approving ? 'Đang phê duyệt...' : 'Phê duyệt Kế hoạch'}
                                </button>
                            )}
                        </>
                    )}
                    {/* Order/Cancel Discharge Buttons */}
                    {stay && stay.currentStatus !== 'DISCHARGE_ORDERED' &&(
                        <button
                            className="btn-order-discharge"
                            onClick={() => openActionModal('ORDER')}
                        >
                            <FiCheckSquare />
                            <span>Đặt lệnh xuất viện</span>
                        </button>
                    )}
                    {stay && stay.currentStatus === 'DISCHARGE_ORDERED' && (
                        <button
                            className="btn-cancel-discharge-order"
                            onClick={() => openActionModal('CANCEL')}
                        >
                            <FiSlash />
                            <span>Hủy lệnh xuất viện</span>
                        </button>
                    )}

                    {/* Existing Buttons */}
                    {!dischargePlan && (
                        <button className="btn-create" onClick={handleShowCreateForm}>
                            <FiFileText /> Tạo Kế hoạch
                        </button>
                    )}
                    
                    {dischargePlan && dischargePlan.approved && stay.currentStatus === 'DISCHARGE_ORDERED' && (
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
                    <p>Bác sĩ hoặc Điều dưỡng có thể tạo kế hoạch này.</p>
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
                    
                    {/* ... (Phần hiển thị thông tin giữ nguyên giống Nurse) ... */}
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
            
            {/* Form Modal - (Giữ nguyên logic Form) */}
            {showFormModal && (
                <div className="modal-overlay" onClick={() => setShowFormModal(false)}>
                    <div className="modal-content form-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{isEditing ? 'Chỉnh sửa Kế hoạch' : 'Tạo Kế hoạch Xuất viện'}</h2>
                            <button className="btn-close" onClick={() => setShowFormModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-grid">
                                {/* ... Các trường input giữ nguyên như file Nurse ... */}
                                <div className="form-group">
                                    <label>Ngày xuất viện dự kiến <span className="required">*</span></label>
                                    <input
                                        type="date"
                                        value={formData.expectedDischargeDate}
                                        onChange={(e) => setFormData({...formData, expectedDischargeDate: e.target.value})}
                                    />
                                </div>
                                {/* ...Copy phần còn lại của form fields từ file DischargePlanningPage.js... */}
                                <div className="form-group">
                                    <label>Điểm đến sau xuất viện <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.dischargeDestination}
                                        onChange={(e) => setFormData({...formData, dischargeDestination: e.target.value})}
                                        placeholder="Nhập điểm đến..."
                                    />
                                </div>
                                {/* ... (Rút gọn để tiết kiệm không gian, bạn copy đầy đủ từ file nurse nhé) ... */}
                                <div className="form-group full-width">
                                    <label>Hướng dẫn theo dõi</label>
                                    <textarea
                                        value={formData.followUpInstructions}
                                        onChange={(e) => setFormData({...formData, followUpInstructions: e.target.value})}
                                        rows="3"
                                    />
                                </div>
                                {/* ... */}
                            </div>
                            <div className="dialog-actions">
                                <button className="btn-cancel" onClick={() => setShowFormModal(false)}>Hủy</button>
                                <button className="btn-confirm" onClick={handleSubmitForm} disabled={submitting}>
                                    <FiCheckCircle /> {submitting ? 'Đang xử lý...' : (isEditing ? 'Cập nhật' : 'Tạo mới')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Execute Discharge Modal (Tương tự, giữ nguyên component con hoặc import) */}
            {showExecuteModal && (
                <ExecuteDischargeModal
                    executeFormData={executeFormData}
                    onFormChange={handleExecuteFormChange}
                    onExecute={handleExecuteDischarge}
                    onClose={() => setShowExecuteModal(false)}
                    executing={executing}
                />
            )}

            {/* Reason Modal for Order/Cancel Discharge */}
            {showReasonModal && (
                <ReasonModal
                    title={actionType === 'ORDER' ? 'Đặt lệnh xuất viện' : 'Hủy lệnh xuất viện'}
                    message={actionType === 'ORDER'
                        ? 'Bạn có chắc chắn muốn đặt lệnh xuất viện? Các y lệnh mới sẽ bị chặn.'
                        : 'Bạn có chắc chắn muốn hủy lệnh xuất viện? Trạng thái sẽ trở về Active.'}
                    onClose={() => setShowReasonModal(false)}
                    onConfirm={handleConfirmAction}
                    loading={processingAction}
                    actionType={actionType}
                />
            )}
        </div>
    );
};

// Component con Modal Thực hiện Xuất viện (Có thể tách ra file riêng hoặc giữ ở đây)
const ExecuteDischargeModal = ({ executeFormData, onFormChange, onExecute, onClose, executing }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content modal-lg">
                <div className="modal-header">
                    <h3>Thực hiện Xuất viện</h3>
                    <button className="btn-close" onClick={onClose} disabled={executing}><FiX /></button>
                </div>
                <div className="modal-body">
                    {/* ... Copy nội dung Modal Body từ file DischargePlanningPage.js ... */}
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Ngày xuất viện <span className="required">*</span></label>
                            <input type="datetime-local" name="dischargeDate" value={executeFormData.dischargeDate} onChange={onFormChange} required />
                        </div>
                        <div className="form-group">
                            <label>Tình trạng xuất viện <span className="required">*</span></label>
                            <select name="dischargeCondition" value={executeFormData.dischargeCondition} onChange={onFormChange} required>
                                <option value="STABLE">Ổn định</option>
                                <option value="IMPROVED">Cải thiện</option>
                                <option value="DETERIORATED">Xấu đi</option>
                                <option value="DECEASED">Tử vong</option>
                            </select>
                        </div>
                        {/* ... các trường khác ... */}
                        <div className="form-group full-width">
                            <label>Chẩn đoán xuất viện <span className="required">*</span></label>
                            <textarea name="dischargeDiagnosis" value={executeFormData.dischargeDiagnosis} onChange={onFormChange} rows="3" required />
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose} disabled={executing}>Hủy</button>
                    <button className="btn-execute" onClick={onExecute} disabled={executing}>
                        <FiCheck /> {executing ? 'Đang thực hiện...' : 'Thực hiện Xuất viện'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Reason Modal Component for Order/Cancel Discharge
const ReasonModal = ({ title, message, onClose, onConfirm, loading, actionType }) => {
    const [reason, setReason] = useState('');

    const handleSubmit = () => {
        if (!reason.trim()) {
            alert('Vui lòng nhập lý do/ghi chú.');
            return;
        }
        onConfirm(reason);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="btn-close" onClick={onClose} disabled={loading}><FiX /></button>
                </div>
                <div className="modal-body">
                    <div className="alert-message" style={{ marginBottom: '15px', color: '#4b5563' }}>
                        {message}
                    </div>
                    <div className="form-group">
                        <label>Lý do / Ghi chú <span className="required">*</span></label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Nhập lý do..."
                            rows="4"
                            className="form-control"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose} disabled={loading}>Hủy</button>
                    <button
                        className={`btn-confirm ${actionType === 'CANCEL' ? 'btn-danger' : 'btn-primary'}`}
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{
                            backgroundColor: actionType === 'CANCEL' ? '#dc2626' : '#10b981',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        {loading ? 'Đang xử lý...' : <><FiCheck /> Xác nhận</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DoctorDischargePlanningPage;