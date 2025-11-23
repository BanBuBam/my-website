import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './PrescriptionPage.css';
import {
    FiSearch, FiUser, FiClock, FiList, FiX,
    FiCheckCircle, FiFileText, FiPackage, FiPlus, FiShoppingCart, FiTrash2, FiRefreshCw
} from 'react-icons/fi';
import { doctorEncounterAPI, medicineAPI } from '../../../../services/staff/doctorAPI';

const PrescriptionPage = () => {
    const location = useLocation();
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
    const [showReplacePrescriptionModal, setShowReplacePrescriptionModal] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [prescriptionToReplace, setPrescriptionToReplace] = useState(null);
    const [replacementChain, setReplacementChain] = useState([]);
    const [loadingReplacementChain, setLoadingReplacementChain] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Prescription form data
    const [prescriptionFormData, setPrescriptionFormData] = useState({
        prescriptionDate: new Date().toISOString().split('T')[0],
        items: []
    });

    // Replace prescription form data
    const [replacePrescriptionFormData, setReplacePrescriptionFormData] = useState({
        prescriptionDate: new Date().toISOString().split('T')[0],
        prescriptionType: 'BHYT',
        diagnosisCode: '',
        insuranceCoveragePercent: 80,
        digitalSignature: '',
        items: [],
        replacementReason: ''
    });

    // Current prescription item being added
    const [currentPrescriptionItem, setCurrentPrescriptionItem] = useState({
        medicineId: '',
        dosage: '',
        quantity: '',
        notes: ''
    });

    // Medicine search filter
    const [medicineSearchTerm, setMedicineSearchTerm] = useState('');

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

    // Auto-load encounter if encounterId is passed via navigation state
    useEffect(() => {
        if (location.state?.encounterId) {
            const encounterIdFromState = location.state.encounterId.toString();
            setEncounterId(encounterIdFromState);
            // Auto-trigger search
            loadEncounterById(encounterIdFromState);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state]);

    const loadEncounterById = async (id) => {
        if (!id || !id.trim()) return;

        try {
            setLoading(true);
            setError(null);
            setEncounter(null);

            const response = await doctorEncounterAPI.getEncounterStatus(id.trim());

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

    const handleSearchEncounter = async (e) => {
        e.preventDefault();

        if (!encounterId.trim()) {
            alert('Vui lòng nhập Encounter ID');
            return;
        }

        loadEncounterById(encounterId);
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
        setMedicineSearchTerm('');
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
            setReplacementChain([]);

            const response = await doctorEncounterAPI.getPrescriptionDetail(prescriptionId);

            if (response && response.data) {
                setSelectedPrescription(response.data);
                // Load replacement chain
                loadReplacementChain(prescriptionId);
            }
        } catch (err) {
            console.error('Error loading prescription detail:', err);
            alert(err.message || 'Không thể tải chi tiết đơn thuốc');
            setShowPrescriptionDetailModal(false);
        } finally {
            setLoadingDetail(false);
        }
    };

    const loadReplacementChain = async (prescriptionId) => {
        try {
            setLoadingReplacementChain(true);
            const response = await doctorEncounterAPI.getReplacementChain(prescriptionId);

            if (response && response.data) {
                setReplacementChain(response.data);
            }
        } catch (err) {
            console.error('Error loading replacement chain:', err);
            // Don't show alert for this error, just log it
            setReplacementChain([]);
        } finally {
            setLoadingReplacementChain(false);
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

    const handleOpenReplacePrescription = (prescription) => {
        setPrescriptionToReplace(prescription);
        setReplacePrescriptionFormData({
            prescriptionDate: new Date().toISOString().split('T')[0],
            prescriptionType: prescription.prescriptionType || 'BHYT',
            diagnosisCode: prescription.diagnosisCode || '',
            insuranceCoveragePercent: prescription.insuranceCoveragePercent || 80,
            digitalSignature: '',
            items: prescription.items ? prescription.items.map(item => ({
                medicineId: parseInt(item.medicineId),
                dosage: item.dosage || '',
                quantity: parseInt(item.quantity) || 0,
                notes: item.notes || ''
            })) : [],
            replacementReason: ''
        });
        setShowReplacePrescriptionModal(true);
        setShowPrescriptionDetailModal(false);
    };

    const handleReplacePrescriptionItemChange = (index, field, value) => {
        setReplacePrescriptionFormData(prev => ({
            ...prev,
            items: prev.items.map((item, i) => {
                if (i === index) {
                    // Ensure quantity is a number
                    if (field === 'quantity') {
                        return { ...item, [field]: parseInt(value) || 0 };
                    }
                    return { ...item, [field]: value };
                }
                return item;
            })
        }));
    };

    const handleAddReplacePrescriptionItem = () => {
        if (!currentPrescriptionItem.medicineId || !currentPrescriptionItem.dosage || !currentPrescriptionItem.quantity) {
            alert('Vui lòng điền đầy đủ thông tin thuốc');
            return;
        }

        setReplacePrescriptionFormData(prev => ({
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

    const handleRemoveReplacePrescriptionItem = (index) => {
        setReplacePrescriptionFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleSubmitReplacePrescription = async (e) => {
        e.preventDefault();

        if (!replacePrescriptionFormData.replacementReason.trim()) {
            alert('Vui lòng nhập lý do thay thế đơn thuốc');
            return;
        }

        if (replacePrescriptionFormData.items.length === 0) {
            alert('Vui lòng thêm ít nhất một loại thuốc');
            return;
        }

        try {
            setSubmitting(true);

            const { replacementReason, digitalSignature, ...rest } = replacePrescriptionFormData;

            // Build prescription data, only include non-empty fields
            const prescriptionData = {
                prescriptionDate: rest.prescriptionDate,
                prescriptionType: rest.prescriptionType,
                items: rest.items
            };

            // Only add optional fields if they have values
            if (rest.diagnosisCode && rest.diagnosisCode.trim()) {
                prescriptionData.diagnosisCode = rest.diagnosisCode;
            }
            if (rest.insuranceCoveragePercent !== undefined && rest.insuranceCoveragePercent !== null) {
                prescriptionData.insuranceCoveragePercent = rest.insuranceCoveragePercent;
            }

            const response = await doctorEncounterAPI.replacePrescription(
                prescriptionToReplace.prescriptionId,
                replacementReason,
                prescriptionData
            );

            if (response && response.data) {
                alert('Thay thế đơn thuốc thành công!');
                setShowReplacePrescriptionModal(false);
                setReplacePrescriptionFormData({
                    prescriptionDate: new Date().toISOString().split('T')[0],
                    prescriptionType: 'BHYT',
                    diagnosisCode: '',
                    insuranceCoveragePercent: 80,
                    digitalSignature: '',
                    items: [],
                    replacementReason: ''
                });
                // Refresh prescriptions list if modal is open
                if (showPrescriptionListModal && encounter) {
                    const refreshResponse = await doctorEncounterAPI.getPrescriptions(encounter.encounterId);
                    if (refreshResponse && refreshResponse.data) {
                        setPrescriptions(refreshResponse.data);
                    }
                }
            }
        } catch (err) {
            console.error('Error replacing prescription:', err);
            alert(err.message || 'Không thể thay thế đơn thuốc');
        } finally {
            setSubmitting(false);
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

    // Filter medicines based on search term
    const filteredMedicines = medicines.filter(medicine => {
        if (!medicineSearchTerm) return true;
        const searchLower = medicineSearchTerm.toLowerCase();
        return (
            medicine.medicineName?.toLowerCase().includes(searchLower) ||
            medicine.sku?.toLowerCase().includes(searchLower)
        );
    });

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

                                    {/* Replacement Chain History */}
                                    {replacementChain.length > 0 && (
                                        <div className="replacement-chain-section">
                                            <h4>
                                                <FiRefreshCw /> Lịch sử thay thế đơn thuốc
                                            </h4>
                                            {loadingReplacementChain ? (
                                                <div className="loading-chain">
                                                    <p>Đang tải lịch sử...</p>
                                                </div>
                                            ) : (
                                                <div className="replacement-chain-timeline">
                                                    {replacementChain.map((item, index) => (
                                                        <div
                                                            key={item.prescriptionId}
                                                            className={`chain-item ${item.prescriptionId === selectedPrescription.prescriptionId ? 'current' : ''}`}
                                                        >
                                                            <div className="chain-marker">
                                                                <div className="chain-dot"></div>
                                                                {index < replacementChain.length - 1 && (
                                                                    <div className="chain-line"></div>
                                                                )}
                                                            </div>
                                                            <div className="chain-content">
                                                                <div className="chain-header">
                                                                    <span className="chain-id">
                                                                        Đơn thuốc #{item.prescriptionId}
                                                                        {item.prescriptionId === selectedPrescription.prescriptionId && (
                                                                            <span className="current-badge">Hiện tại</span>
                                                                        )}
                                                                    </span>
                                                                    <span className={`chain-status status-${item.status.toLowerCase()}`}>
                                                                        {item.status === 'SUPERSEDED' ? 'Đã thay thế' :
                                                                         item.status === 'SIGNED' ? 'Đã ký' :
                                                                         item.status === 'DRAFT' ? 'Nháp' :
                                                                         item.status === 'DISPENSED' ? 'Đã cấp phát' :
                                                                         item.status}
                                                                    </span>
                                                                </div>
                                                                <div className="chain-info">
                                                                    <span className="chain-date">
                                                                        <FiClock /> {formatDateTime(item.createdAt)}
                                                                    </span>
                                                                    {item.replacedBy && (
                                                                        <span className="chain-replaced">
                                                                            → Được thay thế bởi đơn #{item.replacedBy}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
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
                                            {selectedPrescription.status === 'SIGNED' && (
                                                <button
                                                    className="btn-replace-prescription"
                                                    onClick={() => handleOpenReplacePrescription(selectedPrescription)}
                                                >
                                                    <FiRefreshCw /> Thay thế đơn thuốc
                                                </button>
                                            )}
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
                                            <label>Tìm kiếm thuốc</label>
                                            <div className="medicine-search-wrapper">
                                                <FiSearch className="search-icon-small" />
                                                <input
                                                    type="text"
                                                    placeholder="Tìm theo tên thuốc hoặc mã SKU..."
                                                    value={medicineSearchTerm}
                                                    onChange={(e) => setMedicineSearchTerm(e.target.value)}
                                                    className="medicine-search-input"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Thuốc <span className="required">*</span></label>
                                            <select
                                                name="medicineId"
                                                value={currentPrescriptionItem.medicineId}
                                                onChange={handlePrescriptionItemChange}
                                            >
                                                <option value="">-- Chọn thuốc --</option>
                                                {filteredMedicines.map((medicine) => (
                                                    <option key={medicine.medicineId} value={medicine.medicineId}>
                                                        {medicine.medicineName} {medicine.sku ? `(${medicine.sku})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            {medicineSearchTerm && (
                                                <small className="medicine-count-info">
                                                    Hiển thị {filteredMedicines.length} / {medicines.length} thuốc
                                                </small>
                                            )}
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

            {/* Replace Prescription Modal */}
            {showReplacePrescriptionModal && prescriptionToReplace && (
                <div className="modal-overlay" onClick={() => setShowReplacePrescriptionModal(false)}>
                    <div className="modal-content replace-prescription-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Thay thế đơn thuốc #{prescriptionToReplace.prescriptionId}</h3>
                            <button className="modal-close" onClick={() => setShowReplacePrescriptionModal(false)}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="alert-info">
                                <strong>Lưu ý:</strong> Theo quy định pháp luật Việt Nam, đơn thuốc đã ký không thể hủy, chỉ có thể thay thế.
                                Đơn thuốc cũ sẽ được đánh dấu là SUPERSEDED (Đã thay thế).
                            </div>
                            <form onSubmit={handleSubmitReplacePrescription}>
                                <div className="form-group">
                                    <label>Lý do thay thế <span className="required">*</span></label>
                                    <textarea
                                        value={replacePrescriptionFormData.replacementReason}
                                        onChange={(e) => setReplacePrescriptionFormData(prev => ({
                                            ...prev,
                                            replacementReason: e.target.value
                                        }))}
                                        placeholder="VD: Thay đổi liều lượng, thay đổi thuốc..."
                                        rows="3"
                                        required
                                    />
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Ngày kê đơn <span className="required">*</span></label>
                                        <input
                                            type="date"
                                            value={replacePrescriptionFormData.prescriptionDate}
                                            onChange={(e) => setReplacePrescriptionFormData(prev => ({
                                                ...prev,
                                                prescriptionDate: e.target.value
                                            }))}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Loại đơn thuốc</label>
                                        <select
                                            value={replacePrescriptionFormData.prescriptionType}
                                            onChange={(e) => setReplacePrescriptionFormData(prev => ({
                                                ...prev,
                                                prescriptionType: e.target.value
                                            }))}
                                        >
                                            <option value="BHYT">BHYT</option>
                                            <option value="DICH_VU">Dịch vụ</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Mã chẩn đoán (ICD-10)</label>
                                        <input
                                            type="text"
                                            value={replacePrescriptionFormData.diagnosisCode}
                                            onChange={(e) => setReplacePrescriptionFormData(prev => ({
                                                ...prev,
                                                diagnosisCode: e.target.value
                                            }))}
                                            placeholder="VD: J06.9"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>% BHYT chi trả</label>
                                        <input
                                            type="number"
                                            value={replacePrescriptionFormData.insuranceCoveragePercent}
                                            onChange={(e) => setReplacePrescriptionFormData(prev => ({
                                                ...prev,
                                                insuranceCoveragePercent: parseInt(e.target.value)
                                            }))}
                                            min="0"
                                            max="100"
                                        />
                                    </div>
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
                                                placeholder="VD: 1 viên x 2 lần/ngày"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Số lượng <span className="required">*</span></label>
                                            <input
                                                type="number"
                                                name="quantity"
                                                value={currentPrescriptionItem.quantity}
                                                onChange={handlePrescriptionItemChange}
                                                placeholder="20"
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
                                                placeholder="VD: Thay đổi liều lượng"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-add-item"
                                        onClick={handleAddReplacePrescriptionItem}
                                    >
                                        <FiPlus /> Thêm vào đơn
                                    </button>
                                </div>

                                {/* Prescription Items List */}
                                {replacePrescriptionFormData.items.length > 0 && (
                                    <div className="prescription-items-list">
                                        <h4>Danh sách thuốc trong đơn ({replacePrescriptionFormData.items.length})</h4>
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
                                                    {replacePrescriptionFormData.items.map((item, index) => {
                                                        const medicine = medicines.find(m => m.medicineId === parseInt(item.medicineId));
                                                        return (
                                                            <tr key={index}>
                                                                <td>
                                                                    <input
                                                                        type="text"
                                                                        value={medicine?.medicineName || 'N/A'}
                                                                        disabled
                                                                        className="readonly-input"
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        type="text"
                                                                        value={item.dosage}
                                                                        onChange={(e) => handleReplacePrescriptionItemChange(index, 'dosage', e.target.value)}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        type="number"
                                                                        value={item.quantity}
                                                                        onChange={(e) => handleReplacePrescriptionItemChange(index, 'quantity', parseInt(e.target.value))}
                                                                        min="1"
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        type="text"
                                                                        value={item.notes || ''}
                                                                        onChange={(e) => handleReplacePrescriptionItemChange(index, 'notes', e.target.value)}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <button
                                                                        type="button"
                                                                        className="btn-remove-item"
                                                                        onClick={() => handleRemoveReplacePrescriptionItem(index)}
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
                                        onClick={() => setShowReplacePrescriptionModal(false)}
                                        disabled={submitting}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={submitting || replacePrescriptionFormData.items.length === 0 || !replacePrescriptionFormData.replacementReason.trim()}
                                    >
                                        {submitting ? 'Đang thay thế...' : 'Thay thế đơn thuốc'}
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

