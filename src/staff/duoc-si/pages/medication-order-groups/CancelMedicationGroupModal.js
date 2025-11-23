import React, { useState } from 'react';
import { FiX, FiXCircle, FiAlertTriangle } from 'react-icons/fi';
import { medicationOrderGroupAPI } from '../../../../services/staff/pharmacistAPI';
import './MedicationGroupActionModals.css';

const CancelMedicationGroupModal = ({ isOpen, onClose, group, onSuccess }) => {
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
            setError('Vui lòng nhập lý do từ chối');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const response = await medicationOrderGroupAPI.cancelMedicationOrderGroup(
                group.medicationOrderGroupId,
                formData.reason
            );

            if (response && (response.status === 'OK' || response.code === 200 || response.code === 201)) {
                alert('Từ chối nhóm y lệnh thành công!');
                setFormData({ reason: '' });
                onSuccess();
                onClose();
            } else {
                setError(response?.message || 'Không thể từ chối nhóm y lệnh');
            }
        } catch (err) {
            console.error('Error canceling medication order group:', err);
            setError(err.message || 'Không thể từ chối nhóm y lệnh');
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
                        <FiXCircle className="modal-icon cancel-icon" />
                        <h2>Từ chối nhóm y lệnh</h2>
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
                        <span>Hành động này không thể hoàn tác. Nhóm y lệnh sẽ bị hủy và không thể xử lý tiếp.</span>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Lý do từ chối <span className="required">*</span></label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Nhập lý do từ chối nhóm y lệnh..."
                                required
                            />
                        </div>

                        <div className="modal-actions">
                            <button type="button" onClick={handleClose} className="btn-cancel">
                                Hủy
                            </button>
                            <button type="submit" className="btn-submit btn-reject" disabled={submitting}>
                                <FiXCircle />
                                {submitting ? 'Đang xử lý...' : 'Từ chối'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CancelMedicationGroupModal;

