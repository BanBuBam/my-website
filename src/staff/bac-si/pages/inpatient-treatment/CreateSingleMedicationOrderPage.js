import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiAlertCircle, FiPackage } from 'react-icons/fi';
import { medicationOrderAPI, medicineAPI, doctorInpatientTreatmentAPI } from '../../../../services/staff/doctorAPI';
import './CreateSingleMedicationOrderPage.css';

const CreateSingleMedicationOrderPage = () => {
    const { inpatientStayId } = useParams();
    const navigate = useNavigate();
    
    const [stay, setStay] = useState(null);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    
    const [formData, setFormData] = useState({
        medicineId: '',
        dosage: '',
        route: 'ORAL',
        frequency: 'BID',
        orderType: 'INPATIENT',
        durationDays: '',
        scheduledDatetime: '',
        priority: 'ROUTINE',
        isPrn: false,
        isStat: false,
        quantityOrdered: '',
        specialInstructions: ''
    });

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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!stay) {
            alert('Không tìm thấy thông tin điều trị nội trú');
            return;
        }
        
        if (!formData.medicineId || !formData.dosage || !formData.durationDays || 
            !formData.quantityOrdered || !formData.scheduledDatetime) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const orderData = {
                encounterId: stay.encounterId,
                inpatientStayId: parseInt(inpatientStayId),
                patientId: stay.patientId,
                medicineId: parseInt(formData.medicineId),
                dosage: formData.dosage,
                route: formData.route,
                frequency: formData.frequency,
                orderType: formData.orderType,
                durationDays: parseInt(formData.durationDays),
                scheduledDatetime: formData.scheduledDatetime,
                priority: formData.priority,
                isPrn: formData.isPrn,
                isStat: formData.isStat,
                quantityOrdered: parseInt(formData.quantityOrdered),
                specialInstructions: formData.specialInstructions
            };

            const response = await medicationOrderAPI.createSingleMedicationOrder(orderData);
            
            if (response && (response.code === 200 || response.code === 201)) {
                alert('Tạo y lệnh thành công!');
                navigate(`/staff/bac-si/dieu-tri-noi-tru/${inpatientStayId}`);
            } else {
                setError(response?.message || 'Không thể tạo y lệnh');
            }
        } catch (err) {
            console.error('Error creating medication order:', err);
            setError(err.message || 'Không thể tạo y lệnh');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="create-single-medication-order-page">
                <div className="loading-state">
                    <p>Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error && !stay) {
        return (
            <div className="create-single-medication-order-page">
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
        <div className="create-single-medication-order-page">
            {/* Header */}
            <div className="page-header">
                <button onClick={() => navigate(-1)} className="btn-back">
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-content">
                    <FiPackage className="header-icon" />
                    <div>
                        <h1>Thêm y lệnh lẻ</h1>
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
                <div className="form-section">
                    <h2>Thông tin y lệnh</h2>
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Thuốc <span className="required">*</span></label>
                            <select
                                name="medicineId"
                                value={formData.medicineId}
                                onChange={handleChange}
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
                                name="dosage"
                                value={formData.dosage}
                                onChange={handleChange}
                                placeholder="VD: 500mg"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Đường dùng <span className="required">*</span></label>
                            <select
                                name="route"
                                value={formData.route}
                                onChange={handleChange}
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
                                name="frequency"
                                value={formData.frequency}
                                onChange={handleChange}
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
                            <label>Loại y lệnh</label>
                            <input
                                type="text"
                                name="orderType"
                                value={formData.orderType}
                                readOnly
                                className="readonly-input"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Số ngày điều trị <span className="required">*</span></label>
                            <input
                                type="number"
                                name="durationDays"
                                value={formData.durationDays}
                                onChange={handleChange}
                                min="1"
                                placeholder="VD: 7"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Thời gian thực hiện <span className="required">*</span></label>
                            <input
                                type="datetime-local"
                                name="scheduledDatetime"
                                value={formData.scheduledDatetime}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Mức độ ưu tiên <span className="required">*</span></label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                required
                            >
                                <option value="ROUTINE">ROUTINE - Thường quy</option>
                                <option value="URGENT">URGENT - Khẩn cấp</option>
                                <option value="STAT">STAT - Cấp cứu</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Số lượng <span className="required">*</span></label>
                            <input
                                type="number"
                                name="quantityOrdered"
                                value={formData.quantityOrdered}
                                onChange={handleChange}
                                min="1"
                                placeholder="VD: 21"
                                required
                            />
                        </div>

                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="isPrn"
                                    checked={formData.isPrn}
                                    onChange={handleChange}
                                />
                                <span>Is PRN (Khi cần)</span>
                            </label>
                        </div>

                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="isStat"
                                    checked={formData.isStat}
                                    onChange={handleChange}
                                />
                                <span>Is STAT (Cấp cứu)</span>
                            </label>
                        </div>

                        <div className="form-group full-width">
                            <label>Hướng dẫn đặc biệt</label>
                            <textarea
                                name="specialInstructions"
                                value={formData.specialInstructions}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Nhập hướng dẫn đặc biệt..."
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="form-actions">
                    <button type="button" onClick={() => navigate(-1)} className="btn-cancel">
                        Hủy
                    </button>
                    <button type="submit" className="btn-submit" disabled={submitting}>
                        <FiSave />
                        {submitting ? 'Đang tạo...' : 'Tạo y lệnh'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateSingleMedicationOrderPage;

