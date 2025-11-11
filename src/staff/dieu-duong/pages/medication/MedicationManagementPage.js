import React, { useState, useEffect } from 'react';
import { nurseMedicationAPI } from '../../../../services/staff/nurseAPI';
import { 
    FiAlertCircle, FiActivity, FiClock, FiUser, FiMapPin,
    FiCheckCircle, FiXCircle, FiAlertTriangle, FiRefreshCw
} from 'react-icons/fi';
import './MedicationManagementPage.css';

const MedicationManagementPage = () => {
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOverdue, setFilterOverdue] = useState(false);
    
    // States for administer dialog
    const [showAdministerDialog, setShowAdministerDialog] = useState(false);
    const [administeringMed, setAdministeringMed] = useState(null);
    const [administerData, setAdministerData] = useState({
        actualDatetime: '',
        administrationNotes: '',
        patientResponse: '',
        sideEffectsObserved: '',
        confirmationCode: '',
        confirmed: false
    });
    const [submittingAdminister, setSubmittingAdminister] = useState(false);
    
    // States for refuse dialog
    const [showRefuseDialog, setShowRefuseDialog] = useState(false);
    const [refusingMed, setRefusingMed] = useState(null);
    const [refuseReason, setRefuseReason] = useState('');
    const [submittingRefuse, setSubmittingRefuse] = useState(false);
    
    // States for miss dialog
    const [showMissDialog, setShowMissDialog] = useState(false);
    const [missingMed, setMissingMed] = useState(null);
    const [missReason, setMissReason] = useState('');
    const [submittingMiss, setSubmittingMiss] = useState(false);

    useEffect(() => {
        fetchMedications();
    }, []);

    const fetchMedications = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await nurseMedicationAPI.getPendingMedications();
            
            if (response && response.data) {
                setMedications(response.data);
            } else {
                setMedications([]);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách medication');
            setMedications([]);
        } finally {
            setLoading(false);
        }
    };

    // Format datetime
    const formatDateTime = (datetime) => {
        if (!datetime) return '-';
        const date = new Date(datetime);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Show administer dialog
    const handleShowAdministerDialog = (med) => {
        setAdministeringMed(med);
        setAdministerData({
            actualDatetime: new Date().toISOString().slice(0, 16),
            administrationNotes: '',
            patientResponse: '',
            sideEffectsObserved: '',
            confirmationCode: '',
            confirmed: true
        });
        setShowAdministerDialog(true);
    };

    // Administer medication
    const handleAdministerMedication = async () => {
        if (!administerData.administrationNotes.trim()) {
            alert('Vui lòng nhập ghi chú thực hiện');
            return;
        }
        
        if (!window.confirm(`Xác nhận thực hiện medication cho bệnh nhân ${administeringMed.patientName}?`)) {
            return;
        }
        
        setSubmittingAdminister(true);
        
        try {
            const response = await nurseMedicationAPI.administerMedication(
                administeringMed.administrationId,
                {
                    ...administerData,
                    actualDatetime: new Date(administerData.actualDatetime).toISOString()
                }
            );
            
            if (response && response.data) {
                alert('Thực hiện medication thành công!');
                setShowAdministerDialog(false);
                setAdministeringMed(null);
                await fetchMedications();
            }
        } catch (err) {
            alert(err.message || 'Không thể thực hiện medication');
        } finally {
            setSubmittingAdminister(false);
        }
    };

    // Show refuse dialog
    const handleShowRefuseDialog = (med) => {
        setRefusingMed(med);
        setRefuseReason('');
        setShowRefuseDialog(true);
    };

    // Refuse medication
    const handleRefuseMedication = async () => {
        if (!refuseReason.trim()) {
            alert('Vui lòng nhập lý do từ chối');
            return;
        }
        
        if (refuseReason.trim().length < 10) {
            alert('Lý do từ chối phải có ít nhất 10 ký tự');
            return;
        }
        
        if (!window.confirm(`Xác nhận từ chối medication cho bệnh nhân ${refusingMed.patientName}?\n\nLý do: ${refuseReason}`)) {
            return;
        }
        
        setSubmittingRefuse(true);
        
        try {
            const response = await nurseMedicationAPI.refuseMedication(
                refusingMed.administrationId,
                refuseReason
            );
            
            if (response && response.data) {
                alert('Từ chối medication thành công!');
                setShowRefuseDialog(false);
                setRefusingMed(null);
                await fetchMedications();
            }
        } catch (err) {
            alert(err.message || 'Không thể từ chối medication');
        } finally {
            setSubmittingRefuse(false);
        }
    };

    // Show miss dialog
    const handleShowMissDialog = (med) => {
        setMissingMed(med);
        setMissReason('');
        setShowMissDialog(true);
    };

    // Miss medication
    const handleMissMedication = async () => {
        if (!missReason.trim()) {
            alert('Vui lòng nhập lý do bỏ lỡ');
            return;
        }
        
        if (missReason.trim().length < 10) {
            alert('Lý do bỏ lỡ phải có ít nhất 10 ký tự');
            return;
        }
        
        if (!window.confirm(`Xác nhận bỏ lỡ medication cho bệnh nhân ${missingMed.patientName}?\n\nLý do: ${missReason}`)) {
            return;
        }
        
        setSubmittingMiss(true);
        
        try {
            const response = await nurseMedicationAPI.missMedication(
                missingMed.administrationId,
                missReason
            );
            
            if (response && response.data) {
                alert('Đánh dấu bỏ lỡ medication thành công!');
                setShowMissDialog(false);
                setMissingMed(null);
                await fetchMedications();
            }
        } catch (err) {
            alert(err.message || 'Không thể đánh dấu bỏ lỡ medication');
        } finally {
            setSubmittingMiss(false);
        }
    };

    // Filter medications
    const filteredMedications = medications.filter(med => {
        const matchesSearch = 
            med.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            med.patientCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            med.medicationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            med.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            med.bedNumber.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesOverdue = !filterOverdue || med.overdue;
        
        return matchesSearch && matchesOverdue;
    });

    if (loading) {
        return (
            <div className="medication-page">
                <div className="loading-container">
                    <FiActivity className="spinner" />
                    <p>Đang tải danh sách medication...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="medication-page">
                <div className="error-container">
                    <FiAlertCircle />
                    <p>{error}</p>
                    <button onClick={fetchMedications} className="btn-retry">
                        <FiRefreshCw /> Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="medication-page">
            {/* Header */}
            <div className="medication-header">
                <div className="header-content">
                    <h1>Quản lý Medication</h1>
                    <p>Danh sách medication đang chờ thực hiện</p>
                </div>
                <button className="btn-refresh" onClick={fetchMedications}>
                    <FiRefreshCw /> Làm mới
                </button>
            </div>

            {/* Filters */}
            <div className="medication-filters">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên BN, mã BN, thuốc, phòng, giường..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-options">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={filterOverdue}
                            onChange={(e) => setFilterOverdue(e.target.checked)}
                        />
                        <span>Chỉ hiển thị quá hạn</span>
                    </label>
                </div>
            </div>

            {/* Stats */}
            <div className="medication-stats">
                <div className="stat-card">
                    <div className="stat-icon total">
                        <FiActivity />
                    </div>
                    <div className="stat-info">
                        <h3>{medications.length}</h3>
                        <p>Tổng số medication</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon overdue">
                        <FiAlertTriangle />
                    </div>
                    <div className="stat-info">
                        <h3>{medications.filter(m => m.overdue).length}</h3>
                        <p>Quá hạn</p>
                    </div>
                </div>
            </div>

            {/* Medication List */}
            {filteredMedications.length === 0 ? (
                <div className="empty-state">
                    <FiCheckCircle />
                    <p>Không có medication nào đang chờ thực hiện</p>
                </div>
            ) : (
                <div className="medication-list">
                    {filteredMedications.map((med) => (
                        <div key={med.administrationId} className={`medication-card ${med.overdue ? 'overdue' : ''}`}>
                            {med.overdue && (
                                <div className="overdue-banner">
                                    <FiAlertTriangle /> Quá hạn
                                </div>
                            )}
                            
                            <div className="card-header">
                                <div className="patient-info">
                                    <h3>{med.patientName}</h3>
                                    <span className="patient-code">{med.patientCode}</span>
                                </div>
                                <span className="badge status-pending">
                                    <FiClock /> {med.statusDisplay}
                                </span>
                            </div>

                            <div className="card-body">
                                <div className="medication-info">
                                    <h4>{med.medicationName}</h4>
                                    <div className="med-details">
                                        <span className="detail-item">
                                            <strong>Liều lượng:</strong> {med.dosage}
                                        </span>
                                        <span className="detail-item">
                                            <strong>Đường dùng:</strong> {med.routeOfAdministration}
                                        </span>
                                        <span className="detail-item">
                                            <strong>Tần suất:</strong> {med.frequency}
                                        </span>
                                    </div>
                                </div>

                                <div className="schedule-info">
                                    <div className="info-row">
                                        <FiClock />
                                        <span><strong>Thời gian dự kiến:</strong> {formatDateTime(med.scheduledDatetime)}</span>
                                    </div>
                                    <div className="info-row">
                                        <FiMapPin />
                                        <span><strong>Vị trí:</strong> Phòng {med.roomNumber} - Giường {med.bedNumber}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="card-actions">
                                <button
                                    className="btn-action btn-administer"
                                    onClick={() => handleShowAdministerDialog(med)}
                                >
                                    <FiCheckCircle /> Thực hiện
                                </button>
                                <button
                                    className="btn-action btn-refuse"
                                    onClick={() => handleShowRefuseDialog(med)}
                                >
                                    <FiXCircle /> Từ chối
                                </button>
                                <button
                                    className="btn-action btn-miss"
                                    onClick={() => handleShowMissDialog(med)}
                                >
                                    <FiAlertTriangle /> Bỏ lỡ
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Administer Dialog */}
            {showAdministerDialog && administeringMed && (
                <div className="modal-overlay" onClick={() => setShowAdministerDialog(false)}>
                    <div className="modal-content administer-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Thực hiện Medication</h2>
                            <button className="btn-close" onClick={() => setShowAdministerDialog(false)}>
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="patient-summary">
                                <p><strong>Bệnh nhân:</strong> {administeringMed.patientName} ({administeringMed.patientCode})</p>
                                <p><strong>Thuốc:</strong> {administeringMed.medicationDisplay}</p>
                            </div>

                            <div className="form-group">
                                <label>Thời gian thực hiện <span className="required">*</span></label>
                                <input
                                    type="datetime-local"
                                    value={administerData.actualDatetime}
                                    onChange={(e) => setAdministerData({...administerData, actualDatetime: e.target.value})}
                                />
                            </div>

                            <div className="form-group">
                                <label>Ghi chú thực hiện <span className="required">*</span></label>
                                <textarea
                                    value={administerData.administrationNotes}
                                    onChange={(e) => setAdministerData({...administerData, administrationNotes: e.target.value})}
                                    placeholder="Nhập ghi chú về quá trình thực hiện..."
                                    rows="3"
                                />
                            </div>

                            <div className="form-group">
                                <label>Phản ứng của bệnh nhân</label>
                                <textarea
                                    value={administerData.patientResponse}
                                    onChange={(e) => setAdministerData({...administerData, patientResponse: e.target.value})}
                                    placeholder="Nhập phản ứng của bệnh nhân..."
                                    rows="2"
                                />
                            </div>

                            <div className="form-group">
                                <label>Tác dụng phụ quan sát được</label>
                                <textarea
                                    value={administerData.sideEffectsObserved}
                                    onChange={(e) => setAdministerData({...administerData, sideEffectsObserved: e.target.value})}
                                    placeholder="Nhập tác dụng phụ nếu có..."
                                    rows="2"
                                />
                            </div>

                            <div className="form-group">
                                <label>Mã xác nhận</label>
                                <input
                                    type="text"
                                    value={administerData.confirmationCode}
                                    onChange={(e) => setAdministerData({...administerData, confirmationCode: e.target.value})}
                                    placeholder="Nhập mã xác nhận (nếu có)"
                                />
                            </div>

                            <div className="dialog-actions">
                                <button
                                    className="btn-cancel"
                                    onClick={() => setShowAdministerDialog(false)}
                                    disabled={submittingAdminister}
                                >
                                    Hủy
                                </button>
                                <button
                                    className="btn-confirm"
                                    onClick={handleAdministerMedication}
                                    disabled={submittingAdminister || !administerData.administrationNotes.trim()}
                                >
                                    <FiCheckCircle /> {submittingAdminister ? 'Đang xử lý...' : 'Xác nhận thực hiện'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Refuse Dialog */}
            {showRefuseDialog && refusingMed && (
                <div className="modal-overlay" onClick={() => setShowRefuseDialog(false)}>
                    <div className="modal-content refuse-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Từ chối Medication</h2>
                            <button className="btn-close" onClick={() => setShowRefuseDialog(false)}>
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="patient-summary">
                                <p><strong>Bệnh nhân:</strong> {refusingMed.patientName} ({refusingMed.patientCode})</p>
                                <p><strong>Thuốc:</strong> {refusingMed.medicationDisplay}</p>
                            </div>

                            <div className="form-group">
                                <label>Lý do từ chối <span className="required">*</span></label>
                                <textarea
                                    value={refuseReason}
                                    onChange={(e) => setRefuseReason(e.target.value)}
                                    placeholder="Nhập lý do từ chối (tối thiểu 10 ký tự)..."
                                    rows="4"
                                    className={refuseReason.trim().length > 0 && refuseReason.trim().length < 10 ? 'error' : ''}
                                />
                                {refuseReason.trim().length > 0 && refuseReason.trim().length < 10 && (
                                    <span className="error-message">
                                        Lý do phải có ít nhất 10 ký tự (hiện tại: {refuseReason.trim().length})
                                    </span>
                                )}
                            </div>

                            <div className="dialog-actions">
                                <button
                                    className="btn-cancel"
                                    onClick={() => setShowRefuseDialog(false)}
                                    disabled={submittingRefuse}
                                >
                                    Hủy
                                </button>
                                <button
                                    className="btn-confirm btn-refuse-confirm"
                                    onClick={handleRefuseMedication}
                                    disabled={submittingRefuse || !refuseReason.trim() || refuseReason.trim().length < 10}
                                >
                                    <FiXCircle /> {submittingRefuse ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Miss Dialog */}
            {showMissDialog && missingMed && (
                <div className="modal-overlay" onClick={() => setShowMissDialog(false)}>
                    <div className="modal-content miss-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Đánh dấu Bỏ lỡ Medication</h2>
                            <button className="btn-close" onClick={() => setShowMissDialog(false)}>
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="patient-summary">
                                <p><strong>Bệnh nhân:</strong> {missingMed.patientName} ({missingMed.patientCode})</p>
                                <p><strong>Thuốc:</strong> {missingMed.medicationDisplay}</p>
                            </div>

                            <div className="form-group">
                                <label>Lý do bỏ lỡ <span className="required">*</span></label>
                                <textarea
                                    value={missReason}
                                    onChange={(e) => setMissReason(e.target.value)}
                                    placeholder="Nhập lý do bỏ lỡ (tối thiểu 10 ký tự)..."
                                    rows="4"
                                    className={missReason.trim().length > 0 && missReason.trim().length < 10 ? 'error' : ''}
                                />
                                {missReason.trim().length > 0 && missReason.trim().length < 10 && (
                                    <span className="error-message">
                                        Lý do phải có ít nhất 10 ký tự (hiện tại: {missReason.trim().length})
                                    </span>
                                )}
                            </div>

                            <div className="dialog-actions">
                                <button
                                    className="btn-cancel"
                                    onClick={() => setShowMissDialog(false)}
                                    disabled={submittingMiss}
                                >
                                    Hủy
                                </button>
                                <button
                                    className="btn-confirm btn-miss-confirm"
                                    onClick={handleMissMedication}
                                    disabled={submittingMiss || !missReason.trim() || missReason.trim().length < 10}
                                >
                                    <FiAlertTriangle /> {submittingMiss ? 'Đang xử lý...' : 'Xác nhận bỏ lỡ'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicationManagementPage;

