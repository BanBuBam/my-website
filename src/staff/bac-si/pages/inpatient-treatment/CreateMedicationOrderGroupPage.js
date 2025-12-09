import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlusCircle, FiTrash2, FiSave, FiAlertCircle } from 'react-icons/fi';
import { medicationOrderAPI, medicineAPI, doctorInpatientTreatmentAPI } from '../../../../services/staff/doctorAPI';
import './CreateMedicationOrderGroupPage.css';

const CreateMedicationOrderGroupPage = () => {
    const { inpatientStayId } = useParams();
    const navigate = useNavigate();
    
    const [stay, setStay] = useState(null);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    
    const [formData, setFormData] = useState({
        priority: 'ROUTINE',
        isStat: false,
        orderNotes: ''
    });
    
    const [medications, setMedications] = useState([{
        medicineId: '',
        dosage: '',
        route: 'ORAL',
        frequency: 'BID',
        durationDays: '',
        quantityOrdered: '',
        isPrn: false,
        isStat: false,
        specialInstructions: ''
    }]);

    useEffect(() => {
        fetchData();
    }, [inpatientStayId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch stay details
            const stayResponse = await doctorInpatientTreatmentAPI.getInpatientStayDetail(inpatientStayId);
            if (stayResponse && stayResponse.data) {
                setStay(stayResponse.data);
            }
            
            // Fetch medicines
            const medicineResponse = await medicineAPI.getMedicines();
            if (medicineResponse && medicineResponse.data.content) {
                setMedicines(medicineResponse.data.content);
            }
        } catch (err) {
            console.error('Error loading data:', err);
            setError(err.message || 'Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleMedicationChange = (index, field, value) => {
        const updatedMedications = [...medications];
        updatedMedications[index][field] = value;
        setMedications(updatedMedications);
    };

    const addMedication = () => {
        setMedications([...medications, {
            medicineId: '',
            dosage: '',
            route: 'ORAL',
            frequency: 'BID',
            durationDays: '',
            quantityOrdered: '',
            isPrn: false,
            isStat: false,
            specialInstructions: ''
        }]);
    };

    const removeMedication = (index) => {
        if (medications.length > 1) {
            setMedications(medications.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!stay) {
            alert('Không tìm thấy thông tin điều trị nội trú');
            return;
        }
        
        const invalidMedication = medications.find(med => 
            !med.medicineId || !med.dosage || !med.durationDays || !med.quantityOrdered
        );
        
        if (invalidMedication) {
            alert('Vui lòng điền đầy đủ thông tin cho tất cả các thuốc');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const orderGroupData = {
                encounterId: stay.encounterId,
                inpatientStayId: parseInt(inpatientStayId),
                patientId: stay.patientId,
                priority: formData.priority,
                isStat: formData.isStat,
                orderNotes: formData.orderNotes,
                medications: medications.map(med => ({
                    medicineId: parseInt(med.medicineId),
                    dosage: med.dosage,
                    route: med.route,
                    frequency: med.frequency,
                    durationDays: parseInt(med.durationDays),
                    quantityOrdered: parseInt(med.quantityOrdered),
                    isPrn: med.isPrn,
                    isStat: med.isStat,
                    specialInstructions: med.specialInstructions
                }))
            };

            const response = await medicationOrderAPI.createMedicationOrderGroup(orderGroupData);
            
            if (response && (response.code === 200 || response.code === 201)) {
                alert('Tạo nhóm y lệnh thành công!');
                navigate(`/staff/bac-si/dieu-tri-noi-tru/${inpatientStayId}`);
            } else {
                setError(response?.message || 'Không thể tạo nhóm y lệnh');
            }
        } catch (err) {
            console.error('Error creating medication order group:', err);
            setError(err.message || 'Không thể tạo nhóm y lệnh');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="create-medication-order-group-page">
                <div className="loading-state">
                    <p>Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error && !stay) {
        return (
            <div className="create-medication-order-group-page">
                <div className="error-state">
                    <FiAlertCircle />
                    <p>{error}</p>
                    <button onClick={() => navigate(-1)} className="btn-back">
                        <FiArrowLeft /> Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="create-medication-order-group-page">
            {/* Header */}
            <div className="page-header">
                <button onClick={() => navigate(-1)} className="btn-back">
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-content">
                    <FiPlusCircle className="header-icon" />
                    <div>
                        <h1>Tạo nhóm y lệnh</h1>
                        <p>Bệnh nhân: {stay?.patientName} - {stay?.patientCode}</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    <FiAlertCircle />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Group Information */}
                <div className="form-section">
                    <h2>Thông tin nhóm y lệnh</h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Mức độ ưu tiên <span className="required">*</span></label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleFormChange}
                                required
                            >
                                <option value="ROUTINE">ROUTINE - Thường quy</option>
                                <option value="URGENT">URGENT - Khẩn cấp</option>
                                <option value="STAT">STAT - Cấp cứu</option>
                            </select>
                        </div>
                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="isStat"
                                    checked={formData.isStat}
                                    onChange={handleFormChange}
                                />
                                <span>Is STAT (Cấp cứu)</span>
                            </label>
                        </div>
                        <div className="form-group full-width">
                            <label>Ghi chú y lệnh</label>
                            <textarea
                                name="orderNotes"
                                value={formData.orderNotes}
                                onChange={handleFormChange}
                                rows="3"
                                placeholder="Nhập ghi chú về nhóm y lệnh..."
                            />
                        </div>
                    </div>
                </div>

                {/* Medications List */}
                <div className="form-section">
                    <div className="section-header">
                        <h2>Danh sách thuốc</h2>
                        <button type="button" onClick={addMedication} className="btn-add-medication">
                            <FiPlusCircle /> Thêm thuốc
                        </button>
                    </div>

                    {medications.map((medication, index) => (
                        <div key={index} className="medication-item">
                            <div className="medication-header">
                                <h3>Thuốc #{index + 1}</h3>
                                {medications.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeMedication(index)}
                                        className="btn-remove"
                                    >
                                        <FiTrash2 /> Xóa
                                    </button>
                                )}
                            </div>
                            
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Thuốc <span className="required">*</span></label>
                                    <select
                                        value={medication.medicineId}
                                        onChange={(e) => handleMedicationChange(index, 'medicineId', e.target.value)}
                                        required
                                    >
                                        <option value="">-- Chọn thuốc --</option>
                                        {medicines.map(med => (
                                            <option key={med.medicineId} value={med.medicineId}>
                                                {med.medicineName} {med.sku ? `(${med.sku})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Liều lượng <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        value={medication.dosage}
                                        onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                                        placeholder="VD: 500mg"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Đường dùng <span className="required">*</span></label>
                                    <select
                                        value={medication.route}
                                        onChange={(e) => handleMedicationChange(index, 'route', e.target.value)}
                                        required
                                    >
                                        <option value="ORAL">ORAL - Uống</option>
                                        <option value="IV">IV - Tiêm tĩnh mạch</option>
                                        <option value="IM">IM - Tiêm bắp</option>
                                        <option value="SC">SC - Tiêm dưới da</option>
                                        <option value="TOPICAL">TOPICAL - Bôi ngoài da</option>
                                        <option value="INHALATION">INHALATION - Hít</option>
                                        <option value="RECTAL">RECTAL - Đặt hậu môn</option>
                                        <option value="OTHER">OTHER - Khác</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Tần suất <span className="required">*</span></label>
                                    <select
                                        value={medication.frequency}
                                        onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                                        required
                                    >
                                        <option value="QD">QD - Mỗi ngày 1 lần</option>
                                        <option value="BID">BID - Mỗi ngày 2 lần</option>
                                        <option value="TID">TID - Mỗi ngày 3 lần</option>
                                        <option value="QID">QID - Mỗi ngày 4 lần</option>
                                        <option value="Q4H">Q4H - Mỗi 4 giờ</option>
                                        <option value="Q6H">Q6H - Mỗi 6 giờ</option>
                                        <option value="Q8H">Q8H - Mỗi 8 giờ</option>
                                        <option value="Q12H">Q12H - Mỗi 12 giờ</option>
                                        <option value="PRN">PRN - Khi cần</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Số ngày điều trị <span className="required">*</span></label>
                                    <input
                                        type="number"
                                        value={medication.durationDays}
                                        onChange={(e) => handleMedicationChange(index, 'durationDays', e.target.value)}
                                        min="1"
                                        placeholder="VD: 7"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Số lượng <span className="required">*</span></label>
                                    <input
                                        type="number"
                                        value={medication.quantityOrdered}
                                        onChange={(e) => handleMedicationChange(index, 'quantityOrdered', e.target.value)}
                                        min="1"
                                        placeholder="VD: 21"
                                        required
                                    />
                                </div>

                                <div className="form-group checkbox-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={medication.isPrn}
                                            onChange={(e) => handleMedicationChange(index, 'isPrn', e.target.checked)}
                                        />
                                        <span>Is PRN (Khi cần)</span>
                                    </label>
                                </div>

                                <div className="form-group checkbox-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={medication.isStat}
                                            onChange={(e) => handleMedicationChange(index, 'isStat', e.target.checked)}
                                        />
                                        <span>Is STAT (Cấp cứu)</span>
                                    </label>
                                </div>

                                <div className="form-group full-width">
                                    <label>Hướng dẫn đặc biệt</label>
                                    <textarea
                                        value={medication.specialInstructions}
                                        onChange={(e) => handleMedicationChange(index, 'specialInstructions', e.target.value)}
                                        rows="2"
                                        placeholder="Nhập hướng dẫn đặc biệt..."
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit Buttons */}
                <div className="form-actions">
                    <button type="button" onClick={() => navigate(-1)} className="btn-cancel">
                        Hủy
                    </button>
                    <button type="submit" className="btn-submit" disabled={submitting}>
                        <FiSave />
                        {submitting ? 'Đang tạo...' : 'Tạo nhóm y lệnh'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateMedicationOrderGroupPage;

