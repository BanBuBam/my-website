import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { nurseAdmissionRequestAPI } from '../../../../services/staff/nurseAPI';
import {FiArrowLeft, FiAlertCircle, FiCheck, FiUser, FiClipboard, FiGrid, FiClock, FiCheckCircle} from 'react-icons/fi';
import './RequestDetailPage.css';
import AssignBedModal from './AssignBedModal';

// Helper để render các badge giống như trang danh sách
const getStatusBadgeClass = (status) => {
    const statusMap = {
        'PENDING': 'status-pending', 'APPROVED': 'status-approved',
        'BED_ASSIGNED': 'status-bed-assigned', 'ADMITTED': 'status-admitted',
        'REJECTED': 'status-rejected', 'CANCELLED': 'status-cancelled',
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
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
};

const formatDateOnly = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
};


const RequestDetailPage = () => {
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [status, setStatus] = useState(null);
    
    // Lấy requestId từ URL
    const { requestId } = useParams();
    const navigate = useNavigate();
    
    // === ADDED: STATE CHO LOADING KHI HOÀN THÀNH ===
    const [completing, setCompleting] = useState(false);
    
    // useEffect(() => {
    //     if (!requestId) {
    //         setError('Không tìm thấy ID yêu cầu');
    //         setLoading(false);
    //         return;
    //     }
    //
    //     const fetchDetail = async () => {
    //         setLoading(true);
    //         setError(null);
    //         try {
    //             const response = await nurseAdmissionRequestAPI.getAdmissionRequestDetail(requestId);
    //             if (response && response.data) {
    //                 setRequest(response.data);
    //             } else {
    //                 setError('Không tìm thấy dữ liệu cho yêu cầu này');
    //             }
    //         } catch (err) {
    //             setError(err.message || 'Không thể tải chi tiết yêu cầu');
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //
    //     fetchDetail();
    // }, [requestId]);
    // === REFACTOR: Tách hàm fetchDetail ra ngoài ===
    const fetchDetail = useCallback(async () => {
        if (!requestId) {
            setError('Không tìm thấy ID yêu cầu');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await nurseAdmissionRequestAPI.getAdmissionRequestDetail(requestId);
            if (response && response.data) {
                setRequest(response.data);
                setStatus(response.data.status);
            } else {
                setError('Không tìm thấy dữ liệu cho yêu cầu này');
            }
        } catch (err) {
            setError(err.message || 'Không thể tải chi tiết yêu cầu');
        } finally {
            setLoading(false);
        }
    }, [requestId]); // Phụ thuộc vào requestId
    
    // useEffect bây giờ chỉ gọi hàm fetchDetail
    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);
    
    const handleAssignmentSuccess = () => {
        setIsModalOpen(false);
        fetchDetail(); // Tải lại dữ liệu trang để cập nhật
    };
    
    // === ADDED: HÀM XỬ LÝ HOÀN THÀNH NHẬP VIỆN ===
    const handleComplete = async () => {
        if (!window.confirm(`Xác nhận hoàn thành thủ tục nhập viện cho bệnh nhân ${request.patientName}?`)) {
            return;
        }
        
        setCompleting(true);
        try {
            const response = await nurseAdmissionRequestAPI.completeAdmissionRequest(requestId);
            
            // Hiển thị thông báo từ server hoặc thông báo mặc định
            alert(response.message || 'Hoàn thành nhập viện thành công!');
            
            // Tải lại dữ liệu để cập nhật trạng thái mới (ADMITTED)
            fetchDetail();
        } catch (err) {
            alert('Lỗi: ' + (err.message || 'Không thể hoàn thành nhập viện'));
        } finally {
            setCompleting(false);
        }
    };
    
    if (loading) {
        return <div className="detail-loading">Đang tải chi tiết yêu cầu...</div>;
    }
    
    if (error) {
        return <div className="detail-error"><FiAlertCircle /> {error}</div>;
    }
    
    if (!request) {
        return <div className="detail-error">Không có dữ liệu</div>;
    }
    
    return (
        <div className="request-detail-page">
            {/* Header với nút quay lại */}
            <div className="detail-header">
                <button className="btn-back" onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-content">
                    <h1>Chi tiết Yêu cầu nhập viện #{request.admissionRequestId}</h1>
                    <p>Mã bệnh nhân: {request.patientCode}</p>
                </div>
                
                {/*/!* === ĐÂY LÀ NÚT GÁN GIƯỜNG BẠN MUỐN THÊM === *!/*/}
                {/*/!* Nó chỉ hiển thị nếu giường CHƯA được gán *!/*/}
                {/*{!request.assignedBedCode && (*/}
                {/*    <button className="btn-assign-bed" onClick={() => setIsModalOpen(true)}>*/}
                {/*        <FiGrid /> Gán giường*/}
                {/*    </button>*/}
                {/*)}*/}
                {/* === BUTTONS SECTION === */}
                <div className="header-actions" style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
                    
                    {/* Nút Gán giường (Giữ nguyên logic cũ: Hiện khi chưa có giường) */}
                    {status === 'APPROVED' && (
                        <button className="btn-assign-bed" onClick={() => setIsModalOpen(true)}>
                            <FiGrid /> Gán giường
                        </button>
                    )}
                    
                    {/* === ADDED: NÚT HOÀN THÀNH === */}
                    {/* Hiện khi ĐÃ CÓ giường VÀ CHƯA hoàn thành, BED_ASSIGNED, ADMITTED, APPROVED */}
                    
                    {status === 'BED_ASSIGNED' && (
                        <button
                            className="btn-complete"
                            onClick={handleComplete}
                            disabled={completing}
                        >
                            <FiCheckCircle /> {completing ? 'Đang xử lý...' : 'Hoàn thành'}
                        </button>
                    )}
                </div>
            </div>
            
            {/* Thông tin chính và Trạng thái */}
            <div className="detail-section status-section">
                <div className="info-item-lg">
                    <label>Bệnh nhân</label>
                    <span>{request.patientName}</span>
                </div>
                <div className="info-item-lg">
                    <label>Trạng thái</label>
                    <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                        {request.statusDisplay || request.status}
                    </span>
                </div>
                <div className="info-item-lg">
                    <label>Ưu tiên</label>
                    <span className={`badge ${getPriorityBadgeClass(request.priorityLevel)}`}>
                        {request.priorityDisplay || `Mức ${request.priorityLevel}`}
                    </span>
                </div>
                {request.isEmergency && <span className="badge badge-emergency">CẤP CỨU</span>}
            </div>
            
            {/* Chia cột thông tin */}
            <div className="detail-columns">
                {/* Cột 1: Thông tin bệnh nhân và yêu cầu */}
                <div className="detail-column">
                    <div className="detail-section">
                        <h3><FiUser /> Thông tin bệnh nhân</h3>
                        <div className="info-grid">
                            <div className="info-item"><label>Tên bệnh nhân:</label> <span>{request.patientName}</span></div>
                            <div className="info-item"><label>Mã bệnh nhân:</label> <span>{request.patientCode}</span></div>
                        </div>
                    </div>
                    
                    <div className="detail-section">
                        <h3><FiClipboard /> Chi tiết yêu cầu</h3>
                        <div className="info-grid">
                            <div className="info-item"><label>Loại nhập viện:</label> <span>{request.admissionTypeDisplay}</span></div>
                            <div className="info-item"><label>Ngày dự kiến:</label> <span>{formatDateOnly(request.expectedAdmissionDate)}</span></div>
                            <div className="info-item"><label>Thời gian lưu trú (dự kiến):</label> <span>{request.estimatedLengthOfStay} ngày</span></div>
                            <div className="info-item"><label>Khoa yêu cầu:</label> <span>{request.requestedDepartmentName}</span></div>
                            <div className="info-item"><label>Người yêu cầu:</label> <span>{request.requestedByEmployeeName}</span></div>
                            <div className="info-item"><label>Ngày tạo:</label> <span>{formatDate(request.createdAt)}</span></div>
                        </div>
                        <div className="info-item-full">
                            <label>Chẩn đoán:</label>
                            <span>{request.admissionDiagnosis}</span>
                        </div>
                    </div>
                </div>
                
                {/* Cột 2: Yêu cầu đặc biệt và Phê duyệt */}
                <div className="detail-column">
                    <div className="detail-section">
                        <h3><FiGrid /> Yêu cầu giường & Đặc biệt</h3>
                        <div className="info-grid">
                            <div className="info-item"><label>Loại giường:</label> <span>{request.bedTypeRequired || '-'}</span></div>
                            <div className="info-item"><label>Giường đã gán:</label> <span>{request.assignedBedCode ? `${request.assignedBedCode} - ${request.assignedBedRoom}` : 'Chưa gán'}</span></div>
                            <div className="info-item"><label>Ngày gán giường:</label> <span>{formatDate(request.bedAssignedAt)}</span></div>
                        </div>
                        <div className="requirements-badges">
                            {request.isolationRequired && <span className="req-badge">Cách ly</span>}
                            {request.requiresIcu && <span className="req-badge">ICU</span>}
                            {request.oxygenRequired && <span className="req-badge">Oxy</span>}
                            {request.monitoringLevelDisplay && (
                                <span className="req-badge">Theo dõi: {request.monitoringLevelDisplay}</span>
                            )}
                        </div>
                        <div className="info-item-full">
                            <label>Yêu cầu đặc biệt:</label>
                            <p>{request.specialRequirements || 'Không có'}</p>
                        </div>
                    </div>
                    
                    <div className="detail-section">
                        <h3><FiCheck /> Thông tin Phê duyệt</h3>
                        <div className="info-grid">
                            <div className="info-item"><label>Người phê duyệt:</label> <span>{request.approvedByEmployeeName || '-'}</span></div>
                            <div className="info-item"><label>Ngày phê duyệt:</label> <span>{formatDate(request.approvedAt)}</span></div>
                        </div>
                        <div className="info-item-full">
                            <label>Ghi chú phê duyệt:</label>
                            <p>{request.approvalNotes || 'Không có'}</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* === RENDER MODAL === */}
            {isModalOpen && (
                <AssignBedModal
                    request={request}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleAssignmentSuccess}
                />
            )}
        </div>
    );
};

export default RequestDetailPage;