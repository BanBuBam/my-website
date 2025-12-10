import React, { useState } from 'react';
import { doctorEmergencyAPI } from '../../../../services/staff/doctorAPI';
import { FiX, FiSave, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import './CreateDiagnosticOrderModal.css';

const CreateDiagnosticOrderModal = ({ emergencyEncounterId, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        emergencyEncounterId: emergencyEncounterId,
        diagnosticType: 'XET_NGHIEM_MAU',
        urgencyLevel: 'ROUTINE',
        orderDetails: '',
        clinicalIndication: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.orderDetails) {
            setError('Vui lòng nhập chi tiết chỉ định');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const submitData = {
                ...formData,
                emergencyEncounterId: parseInt(emergencyEncounterId),
            };

            const response = await doctorEmergencyAPI.createDiagnosticOrder(submitData);

            if (response && response.data) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess(response.data);
                    onClose();
                }, 1500);
            }
        } catch (err) {
            console.error('Error creating diagnostic order:', err);
            setError(err.message || 'Không thể tạo chỉ định xét nghiệm');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content create-diagnostic-order-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Tạo chỉ định xét nghiệm</h3>
                    <button className="btn-close" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                {error && (
                    <div className="error-message">
                        <FiAlertCircle />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="success-message">
                        <FiCheckCircle />
                        <span>Tạo chỉ định xét nghiệm thành công!</span>
                    </div>
                )}

                <form className="modal-body" onSubmit={handleSubmit}>
                    <div className="form-section">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Loại xét nghiệm <span className="required">*</span></label>
                                <select name="diagnosticType" value={formData.diagnosticType} onChange={handleChange} required>
                                    <option value="XET_NGHIEM_MAU">Xét nghiệm máu</option>
                                    <option value="XET_NGHIEM_NUOC_TIEU">Xét nghiệm nước tiểu</option>
                                    <option value="X_QUANG">X-quang</option>
                                    <option value="CT_SCAN">CT Scan</option>
                                    <option value="ECG">Điện tâm đồ</option>
                                    <option value="ECHO_TIM">Siêu âm tim</option>
                                    <option value="SIEU_AM">Siêu âm</option>
                                    <option value="XET_NGHIEM_KHAC">Xét nghiệm khác</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Mức độ khẩn <span className="required">*</span></label>
                                <select name="urgencyLevel" value={formData.urgencyLevel} onChange={handleChange} required>
                                    <option value="STAT">Cấp cứu ngay (STAT)</option>
                                    <option value="URGENT">Khẩn cấp (URGENT)</option>
                                    <option value="ROUTINE">Thường quy (ROUTINE)</option>
                                </select>
                            </div>

                            <div className="form-group full-width">
                                <label>Chi tiết chỉ định <span className="required">*</span></label>
                                <textarea
                                    name="orderDetails"
                                    value={formData.orderDetails}
                                    onChange={handleChange}
                                    placeholder="Nhập chi tiết chỉ định xét nghiệm..."
                                    rows="4"
                                    required
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Chỉ định lâm sàng</label>
                                <textarea
                                    name="clinicalIndication"
                                    value={formData.clinicalIndication}
                                    onChange={handleChange}
                                    placeholder="Nhập chỉ định lâm sàng..."
                                    rows="3"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Hủy
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            <FiSave /> {loading ? 'Đang lưu...' : 'Tạo chỉ định'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateDiagnosticOrderModal;
