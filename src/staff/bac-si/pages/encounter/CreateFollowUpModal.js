import React, { useState } from 'react';
import { doctorFollowUpAPI } from '../../../../services/staff/doctorAPI';
import { FiX, FiCalendar, FiCheck } from 'react-icons/fi';
import './CreateFollowUpModal.css';

const CreateFollowUpModal = ({ isOpen, onClose, encounterId, onSuccess }) => {
    const [formData, setFormData] = useState({
        reExaminationDate: '',
        reason: '',
        doctorEmployeeId: '',
        notes: '',
        priority: 'ROUTINE',
        urgent: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.reExaminationDate || !formData.reason) {
            setError('Vui lòng nhập đầy đủ thông tin bắt buộc');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const employeeId = localStorage.getItem('employeeId');
            const submitData = {
                ...formData,
                doctorEmployeeId: formData.doctorEmployeeId || parseInt(employeeId),
            };

            const response = await doctorFollowUpAPI.createFollowUpForEncounter(encounterId, submitData);
            if (response && response.data) {
                alert('Tạo lịch tái khám thành công!');
                if (onSuccess) onSuccess(response.data);
                handleClose();
            }
        } catch (err) {
            setError(err.message || 'Không thể tạo lịch tái khám');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            reExaminationDate: '',
            reason: '',
            doctorEmployeeId: '',
            notes: '',
            priority: 'ROUTINE',
            urgent: false,
        });
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content create-follow-up-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3><FiCalendar /> Hẹn tái khám</h3>
                    <button className="btn-close" onClick={handleClose}>
                        <FiX />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label>Ngày tái khám <span className="required">*</span></label>
                        <input
                            type="date"
                            name="reExaminationDate"
                            value={formData.reExaminationDate}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Lý do <span className="required">*</span></label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            rows="3"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Độ ưu tiên</label>
                        <select name="priority" value={formData.priority} onChange={handleChange}>
                            <option value="ROUTINE">Thường</option>
                            <option value="URGENT">Khẩn</option>
                            <option value="ASAP">Càng sớm càng tốt</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Ghi chú</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="2"
                        />
                    </div>
                    <div className="form-group checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                name="urgent"
                                checked={formData.urgent}
                                onChange={handleChange}
                            />
                            <span>Khẩn cấp</span>
                        </label>
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={handleClose}>
                            Hủy
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Đang xử lý...' : <><FiCheck /> Tạo lịch</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateFollowUpModal;
