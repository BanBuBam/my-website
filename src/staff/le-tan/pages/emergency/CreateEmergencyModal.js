import React, { useState, useEffect } from 'react';
import { receptionistEmergencyAPI, receptionistDepartmentAPI, receptionistEmployeeAPI } from '../../../../services/staff/receptionistAPI';
import { FiX, FiSave, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import './CreateEmergencyModal.css';

const CreateEmergencyModal = ({ encounterId, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [nurses, setNurses] = useState([]);
    const [doctors, setDoctors] = useState([]);

    const [formData, setFormData] = useState({
        encounterId: encounterId,
        emergencyCategory: 'URGENT',
        chiefComplaint: '',
        arrivalMethod: 'WALK_IN',
        arrivalTime: new Date().toISOString().slice(0, 16),
        accompaniedBy: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        initialAssessment: '',
        vitalSigns: '',
        painScore: 0,
        triageNurseId: '',
        assignedDoctorId: '',
        status: 'WAITING',
        hasInsurance: false,
        insuranceCardNumber: '',
        insuranceCoveragePercent: 0,
    });

    useEffect(() => {
        fetchDepartments();
        fetchNurses();
        fetchDoctors();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await receptionistDepartmentAPI.getDepartments();
            if (response && response.data) {
                setDepartments(response.data);
            }
        } catch (err) {
            console.error('Error fetching departments:', err);
        }
    };

    const fetchNurses = async () => {
        try {
            const response = await receptionistEmployeeAPI.getNurses();
            if (response && response.data) {
                const nursesData = response.data.content || response.data;
                setNurses(nursesData);
            }
        } catch (err) {
            console.error('Error fetching nurses:', err);
        }
    };

    const fetchDoctors = async () => {
        try {
            const response = await receptionistEmployeeAPI.getDoctors();
            if (response && response.data) {
                const doctorsData = response.data.content || response.data;
                setDoctors(doctorsData);
            }
        } catch (err) {
            console.error('Error fetching doctors:', err);
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

        if (!formData.chiefComplaint) {
            setError('Vui lòng nhập lý do khám');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const submitData = {
                ...formData,
                encounterId: parseInt(encounterId),
                painScore: parseInt(formData.painScore) || 0,
                triageNurseId: formData.triageNurseId ? parseInt(formData.triageNurseId) : null,
                assignedDoctorId: formData.assignedDoctorId ? parseInt(formData.assignedDoctorId) : null,
                insuranceCoveragePercent: parseFloat(formData.insuranceCoveragePercent) || 0,
            };

            const response = await receptionistEmergencyAPI.createEmergencyFromEncounter(submitData);

            if (response && response.data) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess(response.data);
                    onClose();
                }, 1500);
            }
        } catch (err) {
            console.error('Error creating emergency:', err);
            setError(err.message || 'Không thể tạo emergency');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content create-emergency-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Tạo Emergency từ Encounter #{encounterId}</h3>
                    <button className="btn-close" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                {error && (
                    <div className="error-message">
                        <FiAlertCircle />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="success-message">
                        <FiCheckCircle />
                        <span>Tạo emergency thành công!</span>
                    </div>
                )}

                <form className="modal-body" onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h4>Thông tin cấp cứu</h4>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Phân loại cấp cứu <span className="required">*</span></label>
                                <select name="emergencyCategory" value={formData.emergencyCategory} onChange={handleChange} required>
                                    <option value="RESUSCITATION">Hồi sức (Đỏ)</option>
                                    <option value="EMERGENCY">Cấp cứu (Cam)</option>
                                    <option value="URGENT">Khẩn (Vàng)</option>
                                    <option value="LESS_URGENT">Ít khẩn (Xanh lá)</option>
                                    <option value="NON_URGENT">Không khẩn (Xanh dương)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Phương thức đến</label>
                                <select name="arrivalMethod" value={formData.arrivalMethod} onChange={handleChange}>
                                    <option value="WALK_IN">Đi bộ</option>
                                    <option value="AMBULANCE">Xe cấp cứu</option>
                                    <option value="HELICOPTER">Trực thăng</option>
                                    <option value="POLICE">Công an đưa đến</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Thời gian đến</label>
                                <input
                                    type="datetime-local"
                                    name="arrivalTime"
                                    value={formData.arrivalTime}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Điểm đau (0-10)</label>
                                <input
                                    type="number"
                                    name="painScore"
                                    value={formData.painScore}
                                    onChange={handleChange}
                                    min="0"
                                    max="10"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Lý do khám <span className="required">*</span></label>
                                <textarea
                                    name="chiefComplaint"
                                    value={formData.chiefComplaint}
                                    onChange={handleChange}
                                    placeholder="Nhập lý do khám"
                                    rows="3"
                                    required
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Đánh giá ban đầu</label>
                                <textarea
                                    name="initialAssessment"
                                    value={formData.initialAssessment}
                                    onChange={handleChange}
                                    placeholder="Nhập đánh giá ban đầu"
                                    rows="3"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Dấu hiệu sinh tồn</label>
                                <textarea
                                    name="vitalSigns"
                                    value={formData.vitalSigns}
                                    onChange={handleChange}
                                    placeholder="Nhập dấu hiệu sinh tồn"
                                    rows="2"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h4>Thông tin liên hệ</h4>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Người đi cùng</label>
                                <input
                                    type="text"
                                    name="accompaniedBy"
                                    value={formData.accompaniedBy}
                                    onChange={handleChange}
                                    placeholder="Nhập tên người đi cùng"
                                />
                            </div>

                            <div className="form-group">
                                <label>Tên người liên hệ khẩn cấp</label>
                                <input
                                    type="text"
                                    name="emergencyContactName"
                                    value={formData.emergencyContactName}
                                    onChange={handleChange}
                                    placeholder="Nhập tên người liên hệ"
                                />
                            </div>

                            <div className="form-group">
                                <label>SĐT người liên hệ</label>
                                <input
                                    type="tel"
                                    name="emergencyContactPhone"
                                    value={formData.emergencyContactPhone}
                                    onChange={handleChange}
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h4>Phân công nhân viên</h4>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Y tá phân loại</label>
                                <select name="triageNurseId" value={formData.triageNurseId} onChange={handleChange}>
                                    <option value="">-- Chọn y tá --</option>
                                    {nurses.map(nurse => (
                                        <option key={nurse.employeeId} value={nurse.employeeId}>
                                            {nurse.fullName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Bác sĩ phụ trách</label>
                                <select name="assignedDoctorId" value={formData.assignedDoctorId} onChange={handleChange}>
                                    <option value="">-- Chọn bác sĩ --</option>
                                    {doctors.map(doctor => (
                                        <option key={doctor.employeeId} value={doctor.employeeId}>
                                            {doctor.fullName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h4>Bảo hiểm y tế</h4>
                        <div className="form-grid">
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="hasInsurance"
                                        checked={formData.hasInsurance}
                                        onChange={handleChange}
                                    />
                                    <span>Có bảo hiểm y tế</span>
                                </label>
                            </div>

                            {formData.hasInsurance && (
                                <>
                                    <div className="form-group">
                                        <label>Số thẻ BHYT</label>
                                        <input
                                            type="text"
                                            name="insuranceCardNumber"
                                            value={formData.insuranceCardNumber}
                                            onChange={handleChange}
                                            placeholder="Nhập số thẻ BHYT"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Tỷ lệ chi trả (%)</label>
                                        <input
                                            type="number"
                                            name="insuranceCoveragePercent"
                                            value={formData.insuranceCoveragePercent}
                                            onChange={handleChange}
                                            min="0"
                                            max="100"
                                            step="0.1"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Hủy
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            <FiSave /> {loading ? 'Đang lưu...' : 'Tạo Emergency'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEmergencyModal;
