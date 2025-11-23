import React, { useState } from 'react';
import { FiX, FiTruck } from 'react-icons/fi';
import { medicationOrderGroupAPI } from '../../../../services/staff/pharmacistAPI';
import './MedicationGroupActionModals.css';

const DispenseMedicationGroupModal = ({ isOpen, onClose, group, onSuccess }) => {
    const [formData, setFormData] = useState({
        nurseId: '',
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

        if (!formData.nurseId.trim()) {
            setError('Vui lòng nhập mã điều dưỡng nhận thuốc');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const response = await medicationOrderGroupAPI.dispenseMedicationOrderGroup(
                group.medicationOrderGroupId,
                formData.nurseId,
                formData.notes
            );

            if (response && (response.status === 'OK' || response.code === 200 || response.code === 201)) {
                alert('Xuất kho nhóm y lệnh thành công!');
                setFormData({ nurseId: '', notes: '' });
                onSuccess();
                onClose();
            } else {
                setError(response?.message || 'Không thể xuất kho nhóm y lệnh');
            }
        } catch (err) {
            console.error('Error dispensing medication order group:', err);
            setError(err.message || 'Không thể xuất kho nhóm y lệnh');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({ nurseId: '', notes: '' });
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        <FiTruck className="modal-icon dispense-icon" />
                        <h2>Xuất kho nhóm y lệnh</h2>
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
                            <label>Mã điều dưỡng nhận thuốc <span className="required">*</span></label>
                            <input
                                type="text"
                                name="nurseId"
                                value={formData.nurseId}
                                onChange={handleChange}
                                placeholder="Nhập mã điều dưỡng..."
                                required
                            />
                            <span className="form-hint">Nhập mã ID của điều dưỡng sẽ nhận thuốc</span>
                        </div>

                        <div className="form-group">
                            <label>Ghi chú xuất kho (tùy chọn)</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Nhập ghi chú về việc xuất kho (nếu có)..."
                            />
                        </div>

                        <div className="modal-actions">
                            <button type="button" onClick={handleClose} className="btn-cancel">
                                Hủy
                            </button>
                            <button type="submit" className="btn-submit btn-dispense" disabled={submitting}>
                                <FiTruck />
                                {submitting ? 'Đang xử lý...' : 'Xuất kho'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DispenseMedicationGroupModal;

