import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorEmergencyAPI, patientListAPI, departmentAPI, employeeAPI } from '../../../../services/staff/doctorAPI';
import { FiAlertCircle, FiSave, FiX, FiCheckCircle, FiSearch, FiUser } from 'react-icons/fi';
import './CreateEmergencyPage.css';

const CreateEmergencyPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Patient search state
    const [showPatientSearch, setShowPatientSearch] = useState(false);
    const [patientSearchQuery, setPatientSearchQuery] = useState('');
    const [searchingPatients, setSearchingPatients] = useState(false);
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);

    // Dropdown data
    const [departments, setDepartments] = useState([]);
    const [nurses, setNurses] = useState([]);
    const [doctors, setDoctors] = useState([]);

    const [formData, setFormData] = useState({
        patientId: '',
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
        departmentId: '',
        hasInsurance: false,
        insuranceCardNumber: '',
    });

    const emergencyCategories = [
        { value: 'RESUSCITATION', label: 'Hồi sức - Cấp cứu (Đỏ)' },
        { value: 'EMERGENCY', label: 'Khẩn cấp (Cam)' },
        { value: 'URGENT', label: 'Cấp bách (Vàng)' },
        { value: 'SEMI_URGENT', label: 'Bán cấp (Xanh lá)' },
        { value: 'NON_URGENT', label: 'Không cấp (Xanh dương)' },
    ];

    const arrivalMethods = [
        { value: 'AMBULANCE', label: 'Xe cứu thương' },
        { value: 'WALK_IN', label: 'Tự đến' },
        { value: 'POLICE', label: 'Cảnh sát đưa đến' },
        { value: 'HELICOPTER', label: 'Trực thăng' },
        { value: 'TRANSFERRED', label: 'Chuyển viện' },
    ];

    // Load departments, nurses, and doctors on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                // Load departments
                const deptResponse = await departmentAPI.getDepartments();
                if (deptResponse && deptResponse.data.content) {
                    setDepartments(deptResponse.data.content);
                }

                // Load nurses
                const nurseResponse = await employeeAPI.getNurses(0, 100);
                if (nurseResponse && nurseResponse.data && nurseResponse.data.content) {
                    setNurses(nurseResponse.data.content.filter(n => n.isActive));
                }

                // Don't load doctors initially - will load when department is selected
            } catch (err) {
                console.error('Error loading data:', err);
            }
        };
        loadData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // When department changes, load doctors for that department
        if (name === 'departmentId' && value) {
            loadDoctorsByDepartment(value);
        }
    };

    const loadDoctorsByDepartment = async (departmentId) => {
        try {
            const response = await employeeAPI.getDoctorsByDepartment(departmentId);
            if (response && response.data) {
                setDoctors(response.data.filter(d => d.isActive));
            }
        } catch (err) {
            console.error('Error loading doctors by department:', err);
            setDoctors([]);
        }
    };

    const handleOpenPatientSearch = () => {
        setShowPatientSearch(true);
        setPatientSearchQuery('');
        setPatients([]);
    };

    const handleClosePatientSearch = () => {
        setShowPatientSearch(false);
        setPatientSearchQuery('');
        setPatients([]);
    };

    const handleSearchPatients = async () => {
        if (!patientSearchQuery || patientSearchQuery.length < 2) {
            return;
        }

        try {
            setSearchingPatients(true);
            const response = await patientListAPI.searchPatientsByName(patientSearchQuery, 0, 10);
            if (response && response.data && response.data.content) {
                setPatients(response.data.content);
            }
        } catch (err) {
            console.error('Error searching patients:', err);
        } finally {
            setSearchingPatients(false);
        }
    };

    const handleSelectPatient = (patient) => {
        setSelectedPatient(patient);
        setFormData(prev => ({
            ...prev,
            patientId: patient.patientId.toString(),
            emergencyContactName: patient.emergencyContactName || '',
            emergencyContactPhone: patient.emergencyContactPhone || '',
            hasInsurance: !!patient.insuranceCardNumber,
            insuranceCardNumber: patient.insuranceCardNumber || '',
        }));
        handleClosePatientSearch();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.patientId) {
            setError('Vui lòng nhập Patient ID');
            return;
        }
        if (!formData.chiefComplaint) {
            setError('Vui lòng nhập lý do khám');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Prepare data
            const submitData = {
                patientId: parseInt(formData.patientId),
                emergencyCategory: formData.emergencyCategory,
                chiefComplaint: formData.chiefComplaint,
                arrivalMethod: formData.arrivalMethod,
                arrivalTime: formData.arrivalTime,
                accompaniedBy: formData.accompaniedBy || null,
                emergencyContactName: formData.emergencyContactName || null,
                emergencyContactPhone: formData.emergencyContactPhone || null,
                initialAssessment: formData.initialAssessment || null,
                vitalSigns: formData.vitalSigns || null,
                painScore: parseInt(formData.painScore) || 0,
                triageNurseId: formData.triageNurseId ? parseInt(formData.triageNurseId) : null,
                assignedDoctorId: formData.assignedDoctorId ? parseInt(formData.assignedDoctorId) : null,
                departmentId: formData.departmentId ? parseInt(formData.departmentId) : null,
                hasInsurance: formData.hasInsurance,
                insuranceCardNumber: formData.hasInsurance ? formData.insuranceCardNumber : null,
            };

            const response = await doctorEmergencyAPI.createEmergency(submitData);

            if (response && response.data) {
                setSuccess(true);
                // Navigate to detail page after 2 seconds
                setTimeout(() => {
                    navigate(`/staff/le-tan/cap-cuu/emergency/${response.data.emergencyEncounterId}`);
                }, 2000);
            }
        } catch (err) {
            console.error('Error creating emergency:', err);
            setError(err.message || 'Không thể tạo yêu cầu cấp cứu');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/staff/le-tan/cap-cuu');
    };

    if (success) {
        return (
            <div className="create-emergency-page">
                <div className="success-container">
                    <FiCheckCircle className="success-icon" />
                    <h2>Tạo yêu cầu cấp cứu thành công!</h2>
                    <p>Đang chuyển đến trang chi tiết...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="create-emergency-page">
            <div className="page-header">
                <div className="header-left">
                    <FiAlertCircle className="header-icon" />
                    <div>
                        <h1>Tạo Yêu cầu Cấp cứu Khẩn</h1>
                        <p>Nhập thông tin bệnh nhân cấp cứu</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    <FiAlertCircle />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="emergency-form">
                {/* Basic Information */}
                <div className="form-section">
                    <h3 className="section-title">Thông tin cơ bản</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="patientId">
                                Bệnh nhân <span className="required">*</span>
                            </label>
                            <div className="patient-search-container">
                                <input
                                    type="text"
                                    id="patientId"
                                    value={selectedPatient ? `${selectedPatient.fullName} - ${selectedPatient.patientCode}` : formData.patientId}
                                    readOnly
                                    placeholder="Nhấn nút tìm kiếm để chọn bệnh nhân"
                                    className="patient-display-input"
                                />
                                <button
                                    type="button"
                                    className="btn-search-patient"
                                    onClick={handleOpenPatientSearch}
                                >
                                    <FiSearch /> Tìm kiếm
                                </button>
                            </div>
                            {selectedPatient && (
                                <div className="selected-patient-info">
                                    <FiUser />
                                    <span>
                                        {selectedPatient.fullName} - {selectedPatient.patientCode}
                                        {selectedPatient.dateOfBirth && ` - ${new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear()} tuổi`}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="emergencyCategory">
                                Phân loại cấp cứu <span className="required">*</span>
                            </label>
                            <select
                                id="emergencyCategory"
                                name="emergencyCategory"
                                value={formData.emergencyCategory}
                                onChange={handleInputChange}
                                required
                            >
                                {emergencyCategories.map(cat => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="chiefComplaint">
                                Lý do khám / Triệu chứng <span className="required">*</span>
                            </label>
                            <textarea
                                id="chiefComplaint"
                                name="chiefComplaint"
                                value={formData.chiefComplaint}
                                onChange={handleInputChange}
                                required
                                rows="3"
                                placeholder="Mô tả lý do khám và triệu chứng chính"
                            />
                        </div>
                    </div>
                </div>

                {/* Arrival Information */}
                <div className="form-section">
                    <h3 className="section-title">Thông tin đến viện</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="arrivalMethod">Phương thức đến</label>
                            <select
                                id="arrivalMethod"
                                name="arrivalMethod"
                                value={formData.arrivalMethod}
                                onChange={handleInputChange}
                            >
                                {arrivalMethods.map(method => (
                                    <option key={method.value} value={method.value}>
                                        {method.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="arrivalTime">Thời gian đến</label>
                            <input
                                type="datetime-local"
                                id="arrivalTime"
                                name="arrivalTime"
                                value={formData.arrivalTime}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="accompaniedBy">Người đi cùng</label>
                            <input
                                type="text"
                                id="accompaniedBy"
                                name="accompaniedBy"
                                value={formData.accompaniedBy}
                                onChange={handleInputChange}
                                placeholder="Tên người đi cùng"
                            />
                        </div>
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="form-section">
                    <h3 className="section-title">Liên hệ khẩn cấp</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="emergencyContactName">Tên người liên hệ</label>
                            <input
                                type="text"
                                id="emergencyContactName"
                                name="emergencyContactName"
                                value={formData.emergencyContactName}
                                onChange={handleInputChange}
                                placeholder="Tên người liên hệ khẩn cấp"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="emergencyContactPhone">Số điện thoại</label>
                            <input
                                type="tel"
                                id="emergencyContactPhone"
                                name="emergencyContactPhone"
                                value={formData.emergencyContactPhone}
                                onChange={handleInputChange}
                                placeholder="Số điện thoại liên hệ"
                            />
                        </div>
                    </div>
                </div>

                {/* Medical Assessment */}
                <div className="form-section">
                    <h3 className="section-title">Đánh giá y tế</h3>
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label htmlFor="initialAssessment">Đánh giá ban đầu</label>
                            <textarea
                                id="initialAssessment"
                                name="initialAssessment"
                                value={formData.initialAssessment}
                                onChange={handleInputChange}
                                rows="3"
                                placeholder="Đánh giá tình trạng ban đầu của bệnh nhân"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="vitalSigns">Dấu hiệu sinh tồn</label>
                            <textarea
                                id="vitalSigns"
                                name="vitalSigns"
                                value={formData.vitalSigns}
                                onChange={handleInputChange}
                                rows="2"
                                placeholder="Huyết áp, nhịp tim, nhiệt độ, nhịp thở, SpO2..."
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="painScore">Điểm đau (0-10)</label>
                            <input
                                type="number"
                                id="painScore"
                                name="painScore"
                                value={formData.painScore}
                                onChange={handleInputChange}
                                min="0"
                                max="10"
                                placeholder="0"
                            />
                            <small>0 = Không đau, 10 = Đau cực độ</small>
                        </div>
                    </div>
                </div>

                {/* Staff Assignment */}
                <div className="form-section">
                    <h3 className="section-title">Phân công nhân viên</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="departmentId">Khoa</label>
                            <select
                                id="departmentId"
                                name="departmentId"
                                value={formData.departmentId}
                                onChange={handleInputChange}
                            >
                                <option value="">-- Chọn khoa --</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.departmentName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="triageNurseId">Y tá phân loại</label>
                            <select
                                id="triageNurseId"
                                name="triageNurseId"
                                value={formData.triageNurseId}
                                onChange={handleInputChange}
                            >
                                <option value="">-- Chọn y tá --</option>
                                {nurses.map(nurse => (
                                    <option key={nurse.id} value={nurse.id}>
                                        {nurse.fullName} - {nurse.employeeCode} ({nurse.departmentName})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="assignedDoctorId">Bác sĩ phụ trách</label>
                            <select
                                id="assignedDoctorId"
                                name="assignedDoctorId"
                                value={formData.assignedDoctorId}
                                onChange={handleInputChange}
                            >
                                <option value="">-- Chọn bác sĩ --</option>
                                {doctors.map(doctor => (
                                    <option key={doctor.id} value={doctor.id}>
                                        {doctor.fullName} - {doctor.employeeCode} ({doctor.specialization || doctor.departmentName})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Insurance Information */}
                <div className="form-section">
                    <h3 className="section-title">Thông tin bảo hiểm</h3>
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="hasInsurance"
                                    checked={formData.hasInsurance}
                                    onChange={handleInputChange}
                                />
                                <span>Có bảo hiểm y tế</span>
                            </label>
                        </div>

                        {formData.hasInsurance && (
                            <>
                                <div className="form-group full-width">
                                    <label htmlFor="insuranceCardNumber">Số thẻ BHYT</label>
                                    <input
                                        type="text"
                                        id="insuranceCardNumber"
                                        name="insuranceCardNumber"
                                        value={formData.insuranceCardNumber}
                                        onChange={handleInputChange}
                                        placeholder="Nhập số thẻ BHYT"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        <FiX /> Hủy
                    </button>
                    <button
                        type="submit"
                        className="btn-submit"
                        disabled={loading}
                    >
                        <FiSave />
                        {loading ? 'Đang tạo...' : 'Tạo yêu cầu cấp cứu'}
                    </button>
                </div>
            </form>

            {/* Patient Search Modal */}
            {showPatientSearch && (
                <div className="modal-overlay" onClick={handleClosePatientSearch}>
                    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                <FiSearch /> Tìm kiếm Bệnh nhân
                            </h3>
                            <button className="btn-close" onClick={handleClosePatientSearch}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="search-box">
                                <input
                                    type="text"
                                    value={patientSearchQuery}
                                    onChange={(e) => setPatientSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearchPatients()}
                                    placeholder="Nhập tên bệnh nhân..."
                                    autoFocus
                                />
                                <button
                                    className="btn-search"
                                    onClick={handleSearchPatients}
                                    disabled={searchingPatients || patientSearchQuery.length < 2}
                                >
                                    <FiSearch />
                                    {searchingPatients ? 'Đang tìm...' : 'Tìm kiếm'}
                                </button>
                            </div>

                            {patients.length > 0 ? (
                                <div className="patients-list">
                                    {patients.map((patient) => (
                                        <div
                                            key={patient.patientId}
                                            className="patient-item"
                                        >
                                            <div className="patient-info">
                                                <div className="patient-name">{patient.fullName}</div>
                                                <div className="patient-details">
                                                    <span>Mã: {patient.patientCode}</span>
                                                    <span>•</span>
                                                    <span>Tuổi: {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}</span>
                                                    <span>•</span>
                                                    <span>Giới tính: {patient.gender === 'MALE' ? 'Nam' : patient.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</span>
                                                </div>
                                                {patient.phoneNumber && (
                                                    <div className="patient-contact">SĐT: {patient.phoneNumber}</div>
                                                )}
                                            </div>
                                            <button
                                                className="btn-select"
                                                onClick={() => handleSelectPatient(patient)}
                                            >
                                                Chọn
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : patientSearchQuery.length >= 2 && !searchingPatients ? (
                                <div className="empty-state">
                                    <FiUser className="empty-icon" />
                                    <p>Không tìm thấy bệnh nhân</p>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateEmergencyPage;
