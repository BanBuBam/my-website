import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { medicationOrderAPI } from '../../../../services/staff/doctorAPI';
import {
    FiArrowLeft, FiAlertCircle, FiPackage, FiUser, FiClock,
    FiEye, FiPause, FiPlay, FiXCircle, FiList, FiCheckCircle
} from 'react-icons/fi';
import './MedicationOrderGroupsPage.css';

const MedicationOrderGroupsPage = () => {
    const { inpatientStayId } = useParams();
    const navigate = useNavigate();
    
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    // State để quản lý việc mở rộng (Xem chi tiết) của từng nhóm
    const [expandedGroups, setExpandedGroups] = useState({});
    
    useEffect(() => {
        fetchGroups();
    }, [inpatientStayId]);
    
    const fetchGroups = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await medicationOrderAPI.getMedicationOrderGroupsByStay(inpatientStayId);
            if (response && response.data) {
                setGroups(response.data);
            } else {
                setGroups([]);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách nhóm y lệnh');
        } finally {
            setLoading(false);
        }
    };
    
    // Hàm toggle xem chi tiết
    const toggleDetail = (groupId) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };
    
    // Các hàm xử lý hành động (Placeholder - Bạn cần API xử lý các hành động này)
    const handleHoldGroup = async (groupId) => {
        const reason = prompt('Nhập lý do tạm dừng nhóm y lệnh:');
        if (!reason || !reason.trim()) {
            return;
        }

        setActionLoading(groupId);
        try {
            const response = await medicationOrderAPI.discontinueMedicationOrderGroup(groupId, reason.trim());

            if (response) {
                alert('Tạm dừng nhóm y lệnh thành công!');
                fetchGroups();
            }
        } catch (err) {
            console.error('Error discontinuing group:', err);
            alert(err.message || 'Không thể tạm dừng nhóm y lệnh');
        } finally {
            setActionLoading(null);
        }
    };

    const handleResumeGroup = (groupId) => {
        if(window.confirm(`Bạn có chắc muốn TIẾP TỤC nhóm y lệnh #${groupId}?`)) {
            alert(`Đã gửi yêu cầu tiếp tục nhóm #${groupId} (Cần API tích hợp)`);
        }
    };

    const handleDiscontinueGroup = async (groupId) => {
        const reason = prompt('Nhập lý do ngừng nhóm y lệnh:');
        if (!reason || !reason.trim()) {
            return;
        }

        setActionLoading(groupId);
        try {
            const response = await medicationOrderAPI.cancelMedicationOrderGroup(groupId, reason.trim());

            if (response) {
                alert('Ngừng nhóm y lệnh thành công!');
                fetchGroups();
            }
        } catch (err) {
            console.error('Error cancelling group:', err);
            alert(err.message || 'Không thể ngừng nhóm y lệnh');
        } finally {
            setActionLoading(null);
        }
    };

    const handleConfirmGroup = async (groupId) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xác nhận nhóm y lệnh #${groupId}?`)) {
            return;
        }

        setActionLoading(groupId);
        try {
            const response = await medicationOrderAPI.confirmMedicationOrderGroup(groupId);

            if (response) {
                alert('Xác nhận nhóm y lệnh thành công!');
                // Reload danh sách
                fetchGroups();
            }
        } catch (err) {
            console.error('Error confirming medication order group:', err);
            alert(err.message || 'Không thể xác nhận nhóm y lệnh');
        } finally {
            setActionLoading(null);
        }
    };
    
    // Helper format ngày giờ
    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };
    
    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'ACTIVE': 'status-active',
            'PENDING': 'status-pending',
            'COMPLETED': 'status-completed',
            'HELD': 'status-held',
            'DISCONTINUED': 'status-discontinued',
        };
        return statusMap[status] || 'status-default';
    };
    
    if (loading) return <div className="med-group-loading">Đang tải dữ liệu...</div>;
    if (error) return <div className="med-group-error"><FiAlertCircle /> {error}</div>;
    
    return (
        <div className="med-order-groups-page">
            <div className="page-header">
                <button className="btn-back" onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-content">
                    <h1>Danh sách Nhóm Y lệnh </h1>
                    <p>Điều trị nội trú #{inpatientStayId}</p>
                </div>
            </div>
            
            <div className="groups-list-container">
                {groups.length === 0 ? (
                    <div className="no-data">
                        <FiPackage /> <p>Chưa có nhóm y lệnh nào.</p>
                    </div>
                ) : (
                    <div className="groups-grid">
                        {groups.map(group => (
                            <div key={group.medicationOrderGroupId} className="group-card">
                                {/* Header của Card */}
                                <div className="group-card-header">
                                    <div className="group-title">
                                        <h3>Nhóm #{group.medicationOrderGroupId}</h3>
                                        <span className={`status-badge ${getStatusBadgeClass(group.status)}`}>
                                            {group.status}
                                        </span>
                                        {group.isStat && <span className="badge-stat">KHẨN CẤP</span>}
                                    </div>
                                    <div className="group-meta">
                                        <span><FiUser /> BS. {group.orderedByDoctorName}</span>
                                        <span><FiClock /> {formatDateTime(group.orderDate)}</span>
                                        <span><FiList /> {group.medications?.length || 0} thuốc</span>
                                    </div>
                                </div>
                                
                                {/* Body của Card (Hiển thị ghi chú nếu có) */}
                                {group.orderNotes && (
                                    <div className="group-notes">
                                        <strong>Ghi chú:</strong> {group.orderNotes}
                                    </div>
                                )}
                                
                                {/* Vùng chứa 5 Nút bấm */}
                                <div className="group-actions">
                                    <button
                                        className="btn-action btn-confirm"
                                        onClick={() => handleConfirmGroup(group.medicationOrderGroupId)}
                                        disabled={actionLoading === group.medicationOrderGroupId}
                                    >
                                        <FiCheckCircle />
                                        {actionLoading === group.medicationOrderGroupId ? 'Đang xử lý...' : 'Xác nhận'}
                                    </button>

                                    <button
                                        className="btn-action btn-view"
                                        onClick={() => toggleDetail(group.medicationOrderGroupId)}
                                    >
                                        <FiEye /> {expandedGroups[group.medicationOrderGroupId] ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                                    </button>

                                    <button
                                        className="btn-action btn-hold"
                                        onClick={() => handleHoldGroup(group.medicationOrderGroupId)}
                                        disabled={actionLoading === group.medicationOrderGroupId || group.status === 'HELD' || group.status === 'DISCONTINUED'}
                                    >
                                        <FiPause /> {actionLoading === group.medicationOrderGroupId ? 'Đang xử lý...' : 'Tạm dừng'}
                                    </button>

                                    <button
                                        className="btn-action btn-resume"
                                        onClick={() => handleResumeGroup(group.medicationOrderGroupId)}
                                        disabled={group.status !== 'HELD'}
                                    >
                                        <FiPlay /> Tiếp tục
                                    </button>

                                    <button
                                        className="btn-action btn-stop"
                                        onClick={() => handleDiscontinueGroup(group.medicationOrderGroupId)}
                                        disabled={actionLoading === group.medicationOrderGroupId || group.status === 'DISCONTINUED'}
                                    >
                                        <FiXCircle /> {actionLoading === group.medicationOrderGroupId ? 'Đang xử lý...' : 'Ngừng'}
                                    </button>
                                </div>
                                
                                {/* Phần chi tiết (Expandable) */}
                                {expandedGroups[group.medicationOrderGroupId] && (
                                    <div className="group-details-section">
                                        <h4>Danh sách thuốc trong nhóm:</h4>
                                        <div className="meds-list">
                                            {group.medications?.map(med => (
                                                <div key={med.medicationOrderId} className="med-item">
                                                    <div className="med-name">
                                                        <strong>{med.medicineName}</strong>
                                                        <span className="med-dosage">{med.dosage}</span>
                                                    </div>
                                                    <div className="med-info">
                                                        <span>{med.routeDisplay}</span> •
                                                        <span>{med.frequency}</span> •
                                                        <span>{med.quantityOrdered} viên/ống</span>
                                                    </div>
                                                    <div className="med-status">
                                                        Trạng thái:
                                                        <span className={`status-text ${getStatusBadgeClass(med.status)}`}>
                                                             {med.statusDisplay || med.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MedicationOrderGroupsPage;