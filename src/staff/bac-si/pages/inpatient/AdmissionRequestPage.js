import React, { useState, useEffect } from 'react';
import { admissionRequestAPI } from '../../../../services/staff/doctorAPI';
import {
    FiPlus, FiSearch, FiFilter, FiAlertCircle, FiClock,
    FiCheckCircle, FiClipboard, FiX, FiCalendar
} from 'react-icons/fi';
import './AdmissionRequestPage.css';

const AdmissionRequestPage = () => {
    const [activeTab, setActiveTab] = useState('create');
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [encounterId, setEncounterId] = useState('');
    
    // State mới để giữ encounter được chọn
    const [selectedEncounter, setSelectedEncounter] = useState(null);
    
    // Filters
    const [patientNameFilter, setPatientNameFilter] = useState('');
    const [approvalDateFilter, setApprovalDateFilter] = useState('');

    // Fetch data based on active tab
    useEffect(() => {
        if (activeTab !== 'search') {
            fetchRequests();
        }
    }, [activeTab]);

    // Apply filters
    useEffect(() => {
        applyFilters();
    }, [requests, patientNameFilter, approvalDateFilter]);

    const fetchRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            let response;
            switch (activeTab) {
                // TAB MỚI
                case 'create':
                    response = await admissionRequestAPI.getFinishedOutpatientEncounters();
                    break;
                case 'pending':
                    response = await admissionRequestAPI.getPendingRequests();
                    break;
                case 'emergency':
                    response = await admissionRequestAPI.getEmergencyRequests();
                    break;
                case 'highPriority':
                    response = await admissionRequestAPI.getHighPriorityRequests();
                    break;
                case 'search':
                    // Search tab doesn't auto-load
                    setRequests([]);
                    setFilteredRequests([]);
                    setLoading(false);
                    return;
                default:
                    response = await admissionRequestAPI.getPendingRequests();
            }
            
            if (response && response.data) {
                setRequests(response.data);
            } else {
                setRequests([]);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách yêu cầu');
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...requests];

        // Filter by patient name
        if (patientNameFilter.trim()) {
            filtered = filtered.filter(req =>
                req.patientName?.toLowerCase().includes(patientNameFilter.toLowerCase())
            );
        }

        // Filter by approval date
        if (approvalDateFilter && activeTab !== 'create') {
            filtered = filtered.filter(req => {
                if (!req.approvedAt) return false;
                const approvalDate = new Date(req.approvedAt).toISOString().split('T')[0];
                return approvalDate === approvalDateFilter;
            });
        }

        setFilteredRequests(filtered);
    };

    const handleSearchByEncounter = async (e) => {
        e.preventDefault();

        if (!encounterId.trim()) {
            alert('Vui lòng nhập Encounter ID');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await admissionRequestAPI.getRequestByEncounter(encounterId.trim());
            if (response && response.data) {
                setRequests([response.data]);
                setFilteredRequests([response.data]);
            } else {
                setRequests([]);
                setFilteredRequests([]);
                setError('Không tìm thấy yêu cầu nhập viện cho encounter này');
            }
        } catch (err) {
            setError(err.message || 'Không thể tìm kiếm');
            setRequests([]);
            setFilteredRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setPatientNameFilter('');
        setApprovalDateFilter('');
    };
    
    // Hàm mới: Mở modal khi click "Tạo yêu cầu" từ EncounterCard
    const handleCreateRequest = (encounter) => {
        setSelectedEncounter(encounter);
        setShowCreateModal(true);
    };
    
    // Hàm mới: Đóng modal và reset encounter
    const handleCloseModal = () => {
        setShowCreateModal(false);
        setSelectedEncounter(null);
    };
    
    // Hàm mới: Xử lý khi tạo thành công
    const handleCreateSuccess = () => {
        handleCloseModal();
        if (activeTab === 'create') {
            // Tải lại danh sách encounter (để loại bỏ encounter đã tạo)
            fetchRequests();
        } else if (activeTab !== 'search') {
            fetchRequests();
        }
        // Có thể tự động chuyển sang tab 'pending'
        setActiveTab('pending');
    };
    
    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'PENDING': 'status-pending',
            'APPROVED': 'status-approved',
            'BED_ASSIGNED': 'status-bed-assigned',
            'ADMITTED': 'status-admitted',
            'REJECTED': 'status-rejected',
            'CANCELLED': 'status-cancelled',
        };
        return statusMap[status] || 'status-default';
    };

    const getPriorityBadgeClass = (priorityLevel) => {
        if (priorityLevel === 1) return 'priority-critical';
        if (priorityLevel === 2) return 'priority-high';
        if (priorityLevel === 3) return 'priority-medium';
        return 'priority-low';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateOnly = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <div className="admission-request-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-content">
                    <FiClipboard className="header-icon" />
                    <div>
                        <h1>Quản lý yêu cầu nhập viện</h1>
                        <p>Tạo và theo dõi các yêu cầu nhập viện</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs-section">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        <FiClock /> Chờ xác nhận
                    </button>
                    <button
                        className={`tab ${activeTab === 'emergency' ? 'active' : ''}`}
                        onClick={() => setActiveTab('emergency')}
                    >
                        <FiAlertCircle /> Cấp cứu
                    </button>
                    <button
                        className={`tab ${activeTab === 'highPriority' ? 'active' : ''}`}
                        onClick={() => setActiveTab('highPriority')}
                    >
                        <FiCheckCircle /> Ưu tiên cao
                    </button>
                    <button
                        className={`tab ${activeTab === 'search' ? 'active' : ''}`}
                        onClick={() => setActiveTab('search')}
                    >
                        <FiSearch /> Tìm theo Encounter
                    </button>
                    {/* TAB MỚI */}
                    <button
                        className={`tab ${activeTab === 'create' ? 'active' : ''}`}
                        onClick={() => setActiveTab('create')}
                    >
                        <FiPlus /> Tạo Yêu Cầu (Từ Encounter)
                    </button>
                </div>
                {/*<button className="btn-create" onClick={() => setShowCreateModal(true)}>*/}
                {/*    <FiPlus /> Tạo yêu cầu*/}
                {/*</button>*/}
            </div>

            {/* Search by Encounter */}
            {activeTab === 'search' && (
                <div className="search-section">
                    <form onSubmit={handleSearchByEncounter} className="search-form">
                        <div className="search-input-group">
                            <FiSearch className="search-icon" />
                            <input
                                type="number"
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
            )}

            {/* Filters - Only show for list tabs */}
            {activeTab !== 'search' && (
                <div className="filters-section">
                    <div className="filter-group">
                        <label>Tên bệnh nhân:</label>
                        <input
                            type="text"
                            placeholder="Lọc theo tên..."
                            value={patientNameFilter}
                            onChange={(e) => setPatientNameFilter(e.target.value)}
                        />
                    </div>
                    {/* Chỉ hiện filter ngày khi không ở tab 'create' */}
                    {activeTab !== 'create' && (
                        <div className="filter-group">
                            <label>Ngày phê duyệt:</label>
                            <input
                                type="date"
                                value={approvalDateFilter}
                                onChange={(e) => setApprovalDateFilter(e.target.value)}
                            />
                        </div>
                    )}
                    {(patientNameFilter || approvalDateFilter) && (
                        <button className="btn-clear-filter" onClick={resetFilters}>
                            <FiX /> Xóa bộ lọc
                        </button>
                    )}
                </div>
            )}

            {/* Loading & Error */}
            {loading && <div className="loading-state">Đang tải dữ liệu...</div>}
            {error && <div className="error-state"><FiAlertCircle /> {error}</div>}

            {/* Requests List */}
            {!loading && !error && (
                <div className="results-section">
                    {filteredRequests.length === 0 ? (
                        <div className="no-data">
                            <FiClipboard />
                            <p>Không có yêu cầu nào</p>
                        </div>
                    ) : (
                        <div className="requests-grid">
                            {/*{filteredRequests.map(request => (*/}
                            {/*    <RequestCard key={request.admissionRequestId} request={request} />*/}
                            {/*))}*/}
                            {/* LOGIC RENDER CÓ ĐIỀU KIỆN */}
                            {activeTab === 'create' ? (
                                filteredRequests.map(encounter => (
                                    <EncounterCard
                                        key={encounter.encounterId}
                                        encounter={encounter}
                                        onCreateClick={() => handleCreateRequest(encounter)}
                                    />
                                ))
                            ) : (
                                filteredRequests.map(request => (
                                    <RequestCard key={request.admissionRequestId} request={request} />
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                // <CreateAdmissionRequestModal
                //     onClose={() => setShowCreateModal(false)}
                //     onSuccess={() => {
                //         setShowCreateModal(false);
                //         if (activeTab !== 'search') {
                //             fetchRequests();
                //         }
                //     }}
                // />
                <CreateAdmissionRequestModal
                    encounter={selectedEncounter} // Truyền encounter vào modal
                    onClose={handleCloseModal}
                    onSuccess={handleCreateSuccess}
                />
            )}
        </div>
    );
};

// COMPONENT MỚI: Encounter Card
const EncounterCard = ({ encounter, onCreateClick }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };
    
    return (
        <div className="request-card">
            <div className="card-header">
                <div className="card-title">
                    <h3>{encounter.patientName}</h3>
                    <span className="patient-code">{encounter.patientCode}</span>
                </div>
                <div className="card-badges">
                    <span className="badge status-admitted">ĐÃ HOÀN THÀNH</span>
                </div>
            </div>
            
            <div className="card-body">
                <div className="info-grid">
                    <div className="info-item">
                        <label>Encounter ID:</label>
                        <span>{encounter.encounterId}</span>
                    </div>
                    <div className="info-item">
                        <label>Khoa:</label>
                        <span>{encounter.departmentName}</span>
                    </div>
                    <div className="info-item">
                        <label>Bác sĩ tạo:</label>
                        <span>{encounter.createdByEmployeeName}</span>
                    </div>
                    <div className="info-item">
                        <label>Thời gian bắt đầu:</label>
                        <span>{formatDate(encounter.startDatetime)}</span>
                    </div>
                    <div className="info-item">
                        <label>Mô tả trạng thái:</label>
                        <span>{encounter.statusDescription || encounter.status}</span>
                    </div>
                </div>
            </div>
            {/* Thêm phần actions vào card */}
            <div className="card-actions">
                <button className="btn-create-request" onClick={onCreateClick}>
                    <FiPlus /> Tạo Yêu Cầu Nhập Viện
                </button>
            </div>
        </div>
    );
};

// Request Card Component
const RequestCard = ({ request }) => {
    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'PENDING': 'status-pending',
            'APPROVED': 'status-approved',
            'BED_ASSIGNED': 'status-bed-assigned',
            'ADMITTED': 'status-admitted',
            'REJECTED': 'status-rejected',
            'CANCELLED': 'status-cancelled',
        };
        return statusMap[status] || 'status-default';
    };

    const getPriorityBadgeClass = (priorityLevel) => {
        if (priorityLevel === 1) return 'priority-critical';
        if (priorityLevel === 2) return 'priority-high';
        if (priorityLevel === 3) return 'priority-medium';
        return 'priority-low';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateOnly = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <div className="request-card">
            <div className="card-header">
                <div className="card-title">
                    <h3>#{request.admissionRequestId} - {request.patientName}</h3>
                    <span className="patient-code">{request.patientCode}</span>
                </div>
                <div className="card-badges">
                    <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                        {request.statusDisplay || request.status}
                    </span>
                    <span className={`badge ${getPriorityBadgeClass(request.priorityLevel)}`}>
                        {request.priorityDisplay || `Mức ${request.priorityLevel}`}
                    </span>
                    {request.isEmergency && <span className="badge badge-emergency">CẤP CỨU</span>}
                </div>
            </div>

            <div className="card-body">
                <div className="info-grid">
                    <div className="info-item">
                        <label>Encounter ID:</label>
                        <span>{request.encounterId}</span>
                    </div>
                    <div className="info-item">
                        <label>Loại nhập viện:</label>
                        <span>{request.admissionTypeDisplay || request.admissionType}</span>
                    </div>
                    <div className="info-item">
                        <label>Chẩn đoán:</label>
                        <span>{request.admissionDiagnosis}</span>
                    </div>
                    <div className="info-item">
                        <label>Khoa yêu cầu:</label>
                        <span>{request.requestedDepartmentName}</span>
                    </div>
                    <div className="info-item">
                        <label>Loại giường:</label>
                        <span>{request.bedTypeRequired || '-'}</span>
                    </div>
                    <div className="info-item">
                        <label>Ngày dự kiến:</label>
                        <span>{formatDateOnly(request.expectedAdmissionDate)}</span>
                    </div>
                    <div className="info-item">
                        <label>Thời gian lưu trú dự kiến:</label>
                        <span>{request.estimatedLengthOfStay ? `${request.estimatedLengthOfStay} ngày` : '-'}</span>
                    </div>
                    <div className="info-item">
                        <label>Người yêu cầu:</label>
                        <span>{request.requestedByEmployeeName}</span>
                    </div>
                    {request.approvedByEmployeeName && (
                        <div className="info-item">
                            <label>Người phê duyệt:</label>
                            <span>{request.approvedByEmployeeName}</span>
                        </div>
                    )}
                    {request.approvedAt && (
                        <div className="info-item">
                            <label>Ngày phê duyệt:</label>
                            <span>{formatDate(request.approvedAt)}</span>
                        </div>
                    )}
                    {request.assignedBedCode && (
                        <div className="info-item">
                            <label>Giường đã gán:</label>
                            <span>{request.assignedBedCode} - {request.assignedBedRoom}</span>
                        </div>
                    )}
                    <div className="info-item">
                        <label>Ngày tạo:</label>
                        <span>{formatDate(request.createdAt)}</span>
                    </div>
                    {request.waitTimeMinutes > 0 && (
                        <div className="info-item">
                            <label>Thời gian chờ:</label>
                            <span className={request.isWaitTimeExcessive ? 'text-danger' : ''}>
                                {Math.floor(request.waitTimeMinutes / 60)}h {request.waitTimeMinutes % 60}m
                            </span>
                        </div>
                    )}
                </div>

                {request.specialRequirements && (
                    <div className="special-requirements">
                        <label>Yêu cầu đặc biệt:</label>
                        <p>{request.specialRequirements}</p>
                    </div>
                )}

                {request.approvalNotes && (
                    <div className="approval-notes">
                        <label>Ghi chú phê duyệt:</label>
                        <p>{request.approvalNotes}</p>
                    </div>
                )}

                <div className="requirements-badges">
                    {request.isolationRequired && <span className="req-badge">Cách ly</span>}
                    {request.requiresIcu && <span className="req-badge">ICU</span>}
                    {request.oxygenRequired && <span className="req-badge">Oxy</span>}
                    {request.monitoringLevelDisplay && (
                        <span className="req-badge">Theo dõi: {request.monitoringLevelDisplay}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

// Create Modal Component
const CreateAdmissionRequestModal = ({ onClose, onSuccess, encounter }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        encounterId: encounter ? encounter.encounterId : '',
        admissionType: 'ELECTIVE',
        priorityLevel: 3,
        admissionDiagnosis: '',
        specialRequirements: '',
        bedTypeRequired: 'STANDARD',
        requestedDepartmentId: encounter ? encounter.departmentId : '', // Điền sẵn khoa
        requestedByEmployeeId: encounter ? encounter.createdByEmployeeId : '', // Điền sẵn BS
        expectedAdmissionDate: new Date().toISOString().split('T')[0], // Đặt ngày mặc định
        estimatedLengthOfStay: 7,
        isolationRequired: false,
        requiresIcu: false,
        oxygenRequired: false,
        monitoringLevel: 'BASIC',
        preAdmissionChecklistCompleted: false,
        insuranceVerified: false,
        consentFormSigned: false,
    });
    
    // Tự động cập nhật form nếu encounter thay đổi (mặc dù modal sẽ re-render)
    useEffect(() => {
        if (encounter) {
            setFormData(prev => ({
                ...prev,
                encounterId: encounter.encounterId,
                requestedDepartmentId: encounter.departmentId || '',
                // Tự động điền chẩn đoán từ encounter nếu có (bạn cần thêm trường này vào API)
                // admissionDiagnosis: encounter.diagnosis || '',
            }));
        }
    }, [encounter]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Convert string numbers to integers
            const requestData = {
                ...formData,
                encounterId: parseInt(formData.encounterId),
                priorityLevel: parseInt(formData.priorityLevel),
                requestedDepartmentId: parseInt(formData.requestedDepartmentId),
                requestedByEmployeeId: parseInt(formData.requestedByEmployeeId),
                estimatedLengthOfStay: parseInt(formData.estimatedLengthOfStay),
            };

            await admissionRequestAPI.createAdmissionRequest(requestData);
            alert('Tạo yêu cầu nhập viện thành công!');
            onSuccess();
        } catch (err) {
            alert('Lỗi: ' + (err.message || 'Không thể tạo yêu cầu'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Tạo yêu cầu nhập viện</h3>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Encounter ID: *</label>
                            <input
                                type="number"
                                name="encounterId"
                                value={formData.encounterId}
                                onChange={handleChange}
                                required
                                readOnly={!!encounter} // Không cho sửa nếu đã chọn từ encounter
                                style={!!encounter ? { backgroundColor: '#f3f4f6' } : {}}
                            />
                        </div>

                        <div className="form-group">
                            <label>Loại nhập viện: *</label>
                            <select name="admissionType" value={formData.admissionType} onChange={handleChange} required>
                                <option value="ELECTIVE">Kế hoạch</option>
                                <option value="EMERGENCY">Cấp cứu</option>
                                <option value="URGENT">Khẩn cấp</option>
                                <option value="OBSERVATION">Quan sát</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Mức độ ưu tiên: *</label>
                            <select name="priorityLevel" value={formData.priorityLevel} onChange={handleChange} required>
                                <option value="1">1 - Cực kỳ khẩn cấp</option>
                                <option value="2">2 - Khẩn cấp</option>
                                <option value="3">3 - Trung bình</option>
                                <option value="4">4 - Thấp</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Loại giường: *</label>
                            <select name="bedTypeRequired" value={formData.bedTypeRequired} onChange={handleChange} required>
                                <option value="STANDARD">Thường</option>
                                <option value="ICU">ICU</option>
                                <option value="ISOLATION">Cách ly</option>
                                <option value="PRIVATE">Riêng</option>
                                <option value="VIP">VIP</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Khoa yêu cầu ID: *</label>
                            <input
                                type="number"
                                name="requestedDepartmentId"
                                value={formData.requestedDepartmentId}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Người yêu cầu ID: *</label>
                            <input
                                type="number"
                                name="requestedByEmployeeId"
                                value={formData.requestedByEmployeeId}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Ngày dự kiến nhập viện: *</label>
                            <input
                                type="date"
                                name="expectedAdmissionDate"
                                value={formData.expectedAdmissionDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Thời gian lưu trú dự kiến (ngày):</label>
                            <input
                                type="number"
                                name="estimatedLengthOfStay"
                                value={formData.estimatedLengthOfStay}
                                onChange={handleChange}
                                min="1"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Chẩn đoán nhập viện: *</label>
                            <textarea
                                name="admissionDiagnosis"
                                value={formData.admissionDiagnosis}
                                onChange={handleChange}
                                rows="3"
                                required
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Yêu cầu đặc biệt:</label>
                            <textarea
                                name="specialRequirements"
                                value={formData.specialRequirements}
                                onChange={handleChange}
                                rows="2"
                            />
                        </div>

                        <div className="form-group">
                            <label>Mức độ theo dõi:</label>
                            <select name="monitoringLevel" value={formData.monitoringLevel} onChange={handleChange}>
                                <option value="BASIC">Tiêu chuẩn</option>
                                <option value="INTERMEDIATE">Trung bình</option>
                                <option value="INTENSIVE">Tích cực</option>
                                <option value="CRITICAL">Nguy kịch</option>
                            </select>
                        </div>

                        <div className="form-group checkboxes full-width">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="isolationRequired"
                                    checked={formData.isolationRequired}
                                    onChange={handleChange}
                                />
                                Yêu cầu cách ly
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="requiresIcu"
                                    checked={formData.requiresIcu}
                                    onChange={handleChange}
                                />
                                Yêu cầu ICU
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="oxygenRequired"
                                    checked={formData.oxygenRequired}
                                    onChange={handleChange}
                                />
                                Yêu cầu oxy
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="preAdmissionChecklistCompleted"
                                    checked={formData.preAdmissionChecklistCompleted}
                                    onChange={handleChange}
                                />
                                Hoàn thành checklist trước nhập viện
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="insuranceVerified"
                                    checked={formData.insuranceVerified}
                                    onChange={handleChange}
                                />
                                Đã xác minh bảo hiểm
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="consentFormSigned"
                                    checked={formData.consentFormSigned}
                                    onChange={handleChange}
                                />
                                Đã ký giấy đồng ý
                            </label>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Hủy
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Đang tạo...' : 'Tạo yêu cầu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdmissionRequestPage;

