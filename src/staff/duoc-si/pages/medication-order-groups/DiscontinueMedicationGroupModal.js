import React, { useState } from 'react';
import { FiX, FiPause, FiAlertTriangle } from 'react-icons/fi';
import { medicationOrderGroupAPI } from '../../../../services/staff/pharmacistAPI';
import './MedicationGroupActionModals.css';

const DiscontinueMedicationGroupModal = ({ isOpen, onClose, group, onSuccess }) => {
    const [formData, setFormData] = useState({
        reason: ''
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

        if (!formData.reason.trim()) {
            setError('Vui lòng nhập lý do tạm dừng');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const response = await medicationOrderGroupAPI.discontinueMedicationOrderGroup(
                group.medicationOrderGroupId,
                formData.reason
            );

            if (response && (response.status === 'OK' || response.code === 200 || response.code === 201)) {
                alert('Tạm dừng nhóm y lệnh thành công!');
                setFormData({ reason: '' });
                onSuccess();
                onClose();
            } else {
                setError(response?.message || 'Không thể tạm dừng nhóm y lệnh');
            }
        } catch (err) {
            console.error('Error discontinuing medication order group:', err);
            setError(err.message || 'Không thể tạm dừng nhóm y lệnh');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({ reason: '' });
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        <FiPause className="modal-icon discontinue-icon" />
                        <h2>Tạm dừng nhóm y lệnh</h2>
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

                    <div className="warning-message">
                        <FiAlertTriangle />
                        <span>Tạm dừng nhóm y lệnh sẽ ngừng xử lý tất cả các thuốc trong nhóm này.</span>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Lý do tạm dừng <span className="required">*</span></label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Nhập lý do tạm dừng nhóm y lệnh..."
                                required
                            />
                        </div>

                        <div className="modal-actions">
                            <button type="button" onClick={handleClose} className="btn-cancel">
                                Hủy
                            </button>
                            <button type="submit" className="btn-submit btn-discontinue" disabled={submitting}>
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

export default DiscontinueMedicationGroupModal;

