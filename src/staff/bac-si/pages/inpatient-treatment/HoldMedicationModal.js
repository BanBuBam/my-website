import React, { useState } from 'react';
import { FiX, FiPause } from 'react-icons/fi';
import { medicationOrderAPI } from '../../../../services/staff/doctorAPI';
import './MedicationActionModals.css';

const HoldMedicationModal = ({ isOpen, onClose, medicationOrder, onSuccess }) => {
    const [formData, setFormData] = useState({
        holdReason: '',
        holdUntil: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.holdReason.trim()) {
            setError('Vui lòng nhập lý do tạm dừng');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const holdData = {
                holdReason: formData.holdReason,
                ...(formData.holdUntil && { holdUntil: formData.holdUntil })
            };

            const response = await medicationOrderAPI.holdMedicationOrder(
                medicationOrder.medicationOrderId,
                holdData
            );

            if (response && (response.code === 200 || response.code === 201)) {
                alert('Tạm dừng y lệnh thành công!');
                setFormData({ holdReason: '', holdUntil: '' });
                onSuccess();
                onClose();
            } else {
                setError(response?.message || 'Không thể tạm dừng y lệnh');
            }
        } catch (err) {
            console.error('Error holding medication order:', err);
            setError(err.message || 'Không thể tạm dừng y lệnh');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({ holdReason: '', holdUntil: '' });
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        <FiPause className="modal-icon hold-icon" />
                        <h2>Tạm dừng y lệnh</h2>
                    </div>
                    <button className="modal-close" onClick={handleClose}>
                        <FiX />
                    </button>
                </div>

                <div className="modal-body">
                    {medicationOrder && (
                        <div className="medication-info">
                            <p><strong>Thuốc:</strong> {medicationOrder.medicineName}</p>
                            <p><strong>Liều lượng:</strong> {medicationOrder.dosage}</p>
                            <p><strong>Đường dùng:</strong> {medicationOrder.routeDisplay || medicationOrder.route}</p>
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Lý do tạm dừng <span className="required">*</span></label>
                            <textarea
                                name="holdReason"
                                value={formData.holdReason}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Nhập lý do tạm dừng y lệnh..."
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Tạm dừng đến (tùy chọn)</label>
                            <input
                                type="datetime-local"
                                name="holdUntil"
                                value={formData.holdUntil}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="modal-actions">
                            <button type="button" onClick={handleClose} className="btn-cancel">
                                Hủy
                            </button>
                            <button type="submit" className="btn-submit btn-hold" disabled={submitting}>
                                <FiPause />
                                {submitting ? 'Đang xử lý...' : 'Tạm dừng'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default HoldMedicationModal;

