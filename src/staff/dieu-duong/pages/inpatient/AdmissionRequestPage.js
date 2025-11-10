import React, { useState, useEffect } from 'react';
import { nurseAdmissionRequestAPI } from '../../../../services/staff/nurseAPI';
import {
    FiSearch, FiFilter, FiAlertCircle, FiClock,
    FiCheckCircle, FiClipboard, FiX, FiCalendar
} from 'react-icons/fi';
import './AdmissionRequestPage.css';
import {useNavigate} from "react-router-dom";

const AdmissionRequestPage = () => {
    const [activeTab, setActiveTab] = useState('approved');
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Filters
    const [patientNameFilter, setPatientNameFilter] = useState('');
    const [approvalDateFilter, setApprovalDateFilter] = useState('');

    // Fetch data based on active tab
    useEffect(() => {
        fetchRequests();
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
                case 'approved':
                    response = await nurseAdmissionRequestAPI.getApprovedRequests();
                    break;
                case 'emergency':
                    response = await nurseAdmissionRequestAPI.getEmergencyRequests();
                    break;
                case 'highPriority':
                    response = await nurseAdmissionRequestAPI.getHighPriorityRequests();
                    break;
                case 'longWaiting':
                    response = await nurseAdmissionRequestAPI.getLongWaitingRequests();
                    break;
                default:
                    response = await nurseAdmissionRequestAPI.getApprovedRequests();
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
        if (approvalDateFilter) {
            filtered = filtered.filter(req => {
                if (!req.approvedAt) return false;
                const approvalDate = new Date(req.approvedAt).toISOString().split('T')[0];
                return approvalDate === approvalDateFilter;
            });
        }

        setFilteredRequests(filtered);
    };

    const resetFilters = () => {
        setPatientNameFilter('');
        setApprovalDateFilter('');
    };
    
    const handleViewDetail = (requestId) => {
        // Điều hướng đến trang chi tiết
        // URL này phải khớp với route bạn định nghĩa
        navigate(`/staff/dieu-duong/yeu-cau-nhap-vien/${requestId}`);
    };

    return (
        <div className="admission-request-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-content">
                    <FiClipboard className="header-icon" />
                    <div>
                        <h1>Quản lý yêu cầu nhập viện</h1>
                        <p>Theo dõi các yêu cầu nhập viện</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs-section">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'approved' ? 'active' : ''}`}
                        onClick={() => setActiveTab('approved')}
                    >
                        <FiCheckCircle /> Đã xác nhận
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
                        className={`tab ${activeTab === 'longWaiting' ? 'active' : ''}`}
                        onClick={() => setActiveTab('longWaiting')}
                    >
                        <FiClock /> Chờ lâu
                    </button>
                </div>
            </div>

            {/* Filters */}
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
                <div className="filter-group">
                    <label>Ngày phê duyệt:</label>
                    <input
                        type="date"
                        value={approvalDateFilter}
                        onChange={(e) => setApprovalDateFilter(e.target.value)}
                    />
                </div>
                {(patientNameFilter || approvalDateFilter) && (
                    <button className="btn-clear-filter" onClick={resetFilters}>
                        <FiX /> Xóa bộ lọc
                    </button>
                )}
            </div>

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
                            {filteredRequests.map(request => (
                                <RequestCard
                                    key={request.admissionRequestId}
                                    request={request}
                                    // Truyền hàm xử lý click vào card
                                    onCardClick={() => handleViewDetail(request.admissionRequestId)}
                                    // Truyền hàm refresh khi hoàn thành
                                    onComplete={fetchRequests}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Request Card Component
const RequestCard = ({ request, onCardClick, onComplete }) => {
    const [isCompleting, setIsCompleting] = useState(false);

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

    const handleCompleteClick = async (e) => {
        e.stopPropagation(); // Ngăn không cho click vào card

        if (!window.confirm(`Xác nhận hoàn thành yêu cầu nhập viện cho bệnh nhân ${request.patientName}?`)) {
            return;
        }

        setIsCompleting(true);
        try {
            await nurseAdmissionRequestAPI.completeAdmissionRequest(request.admissionRequestId);
            alert('Hoàn thành yêu cầu nhập viện thành công!');
            if (onComplete) {
                onComplete(); // Gọi callback để refresh danh sách
            }
        } catch (error) {
            alert(`Lỗi: ${error.message || 'Không thể hoàn thành yêu cầu'}`);
        } finally {
            setIsCompleting(false);
        }
    };

    return (
        <div className="request-card clickable" onClick={onCardClick}>
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

            {/* Nút hoàn thành - chỉ hiển thị khi đã gán giường và chưa hoàn thành */}
            {request.hasBedAssigned && !request.isCompleted && (
                <div className="card-actions">
                    <button
                        className="btn-complete"
                        onClick={handleCompleteClick}
                        disabled={isCompleting}
                    >
                        <FiCheckCircle /> {isCompleting ? 'Đang xử lý...' : 'Hoàn thành'}
                    </button>
                </div>
            )}

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

export default AdmissionRequestPage;

