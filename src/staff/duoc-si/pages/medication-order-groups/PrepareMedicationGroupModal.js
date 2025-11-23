import React, { useState } from 'react';
import { FiX, FiClock } from 'react-icons/fi';
import { medicationOrderGroupAPI } from '../../../../services/staff/pharmacistAPI';
import './MedicationGroupActionModals.css';

const PrepareMedicationGroupModal = ({ isOpen, onClose, group, onSuccess }) => {
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

            const response = await medicationOrderGroupAPI.prepareMedicationOrderGroup(
                group.medicationOrderGroupId,
                formData.notes
            );

            if (response && (response.status === 'OK' || response.code === 200 || response.code === 201)) {
                alert('Chuẩn bị nhóm y lệnh thành công!');
                setFormData({ notes: '' });
                onSuccess();
                onClose();
            } else {
                setError(response?.message || 'Không thể chuẩn bị nhóm y lệnh');
            }
        } catch (err) {
            console.error('Error preparing medication order group:', err);
            setError(err.message || 'Không thể chuẩn bị nhóm y lệnh');
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
                        <FiClock className="modal-icon prepare-icon" />
                        <h2>Chuẩn bị nhóm y lệnh</h2>
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
                            <label>Ghi chú chuẩn bị (tùy chọn)</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Nhập ghi chú về quá trình chuẩn bị (nếu có)..."
                            />
                        </div>

                        <div className="modal-actions">
                            <button type="button" onClick={handleClose} className="btn-cancel">
                                Hủy
                            </button>
                            <button type="submit" className="btn-submit btn-prepare" disabled={submitting}>
                                <FiClock />
                                {submitting ? 'Đang xử lý...' : 'Chuẩn bị'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PrepareMedicationGroupModal;

