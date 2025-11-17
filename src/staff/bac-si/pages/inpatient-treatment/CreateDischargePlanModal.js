import React, { useState } from 'react';
import { doctorInpatientTreatmentAPI } from '../../../../services/staff/doctorAPI';
import { FiX, FiAlertCircle, FiLogOut } from 'react-icons/fi';
import './CreateDischargePlanModal.css';

const CreateDischargePlanModal = ({ isOpen, onClose, inpatientStayId, onSuccess }) => {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        expectedDischargeDate: '',
        dischargeDestination: 'Home',
        homeCarePlan: '',
        followUpInstructions: '',
        followUpDate: '',
        medicationReconciliation: '',
        specialInstructions: '',
        equipmentNeeded: '',
        transportationArrangements: '',
        familyEducation: '',
        dischargeReadinessAssessment: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.expectedDischargeDate) {
            setError('Vui lòng chọn ngày xuất viện dự kiến');
            return;
        }
        if (!formData.homeCarePlan.trim()) {
            setError('Vui lòng nhập kế hoạch chăm sóc tại nhà');
            return;
        }
        if (!formData.followUpInstructions.trim()) {
            setError('Vui lòng nhập hướng dẫn tái khám');
            return;
        }
        if (!formData.medicationReconciliation.trim()) {
            setError('Vui lòng nhập thông tin đối chiếu thuốc');
            return;
        }
        if (!formData.dischargeReadinessAssessment.trim()) {
            setError('Vui lòng nhập đánh giá sẵn sàng xuất viện');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const dischargePlanData = {
                expectedDischargeDate: formData.expectedDischargeDate,
                dischargeDestination: formData.dischargeDestination,
                homeCarePlan: formData.homeCarePlan,
                followUpInstructions: formData.followUpInstructions,
                followUpDate: formData.followUpDate || null,
                medicationReconciliation: formData.medicationReconciliation,
                specialInstructions: formData.specialInstructions || null,
                equipmentNeeded: formData.equipmentNeeded || null,
                transportationArrangements: formData.transportationArrangements || null,
                familyEducation: formData.familyEducation || null,
                dischargeReadinessAssessment: formData.dischargeReadinessAssessment,
            };

            const response = await doctorInpatientTreatmentAPI.createDischargePlanning(
                inpatientStayId,
                dischargePlanData
            );
            
            if (response && (response.code === 201 || response.code === 200)) {
                // Success
                if (onSuccess) {
                    onSuccess();
                }
                handleClose();
            } else {
                setError(response?.message || 'Không thể tạo kế hoạch xuất viện');
            }
        } catch (err) {
            console.error('Error creating discharge plan:', err);
            setError(err.message || 'Không thể tạo kế hoạch xuất viện');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({
            expectedDischargeDate: '',
            dischargeDestination: 'Home',
            homeCarePlan: '',
            followUpInstructions: '',
            followUpDate: '',
            medicationReconciliation: '',
            specialInstructions: '',
            equipmentNeeded: '',
            transportationArrangements: '',
            familyEducation: '',
            dischargeReadinessAssessment: '',
        });
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    // Get today's date for min attribute
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content discharge-modal" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="modal-header">
                    <h2>
                        <FiLogOut /> Tạo kế hoạch xuất viện
                    </h2>
                    <button className="btn-close" onClick={handleClose}>
                        <FiX />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="modal-body">
                    {error && (
                        <div className="alert alert-error">
                            <FiAlertCircle />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Basic Information */}
                        <div className="form-section">
                            <h3>Thông tin cơ bản</h3>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ngày xuất viện dự kiến <span className="required">*</span></label>
                                    <input
                                        type="date"
                                        name="expectedDischargeDate"
                                        value={formData.expectedDischargeDate}
                                        onChange={handleInputChange}
                                        min={getTodayDate()}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Nơi đến sau xuất viện <span className="required">*</span></label>
                                    <select
                                        name="dischargeDestination"
                                        value={formData.dischargeDestination}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="Home">Về nhà</option>
                                        <option value="Rehabilitation Facility">Cơ sở phục hồi chức năng</option>
                                        <option value="Nursing Home">Nhà dưỡng lão</option>
                                        <option value="Another Hospital">Bệnh viện khác</option>
                                        <option value="Other">Khác</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Care Plan */}
                        <div className="form-section">
                            <h3>Kế hoạch chăm sóc</h3>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Kế hoạch chăm sóc tại nhà <span className="required">*</span></label>
                                    <textarea
                                        name="homeCarePlan"
                                        value={formData.homeCarePlan}
                                        onChange={handleInputChange}
                                        placeholder="VD: Bệnh nhân cần chăm sóc vết thương hàng ngày và quản lý thuốc"
                                        rows="3"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Đối chiếu thuốc <span className="required">*</span></label>
                                    <textarea
                                        name="medicationReconciliation"
                                        value={formData.medicationReconciliation}
                                        onChange={handleInputChange}
                                        placeholder="VD: Tiếp tục dùng thuốc hiện tại theo chỉ định"
                                        rows="3"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Thiết bị cần thiết</label>
                                    <input
                                        type="text"
                                        name="equipmentNeeded"
                                        value={formData.equipmentNeeded}
                                        onChange={handleInputChange}
                                        placeholder="VD: Xe lăn, khung tập đi"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Follow-up Instructions */}
                        <div className="form-section">
                            <h3>Hướng dẫn tái khám</h3>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Hướng dẫn tái khám <span className="required">*</span></label>
                                    <textarea
                                        name="followUpInstructions"
                                        value={formData.followUpInstructions}
                                        onChange={handleInputChange}
                                        placeholder="VD: Tái khám với bác sĩ gia đình sau 1 tuần"
                                        rows="3"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ngày tái khám</label>
                                    <input
                                        type="date"
                                        name="followUpDate"
                                        value={formData.followUpDate}
                                        onChange={handleInputChange}
                                        min={getTodayDate()}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Additional Instructions */}
                        <div className="form-section">
                            <h3>Hướng dẫn bổ sung</h3>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Hướng dẫn đặc biệt</label>
                                    <textarea
                                        name="specialInstructions"
                                        value={formData.specialInstructions}
                                        onChange={handleInputChange}
                                        placeholder="VD: Tránh mang vác nặng trong 2 tuần"
                                        rows="2"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Sắp xếp vận chuyển</label>
                                    <textarea
                                        name="transportationArrangements"
                                        value={formData.transportationArrangements}
                                        onChange={handleInputChange}
                                        placeholder="VD: Gia đình sẽ đưa đón"
                                        rows="2"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Giáo dục gia đình</label>
                                    <textarea
                                        name="familyEducation"
                                        value={formData.familyEducation}
                                        onChange={handleInputChange}
                                        placeholder="VD: Gia đình đã được hướng dẫn chăm sóc vết thương và lịch uống thuốc"
                                        rows="2"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Assessment */}
                        <div className="form-section">
                            <h3>Đánh giá</h3>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Đánh giá sẵn sàng xuất viện <span className="required">*</span></label>
                                    <textarea
                                        name="dischargeReadinessAssessment"
                                        value={formData.dischargeReadinessAssessment}
                                        onChange={handleInputChange}
                                        placeholder="VD: Bệnh nhân ổn định và sẵn sàng xuất viện"
                                        rows="3"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleClose}>
                                Hủy
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary" 
                                disabled={submitting}
                            >
                                {submitting ? 'Đang tạo...' : 'Tạo kế hoạch xuất viện'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateDischargePlanModal;

