import React, { useState, useEffect } from 'react';
import './PrescriptionPage.css';
import {
    FiSearch, FiUser, FiClock, FiList, FiX,
    FiCheckCircle, FiFileText, FiPackage, FiPlus, FiShoppingCart, FiTrash2
} from 'react-icons/fi';
import { doctorEncounterAPI, medicineAPI } from '../../../../services/staff/doctorAPI';

const PrescriptionPage = () => {
    const [encounterId, setEncounterId] = useState('');
    const [encounter, setEncounter] = useState(null);
    const [prescriptions, setPrescriptions] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
    const [error, setError] = useState(null);
    const [showPrescriptionListModal, setShowPrescriptionListModal] = useState(false);
    const [showCreatePrescriptionModal, setShowCreatePrescriptionModal] = useState(false);
    const [showPrescriptionDetailModal, setShowPrescriptionDetailModal] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Prescription form data
    const [prescriptionFormData, setPrescriptionFormData] = useState({
        prescriptionDate: new Date().toISOString().split('T')[0],
        items: []
    });

    // Current prescription item being added
    const [currentPrescriptionItem, setCurrentPrescriptionItem] = useState({
        medicineId: '',
        dosage: '',
        quantity: '',
        notes: ''
    });

    // Load medicines on component mount
    useEffect(() => {
        const fetchMedicines = async () => {
            try {
                const response = await medicineAPI.getMedicines();
                if (response && response.content) {
                    setMedicines(response.content);
                }
            } catch (err) {
                console.error('Error loading medicines:', err);
            }
        };
        fetchMedicines();
    }, []);

    const handleSearchEncounter = async (e) => {
        e.preventDefault();

        if (!encounterId.trim()) {
            alert('Vui lòng nhập Encounter ID');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setEncounter(null);

            const response = await doctorEncounterAPI.getEncounterStatus(encounterId.trim());

            if (response && response.data) {
                setEncounter(response.data);
            } else {
                setError('Không tìm thấy encounter');
            }
        } catch (err) {
            console.error('Error fetching encounter:', err);
            setError(err.message || 'Không thể tải thông tin encounter');
        } finally {
            setLoading(false);
        }
    };

    const handleViewPrescriptions = async () => {
        try {
            setLoadingPrescriptions(true);
            setShowPrescriptionListModal(true);

            const response = await doctorEncounterAPI.getPrescriptions(encounter.encounterId);

            if (response && response.data) {
                setPrescriptions(response.data);
            }
        } catch (err) {
            console.error('Error loading prescriptions:', err);
            alert(err.message || 'Không thể tải danh sách prescriptions');
        } finally {
            setLoadingPrescriptions(false);
        }
    };

    const handleCreatePrescription = () => {
        setPrescriptionFormData({
            prescriptionDate: new Date().toISOString().split('T')[0],
            items: []
        });
        setCurrentPrescriptionItem({
            medicineId: '',
            dosage: '',
            quantity: '',
            notes: ''
        });
        setShowCreatePrescriptionModal(true);
    };

    const handlePrescriptionItemChange = (e) => {
        const { name, value } = e.target;
        setCurrentPrescriptionItem(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddPrescriptionItem = () => {
        if (!currentPrescriptionItem.medicineId || !currentPrescriptionItem.dosage || !currentPrescriptionItem.quantity) {
            alert('Vui lòng điền đầy đủ thông tin thuốc');
            return;
        }

        setPrescriptionFormData(prev => ({
            ...prev,
            items: [...prev.items, { ...currentPrescriptionItem, quantity: parseInt(currentPrescriptionItem.quantity) }]
        }));

        setCurrentPrescriptionItem({
            medicineId: '',
            dosage: '',
            quantity: '',
            notes: ''
        });
    };

    const handleRemovePrescriptionItem = (index) => {
        setPrescriptionFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleSubmitPrescription = async (e) => {
        e.preventDefault();

        if (prescriptionFormData.items.length === 0) {
            alert('Vui lòng thêm ít nhất một loại thuốc');
            return;
        }

        try {
            setSubmitting(true);

            const response = await doctorEncounterAPI.createPrescription(encounter.encounterId, prescriptionFormData);

            if (response && response.data) {
                alert('Tạo đơn thuốc thành công!');
                setShowCreatePrescriptionModal(false);
                setPrescriptionFormData({
                    prescriptionDate: new Date().toISOString().split('T')[0],
                    items: []
                });
                // Refresh prescriptions list if modal is open
                if (showPrescriptionListModal) {
                    const refreshResponse = await doctorEncounterAPI.getPrescriptions(encounter.encounterId);
                    if (refreshResponse && refreshResponse.data) {
                        setPrescriptions(refreshResponse.data);
                    }
                }
            }
        } catch (err) {
            console.error('Error creating prescription:', err);
            alert(err.message || 'Không thể tạo đơn thuốc');
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewPrescriptionDetail = async (prescriptionId) => {
        try {
            setLoadingDetail(true);
            setShowPrescriptionDetailModal(true);
            setSelectedPrescription(null);

            const response = await doctorEncounterAPI.getPrescriptionDetail(prescriptionId);

            if (response && response.data) {
                setSelectedPrescription(response.data);
            }
        } catch (err) {
            console.error('Error loading prescription detail:', err);
            alert(err.message || 'Không thể tải chi tiết đơn thuốc');
            setShowPrescriptionDetailModal(false);
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleSignPrescription = async (prescriptionId) => {
        if (!window.confirm('Bạn có chắc chắn muốn ký đơn thuốc này?')) {
            return;
        }

        try {
            const response = await doctorEncounterAPI.signPrescription(prescriptionId);

            if (response && response.data) {
                alert('Ký đơn thuốc thành công!');
                // Update selected prescription
                setSelectedPrescription(response.data);
                // Refresh prescriptions list
                if (showPrescriptionListModal && encounter) {
                    const refreshResponse = await doctorEncounterAPI.getPrescriptions(encounter.encounterId);
                    if (refreshResponse && refreshResponse.data) {
                        setPrescriptions(refreshResponse.data);
                    }
                }
            }
        } catch (err) {
            console.error('Error signing prescription:', err);
            alert(err.message || 'Không thể ký đơn thuốc');
        }
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '';
        const date = new Date(dateTimeString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const getStatusColor = (status) => {
        const statusColors = {
            'PENDING': '#f59e0b',
            'SIGNED': '#3b82f6',
            'DISPENSED': '#10b981',
            'CANCELLED': '#ef4444'
        };
        return statusColors[status] || '#6b7280';
    };

    return (
        <div className="prescription-page">
            <div className="page-header">
                <div className="header-content">
                    <FiFileText className="header-icon" />
                    <div>
                        <h1>Prescription</h1>
                        <p>Xem danh sách đơn thuốc</p>
                    </div>
                </div>
            </div>

            <div className="search-section">
                <form onSubmit={handleSearchEncounter} className="search-form">
                    <div className="search-input-group">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Nhập Encounter ID..."
                            value={encounterId}
                            onChange={(e) => setEncounterId(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <button type="submit" className="btn-search" disabled={loading}>
                        {loading ? 'Đang tìm...' : 'Tìm kiếm'}
                    </button>
                </form>
            </div>

            {error && (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )}

            {loading && (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải thông tin encounter...</p>
                </div>
            )}

            {encounter && !loading && (
                <div className="encounter-card">
                    <div className="encounter-header">
                        <div className="encounter-title">
                            <FiUser />
                            <h2>Thông tin Encounter</h2>
                        </div>
                        <span
                            className="encounter-status-badge"
                            style={{ backgroundColor: getStatusColor(encounter.status), color: '#fff' }}
                        >
                            {encounter.status}
                        </span>
                    </div>
                    <div className="encounter-body">
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Encounter ID:</span>
                                <span className="info-value">{encounter.encounterId}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Bệnh nhân:</span>
                                <span className="info-value">{encounter.patientName}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Mã BN:</span>
                                <span className="info-value">{encounter.patientCode}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Loại:</span>
                                <span className="info-value">{encounter.encounterType}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Bác sĩ:</span>
                                <span className="info-value">{encounter.doctorName || '-'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">
                                    <FiClock /> Thời gian:
                                </span>
                                <span className="info-value">{formatDateTime(encounter.encounterDatetime)}</span>
                            </div>
                        </div>
                        <div className="encounter-footer">
                            <button className="btn-view-prescription" onClick={handleViewPrescriptions}>
                                <FiList /> Xem Prescriptions
                            </button>
                            <button className="btn-create-prescription" onClick={handleCreatePrescription}>
                                <FiShoppingCart /> Tạo Prescription
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Prescriptions Modal */}
            {showPrescriptionListModal && (
                <div className="modal-overlay" onClick={() => setShowPrescriptionListModal(false)}>
                    <div className="modal-content prescription-list-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Danh sách Prescriptions</h3>
                            <button className="modal-close" onClick={() => setShowPrescriptionListModal(false)}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="patient-summary">
                                <strong>{encounter?.patientName}</strong> - {encounter?.patientCode}
                            </div>
                            {loadingPrescriptions ? (
                                <div className="loading-state-small">
                                    <div className="spinner-small"></div>
                                    <p>Đang tải prescriptions...</p>
                                </div>
                            ) : prescriptions.length === 0 ? (
                                <div className="empty-state-small">
                                    <FiFileText />
                                    <p>Chưa có prescription nào</p>
                                </div>
                            ) : (
                                <div className="prescriptions-list">
                                    {prescriptions.map((prescription) => (
                                        <div key={prescription.prescriptionId} className="prescription-card">
                                            <div className="prescription-header">
                                                <div className="prescription-title">
                                                    <FiFileText />
                                                    <strong>Prescription #{prescription.prescriptionId}</strong>
                                                    <span
                                                        className="prescription-status-badge"
                                                        style={{ backgroundColor: getStatusColor(prescription.status), color: '#fff' }}
                                                    >
                                                        {prescription.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="prescription-body">
                                                <div className="prescription-info-grid">
                                                    <div className="prescription-info-item">
                                                        <span className="prescription-label">Ngày kê đơn:</span>
                                                        <span className="prescription-value">{formatDate(prescription.prescriptionDate)}</span>
                                                    </div>
                                                    <div className="prescription-info-item">
                                                        <span className="prescription-label">Người tạo:</span>
                                                        <span className="prescription-value">{prescription.createdByEmployeeName || '-'}</span>
                                                    </div>
                                                    {prescription.signedByEmployeeName && (
                                                        <div className="prescription-info-item">
                                                            <span className="prescription-label">Người ký:</span>
                                                            <span className="prescription-value">{prescription.signedByEmployeeName}</span>
                                                        </div>
                                                    )}
                                                    {prescription.signedAt && (
                                                        <div className="prescription-info-item">
                                                            <span className="prescription-label">Ngày ký:</span>
                                                            <span className="prescription-value">{formatDateTime(prescription.signedAt)}</span>
                                                        </div>
                                                    )}
                                                    {prescription.dispensedByEmployeeName && (
                                                        <div className="prescription-info-item">
                                                            <span className="prescription-label">Người phát thuốc:</span>
                                                            <span className="prescription-value">{prescription.dispensedByEmployeeName}</span>
                                                        </div>
                                                    )}
                                                    {prescription.dispensedAt && (
                                                        <div className="prescription-info-item">
                                                            <span className="prescription-label">Ngày phát thuốc:</span>
                                                            <span className="prescription-value">{formatDateTime(prescription.dispensedAt)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {prescription.items && prescription.items.length > 0 && (
                                                    <div className="prescription-items">
                                                        <strong>Danh sách thuốc:</strong>
                                                        <div className="items-list">
                                                            {prescription.items.map((item) => (
                                                                <div key={item.prescriptionItemId} className="item-card">
                                                                    <div className="item-header">
                                                                        <FiPackage />
                                                                        <span className="medicine-name">{item.medicineName}</span>
                                                                    </div>
                                                                    <div className="item-details">
                                                                        <div className="item-detail">
                                                                            <strong>Liều dùng:</strong> {item.dosage || '-'}
                                                                        </div>
                                                                        <div className="item-detail">
                                                                            <strong>Số lượng:</strong> {item.quantity || '-'}
                                                                        </div>
                                                                        {item.notes && (
                                                                            <div className="item-detail">
                                                                                <strong>Ghi chú:</strong> {item.notes}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="prescription-footer">
                                                <button
                                                    className="btn-view-detail"
                                                    onClick={() => handleViewPrescriptionDetail(prescription.prescriptionId)}
                                                >
                                                    <FiFileText /> Xem chi tiết
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Prescription Detail Modal */}
            {showPrescriptionDetailModal && (
                <div className="modal-overlay" onClick={() => setShowPrescriptionDetailModal(false)}>
                    <div className="modal-content prescription-detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Chi tiết Đơn thuốc</h3>
                            <button className="modal-close" onClick={() => setShowPrescriptionDetailModal(false)}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body">
                            {loadingDetail ? (
                                <div className="loading-state-small">
                                    <div className="spinner-small"></div>
                                    <p>Đang tải chi tiết...</p>
                                </div>
                            ) : selectedPrescription ? (
                                <div className="prescription-detail-content">
                                    <div className="detail-header">
                                        <div className="detail-title">
                                            <FiFileText />
                                            <h4>Prescription #{selectedPrescription.prescriptionId}</h4>
                                        </div>
                                        <span
                                            className="detail-status-badge"
                                            style={{ backgroundColor: getStatusColor(selectedPrescription.status), color: '#fff' }}
                                        >
                                            {selectedPrescription.status}
                                        </span>
                                    </div>

                                    <div className="detail-info-section">
                                        <h5>Thông tin chung</h5>
                                        <div className="detail-info-grid">
                                            <div className="detail-info-item">
                                                <span className="detail-label">Encounter ID:</span>
                                                <span className="detail-value">{selectedPrescription.encounterId}</span>
                                            </div>
                                            <div className="detail-info-item">
                                                <span className="detail-label">Ngày kê đơn:</span>
                                                <span className="detail-value">{formatDate(selectedPrescription.prescriptionDate)}</span>
                                            </div>
                                            <div className="detail-info-item">
                                                <span className="detail-label">Người tạo:</span>
                                                <span className="detail-value">{selectedPrescription.createdByEmployeeName || '-'}</span>
                                            </div>
                                            <div className="detail-info-item">
                                                <span className="detail-label">Ngày tạo:</span>
                                                <span className="detail-value">{formatDateTime(selectedPrescription.createdAt)}</span>
                                            </div>
                                            {selectedPrescription.signedByEmployeeName && (
                                                <>
                                                    <div className="detail-info-item">
                                                        <span className="detail-label">Người ký:</span>
                                                        <span className="detail-value">{selectedPrescription.signedByEmployeeName}</span>
                                                    </div>
                                                    <div className="detail-info-item">
                                                        <span className="detail-label">Ngày ký:</span>
                                                        <span className="detail-value">{formatDateTime(selectedPrescription.signedAt)}</span>
                                                    </div>
                                                </>
                                            )}
                                            {selectedPrescription.dispensedByEmployeeName && (
                                                <>
                                                    <div className="detail-info-item">
                                                        <span className="detail-label">Người phát thuốc:</span>
                                                        <span className="detail-value">{selectedPrescription.dispensedByEmployeeName}</span>
                                                    </div>
                                                    <div className="detail-info-item">
                                                        <span className="detail-label">Ngày phát thuốc:</span>
                                                        <span className="detail-value">{formatDateTime(selectedPrescription.dispensedAt)}</span>
                                                    </div>
                                                </>
                                            )}
                                            <div className="detail-info-item">
                                                <span className="detail-label">Version:</span>
                                                <span className="detail-value">{selectedPrescription.version}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedPrescription.items && selectedPrescription.items.length > 0 && (
                                        <div className="detail-items-section">
                                            <h5>Danh sách thuốc ({selectedPrescription.items.length})</h5>
                                            <div className="detail-items-table">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th>STT</th>
                                                            <th>Tên thuốc</th>
                                                            <th>Liều dùng</th>
                                                            <th>Số lượng</th>
                                                            <th>Ghi chú</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedPrescription.items.map((item, index) => (
                                                            <tr key={item.prescriptionItemId}>
                                                                <td>{index + 1}</td>
                                                                <td>
                                                                    <div className="medicine-info">
                                                                        <FiPackage />
                                                                        <span>{item.medicineName}</span>
                                                                    </div>
                                                                </td>
                                                                <td>{item.dosage || '-'}</td>
                                                                <td>{item.quantity || '-'}</td>
                                                                <td>{item.notes || '-'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/*{selectedPrescription.status === 'PENDING' && (*/}
                                        <div className="detail-actions">
                                            <button
                                                className="btn-sign-prescription"
                                                onClick={() => handleSignPrescription(selectedPrescription.prescriptionId)}
                                            >
                                                <FiCheckCircle /> Ký đơn thuốc
                                            </button>
                                        </div>
                                    {/*)}*/}
                                </div>
                            ) : (
                                <div className="empty-state-small">
                                    <FiFileText />
                                    <p>Không có dữ liệu</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Prescription Modal */}
            {showCreatePrescriptionModal && (
                <div className="modal-overlay" onClick={() => setShowCreatePrescriptionModal(false)}>
                    <div className="modal-content create-prescription-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Kê đơn thuốc</h3>
                            <button className="modal-close" onClick={() => setShowCreatePrescriptionModal(false)}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="patient-summary">
                                <strong>{encounter?.patientName}</strong> - {encounter?.patientCode}
                            </div>
                            <form onSubmit={handleSubmitPrescription}>
                                <div className="form-group">
                                    <label>Ngày kê đơn <span className="required">*</span></label>
                                    <input
                                        type="date"
                                        value={prescriptionFormData.prescriptionDate}
                                        onChange={(e) => setPrescriptionFormData(prev => ({ ...prev, prescriptionDate: e.target.value }))}
                                        required
                                    />
                                </div>

                                {/* Add Medicine Item Section */}
                                <div className="add-medicine-section">
                                    <h4>Thêm thuốc vào đơn</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Thuốc <span className="required">*</span></label>
                                            <select
                                                name="medicineId"
                                                value={currentPrescriptionItem.medicineId}
                                                onChange={handlePrescriptionItemChange}
                                            >
                                                <option value="">-- Chọn thuốc --</option>
                                                {medicines.map((medicine) => (
                                                    <option key={medicine.medicineId} value={medicine.medicineId}>
                                                        {medicine.medicineName} {medicine.sku ? `(${medicine.sku})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Liều lượng <span className="required">*</span></label>
                                            <input
                                                type="text"
                                                name="dosage"
                                                value={currentPrescriptionItem.dosage}
                                                onChange={handlePrescriptionItemChange}
                                                placeholder="VD: 500mg, 2 viên/lần"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Số lượng <span className="required">*</span></label>
                                            <input
                                                type="number"
                                                name="quantity"
                                                value={currentPrescriptionItem.quantity}
                                                onChange={handlePrescriptionItemChange}
                                                placeholder="10"
                                                min="1"
                                            />
                                        </div>
                                        <div className="form-group full-width">
                                            <label>Ghi chú</label>
                                            <input
                                                type="text"
                                                name="notes"
                                                value={currentPrescriptionItem.notes}
                                                onChange={handlePrescriptionItemChange}
                                                placeholder="VD: Uống sau ăn, ngày 2 lần"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-add-item"
                                        onClick={handleAddPrescriptionItem}
                                    >
                                        <FiPlus /> Thêm vào đơn
                                    </button>
                                </div>

                                {/* Prescription Items List */}
                                {prescriptionFormData.items.length > 0 && (
                                    <div className="prescription-items-list">
                                        <h4>Danh sách thuốc trong đơn ({prescriptionFormData.items.length})</h4>
                                        <div className="items-table">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Thuốc</th>
                                                        <th>Liều lượng</th>
                                                        <th>Số lượng</th>
                                                        <th>Ghi chú</th>
                                                        <th>Xóa</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {prescriptionFormData.items.map((item, index) => {
                                                        const medicine = medicines.find(m => m.medicineId === parseInt(item.medicineId));
                                                        return (
                                                            <tr key={index}>
                                                                <td>{medicine?.medicineName || 'N/A'}</td>
                                                                <td>{item.dosage}</td>
                                                                <td>{item.quantity}</td>
                                                                <td>{item.notes || '-'}</td>
                                                                <td>
                                                                    <button
                                                                        type="button"
                                                                        className="btn-remove-item"
                                                                        onClick={() => handleRemovePrescriptionItem(index)}
                                                                    >
                                                                        <FiTrash2 />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => setShowCreatePrescriptionModal(false)}
                                        disabled={submitting}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={submitting || prescriptionFormData.items.length === 0}
                                    >
                                        {submitting ? 'Đang tạo...' : 'Tạo đơn thuốc'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrescriptionPage;

