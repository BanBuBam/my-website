import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './ImagingOrderPage.css';
import {
    FiSearch, FiUser, FiClock, FiActivity, FiPlus, FiList, FiX,
    FiAlertCircle, FiCheckCircle, FiFileText, FiImage, FiCalendar, FiPlay, FiEdit
} from 'react-icons/fi';
import { doctorEncounterAPI, serviceAPI } from '../../../../services/staff/doctorAPI';

const ImagingOrderPage = () => {
    const location = useLocation();
    const [encounterId, setEncounterId] = useState('');
    const [encounter, setEncounter] = useState(null);
    const [imagingOrders, setImagingOrders] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [error, setError] = useState('');
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [showOrderListModal, setShowOrderListModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Schedule modal states
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedOrderForSchedule, setSelectedOrderForSchedule] = useState(null);
    const [scheduleFormData, setScheduleFormData] = useState({
        scheduledDatetime: '',
        scheduledRoom: '',
        estimatedDurationMinutes: ''
    });

    // Start exam modal states
    const [showStartExamModal, setShowStartExamModal] = useState(false);
    const [selectedOrderForStart, setSelectedOrderForStart] = useState(null);
    const [radiologistId, setRadiologistId] = useState('');
    const [radiologists, setRadiologists] = useState([]);
    const [loadingRadiologists, setLoadingRadiologists] = useState(false);

    // Report modal states
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedOrderForReport, setSelectedOrderForReport] = useState(null);
    const [reportFormData, setReportFormData] = useState({
        findings: '',
        impression: '',
        recommendations: '',
        isCriticalResult: false,
        pacsStudyInstanceUid: '',
        pacsAccessionNumber: '',
        numberOfImages: '',
        imageStorageLocation: ''
    });

    // Detail modal states
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Service autocomplete states
    const [serviceSearchKeyword, setServiceSearchKeyword] = useState('');
    const [serviceSearchResults, setServiceSearchResults] = useState([]);
    const [showServiceDropdown, setShowServiceDropdown] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [loadingServiceSearch, setLoadingServiceSearch] = useState(false);

    const [orderFormData, setOrderFormData] = useState({
        imagingType: '',
        bodyPart: '',
        laterality: '',
        clinicalIndication: '',
        clinicalQuestion: '',
        contrastUsed: false,
        contrastType: '',
        contrastVolumeMl: '',
        contrastRoute: '',
        patientWeightKg: '',
        creatinineLevel: '',
        allergies: '',
        urgencyLevel: '',
        priority: '',
        serviceId: '',
        notes: ''
    });

    // Load services khi component mount
    useEffect(() => {
        loadServices();
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

    // Close service dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showServiceDropdown && !event.target.closest('.autocomplete-wrapper')) {
                setShowServiceDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showServiceDropdown]);

    const loadServices = async () => {
        try {
            const response = await serviceAPI.getServices(0, 100);
            console.log('Services response:', response);

            if (response && response.content) {
                // Response trả về trực tiếp có content
                setServices(response.content);
            } else if (response && response.data && response.data.content) {
                // Response có data wrapper
                setServices(response.data.content);
            } else if (response && Array.isArray(response)) {
                // Response là array trực tiếp
                setServices(response);
            }
        } catch (err) {
            console.error('Error loading services:', err);
        }
    };

    const loadEncounterById = async (id) => {
        if (!id || !id.trim()) return;

        setLoading(true);
        setError('');
        setEncounter(null);

        try {
            const response = await doctorEncounterAPI.getEncounterStatus(id);
            if (response.data) {
                setEncounter(response.data);
            }
        } catch (err) {
            setError(err.message || 'Không tìm thấy encounter');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchEncounter = async (e) => {
        e.preventDefault();
        if (!encounterId.trim()) {
            setError('Vui lòng nhập Encounter ID');
            return;
        }

        loadEncounterById(encounterId);
    };

    const handleAddImagingOrder = () => {
        setShowOrderModal(true);
        setOrderFormData({
            imagingType: '',
            bodyPart: '',
            laterality: '',
            clinicalIndication: '',
            clinicalQuestion: '',
            contrastUsed: false,
            contrastType: '',
            contrastVolumeMl: '',
            contrastRoute: '',
            patientWeightKg: '',
            creatinineLevel: '',
            allergies: '',
            urgencyLevel: '',
            priority: '',
            serviceId: '',
            notes: ''
        });
        // Reset service autocomplete
        setServiceSearchKeyword('');
        setSelectedService(null);
        setServiceSearchResults([]);
        setShowServiceDropdown(false);
    };

    const handleViewImagingOrders = async () => {
        setShowOrderListModal(true);
        setLoadingOrders(true);
        try {
            const response = await doctorEncounterAPI.getImagingOrders(encounterId);
            if (response.data) {
                setImagingOrders(response.data);
            }
        } catch (err) {
            console.error('Error loading imaging orders:', err);
            setImagingOrders([]);
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleOrderFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setOrderFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Service autocomplete handlers
    const handleServiceSearchChange = async (e) => {
        const keyword = e.target.value;
        setServiceSearchKeyword(keyword);
        setShowServiceDropdown(true);

        if (keyword.trim() === '') {
            setServiceSearchResults([]);
            return;
        }

        try {
            setLoadingServiceSearch(true);
            const response = await serviceAPI.getServices(keyword, 0, 20);

            if (response && response.content) {
                setServiceSearchResults(response.content);
            }
        } catch (err) {
            console.error('Error searching services:', err);
            setServiceSearchResults([]);
        } finally {
            setLoadingServiceSearch(false);
        }
    };

    const handleSelectService = (service) => {
        setSelectedService(service);
        setServiceSearchKeyword(service.name);
        setOrderFormData(prev => ({
            ...prev,
            serviceId: service.serviceId
        }));
        setShowServiceDropdown(false);
    };

    const handleServiceInputFocus = async () => {
        setShowServiceDropdown(true);
        // Load initial services if no search keyword
        if (serviceSearchKeyword.trim() === '' && serviceSearchResults.length === 0) {
            try {
                setLoadingServiceSearch(true);
                const response = await serviceAPI.getServices('', 0, 20);
                if (response && response.content) {
                    setServiceSearchResults(response.content);
                }
            } catch (err) {
                console.error('Error loading services:', err);
            } finally {
                setLoadingServiceSearch(false);
            }
        }
    };

    const handleSubmitImagingOrder = async (e) => {
        e.preventDefault();

        // Validation
        if (!orderFormData.imagingType || !orderFormData.bodyPart || !orderFormData.serviceId) {
            alert('Vui lòng điền đầy đủ các trường bắt buộc');
            return;
        }

        setSubmitting(true);
        try {
            const submitData = {
                encounterId: parseInt(encounterId),
                imagingType: orderFormData.imagingType,
                bodyPart: orderFormData.bodyPart,
                laterality: orderFormData.laterality || null,
                clinicalIndication: orderFormData.clinicalIndication || null,
                clinicalQuestion: orderFormData.clinicalQuestion || null,
                contrastUsed: orderFormData.contrastUsed,
                contrastType: orderFormData.contrastType || null,
                contrastVolumeMl: orderFormData.contrastVolumeMl ? parseFloat(orderFormData.contrastVolumeMl) : null,
                contrastRoute: orderFormData.contrastRoute || null,
                patientWeightKg: orderFormData.patientWeightKg ? parseFloat(orderFormData.patientWeightKg) : null,
                creatinineLevel: orderFormData.creatinineLevel ? parseFloat(orderFormData.creatinineLevel) : null,
                allergies: orderFormData.allergies || null,
                urgencyLevel: orderFormData.urgencyLevel || null,
                priority: orderFormData.priority || null,
                serviceId: parseInt(orderFormData.serviceId),
                notes: orderFormData.notes || null
            };

            const response = await doctorEncounterAPI.createImagingOrder(encounterId, submitData);
            if (response.data) {
                alert('Tạo imaging order thành công!');
                setShowOrderModal(false);
            }
        } catch (err) {
            alert('Lỗi: ' + (err.message || 'Không thể tạo imaging order'));
        } finally {
            setSubmitting(false);
        }
    };

    // Schedule imaging exam handlers
    const handleOpenScheduleModal = (order) => {
        setSelectedOrderForSchedule(order);
        setScheduleFormData({
            scheduledDatetime: '',
            scheduledRoom: '',
            estimatedDurationMinutes: ''
        });
        setShowScheduleModal(true);
    };

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        if (!scheduleFormData.scheduledDatetime || !scheduleFormData.scheduledRoom || !scheduleFormData.estimatedDurationMinutes) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        setSubmitting(true);
        try {
            const submitData = {
                scheduledDatetime: scheduleFormData.scheduledDatetime,
                scheduledRoom: scheduleFormData.scheduledRoom,
                estimatedDurationMinutes: parseInt(scheduleFormData.estimatedDurationMinutes)
            };

            const response = await doctorEncounterAPI.scheduleImagingExam(selectedOrderForSchedule.imagingOrderId, submitData);
            if (response.data) {
                alert('Lên lịch thành công!');
                setShowScheduleModal(false);
                handleViewImagingOrders();
            }
        } catch (err) {
            alert('Lỗi: ' + (err.message || 'Không thể lên lịch'));
        } finally {
            setSubmitting(false);
        }
    };

    // Start exam handlers
    const handleOpenStartExamModal = async (order) => {
        setSelectedOrderForStart(order);
        setRadiologistId('');
        setShowStartExamModal(true);

        // Fetch radiologists
        setLoadingRadiologists(true);
        try {
            const response = await doctorEncounterAPI.getRadiologists();
            console.log('Radiologists Response:', response);
            if (response && response.data) {
                setRadiologists(response.data);
            }
        } catch (err) {
            console.error('Error fetching radiologists:', err);
            setRadiologists([]);
        } finally {
            setLoadingRadiologists(false);
        }
    };

    const handleStartExamSubmit = async (e) => {
        e.preventDefault();
        if (!radiologistId) {
            alert('Vui lòng nhập Radiologist ID!');
            return;
        }

        setSubmitting(true);
        try {
            const response = await doctorEncounterAPI.startImagingExam(selectedOrderForStart.imagingOrderId, parseInt(radiologistId));
            if (response.data) {
                alert('Bắt đầu exam thành công!');
                setShowStartExamModal(false);
                handleViewImagingOrders();
            }
        } catch (err) {
            alert('Lỗi: ' + (err.message || 'Không thể bắt đầu exam'));
        } finally {
            setSubmitting(false);
        }
    };

    // Complete exam handler
    const handleCompleteExam = async (order) => {
        if (!window.confirm(`Xác nhận hoàn thành exam cho Imaging Order #${order.imagingOrderId}?`)) {
            return;
        }

        try {
            const response = await doctorEncounterAPI.completeImagingExam(order.imagingOrderId);
            if (response.data) {
                alert('Hoàn thành exam thành công!');
                handleViewImagingOrders();
            }
        } catch (err) {
            alert('Lỗi: ' + (err.message || 'Không thể hoàn thành exam'));
        }
    };

    // Detail handlers
    const handleViewDetail = async (order) => {
        setShowDetailModal(true);
        setLoadingDetail(true);
        setSelectedOrderDetail(null);

        try {
            const response = await doctorEncounterAPI.getImagingOrderDetail(order.imagingOrderId);
            if (response.data) {
                setSelectedOrderDetail(response.data);
            }
        } catch (err) {
            console.error('Error loading imaging order detail:', err);
            alert('Lỗi: ' + (err.message || 'Không thể tải chi tiết imaging order'));
        } finally {
            setLoadingDetail(false);
        }
    };

    // Report handlers
    const handleOpenReportModal = (order) => {
        setSelectedOrderForReport(order);
        setReportFormData({
            findings: order.findings || '',
            impression: order.impression || '',
            recommendations: order.recommendations || '',
            isCriticalResult: order.isCriticalResult || false,
            pacsStudyInstanceUid: order.pacsStudyInstanceUid || '',
            pacsAccessionNumber: order.pacsAccessionNumber || '',
            numberOfImages: order.numberOfImages || '',
            imageStorageLocation: order.imageStorageLocation || ''
        });
        setShowReportModal(true);
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        if (!reportFormData.findings || !reportFormData.impression) {
            alert('Vui lòng điền findings và impression!');
            return;
        }

        setSubmitting(true);
        try {
            const submitData = {
                findings: reportFormData.findings,
                impression: reportFormData.impression,
                recommendations: reportFormData.recommendations || null,
                isCriticalResult: reportFormData.isCriticalResult,
                pacsStudyInstanceUid: reportFormData.pacsStudyInstanceUid || null,
                pacsAccessionNumber: reportFormData.pacsAccessionNumber || null,
                numberOfImages: reportFormData.numberOfImages ? parseInt(reportFormData.numberOfImages) : null,
                imageStorageLocation: reportFormData.imageStorageLocation || null
            };

            const response = await doctorEncounterAPI.reportImagingResults(selectedOrderForReport.imagingOrderId, submitData);
            if (response.data) {
                alert('Báo cáo kết quả thành công!');
                setShowReportModal(false);
                handleViewImagingOrders();
            }
        } catch (err) {
            alert('Lỗi: ' + (err.message || 'Không thể báo cáo kết quả'));
        } finally {
            setSubmitting(false);
        }
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '-';
        const date = new Date(dateTimeString);
        return date.toLocaleString('vi-VN');
    };

    const getStatusColor = (status) => {
        const colors = {
            'PENDING': '#f59e0b',
            'SCHEDULED': '#3b82f6',
            'IN_PROGRESS': '#8b5cf6',
            'COMPLETED': '#10b981',
            'CANCELLED': '#ef4444',
            'REPORTED': '#06b6d4'
        };
        return colors[status] || '#6b7280';
    };

    return (
        <div className="imaging-order-page">
            <div className="page-header">
                <div className="header-content">
                    <FiImage className="header-icon" />
                    <div>
                        <h1>Yêu cầu chẩn đoán hình ảnh</h1>
                        <p>Tạo và quản lý yêu cầu chẩn đoán hình ảnh</p>
                    </div>
                </div>
            </div>

            {/* Search Section */}
            <div className="search-section">
                <form onSubmit={handleSearchEncounter} className="search-form">
                    <div className="search-input-group">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Nhập Encounter ID..."
                            value={encounterId}
                            onChange={(e) => setEncounterId(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn-search" disabled={loading}>
                        {loading ? 'Đang tìm...' : 'Tìm kiếm'}
                    </button>
                </form>
            </div>

            {/* Error Message */}
            {error && (
                <div className="error-message">
                    <FiAlertCircle />
                    <span>{error}</span>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tìm kiếm lượt khám...</p>
                </div>
            )}

            {/* Encounter Information */}
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
                                    {encounter.status}
                                </span>
                            </div>
                        </div>
                        <div className="encounter-body">
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="label">Encounter ID</span>
                                    <span className="value">{encounter.encounterId}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Bác sĩ</span>
                                    <span className="value">{encounter.doctorName || '-'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Thời gian</span>
                                    <span className="value">{formatDateTime(encounter.encounterDatetime)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="encounter-footer">
                            <button className="btn-add-order" onClick={handleAddImagingOrder}>
                                <FiPlus /> Tạo Yêu cầu chẩn đoán hình ảnh
                            </button>
                            <button className="btn-view-order" onClick={handleViewImagingOrders}>
                                <FiList /> Xem Yêu cầu chẩn đoán hình ảnh
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Imaging Order Modal */}
            {showOrderModal && (
                <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
                    <div className="modal-content order-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Tạo Yêu cầu chẩn đoán hình ảnh</h3>
                            <button className="modal-close" onClick={() => setShowOrderModal(false)}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="patient-summary">
                                <strong>{encounter?.patientName}</strong> - {encounter?.patientCode}
                            </div>
                            <form onSubmit={handleSubmitImagingOrder}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Loại hình ảnh <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            name="imagingType"
                                            value={orderFormData.imagingType}
                                            onChange={handleOrderFormChange}
                                            placeholder="VD: X-RAY, CT, MRI, ULTRASOUND"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Bộ phận <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            name="bodyPart"
                                            value={orderFormData.bodyPart}
                                            onChange={handleOrderFormChange}
                                            placeholder="VD: CHEST, HEAD, ABDOMEN"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Laterality</label>
                                        <select
                                            name="laterality"
                                            value={orderFormData.laterality}
                                            onChange={handleOrderFormChange}
                                        >
                                            <option value="">-- Chọn --</option>
                                            <option value="LEFT">LEFT</option>
                                            <option value="RIGHT">RIGHT</option>
                                            <option value="BILATERAL">BILATERAL</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Service <span className="required">*</span></label>
                                        <div className="autocomplete-wrapper">
                                            <input
                                                type="text"
                                                value={serviceSearchKeyword}
                                                onChange={handleServiceSearchChange}
                                                onFocus={handleServiceInputFocus}
                                                placeholder="Nhập tên dịch vụ để tìm kiếm..."
                                                required
                                                autoComplete="off"
                                            />
                                            {showServiceDropdown && (
                                                <div className="autocomplete-dropdown">
                                                    {loadingServiceSearch ? (
                                                        <div className="autocomplete-loading">Đang tìm kiếm...</div>
                                                    ) : serviceSearchResults.length === 0 ? (
                                                        <div className="autocomplete-empty">Không tìm thấy dịch vụ</div>
                                                    ) : (
                                                        serviceSearchResults.map(service => (
                                                            <div
                                                                key={service.serviceId}
                                                                className={`autocomplete-item ${selectedService?.serviceId === service.serviceId ? 'selected' : ''}`}
                                                                onClick={() => handleSelectService(service)}
                                                            >
                                                                <div className="service-name">{service.name}</div>
                                                                <div className="service-price">
                                                                    {service.price?.toLocaleString('vi-VN')} VNĐ
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Chỉ định lâm sàng</label>
                                    <textarea
                                        name="clinicalIndication"
                                        value={orderFormData.clinicalIndication}
                                        onChange={handleOrderFormChange}
                                        rows="2"
                                        placeholder="Nhập chỉ định lâm sàng..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Câu hỏi lâm sàng</label>
                                    <textarea
                                        name="clinicalQuestion"
                                        value={orderFormData.clinicalQuestion}
                                        onChange={handleOrderFormChange}
                                        rows="2"
                                        placeholder="Nhập câu hỏi lâm sàng..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="checkbox-label-inline">
                                        <input
                                            type="checkbox"
                                            name="contrastUsed"
                                            checked={orderFormData.contrastUsed}
                                            onChange={handleOrderFormChange}
                                        />
                                        <span>Sử dụng thuốc cản quang</span>
                                    </label>
                                </div>

                                {orderFormData.contrastUsed && (
                                    <>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Loại thuốc cản quang</label>
                                                <input
                                                    type="text"
                                                    name="contrastType"
                                                    value={orderFormData.contrastType}
                                                    onChange={handleOrderFormChange}
                                                    placeholder="Nhập loại thuốc..."
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Thể tích (ml)</label>
                                                <input
                                                    type="number"
                                                    name="contrastVolumeMl"
                                                    value={orderFormData.contrastVolumeMl}
                                                    onChange={handleOrderFormChange}
                                                    placeholder="0"
                                                    step="0.1"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Đường dùng</label>
                                            <input
                                                type="text"
                                                name="contrastRoute"
                                                value={orderFormData.contrastRoute}
                                                onChange={handleOrderFormChange}
                                                placeholder="VD: IV, ORAL"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Cân nặng BN (kg)</label>
                                        <input
                                            type="number"
                                            name="patientWeightKg"
                                            value={orderFormData.patientWeightKg}
                                            onChange={handleOrderFormChange}
                                            placeholder="0"
                                            step="0.1"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Creatinine Level</label>
                                        <input
                                            type="number"
                                            name="creatinineLevel"
                                            value={orderFormData.creatinineLevel}
                                            onChange={handleOrderFormChange}
                                            placeholder="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Dị ứng</label>
                                    <textarea
                                        name="allergies"
                                        value={orderFormData.allergies}
                                        onChange={handleOrderFormChange}
                                        rows="2"
                                        placeholder="Nhập thông tin dị ứng..."
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Mức độ khẩn cấp</label>
                                        <select
                                            name="urgencyLevel"
                                            value={orderFormData.urgencyLevel}
                                            onChange={handleOrderFormChange}
                                        >
                                            <option value="">-- Chọn --</option>
                                            <option value="ROUTINE">ROUTINE</option>
                                            <option value="URGENT">URGENT</option>
                                            <option value="STAT">STAT</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Ưu tiên</label>
                                        <select
                                            name="priority"
                                            value={orderFormData.priority}
                                            onChange={handleOrderFormChange}
                                        >
                                            <option value="">-- Chọn --</option>
                                            <option value="LOW">LOW</option>
                                            <option value="MEDIUM">MEDIUM</option>
                                            <option value="HIGH">HIGH</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Ghi chú</label>
                                    <textarea
                                        name="notes"
                                        value={orderFormData.notes}
                                        onChange={handleOrderFormChange}
                                        rows="3"
                                        placeholder="Nhập ghi chú..."
                                    />
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => setShowOrderModal(false)}
                                    >
                                        <FiX /> Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={submitting}
                                    >
                                        <FiImage /> {submitting ? 'Đang tạo...' : 'Tạo Yêu cầu chẩn đoán hình ảnh'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* View Imaging Orders Modal */}
            {showOrderListModal && (
                <div className="modal-overlay" onClick={() => setShowOrderListModal(false)}>
                    <div className="modal-content order-list-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Danh sách Yêu cầu chẩn đoán hình ảnh</h3>
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
                                    <p>Đang tải Yêu cầu chẩn đoán hình ảnh...</p>
                                </div>
                            ) : imagingOrders.length === 0 ? (
                                <div className="empty-state-small">
                                    <FiImage />
                                        <p>Chưa có Yêu cầu chẩn đoán hình ảnh nào</p>
                                </div>
                            ) : (
                                <div className="imaging-orders-list">
                                    {imagingOrders.map((order) => (
                                        <div key={order.imagingOrderId} className="order-card">
                                            <div className="order-header">
                                                <div className="order-title">
                                                    <FiImage />
                                                    <strong>Imaging Order #{order.imagingOrderId}</strong>
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
                                                        <span className="order-label">Loại hình ảnh:</span>
                                                        <span className="order-value">{order.imagingType || '-'}</span>
                                                    </div>
                                                    <div className="order-info-item">
                                                        <span className="order-label">Bộ phận:</span>
                                                        <span className="order-value">{order.bodyPart || '-'}</span>
                                                    </div>
                                                    <div className="order-info-item">
                                                        <span className="order-label">Laterality:</span>
                                                        <span className="order-value">{order.laterality || '-'}</span>
                                                    </div>
                                                    <div className="order-info-item">
                                                        <span className="order-label">Bác sĩ chỉ định:</span>
                                                        <span className="order-value">{order.orderedByDoctorName || '-'}</span>
                                                    </div>
                                                    <div className="order-info-item">
                                                        <span className="order-label">Ngày chỉ định:</span>
                                                        <span className="order-value">{formatDateTime(order.orderedAt)}</span>
                                                    </div>
                                                    <div className="order-info-item">
                                                        <span className="order-label">Dịch vụ:</span>
                                                        <span className="order-value">{order.serviceName || '-'}</span>
                                                    </div>
                                                </div>
                                                {order.clinicalIndication && (
                                                    <div className="order-detail-section">
                                                        <strong>Chỉ định lâm sàng:</strong>
                                                        <p>{order.clinicalIndication}</p>
                                                    </div>
                                                )}
                                                {order.clinicalQuestion && (
                                                    <div className="order-detail-section">
                                                        <strong>Câu hỏi lâm sàng:</strong>
                                                        <p>{order.clinicalQuestion}</p>
                                                    </div>
                                                )}
                                                {order.contrastUsed && (
                                                    <div className="order-detail-section">
                                                        <strong>Thuốc cản quang:</strong>
                                                        <p>
                                                            {order.contrastType} - {order.contrastVolumeMl}ml ({order.contrastRoute})
                                                        </p>
                                                    </div>
                                                )}
                                                {order.findings && (
                                                    <div className="order-detail-section findings">
                                                        <strong>Kết quả:</strong>
                                                        <p>{order.findings}</p>
                                                    </div>
                                                )}
                                                {order.impression && (
                                                    <div className="order-detail-section impression">
                                                        <strong>Kết luận:</strong>
                                                        <p>{order.impression}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="order-actions">
                                                <button
                                                    className="btn-action btn-detail"
                                                    onClick={() => handleViewDetail(order)}
                                                >
                                                    <FiFileText /> Chi tiết
                                                </button>
                                                <button
                                                    className="btn-action btn-schedule"
                                                    onClick={() => handleOpenScheduleModal(order)}
                                                >
                                                    <FiCalendar /> Lên lịch
                                                </button>
                                                <button
                                                    className="btn-action btn-start"
                                                    onClick={() => handleOpenStartExamModal(order)}
                                                >
                                                    <FiPlay /> Bắt đầu
                                                </button>
                                                <button
                                                    className="btn-action btn-complete"
                                                    onClick={() => handleCompleteExam(order)}
                                                >
                                                    <FiCheckCircle /> Hoàn thành
                                                </button>
                                                <button
                                                    className="btn-action btn-report"
                                                    onClick={() => handleOpenReportModal(order)}
                                                >
                                                    <FiEdit /> Báo cáo KQ
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

            {/* Schedule Modal */}
            {showScheduleModal && (
                <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
                    <div className="modal-content order-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Lên lịch Imaging Exam</h3>
                            <button className="modal-close" onClick={() => setShowScheduleModal(false)}>
                                <FiX />
                            </button>
                        </div>
                        <form onSubmit={handleScheduleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Imaging Order ID</label>
                                    <input
                                        type="text"
                                        value={selectedOrderForSchedule?.imagingOrderId || ''}
                                        disabled
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Ngày giờ lên lịch <span className="required">*</span></label>
                                    <input
                                        type="datetime-local"
                                        value={scheduleFormData.scheduledDatetime}
                                        onChange={(e) => setScheduleFormData({...scheduleFormData, scheduledDatetime: e.target.value})}
                                        className="form-control"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phòng <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        value={scheduleFormData.scheduledRoom}
                                        onChange={(e) => setScheduleFormData({...scheduleFormData, scheduledRoom: e.target.value})}
                                        className="form-control"
                                        placeholder="Nhập tên phòng"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Thời gian dự kiến (phút) <span className="required">*</span></label>
                                    <input
                                        type="number"
                                        value={scheduleFormData.estimatedDurationMinutes}
                                        onChange={(e) => setScheduleFormData({...scheduleFormData, estimatedDurationMinutes: e.target.value})}
                                        className="form-control"
                                        placeholder="Nhập số phút"
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowScheduleModal(false)}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn-submit" disabled={submitting}>
                                    {submitting ? 'Đang xử lý...' : 'Lên lịch'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Start Exam Modal */}
            {showStartExamModal && (
                <div className="modal-overlay" onClick={() => setShowStartExamModal(false)}>
                    <div className="modal-content order-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Bắt đầu Imaging Exam</h3>
                            <button className="modal-close" onClick={() => setShowStartExamModal(false)}>
                                <FiX />
                            </button>
                        </div>
                        <form onSubmit={handleStartExamSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Imaging Order ID</label>
                                    <input
                                        type="text"
                                        value={selectedOrderForStart?.imagingOrderId || ''}
                                        disabled
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Chọn Radiologist <span className="required">*</span></label>
                                    {loadingRadiologists ? (
                                        <div className="loading-select">
                                            <span>Đang tải danh sách radiologist...</span>
                                        </div>
                                    ) : (
                                        <select
                                            value={radiologistId}
                                            onChange={(e) => setRadiologistId(e.target.value)}
                                            className="form-control"
                                            required
                                        >
                                            <option value="">-- Chọn Radiologist --</option>
                                            {radiologists.map((radiologist) => (
                                                <option key={radiologist.employeeId} value={radiologist.employeeId}>
                                                    {radiologist.fullName} - {radiologist.employeeCode} ({radiologist.specialization})
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowStartExamModal(false)}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn-submit" disabled={submitting || loadingRadiologists}>
                                    {submitting ? 'Đang xử lý...' : 'Bắt đầu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Report Modal */}
            {showReportModal && (
                <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
                    <div className="modal-content order-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Báo cáo kết quả Imaging</h3>
                            <button className="modal-close" onClick={() => setShowReportModal(false)}>
                                <FiX />
                            </button>
                        </div>
                        <form onSubmit={handleReportSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Imaging Order ID</label>
                                    <input
                                        type="text"
                                        value={selectedOrderForReport?.imagingOrderId || ''}
                                        disabled
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Findings <span className="required">*</span></label>
                                    <textarea
                                        value={reportFormData.findings}
                                        onChange={(e) => setReportFormData({...reportFormData, findings: e.target.value})}
                                        className="form-control"
                                        rows="4"
                                        placeholder="Nhập findings"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Impression <span className="required">*</span></label>
                                    <textarea
                                        value={reportFormData.impression}
                                        onChange={(e) => setReportFormData({...reportFormData, impression: e.target.value})}
                                        className="form-control"
                                        rows="4"
                                        placeholder="Nhập impression"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Recommendations</label>
                                    <textarea
                                        value={reportFormData.recommendations}
                                        onChange={(e) => setReportFormData({...reportFormData, recommendations: e.target.value})}
                                        className="form-control"
                                        rows="3"
                                        placeholder="Nhập recommendations"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={reportFormData.isCriticalResult}
                                            onChange={(e) => setReportFormData({...reportFormData, isCriticalResult: e.target.checked})}
                                        />
                                        <span>Kết quả nghiêm trọng (Critical Result)</span>
                                    </label>
                                </div>
                                <div className="form-group">
                                    <label>PACS Study Instance UID</label>
                                    <input
                                        type="text"
                                        value={reportFormData.pacsStudyInstanceUid}
                                        onChange={(e) => setReportFormData({...reportFormData, pacsStudyInstanceUid: e.target.value})}
                                        className="form-control"
                                        placeholder="Nhập PACS Study Instance UID"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>PACS Accession Number</label>
                                    <input
                                        type="text"
                                        value={reportFormData.pacsAccessionNumber}
                                        onChange={(e) => setReportFormData({...reportFormData, pacsAccessionNumber: e.target.value})}
                                        className="form-control"
                                        placeholder="Nhập PACS Accession Number"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Số lượng hình ảnh</label>
                                    <input
                                        type="number"
                                        value={reportFormData.numberOfImages}
                                        onChange={(e) => setReportFormData({...reportFormData, numberOfImages: e.target.value})}
                                        className="form-control"
                                        placeholder="Nhập số lượng hình ảnh"
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Vị trí lưu trữ hình ảnh</label>
                                    <input
                                        type="text"
                                        value={reportFormData.imageStorageLocation}
                                        onChange={(e) => setReportFormData({...reportFormData, imageStorageLocation: e.target.value})}
                                        className="form-control"
                                        placeholder="Nhập vị trí lưu trữ"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowReportModal(false)}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn-submit" disabled={submitting}>
                                    {submitting ? 'Đang xử lý...' : 'Báo cáo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Chi tiết Imaging Order</h3>
                            <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body">
                            {loadingDetail ? (
                                <div className="loading-state">
                                    <p>Đang tải chi tiết...</p>
                                </div>
                            ) : selectedOrderDetail ? (
                                <div className="detail-content">
                                    {/* Thông tin cơ bản */}
                                    <div className="detail-section">
                                        <h4>Thông tin cơ bản</h4>
                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <label>Imaging Order ID:</label>
                                                <span>{selectedOrderDetail.imagingOrderId}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Encounter ID:</label>
                                                <span>{selectedOrderDetail.encounterId}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Bệnh nhân:</label>
                                                <span>{selectedOrderDetail.patientName} (ID: {selectedOrderDetail.patientId})</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Bác sĩ chỉ định:</label>
                                                <span>{selectedOrderDetail.orderedByDoctorName}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Loại chụp:</label>
                                                <span>{selectedOrderDetail.imagingTypeDisplay}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Bộ phận:</label>
                                                <span>{selectedOrderDetail.bodyPart}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Vị trí:</label>
                                                <span>{selectedOrderDetail.laterality || 'N/A'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Trạng thái:</label>
                                                <span className={`status-badge status-${selectedOrderDetail.status?.toLowerCase()}`}>
                                                    {selectedOrderDetail.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thông tin lâm sàng */}
                                    <div className="detail-section">
                                        <h4>Thông tin lâm sàng</h4>
                                        <div className="detail-grid">
                                            <div className="detail-item full-width">
                                                <label>Chỉ định lâm sàng:</label>
                                                <span>{selectedOrderDetail.clinicalIndication || 'N/A'}</span>
                                            </div>
                                            <div className="detail-item full-width">
                                                <label>Câu hỏi lâm sàng:</label>
                                                <span>{selectedOrderDetail.clinicalQuestion || 'N/A'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Cân nặng BN:</label>
                                                <span>{selectedOrderDetail.patientWeightKg ? `${selectedOrderDetail.patientWeightKg} kg` : 'N/A'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Creatinine:</label>
                                                <span>{selectedOrderDetail.creatinineLevel || 'N/A'}</span>
                                            </div>
                                            <div className="detail-item full-width">
                                                <label>Dị ứng:</label>
                                                <span>{selectedOrderDetail.allergies || 'Không'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thuốc cản quang */}
                                    {selectedOrderDetail.contrastUsed && (
                                        <div className="detail-section">
                                            <h4>Thuốc cản quang</h4>
                                            <div className="detail-grid">
                                                <div className="detail-item">
                                                    <label>Loại:</label>
                                                    <span>{selectedOrderDetail.contrastType || 'N/A'}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Thể tích:</label>
                                                    <span>{selectedOrderDetail.contrastVolumeMl ? `${selectedOrderDetail.contrastVolumeMl} ml` : 'N/A'}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Đường dùng:</label>
                                                    <span>{selectedOrderDetail.contrastRoute || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Lịch hẹn */}
                                    {selectedOrderDetail.scheduledDatetime && (
                                        <div className="detail-section">
                                            <h4>Thông tin lịch hẹn</h4>
                                            <div className="detail-grid">
                                                <div className="detail-item">
                                                    <label>Ngày giờ:</label>
                                                    <span>{new Date(selectedOrderDetail.scheduledDatetime).toLocaleString('vi-VN')}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Phòng:</label>
                                                    <span>{selectedOrderDetail.scheduledRoom || 'N/A'}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Thời lượng dự kiến:</label>
                                                    <span>{selectedOrderDetail.estimatedDurationMinutes ? `${selectedOrderDetail.estimatedDurationMinutes} phút` : 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Thông tin thực hiện */}
                                    {selectedOrderDetail.radiologistName && (
                                        <div className="detail-section">
                                            <h4>Thông tin thực hiện</h4>
                                            <div className="detail-grid">
                                                <div className="detail-item">
                                                    <label>Bác sĩ X-quang:</label>
                                                    <span>{selectedOrderDetail.radiologistName}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Kỹ thuật viên:</label>
                                                    <span>{selectedOrderDetail.technicianName || 'N/A'}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Bắt đầu:</label>
                                                    <span>{selectedOrderDetail.examStartDatetime ? new Date(selectedOrderDetail.examStartDatetime).toLocaleString('vi-VN') : 'N/A'}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Kết thúc:</label>
                                                    <span>{selectedOrderDetail.examEndDatetime ? new Date(selectedOrderDetail.examEndDatetime).toLocaleString('vi-VN') : 'N/A'}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Thời lượng thực tế:</label>
                                                    <span>{selectedOrderDetail.actualDurationMinutes ? `${selectedOrderDetail.actualDurationMinutes} phút` : 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Kết quả */}
                                    {selectedOrderDetail.findings && (
                                        <div className="detail-section">
                                            <h4>Kết quả</h4>
                                            <div className="detail-grid">
                                                <div className="detail-item full-width">
                                                    <label>Findings:</label>
                                                    <span>{selectedOrderDetail.findings}</span>
                                                </div>
                                                <div className="detail-item full-width">
                                                    <label>Impression:</label>
                                                    <span>{selectedOrderDetail.impression || 'N/A'}</span>
                                                </div>
                                                <div className="detail-item full-width">
                                                    <label>Recommendations:</label>
                                                    <span>{selectedOrderDetail.recommendations || 'N/A'}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Kết quả nghiêm trọng:</label>
                                                    <span>{selectedOrderDetail.isCriticalResult ? 'Có' : 'Không'}</span>
                                                </div>
                                                {selectedOrderDetail.reportedByRadiologistName && (
                                                    <>
                                                        <div className="detail-item">
                                                            <label>Báo cáo bởi:</label>
                                                            <span>{selectedOrderDetail.reportedByRadiologistName}</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <label>Thời gian báo cáo:</label>
                                                            <span>{new Date(selectedOrderDetail.reportedAt).toLocaleString('vi-VN')}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* PACS Info */}
                                    {selectedOrderDetail.pacsStudyInstanceUid && (
                                        <div className="detail-section">
                                            <h4>Thông tin PACS</h4>
                                            <div className="detail-grid">
                                                <div className="detail-item">
                                                    <label>Study Instance UID:</label>
                                                    <span>{selectedOrderDetail.pacsStudyInstanceUid}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Accession Number:</label>
                                                    <span>{selectedOrderDetail.pacsAccessionNumber || 'N/A'}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Số lượng hình ảnh:</label>
                                                    <span>{selectedOrderDetail.numberOfImages || 'N/A'}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Vị trí lưu trữ:</label>
                                                    <span>{selectedOrderDetail.imageStorageLocation || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Chi phí */}
                                    <div className="detail-section">
                                        <h4>Chi phí</h4>
                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <label>Dịch vụ:</label>
                                                <span>{selectedOrderDetail.serviceName}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Giá dịch vụ:</label>
                                                <span>{selectedOrderDetail.actualPrice?.toLocaleString('vi-VN')} đ</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Phí cản quang:</label>
                                                <span>{selectedOrderDetail.contrastFee?.toLocaleString('vi-VN')} đ</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Phí phụ thu:</label>
                                                <span>{selectedOrderDetail.additionalFees?.toLocaleString('vi-VN')} đ</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Tổng chi phí:</label>
                                                <span>{selectedOrderDetail.totalCost?.toLocaleString('vi-VN')} đ</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Giảm giá:</label>
                                                <span>{selectedOrderDetail.discountAmount?.toLocaleString('vi-VN')} đ</span>
                                            </div>
                                            <div className="detail-item">
                                                <label><strong>Thành tiền:</strong></label>
                                                <span><strong>{selectedOrderDetail.finalAmount?.toLocaleString('vi-VN')} đ</strong></span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thời gian */}
                                    <div className="detail-section">
                                        <h4>Thời gian</h4>
                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <label>Ngày tạo:</label>
                                                <span>{new Date(selectedOrderDetail.createdAt).toLocaleString('vi-VN')}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Cập nhật lần cuối:</label>
                                                <span>{new Date(selectedOrderDetail.updatedAt).toLocaleString('vi-VN')}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Ngày chỉ định:</label>
                                                <span>{new Date(selectedOrderDetail.orderedAt).toLocaleString('vi-VN')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p>Không có dữ liệu</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn-cancel" onClick={() => setShowDetailModal(false)}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImagingOrderPage;