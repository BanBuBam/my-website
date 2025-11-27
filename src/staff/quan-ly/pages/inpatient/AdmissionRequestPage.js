import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAdmissionRequestAPI } from '../../../../services/staff/adminAPI';
import {
    FiSearch, FiFilter, FiAlertCircle, FiClock,
    FiCheckCircle, FiClipboard, FiX, FiCalendar, FiThumbsUp, FiThumbsDown,
    FiList, FiChevronLeft, FiChevronRight // Import thêm icons
} from 'react-icons/fi';
import './AdmissionRequestPage.css';

const AdmissionRequestPage = () => {
    
    // === ADDED: INIT NAVIGATE ===
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('pending');
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // State cho phân trang
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalPages: 0,
        totalElements: 0
    });
    
    // Filters
    const [patientNameFilter, setPatientNameFilter] = useState('');
    const [approvalDateFilter, setApprovalDateFilter] = useState('');
    
    // Fetch data based on active tab or page change
    useEffect(() => {
        // Reset về trang 0 khi đổi tab
        if (activeTab !== 'all') {
            setPagination(prev => ({ ...prev, page: 0 }));
        }
        fetchRequests(activeTab === 'all' ? pagination.page : 0);
    }, [activeTab]);
    
    // Apply filters
    useEffect(() => {
        applyFilters();
    }, [requests, patientNameFilter, approvalDateFilter]);
    
    const fetchRequests = async (page = 0) => {
        setLoading(true);
        setError(null);
        try {
            let response;
            switch (activeTab) {
                case 'pending':
                    response = await adminAdmissionRequestAPI.getPendingRequests();
                    // API cũ trả về mảng trực tiếp trong response.data
                    handleArrayResponse(response);
                    break;
                case 'emergency':
                    response = await adminAdmissionRequestAPI.getEmergencyRequests();
                    handleArrayResponse(response);
                    break;
                case 'highPriority':
                    response = await adminAdmissionRequestAPI.getHighPriorityRequests();
                    handleArrayResponse(response);
                    break;
                case 'all':
                    // API mới trả về object phân trang: data.content, data.totalPages...
                    response = await adminAdmissionRequestAPI.getAllRequests(page, pagination.size);
                    handlePageableResponse(response);
                    break;
                default:
                    response = await adminAdmissionRequestAPI.getPendingRequests();
                    handleArrayResponse(response);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách yêu cầu');
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };
    
    // Xử lý response dạng mảng (API cũ)
    const handleArrayResponse = (response) => {
        if (response && response.data) {
            setRequests(response.data);
            setPagination(prev => ({ ...prev, totalPages: 0 })); // Ẩn phân trang
        } else {
            setRequests([]);
        }
    };
    
    // Xử lý response dạng phân trang (API mới)
    const handlePageableResponse = (response) => {
        if (response && response.data) {
            setRequests(response.data.content || []);
            setPagination(prev => ({
                ...prev,
                totalPages: response.data.totalPages,
                totalElements: response.data.totalElements,
                page: response.data.number // Cập nhật page hiện tại từ server để đồng bộ
            }));
        } else {
            setRequests([]);
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
    
    // Xử lý chuyển trang
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
            fetchRequests(newPage);
        }
    };
    
    // === ADDED: HÀM ĐIỀU HƯỚNG SANG TRANG CHI TIẾT ===
    const handleViewDetail = (requestId) => {
        // Giả sử route của bạn là /staff/admin/admission-requests/:id
        navigate(`/staff/admin/yeu-cau-nhap-vien/${requestId}`);
    };
    
    const handleApprove = async (admissionRequestId) => {
        const approvalNotes = prompt('Nhập ghi chú phê duyệt:');
        if (approvalNotes === null) return;
        
        try {
            await adminAdmissionRequestAPI.approveRequest(admissionRequestId, approvalNotes);
            alert('Phê duyệt yêu cầu thành công!');
            fetchRequests(pagination.page);
        } catch (err) {
            alert('Lỗi: ' + (err.message || 'Không thể phê duyệt'));
        }
    };
    
    const handleReject = async (admissionRequestId) => {
        const rejectionNotes = prompt('Nhập lý do từ chối:');
        if (rejectionNotes === null) return;
        
        try {
            await adminAdmissionRequestAPI.rejectRequest(admissionRequestId, rejectionNotes);
            alert('Từ chối yêu cầu thành công!');
            fetchRequests(pagination.page);
        } catch (err) {
            alert('Lỗi: ' + (err.message || 'Không thể từ chối'));
        }
    };
    
    return (
        <div className="admission-request-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-content">
                    <FiClipboard className="header-icon" />
                    <div>
                        <h1>Quản lý yêu cầu nhập viện</h1>
                        <p>Theo dõi và xử lý các yêu cầu nhập viện</p>
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
                    {/* THẺ MỚI */}
                    <button
                        className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        <FiList /> Tất cả yêu cầu
                    </button>
                </div>
            </div>
            
            {/* Filters */}
            <div className="filters-section">
                <div className="filter-group">
                    <label>Tên bệnh nhân:</label>
                    <input
                        type="text"
                        placeholder="Lọc trong trang hiện tại..."
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
                            <p>Không có dữ liệu</p>
                        </div>
                    ) : (
                        <>
                            <div className="requests-grid">
                                {filteredRequests.map(request => (
                                    <RequestCard
                                        key={request.admissionRequestId}
                                        request={request}
                                        // === ADDED: TRUYỀN HÀM CLICK ===
                                        onClick={() => handleViewDetail(request.admissionRequestId)}
                                        onApprove={handleApprove}
                                        onReject={handleReject}
                                    />
                                ))}
                            </div>
                            
                            {/* Pagination Control (Chỉ hiện khi ở tab All và có > 1 trang) */}
                            {activeTab === 'all' && pagination.totalPages > 1 && (
                                <div className="pagination-controls">
                                    <div className="pagination-info">
                                        Hiển thị trang {pagination.page + 1} / {pagination.totalPages} (Tổng {pagination.totalElements} mục)
                                    </div>
                                    <div className="pagination-buttons">
                                        <button
                                            className="btn-page"
                                            disabled={pagination.page === 0}
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                        >
                                            <FiChevronLeft /> Trước
                                        </button>
                                        <button
                                            className="btn-page"
                                            disabled={pagination.page >= pagination.totalPages - 1}
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                        >
                                            Sau <FiChevronRight />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

// Request Card Component
const RequestCard = ({ request, onClick, onApprove, onReject }) => {
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
        <div className="request-card"
             onClick={onClick}
             style={{ cursor: 'pointer' }}
        >
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

                {/* Action Buttons - Only show for pending requests */}
                {/*{request.isPending && (*/}
                    <div className="card-actions">
                        <button
                            className="btn-approve"
                            onClick={() => onApprove(request.admissionRequestId)}
                        >
                            <FiThumbsUp /> Phê duyệt
                        </button>
                        <button
                            className="btn-reject"
                            onClick={() => onReject(request.admissionRequestId)}
                        >
                            <FiThumbsDown /> Từ chối
                        </button>
                    </div>
                {/*)}*/}
            </div>
        </div>
    );
};

export default AdmissionRequestPage;

