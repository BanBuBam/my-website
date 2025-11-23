import React, { useState } from 'react';
import { FiX, FiPlay } from 'react-icons/fi';
import { medicationOrderAPI } from '../../../../services/staff/doctorAPI';
import './MedicationActionModals.css';

const ResumeMedicationModal = ({ isOpen, onClose, medicationOrder, onSuccess }) => {
    const [formData, setFormData] = useState({
        resumeNotes: ''
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

        try {
            setSubmitting(true);
            setError(null);

            const resumeData = {
                resumeNotes: formData.resumeNotes
            };

            const response = await medicationOrderAPI.resumeMedicationOrder(
                medicationOrder.medicationOrderId,
                resumeData
            );

            if (response && (response.code === 200 || response.code === 201)) {
                alert('Tiếp tục y lệnh thành công!');
                setFormData({ resumeNotes: '' });
                onSuccess();
                onClose();
            } else {
                setError(response?.message || 'Không thể tiếp tục y lệnh');
            }
        } catch (err) {
            console.error('Error resuming medication order:', err);
            setError(err.message || 'Không thể tiếp tục y lệnh');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({ resumeNotes: '' });
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        <FiPlay className="modal-icon resume-icon" />
                        <h2>Tiếp tục y lệnh</h2>
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
                            <label>Ghi chú tiếp tục (tùy chọn)</label>
                            <textarea
                                name="resumeNotes"
                                value={formData.resumeNotes}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Nhập ghi chú khi tiếp tục y lệnh..."
                            />
                        </div>

                        <div className="modal-actions">
                            <button type="button" onClick={handleClose} className="btn-cancel">
                                Hủy
                            </button>
                            <button type="submit" className="btn-submit btn-resume" disabled={submitting}>
                                <FiPlay />
                                {submitting ? 'Đang xử lý...' : 'Tiếp tục'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResumeMedicationModal;

