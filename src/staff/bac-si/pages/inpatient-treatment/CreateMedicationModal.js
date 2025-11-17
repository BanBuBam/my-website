import React, { useState, useEffect } from 'react';
import { doctorInpatientTreatmentAPI } from '../../../../services/staff/doctorAPI';
import { FiX, FiAlertCircle, FiCheck, FiPlusCircle } from 'react-icons/fi';
import './CreateMedicationModal.css';

const CreateMedicationModal = ({ isOpen, onClose, inpatientStayId, encounterId, onSuccess }) => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [selectedPrescriptionItem, setSelectedPrescriptionItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        scheduledDatetime: '',
        dosage: '',
        routeOfAdministration: 'Uống',
        frequency: '',
        administrationNotes: '',
    });

    useEffect(() => {
        if (isOpen && encounterId) {
            fetchPrescriptions();
        }
    }, [isOpen, encounterId]);

    const fetchPrescriptions = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await doctorInpatientTreatmentAPI.getPrescriptionsByEncounter(encounterId);
            if (response && response.data) {
                setPrescriptions(response.data);
            } else {
                setPrescriptions([]);
            }
        } catch (err) {
            console.error('Error loading prescriptions:', err);
            setError(err.message || 'Không thể tải danh sách đơn thuốc');
            setPrescriptions([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePrescriptionItemSelect = (item) => {
        setSelectedPrescriptionItem(item);
        // Pre-fill form with prescription item data
        setFormData({
            ...formData,
            dosage: item.dosage || '',
            administrationNotes: item.notes || '',
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedPrescriptionItem) {
            setError('Vui lòng chọn thuốc từ đơn thuốc');
            return;
        }

        if (!formData.scheduledDatetime) {
            setError('Vui lòng chọn thời gian dự kiến');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const medicationData = {
                inpatientStayId: inpatientStayId,
                prescriptionItemId: selectedPrescriptionItem.prescriptionItemId,
                scheduledDatetime: formData.scheduledDatetime,
                dosage: formData.dosage,
                routeOfAdministration: formData.routeOfAdministration,
                frequency: formData.frequency,
                administrationNotes: formData.administrationNotes,
            };

            const response = await doctorInpatientTreatmentAPI.createInpatientMedication(medicationData);
            
            if (response && response.code === 200 || response.code === 201) {
                // Success
                if (onSuccess) {
                    onSuccess();
                }
                handleClose();
            } else {
                setError(response?.message || 'Không thể tạo lượt thuốc điều trị');
            }
        } catch (err) {
            console.error('Error creating medication:', err);
            setError(err.message || 'Không thể tạo lượt thuốc điều trị');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setSelectedPrescriptionItem(null);
        setFormData({
            scheduledDatetime: '',
            dosage: '',
            routeOfAdministration: 'Uống',
            frequency: '',
            administrationNotes: '',
        });
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    // Get current datetime for min attribute
    const getCurrentDatetime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content medication-modal" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="modal-header">
                    <h2>
                        <FiPlusCircle /> Tạo lượt thuốc điều trị
                    </h2>
                    <button className="btn-close" onClick={handleClose}>
                        <FiX />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="modal-body">
                    {error && (
                        <div className="alert alert-error">
                            <FiAlertCircle />
                            <span>{error}</span>
                        </div>
                    )}

                    {loading ? (
                        <div className="loading-section">
                            <p>Đang tải danh sách đơn thuốc...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {/* Prescription Items Selection */}
                            <div className="form-section">
                                <h3>Chọn thuốc từ đơn thuốc</h3>
                                {prescriptions.length === 0 ? (
                                    <div className="empty-message">
                                        <FiAlertCircle />
                                        <p>Không có đơn thuốc nào cho lượt khám này</p>
                                    </div>
                                ) : (
                                    <div className="prescription-items-list">
                                        {prescriptions.map((prescription) => (
                                            prescription.items && prescription.items.map((item) => (
                                                <div
                                                    key={item.prescriptionItemId}
                                                    className={`prescription-item ${selectedPrescriptionItem?.prescriptionItemId === item.prescriptionItemId ? 'selected' : ''}`}
                                                    onClick={() => handlePrescriptionItemSelect(item)}
                                                >
                                                    <div className="item-header">
                                                        <div className="radio-indicator">
                                                            {selectedPrescriptionItem?.prescriptionItemId === item.prescriptionItemId && <FiCheck />}
                                                        </div>
                                                        <div className="item-info">
                                                            <h4>{item.medicineName}</h4>
                                                            <p className="item-details">
                                                                Liều lượng: {item.dosage} | Số lượng: {item.quantity}
                                                            </p>
                                                            {item.notes && (
                                                                <p className="item-notes">Ghi chú: {item.notes}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Medication Details Form */}
                            {selectedPrescriptionItem && (
                                <div className="form-section">
                                    <h3>Thông tin lượt thuốc</h3>
                                    
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Thời gian dự kiến <span className="required">*</span></label>
                                            <input
                                                type="datetime-local"
                                                name="scheduledDatetime"
                                                value={formData.scheduledDatetime}
                                                onChange={handleInputChange}
                                                min={getCurrentDatetime()}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Liều lượng <span className="required">*</span></label>
                                            <input
                                                type="text"
                                                name="dosage"
                                                value={formData.dosage}
                                                onChange={handleInputChange}
                                                placeholder="VD: 1 viên/lần, 2 lần/ngày"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Đường dùng <span className="required">*</span></label>
                                            <select
                                                name="routeOfAdministration"
                                                value={formData.routeOfAdministration}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="Uống">Uống</option>
                                                <option value="Tiêm">Tiêm</option>
                                                <option value="Bôi">Bôi</option>
                                                <option value="Nhỏ mắt">Nhỏ mắt</option>
                                                <option value="Nhỏ tai">Nhỏ tai</option>
                                                <option value="Xịt mũi">Xịt mũi</option>
                                                <option value="Đặt">Đặt</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Tần suất <span className="required">*</span></label>
                                            <input
                                                type="text"
                                                name="frequency"
                                                value={formData.frequency}
                                                onChange={handleInputChange}
                                                placeholder="VD: 2 lần/ngày, 3 lần/ngày"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Ghi chú sử dụng</label>
                                            <textarea
                                                name="administrationNotes"
                                                value={formData.administrationNotes}
                                                onChange={handleInputChange}
                                                placeholder="VD: Uống sau bữa ăn"
                                                rows="3"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Modal Footer */}
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleClose}>
                                    Hủy
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary" 
                                    disabled={submitting || !selectedPrescriptionItem}
                                >
                                    {submitting ? 'Đang tạo...' : 'Tạo lượt thuốc'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateMedicationModal;

