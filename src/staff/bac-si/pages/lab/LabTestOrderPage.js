import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './LabTestOrderPage.css';
import {
    FiSearch, FiUser, FiClock, FiActivity, FiPlus, FiList, FiX,
    FiAlertCircle, FiCheckCircle, FiFileText, FiClipboard
} from 'react-icons/fi';
import { doctorEncounterAPI } from '../../../../services/staff/doctorAPI';

const LabTestOrderPage = () => {
    const location = useLocation();
    const [encounterId, setEncounterId] = useState('');
    const [encounter, setEncounter] = useState(null);
    const [labOrders, setLabOrders] = useState([]);
    const [medicalTests, setMedicalTests] = useState([]);
    const [loadingTests, setLoadingTests] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [error, setError] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [showOrderListModal, setShowOrderListModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Lab order form data
    const [orderFormData, setOrderFormData] = useState({
        medicalTestIds: [],
        notes: '',
        urgencyLevel: '',
        specimenType: '',
        clinicalInfo: '',
        priorityNotes: ''
    });

    const loadMedicalTests = async () => {
        try {
            setLoadingTests(true);
            const response = await doctorEncounterAPI.getMedicalTests();

            if (response && response.data) {
                setMedicalTests(response.data);
            }
        } catch (err) {
            console.error('Error loading medical tests:', err);
            // Don't show alert, just log the error
        } finally {
            setLoadingTests(false);
        }
    };

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

    // Load medical tests on component mount
    useEffect(() => {
        loadMedicalTests();
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

    const handleSearchEncounter = async (e) => {
        e.preventDefault();

        if (!encounterId.trim()) {
            alert('Vui lòng nhập Encounter ID');
            return;
        }

        loadEncounterById(encounterId);
    };

    const handleAddLabOrder = () => {
        setOrderFormData({
            medicalTestIds: [],
            notes: '',
            urgencyLevel: '',
            specimenType: '',
            clinicalInfo: '',
            priorityNotes: ''
        });
        setShowOrderModal(true);
    };

    const handleViewLabOrders = async () => {
        try {
            setLoadingOrders(true);
            setShowOrderListModal(true);

            const response = await doctorEncounterAPI.getLabTestOrders(encounter.encounterId);

            if (response && response.data) {
                setLabOrders(response.data);
            }
        } catch (err) {
            console.error('Error loading lab orders:', err);
            alert(err.message || 'Không thể tải danh sách lab orders');
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleOrderFormChange = (e) => {
        const { name, value } = e.target;
        setOrderFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleMedicalTestIdsChange = (e) => {
        const value = e.target.value;
        // Parse comma-separated numbers
        const ids = value.split(',').map(id => id.trim()).filter(id => id !== '');
        setOrderFormData(prev => ({
            ...prev,
            medicalTestIds: ids
        }));
    };

    const handleSubmitLabOrder = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (orderFormData.medicalTestIds.length === 0) {
            alert('Vui lòng chọn ít nhất một Medical Test ID');
            return;
        }

        try {
            setSubmitting(true);

            const payload = {
                medicalTestIds: orderFormData.medicalTestIds.map(id => parseInt(id)),
                notes: orderFormData.notes || null,
                urgencyLevel: orderFormData.urgencyLevel || null,
                specimenType: orderFormData.specimenType || null,
                clinicalInfo: orderFormData.clinicalInfo || null,
                priorityNotes: orderFormData.priorityNotes || null
            };

            const response = await doctorEncounterAPI.createLabTestOrder(encounter.encounterId, payload);

            if (response && response.data) {
                alert('Tạo yêu cầu xét nghiệm thành công!');
                setShowOrderModal(false);
                setOrderFormData({
                    medicalTestIds: [],
                    notes: '',
                    urgencyLevel: '',
                    specimenType: '',
                    clinicalInfo: '',
                    priorityNotes: ''
                });
            }
        } catch (err) {
            console.error('Error creating lab order:', err);
            alert(err.message || 'Không thể tạo yêu cầu xét nghiệm');
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

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getStatusColor = (status) => {
        const statusColors = {
            'PENDING': '#f59e0b',
            'IN_PROGRESS': '#3b82f6',
            'COMPLETED': '#10b981',
            'CANCELLED': '#ef4444'
        };
        return statusColors[status] || '#6b7280';
    };

    return (
        <div className="lab-test-order-page">
            <div className="page-header">
                <div className="header-content">
                    <FiClipboard className="header-icon" />
                    <div>
                        <h1>Yêu cầu xét nghiệm</h1>
                        <p>Tạo và quản lý yêu cầu xét nghiệm</p>
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
                    <FiAlertCircle />
                    <span>{error}</span>
                </div>
            )}

            {loading && (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải thông tin lượt khám...</p>
                </div>
            )}

            {encounter && !loading && (
                <div className="encounter-section">
                    <div className="encounter-card">
                        <div className="encounter-header">
                            <div className="patient-info">
                                <FiUser className="patient-icon" />
                                <div>
                                    <h3>{encounter.patientName}</h3>
                                    <p>Mã BN: {encounter.patientCode}</p>
                                </div>
                            </div>
                            <div className="encounter-badges">
                                <span className="encounter-type-badge">{encounter.encounterType}</span>
                                <span
                                    className="status-badge"
                                    style={{ backgroundColor: getStatusColor(encounter.status), color: '#fff' }}
                                >
                                    {encounter.statusDescription}
                                </span>
                            </div>
                        </div>

                        <div className="encounter-body">
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="label">Encounter ID:</span>
                                    <span className="value">{encounter.encounterId}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Khoa:</span>
                                    <span className="value">{encounter.departmentName || '-'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Thời gian bắt đầu:</span>
                                    <span className="value">{formatDateTime(encounter.startDatetime)}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Người tạo:</span>
                                    <span className="value">{encounter.createdByEmployeeName || '-'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Trạng thái</span>
                                    <span className="value badge-completed"><strong>{encounter.status || 'UNKNOWN'}</strong></span>
                                </div>
                            </div>
                        </div>

                        <div className="encounter-footer">
                            <button className="btn-add-order" onClick={handleAddLabOrder}>
                                <FiPlus /> Tạo Yêu cầu xét nghiệm
                            </button>
                            <button className="btn-view-order" onClick={handleViewLabOrders}>
                                <FiList /> Xem Yêu cầu xét nghiệm
                            </button>
                        </div>
                    </div>
                </div>
            )}




            {/* Add Lab Order Modal */}
            {showOrderModal && (
                <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
                    <div className="modal-content order-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Tạo Yêu cầu xét nghiệm</h3>
                            <button className="modal-close" onClick={() => setShowOrderModal(false)}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="patient-summary">
                                <strong>{encounter?.patientName}</strong> - {encounter?.patientCode}
                            </div>
                            <form onSubmit={handleSubmitLabOrder}>
                                <div className="form-group">
                                    <label>Chọn xét nghiệm <span className="required">*</span></label>
                                    {loadingTests ? (
                                        <div className="loading-tests">Đang tải danh sách xét nghiệm...</div>
                                    ) : medicalTests.length === 0 ? (
                                        <div className="no-tests">Không có xét nghiệm nào</div>
                                    ) : (
                                        <div className="medical-tests-list">
                                            {medicalTests.map(test => (
                                                <label key={test.medicalTestId} className="test-checkbox-item">
                                                    <input
                                                        type="checkbox"
                                                        value={test.medicalTestId}
                                                        checked={orderFormData.medicalTestIds.includes(test.medicalTestId.toString())}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            setOrderFormData(prev => ({
                                                                ...prev,
                                                                medicalTestIds: e.target.checked
                                                                    ? [...prev.medicalTestIds, value]
                                                                    : prev.medicalTestIds.filter(id => id !== value)
                                                            }));
                                                        }}
                                                    />
                                                    <div className="test-info">
                                                        <div className="test-name">
                                                            <strong>{test.testName}</strong>
                                                            <span className="test-code">({test.testCode})</span>
                                                        </div>
                                                        <div className="test-details">
                                                            <span className="test-category">{test.categoryDisplay}</span>
                                                            <span className="test-specimen">{test.specimenTypeDisplay}</span>
                                                            <span className="test-price">{formatCurrency(test.price)}</span>
                                                        </div>
                                                        {test.description && (
                                                            <div className="test-description">{test.description}</div>
                                                        )}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                    <small>Chọn các xét nghiệm cần thực hiện</small>
                                </div>
                                <div className="form-group">
                                    <label>Mức độ khẩn cấp</label>
                                    <select
                                        name="urgencyLevel"
                                        value={orderFormData.urgencyLevel}
                                        onChange={handleOrderFormChange}
                                    >
                                        <option value="">-- Chọn mức độ khẩn cấp --</option>
                                        <option value="ROUTINE">ROUTINE</option>
                                        <option value="URGENT">URGENT</option>
                                        <option value="STAT">STAT</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Loại mẫu</label>
                                    <select
                                        name="specimenType"
                                        value={orderFormData.specimenType}
                                        onChange={handleOrderFormChange}
                                    >
                                        <option value="">-- Chọn loại mẫu --</option>
                                        <option value="BLOOD">Máu (BLOOD) - CBC, Glucose, ALT, AST, Lipid Profile</option>
                                        <option value="URINE">Nước tiểu (URINE) - Urinalysis, Urine Culture, Protein</option>
                                        <option value="STOOL">Phân (STOOL) - Stool Culture, Occult Blood, Parasite</option>
                                        <option value="SPUTUM">Đờm (SPUTUM) - Sputum Culture, AFB (TB), Cytology</option>
                                        <option value="CSF">Dịch não tủy (CSF) - CSF Analysis, CSF Culture</option>
                                        <option value="TISSUE">Mô (TISSUE) - Biopsy, Histopathology</option>
                                        <option value="SWAB">Gạc (SWAB) - Throat Swab, Nasal Swab (COVID-19), Wound Culture</option>
                                        <option value="OTHER">Khác (OTHER) - Các loại mẫu khác</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Thông tin lâm sàng</label>
                                    <textarea
                                        name="clinicalInfo"
                                        value={orderFormData.clinicalInfo}
                                        onChange={handleOrderFormChange}
                                        placeholder="Nhập thông tin lâm sàng..."
                                        rows="3"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Ghi chú ưu tiên</label>
                                    <textarea
                                        name="priorityNotes"
                                        value={orderFormData.priorityNotes}
                                        onChange={handleOrderFormChange}
                                        placeholder="Nhập ghi chú ưu tiên..."
                                        rows="2"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Ghi chú</label>
                                    <textarea
                                        name="notes"
                                        value={orderFormData.notes}
                                        onChange={handleOrderFormChange}
                                        placeholder="Nhập ghi chú..."
                                        rows="3"
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => setShowOrderModal(false)}
                                        disabled={submitting}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={submitting}
                                    >
                                        <FiClipboard /> {submitting ? 'Đang tạo...' : 'Tạo Lab Order'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* View Lab Orders Modal */}
            {showOrderListModal && (
                <div className="modal-overlay" onClick={() => setShowOrderListModal(false)}>
                    <div className="modal-content order-list-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Danh sách Yêu cầu xét nghiệm</h3>
                            <button className="modal-close" onClick={() => setShowOrderListModal(false)}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="patient-summary">
                                <strong>{encounter?.patientName}</strong> - {encounter?.patientCode}
                            </div>
                            {loadingOrders ? (
                                <div className="loading-state-small">
                                    <div className="spinner-small"></div>
                                    <p>Đang tải Yêu cầu xét nghiệm...</p>
                                </div>
                            ) : labOrders.length === 0 ? (
                                <div className="empty-state-small">
                                    <FiClipboard />
                                        <p>Chưa có Yêu cầu xét nghiệm nào</p>
                                </div>
                            ) : (
                                <div className="lab-orders-list">
                                    {labOrders.map((order) => (
                                        <div key={order.labTestOrderId} className="order-card">
                                            <div className="order-header">
                                                <div className="order-title">
                                                    <FiClipboard />
                                                    <strong>Lab Order #{order.labTestOrderId}</strong>
                                                    <span
                                                        className="order-status-badge"
                                                        style={{ backgroundColor: getStatusColor(order.status), color: '#fff' }}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="order-body">
                                                <div className="order-info-grid">
                                                    <div className="order-info-item">
                                                        <span className="order-label">Người tạo:</span>
                                                        <span className="order-value">{order.createdByEmployeeName || '-'}</span>
                                                    </div>
                                                    <div className="order-info-item">
                                                        <span className="order-label">Ngày yêu cầu:</span>
                                                        <span className="order-value">{formatDateTime(order.requestedDatetime)}</span>
                                                    </div>
                                                    {order.technicianEmployeeName && (
                                                        <div className="order-info-item">
                                                            <span className="order-label">Kỹ thuật viên:</span>
                                                            <span className="order-value">{order.technicianEmployeeName}</span>
                                                        </div>
                                                    )}
                                                    {order.completedDatetime && (
                                                        <div className="order-info-item">
                                                            <span className="order-label">Ngày hoàn thành:</span>
                                                            <span className="order-value">{formatDateTime(order.completedDatetime)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {order.results && order.results.length > 0 && (
                                                    <div className="test-results">
                                                        <strong>Kết quả xét nghiệm:</strong>
                                                        <div className="results-list">
                                                            {order.results.map((result) => (
                                                                <div key={result.labTestResultId} className="result-item">
                                                                    <div className="result-header">
                                                                        <span className="test-name">{result.testName}</span>
                                                                        <span className="test-id">ID: {result.medicalTestId}</span>
                                                                    </div>
                                                                    <div className="result-details">
                                                                        <div className="result-value">
                                                                            <strong>Kết quả:</strong> {result.resultValue || '-'} {result.unit || ''}
                                                                        </div>
                                                                        {result.referenceRange && (
                                                                            <div className="result-range">
                                                                                <strong>Tham chiếu:</strong> {result.referenceRange}
                                                                            </div>
                                                                        )}
                                                                        {result.notes && (
                                                                            <div className="result-notes">
                                                                                <strong>Ghi chú:</strong> {result.notes}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LabTestOrderPage;

