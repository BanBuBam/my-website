import React, { useState } from 'react';
import { FiX, FiCheckCircle } from 'react-icons/fi';
import { medicationOrderGroupAPI } from '../../../../services/staff/pharmacistAPI';
import './MedicationGroupActionModals.css';

const VerifyMedicationGroupModal = ({ isOpen, onClose, group, onSuccess }) => {
    const [formData, setFormData] = useState({
        notes: ''
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

            const response = await medicationOrderGroupAPI.verifyMedicationOrderGroup(
                group.medicationOrderGroupId,
                formData.notes
            );

            if (response && (response.status === 'OK' || response.code === 200 || response.code === 201)) {
                alert('Phê duyệt nhóm y lệnh thành công!');
                setFormData({ notes: '' });
                onSuccess();
                onClose();
            } else {
                setError(response?.message || 'Không thể phê duyệt nhóm y lệnh');
            }
        } catch (err) {
            console.error('Error verifying medication order group:', err);
            setError(err.message || 'Không thể phê duyệt nhóm y lệnh');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({ notes: '' });
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        <FiCheckCircle className="modal-icon verify-icon" />
                        <h2>Phê duyệt nhóm y lệnh</h2>
                    </div>
                    <button className="modal-close" onClick={handleClose}>
                        <FiX />
                    </button>
                </div>

                <div className="modal-body">
                    {group && (
                        <div className="group-info">
                            <p><strong>Mã nhóm:</strong> #{group.medicationOrderGroupId}</p>
                            <p><strong>Bệnh nhân:</strong> {group.patientName}</p>
                            <p><strong>Bác sĩ chỉ định:</strong> {group.orderedByDoctorName}</p>
                            <p><strong>Số lượng thuốc:</strong> {group.medicationCount}</p>
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Ghi chú xác minh (tùy chọn)</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Nhập ghi chú xác minh (nếu có)..."
                            />
                        </div>

                        <div className="modal-actions">
                            <button type="button" onClick={handleClose} className="btn-cancel">
                                Hủy
                            </button>
                            <button type="submit" className="btn-submit btn-verify" disabled={submitting}>
                                <FiCheckCircle />
                                {submitting ? 'Đang xử lý...' : 'Phê duyệt'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VerifyMedicationGroupModal;

