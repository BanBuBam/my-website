import React, { useState } from 'react';
import { FiX, FiXCircle } from 'react-icons/fi';
import { medicationOrderAPI } from '../../../../services/staff/doctorAPI';
import './MedicationActionModals.css';

const DiscontinueMedicationModal = ({ isOpen, onClose, medicationOrder, onSuccess }) => {
    const [formData, setFormData] = useState({
        discontinueReason: '',
        discontinueDate: ''
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
        
        if (!formData.discontinueReason.trim()) {
            setError('Vui lòng nhập lý do ngừng y lệnh');
            return;
        }

        // Confirmation dialog
        const confirmed = window.confirm(
            `Bạn có chắc chắn muốn ngừng y lệnh "${medicationOrder.medicineName}"?\n\nHành động này không thể hoàn tác.`
        );

        if (!confirmed) {
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const discontinueData = {
                discontinueReason: formData.discontinueReason,
                ...(formData.discontinueDate && { discontinueDate: formData.discontinueDate })
            };

            const response = await medicationOrderAPI.discontinueMedicationOrder(
                medicationOrder.medicationOrderId,
                discontinueData
            );

            if (response && (response.code === 200 || response.code === 201)) {
                alert('Ngừng y lệnh thành công!');
                setFormData({ discontinueReason: '', discontinueDate: '' });
                onSuccess();
                onClose();
            } else {
                setError(response?.message || 'Không thể ngừng y lệnh');
            }
        } catch (err) {
            console.error('Error discontinuing medication order:', err);
            setError(err.message || 'Không thể ngừng y lệnh');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({ discontinueReason: '', discontinueDate: '' });
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        <FiXCircle className="modal-icon discontinue-icon" />
                        <h2>Ngừng y lệnh</h2>
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

                    <div className="warning-message">
                        <FiXCircle />
                        <span>Hành động này sẽ ngừng y lệnh và không thể hoàn tác.</span>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Lý do ngừng y lệnh <span className="required">*</span></label>
                            <textarea
                                name="discontinueReason"
                                value={formData.discontinueReason}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Nhập lý do ngừng y lệnh..."
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Ngày ngừng (tùy chọn)</label>
                            <input
                                type="datetime-local"
                                name="discontinueDate"
                                value={formData.discontinueDate}
                                onChange={handleChange}
                            />
                            <small className="form-hint">Mặc định là thời gian hiện tại</small>
                        </div>

                        <div className="modal-actions">
                            <button type="button" onClick={handleClose} className="btn-cancel">
                                Hủy
                            </button>
                            <button type="submit" className="btn-submit btn-discontinue" disabled={submitting}>
                                <FiXCircle />
                                {submitting ? 'Đang xử lý...' : 'Ngừng y lệnh'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DiscontinueMedicationModal;

